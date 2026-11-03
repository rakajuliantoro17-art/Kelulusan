-- Detect repeated alumni rows inside the same uploaded batch as well as existing profiles.
create or replace function humas.alumni_import_batch_create(
 p_actor_id uuid,p_actor_role text,p_source_label text,p_file_name text,p_rows jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_batch humas.alumni_import_batches%rowtype; v_item jsonb; v_payload jsonb; v_name text; v_norm text;
 v_year integer; v_email text; v_phone text; v_status text; v_error text; v_candidate uuid;
 v_total integer:=0; v_pending integer:=0; v_duplicate integer:=0; v_invalid integer:=0; v_duplicate_in_batch boolean;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas' or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then raise exception using errcode='42501',message='forbidden'; end if;
 if nullif(pg_catalog.btrim(p_source_label),'') is null or pg_catalog.length(p_source_label)>120 or nullif(pg_catalog.btrim(p_file_name),'') is null or pg_catalog.length(p_file_name)>255 or p_rows is null or pg_catalog.jsonb_typeof(p_rows)<>'array' or pg_catalog.jsonb_array_length(p_rows)<1 or pg_catalog.jsonb_array_length(p_rows)>500 then raise exception using errcode='22023',message='invalid_import_batch'; end if;
 insert into humas.alumni_import_batches(source_label,file_name,total_rows,created_by) values(pg_catalog.btrim(p_source_label),pg_catalog.btrim(p_file_name),pg_catalog.jsonb_array_length(p_rows),p_actor_id) returning * into v_batch;
 for v_item in select value from pg_catalog.jsonb_array_elements(p_rows) loop
  v_total:=v_total+1; v_name:=pg_catalog.btrim(coalesce(v_item->>'full_name','')); v_norm:=pg_catalog.regexp_replace(pg_catalog.lower(v_name),'[^[:alnum:]]','','g'); v_year:=null; v_email:=pg_catalog.lower(pg_catalog.btrim(coalesce(v_item->>'email',''))); v_phone:=pg_catalog.regexp_replace(coalesce(v_item->>'whatsapp',''),'[^0-9]','','g'); v_status:='pending'; v_error:=null; v_candidate:=null; v_duplicate_in_batch:=false;
  if pg_catalog.length(v_name)<2 or pg_catalog.length(v_name)>180 then v_status:='invalid'; v_error:='Nama wajib diisi (2–180 karakter).';
  elsif coalesce(v_item->>'graduation_year','') !~ '^[0-9]{4}$' or (v_item->>'graduation_year')::integer not between 1950 and 2100 then v_status:='invalid'; v_error:='Tahun lulus harus antara 1950–2100.';
  elsif v_email<>'' and v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then v_status:='invalid'; v_error:='Format email tidak valid.';
  else
   v_year:=(v_item->>'graduation_year')::integer;
   select p.id into v_candidate from humas.alumni_profiles p where p.record_status='active' and p.graduation_year=v_year and (pg_catalog.regexp_replace(pg_catalog.lower(p.full_name),'[^[:alnum:]]','','g')=v_norm or (v_email<>'' and pg_catalog.lower(coalesce(p.email,''))=v_email) or (v_phone<>'' and pg_catalog.regexp_replace(coalesce(p.whatsapp,''),'[^0-9]','','g')=v_phone)) order by (pg_catalog.regexp_replace(pg_catalog.lower(p.full_name),'[^[:alnum:]]','','g')=v_norm) desc,p.updated_at desc limit 1;
   if v_candidate is not null then v_status:='duplicate';
   else
    select exists(select 1 from humas.alumni_import_rows prior where prior.batch_id=v_batch.id and prior.status in ('pending','duplicate') and prior.payload->>'graduation_year'=v_year::text and (
      pg_catalog.regexp_replace(pg_catalog.lower(coalesce(prior.payload->>'full_name','')),'[^[:alnum:]]','','g')=v_norm
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
revoke all on function humas.alumni_import_batch_create(uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function humas.alumni_import_batch_create(uuid,text,text,text,jsonb) to service_role;
