-- Improve cross-year contact duplicate detection and support non-destructive profile refresh.
alter table humas.alumni_import_rows drop constraint if exists alumni_import_rows_status_check;
alter table humas.alumni_import_rows add constraint alumni_import_rows_status_check
  check (status in ('pending','duplicate','invalid','approved','updated','rejected'));

create or replace function humas.alumni_import_batch_create(p_actor_id uuid,p_actor_role text,p_source_label text,p_file_name text,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_batch humas.alumni_import_batches%rowtype; v_item jsonb; v_payload jsonb; v_name text; v_norm text; v_year integer; v_email text; v_phone text; v_status text; v_error text; v_candidate uuid; v_total integer:=0; v_pending integer:=0; v_duplicate integer:=0; v_invalid integer:=0; v_duplicate_in_batch boolean;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas' or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then raise exception using errcode='42501',message='forbidden'; end if;
 if nullif(pg_catalog.btrim(p_source_label),'') is null or pg_catalog.length(p_source_label)>120 or nullif(pg_catalog.btrim(p_file_name),'') is null or pg_catalog.length(p_file_name)>255 or p_rows is null or pg_catalog.jsonb_typeof(p_rows)<>'array' or pg_catalog.jsonb_array_length(p_rows)<1 or pg_catalog.jsonb_array_length(p_rows)>500 then raise exception using errcode='22023',message='invalid_import_batch'; end if;
 insert into humas.alumni_import_batches(source_label,file_name,total_rows,created_by) values(pg_catalog.btrim(p_source_label),pg_catalog.btrim(p_file_name),pg_catalog.jsonb_array_length(p_rows),p_actor_id) returning * into v_batch;
 for v_item in select value from pg_catalog.jsonb_array_elements(p_rows) loop
  v_total:=v_total+1; v_name:=pg_catalog.btrim(coalesce(v_item->>'full_name','')); v_norm:=pg_catalog.regexp_replace(pg_catalog.lower(v_name),'[^[:alnum:]]','','g'); v_year:=null; v_email:=pg_catalog.lower(pg_catalog.btrim(coalesce(v_item->>'email',''))); v_phone:=pg_catalog.regexp_replace(coalesce(v_item->>'whatsapp',''),'[^0-9]','','g'); v_status:='pending'; v_error:=null; v_candidate:=null; v_duplicate_in_batch:=false;
  if pg_catalog.length(v_name)<2 or pg_catalog.length(v_name)>180 then v_status:='invalid'; v_error:='Nama wajib diisi (2–180 karakter).';
  elsif case when coalesce(v_item->>'graduation_year','') ~ '^[0-9]{4}$' then (v_item->>'graduation_year')::integer not between 1950 and 2100 else true end then v_status:='invalid'; v_error:='Tahun lulus harus antara 1950–2100.';
  elsif v_email<>'' and v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then v_status:='invalid'; v_error:='Format email tidak valid.';
  else
   v_year:=(v_item->>'graduation_year')::integer;
   select p.id into v_candidate from humas.alumni_profiles p where p.record_status='active' and (
     (p.graduation_year=v_year and pg_catalog.regexp_replace(pg_catalog.lower(p.full_name),'[^[:alnum:]]','','g')=v_norm)
     or (v_email<>'' and pg_catalog.lower(coalesce(p.email,''))=v_email)
     or (v_phone<>'' and pg_catalog.regexp_replace(coalesce(p.whatsapp,''),'[^0-9]','','g')=v_phone)
   ) order by ((p.graduation_year=v_year and pg_catalog.regexp_replace(pg_catalog.lower(p.full_name),'[^[:alnum:]]','','g')=v_norm)) desc,p.updated_at desc limit 1;
   if v_candidate is not null then v_status:='duplicate';
   else
    select exists(select 1 from humas.alumni_import_rows prior where prior.batch_id=v_batch.id and prior.status in ('pending','duplicate') and (
      (prior.payload->>'graduation_year'=v_year::text and pg_catalog.regexp_replace(pg_catalog.lower(coalesce(prior.payload->>'full_name','')),'[^[:alnum:]]','','g')=v_norm)
      or (v_email<>'' and pg_catalog.lower(coalesce(prior.payload->>'email',''))=v_email)
      or (v_phone<>'' and pg_catalog.regexp_replace(coalesce(prior.payload->>'whatsapp',''),'[^0-9]','','g')=v_phone)
    )) into v_duplicate_in_batch;
    if v_duplicate_in_batch then v_status:='duplicate'; end if;
   end if;
  end if;
  v_payload:=pg_catalog.jsonb_build_object('full_name',pg_catalog.left(v_name,180),'graduation_year',coalesce(v_item->>'graduation_year',''),'last_class',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'last_class','')),60),'whatsapp',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'whatsapp','')),40),'email',pg_catalog.left(v_email,254),'city',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'city','')),120),'province',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'province','')),120),'current_status',case when coalesce(v_item->>'current_status','') in ('studying','employed','entrepreneur','seeking_work','other','not_reported') then v_item->>'current_status' else 'not_reported' end,'institution',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'institution','')),180),'employer',pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'employer','')),180));
  insert into humas.alumni_import_rows(batch_id,row_number,payload,status,candidate_profile_id,error_message) values(v_batch.id,v_total,v_payload,v_status,v_candidate,v_error);
  if v_status='pending' then v_pending:=v_pending+1; elsif v_status='duplicate' then v_duplicate:=v_duplicate+1; else v_invalid:=v_invalid+1; end if;
 end loop;
 return pg_catalog.jsonb_build_object('batch_id',v_batch.id,'total_rows',v_total,'pending',v_pending,'duplicates',v_duplicate,'invalid',v_invalid);
