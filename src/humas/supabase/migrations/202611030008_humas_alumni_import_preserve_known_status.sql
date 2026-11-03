-- Empty/unspecified status from a legacy CSV must not erase a known profile status.
create or replace function humas.alumni_import_row_review(p_actor_id uuid,p_actor_role text,p_row_id uuid,p_action text,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_row humas.alumni_import_rows%rowtype;v_batch humas.alumni_import_batches%rowtype;v_profile jsonb;v_new_status text;v_note text;v_update_payload jsonb;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas' or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then raise exception using errcode='42501',message='forbidden';end if;
 select * into v_row from humas.alumni_import_rows where id=p_row_id for update;if not found then raise exception using errcode='P0002',message='import_row_not_found';end if;
 select * into v_batch from humas.alumni_import_batches where id=v_row.batch_id;
 if v_row.status not in('pending','duplicate') then raise exception using errcode='22023',message='import_row_already_reviewed';end if;
 if p_action='reject' then v_new_status:='rejected';elsif p_action='approve' and v_row.status='pending' then v_new_status:='approved';elsif p_action='add_anyway' and v_row.status='duplicate' then v_new_status:='approved';elsif p_action='update_existing' and v_row.status='duplicate' and v_row.candidate_profile_id is not null then v_new_status:='updated';else raise exception using errcode='22023',message='invalid_import_review_action';end if;
 if v_new_status='approved' then
  v_note:='Sumber pendataan: '||v_batch.source_label||' (impor '||v_batch.file_name||').';
  if nullif(pg_catalog.btrim(coalesce(p_note,'')),'') is not null then v_note:=v_note||' Catatan verifikasi: '||pg_catalog.left(pg_catalog.btrim(p_note),800);end if;
  v_profile:=humas.alumni_profile_create(p_actor_id,'staff_humas',v_row.payload||pg_catalog.jsonb_build_object('contact_preference','none','consent_school_updates',false,'consent_events',false,'consent_fundraising',false,'consent_career_network',false,'consent_source',null,'notes',v_note,'record_status','active'));
 elsif v_new_status='updated' then
  v_update_payload:=pg_catalog.jsonb_build_object();
  if nullif(pg_catalog.btrim(coalesce(v_row.payload->>'full_name','')),'') is not null then v_update_payload:=v_update_payload||pg_catalog.jsonb_build_object('full_name',v_row.payload->>'full_name');end if;
  foreach v_note in array array['last_class','whatsapp','email','city','province','institution','employer'] loop
   if nullif(pg_catalog.btrim(coalesce(v_row.payload->>v_note,'')),'') is not null then v_update_payload:=v_update_payload||pg_catalog.jsonb_build_object(v_note,v_row.payload->>v_note);end if;
  end loop;
  if coalesce(v_row.payload->>'current_status','not_reported')<>'not_reported' then v_update_payload:=v_update_payload||pg_catalog.jsonb_build_object('current_status',v_row.payload->>'current_status');end if;
  v_profile:=humas.alumni_profile_update(p_actor_id,'staff_humas',v_row.candidate_profile_id,v_update_payload);
 end if;
 update humas.alumni_import_rows set status=v_new_status,created_profile_id=case when v_new_status='approved' then (v_profile->>'id')::uuid else null end,reviewed_by=p_actor_id,reviewed_at=now(),review_note=nullif(pg_catalog.left(pg_catalog.btrim(coalesce(p_note,'')),1000),'') where id=p_row_id;
 return pg_catalog.jsonb_build_object('id',p_row_id,'status',v_new_status,'profile_id',case when v_new_status='updated' then v_row.candidate_profile_id::text when v_new_status='approved' then v_profile->>'id' else null end);
end;$$;
revoke all on function humas.alumni_import_row_review(uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function humas.alumni_import_row_review(uuid,text,uuid,text,text) to service_role;