end; $$;

create or replace function humas.alumni_import_row_review(p_actor_id uuid,p_actor_role text,p_row_id uuid,p_action text,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_row humas.alumni_import_rows%rowtype; v_batch humas.alumni_import_batches%rowtype; v_profile jsonb; v_new_status text; v_note text; v_update_payload jsonb;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas' or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then raise exception using errcode='42501',message='forbidden'; end if;
 select * into v_row from humas.alumni_import_rows where id=p_row_id for update; if not found then raise exception using errcode='P0002',message='import_row_not_found'; end if;
 select * into v_batch from humas.alumni_import_batches where id=v_row.batch_id;
 if v_row.status not in ('pending','duplicate') then raise exception using errcode='22023',message='import_row_already_reviewed'; end if;
 if p_action='reject' then v_new_status:='rejected';
 elsif p_action='approve' and v_row.status='pending' then v_new_status:='approved';
 elsif p_action='add_anyway' and v_row.status='duplicate' then v_new_status:='approved';
 elsif p_action='update_existing' and v_row.status='duplicate' and v_row.candidate_profile_id is not null then v_new_status:='updated';
 else raise exception using errcode='22023',message='invalid_import_review_action'; end if;

 if v_new_status='approved' then
  v_note:='Sumber pendataan: '||v_batch.source_label||' (impor '||v_batch.file_name||').';
  if nullif(pg_catalog.btrim(coalesce(p_note,'')),'') is not null then v_note:=v_note||' Catatan verifikasi: '||pg_catalog.left(pg_catalog.btrim(p_note),800); end if;
  v_profile:=humas.alumni_profile_create(p_actor_id,'staff_humas',v_row.payload||pg_catalog.jsonb_build_object('contact_preference','none','consent_school_updates',false,'consent_events',false,'consent_fundraising',false,'consent_career_network',false,'consent_source',null,'notes',v_note,'record_status','active'));
 elsif v_new_status='updated' then
  v_update_payload:=pg_catalog.jsonb_build_object();
  if nullif(pg_catalog.btrim(coalesce(v_row.payload->>'full_name','')),'') is not null then v_update_payload:=v_update_payload||pg_catalog.jsonb_build_object('full_name',v_row.payload->>'full_name'); end if;
  foreach v_note in array array['last_class','whatsapp','email','city','province','current_status','institution','employer'] loop
   if nullif(pg_catalog.btrim(coalesce(v_row.payload->>v_note,'')),'') is not null then v_update_payload:=v_update_payload||pg_catalog.jsonb_build_object(v_note,v_row.payload->>v_note); end if;
  end loop;
  v_profile:=humas.alumni_profile_update(p_actor_id,'staff_humas',v_row.candidate_profile_id,v_update_payload);
 end if;
 update humas.alumni_import_rows set status=v_new_status,created_profile_id=case when v_new_status='approved' then (v_profile->>'id')::uuid else null end,reviewed_by=p_actor_id,reviewed_at=now(),review_note=nullif(pg_catalog.left(pg_catalog.btrim(coalesce(p_note,'')),1000),'') where id=p_row_id;
 return pg_catalog.jsonb_build_object('id',p_row_id,'status',v_new_status,'profile_id',case when v_new_status='updated' then v_row.candidate_profile_id::text when v_new_status='approved' then v_profile->>'id' else null end);
end; $$;
revoke all on function humas.alumni_import_batch_create(uuid,text,text,text,jsonb) from public,anon,authenticated;
revoke all on function humas.alumni_import_row_review(uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function humas.alumni_import_batch_create(uuid,text,text,text,jsonb) to service_role;
grant execute on function humas.alumni_import_row_review(uuid,text,uuid,text,text) to service_role;
