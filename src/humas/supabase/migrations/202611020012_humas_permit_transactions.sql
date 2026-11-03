-- PINTUKU HUMAS — Sprint 2A: permit transaction workflow and private document storage
-- Apply only after migration 202611020011_humas_permits_protocol_foundation.sql.
-- All write operations are server-only RPCs; browser roles receive no table or function access.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'humas-permit-documents','humas-permit-documents',false,26214400,
  array[
    'application/pdf',
    'image/jpeg','image/png','image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public=false,
  file_size_limit=26214400,
  allowed_mime_types=excluded.allowed_mime_types;

-- No browser policies: object operations are performed only by the trusted server.
drop policy if exists "humas_permit_documents_no_browser_access" on storage.objects;
create policy "humas_permit_documents_no_browser_access"
on storage.objects as restrictive for all to anon,authenticated
using (bucket_id<>'humas-permit-documents')
with check (bucket_id<>'humas-permit-documents');

create or replace function humas.permit_create(
  p_actor_id uuid,p_actor_role text,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_row humas.permit_requests%rowtype; v_code text;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
    or coalesce(p_payload->>'permit_type','') not in ('internal','external','facility')
    or nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'title')) not between 3 and 200
    or nullif(pg_catalog.btrim(p_payload->>'purpose'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'purpose')) not between 3 and 4000
    or nullif(pg_catalog.btrim(p_payload->>'applicant_name'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'applicant_name')) not between 2 and 180
    or (nullif(p_payload->>'expected_attendees','') is not null and p_payload->>'expected_attendees' !~ '^[0-9]{1,6}$')
    or (nullif(p_payload->>'requested_start_at','') is not null and (p_payload->>'requested_start_at')::timestamptz is null)
    or (nullif(p_payload->>'requested_end_at','') is not null and (p_payload->>'requested_end_at')::timestamptz is null)
    or (nullif(p_payload->>'applicant_email','') is not null and p_payload->>'applicant_email' !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
    or (p_payload ? 'facility_details' and pg_catalog.jsonb_typeof(p_payload->'facility_details')<>'object')
    or (p_payload->>'permit_type'='facility' and nullif(pg_catalog.btrim(p_payload->'facility_details'->>'facility_name'),'') is null) then
    raise exception using errcode='22023',message='invalid_permit_payload';
  end if;
  if nullif(p_payload->>'requested_start_at','') is not null
     and nullif(p_payload->>'requested_end_at','') is not null
     and (p_payload->>'requested_end_at')::timestamptz < (p_payload->>'requested_start_at')::timestamptz then
    raise exception using errcode='22023',message='invalid_permit_schedule';
  end if;
  v_code:='IZN-'||to_char(pg_catalog.now(),'YYYYMM')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into humas.permit_requests(
    request_code,permit_type,title,purpose,applicant_name,applicant_unit,applicant_email,
    applicant_phone,related_institution,activity_location,requested_start_at,requested_end_at,
    expected_attendees,facility_details,created_by,assigned_staff
  ) values (
    v_code,p_payload->>'permit_type',pg_catalog.btrim(p_payload->>'title'),
    pg_catalog.btrim(p_payload->>'purpose'),pg_catalog.btrim(p_payload->>'applicant_name'),
    nullif(pg_catalog.btrim(p_payload->>'applicant_unit'),''),nullif(pg_catalog.lower(pg_catalog.btrim(p_payload->>'applicant_email')),''),
    nullif(pg_catalog.btrim(p_payload->>'applicant_phone'),''),nullif(pg_catalog.btrim(p_payload->>'related_institution'),''),
    nullif(pg_catalog.btrim(p_payload->>'activity_location'),''),nullif(p_payload->>'requested_start_at','')::timestamptz,
    nullif(p_payload->>'requested_end_at','')::timestamptz,nullif(p_payload->>'expected_attendees','')::integer,
    coalesce(p_payload->'facility_details','{}'::jsonb),p_actor_id,p_actor_id
  ) returning * into v_row;
  insert into humas.permit_workflow_events(permit_id,event_type,to_status,actor_id,actor_role,metadata)
  values(v_row.id,'created','draft',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('request_code',v_code));
  return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.permit_update_draft(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_before humas.permit_requests%rowtype;v_after humas.permit_requests%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' or p_payload='{}'::jsonb then
    raise exception using errcode='22023',message='empty_update';
  end if;
  select * into v_before from humas.permit_requests where id=p_permit_id for update;
  if not found then raise exception using errcode='P0002',message='permit_not_found'; end if;
  if v_before.status not in ('draft','revision_required') then
    raise exception using errcode='22023',message='permit_not_editable';
  end if;
  if v_before.created_by is distinct from p_actor_id and v_before.assigned_staff is distinct from p_actor_id then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload ? 'permit_type' and coalesce(p_payload->>'permit_type','') not in ('internal','external','facility') then
    raise exception using errcode='22023',message='invalid_permit_type';
  end if;
  update humas.permit_requests set
    permit_type=case when p_payload?'permit_type' then p_payload->>'permit_type' else permit_type end,
    title=case when p_payload?'title' then pg_catalog.btrim(p_payload->>'title') else title end,
    purpose=case when p_payload?'purpose' then pg_catalog.btrim(p_payload->>'purpose') else purpose end,
    applicant_name=case when p_payload?'applicant_name' then pg_catalog.btrim(p_payload->>'applicant_name') else applicant_name end,
    applicant_unit=case when p_payload?'applicant_unit' then nullif(pg_catalog.btrim(p_payload->>'applicant_unit'),'') else applicant_unit end,
    applicant_email=case when p_payload?'applicant_email' then nullif(pg_catalog.lower(pg_catalog.btrim(p_payload->>'applicant_email')),'') else applicant_email end,
    applicant_phone=case when p_payload?'applicant_phone' then nullif(pg_catalog.btrim(p_payload->>'applicant_phone'),'') else applicant_phone end,
    related_institution=case when p_payload?'related_institution' then nullif(pg_catalog.btrim(p_payload->>'related_institution'),'') else related_institution end,
    activity_location=case when p_payload?'activity_location' then nullif(pg_catalog.btrim(p_payload->>'activity_location'),'') else activity_location end,
    requested_start_at=case when p_payload?'requested_start_at' then nullif(p_payload->>'requested_start_at','')::timestamptz else requested_start_at end,
    requested_end_at=case when p_payload?'requested_end_at' then nullif(p_payload->>'requested_end_at','')::timestamptz else requested_end_at end,
    expected_attendees=case when p_payload?'expected_attendees' then nullif(p_payload->>'expected_attendees','')::integer else expected_attendees end,
    facility_details=case when p_payload?'facility_details' then p_payload->'facility_details' else facility_details end
  where id=p_permit_id returning * into v_after;
  if nullif(v_after.title,'') is null or pg_catalog.length(v_after.title) not between 3 and 200
    or nullif(v_after.purpose,'') is null or pg_catalog.length(v_after.purpose) not between 3 and 4000
    or nullif(v_after.applicant_name,'') is null or pg_catalog.length(v_after.applicant_name) not between 2 and 180
    or (v_after.permit_type='facility' and nullif(pg_catalog.btrim(v_after.facility_details->>'facility_name'),'') is null)
    or (v_after.requested_start_at is not null and v_after.requested_end_at is not null and v_after.requested_end_at<v_after.requested_start_at) then
    raise exception using errcode='22023',message='invalid_permit_payload';
  end if;
  insert into humas.permit_workflow_events(permit_id,event_type,from_status,to_status,actor_id,actor_role,metadata)
  values(p_permit_id,'draft_updated',v_before.status,v_after.status,p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('changed_fields',(select pg_catalog.jsonb_agg(k) from pg_catalog.jsonb_object_keys(p_payload) as x(k))));
  return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.permit_transition(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_action text,p_reason text default null
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_before humas.permit_requests%rowtype;v_after humas.permit_requests%rowtype;
  v_to text;v_required_role text;
begin
  if p_actor_id is null or p_actor_role not in ('staff_humas','vice_principal_humas','principal')
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code=p_actor_role and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  select * into v_before from humas.permit_requests where id=p_permit_id for update;
  if not found then raise exception using errcode='P0002',message='permit_not_found'; end if;
  case p_action
    when 'submit' then v_required_role:='staff_humas';v_to:='submitted';
      if v_before.status not in ('draft','revision_required') then raise exception using errcode='22023',message='invalid_transition';end if;
    when 'verify' then v_required_role:='staff_humas';v_to:='verified';
      if v_before.status<>'submitted' then raise exception using errcode='22023',message='invalid_transition';end if;
    when 'recommend' then v_required_role:='vice_principal_humas';v_to:='under_review';
      if v_before.status<>'verified' then raise exception using errcode='22023',message='invalid_transition';end if;
    when 'request_revision' then
      if p_actor_role not in ('vice_principal_humas','principal') or v_before.status not in ('submitted','verified','under_review') then
        raise exception using errcode='42501',message='forbidden';
      end if;
      v_required_role:=p_actor_role;v_to:='revision_required';
      if nullif(pg_catalog.btrim(p_reason),'') is null then raise exception using errcode='22023',message='reason_required';end if;
    when 'approve' then v_required_role:='principal';v_to:='approved';
      if v_before.status<>'under_review' then raise exception using errcode='22023',message='invalid_transition';end if;
      if v_before.created_by=p_actor_id or v_before.assigned_staff=p_actor_id then
        raise exception using errcode='42501',message='separation_of_duties_required';
      end if;
    when 'reject' then v_required_role:='principal';v_to:='rejected';
      if v_before.status not in ('under_review','verified') then raise exception using errcode='22023',message='invalid_transition';end if;
      if nullif(pg_catalog.btrim(p_reason),'') is null then raise exception using errcode='22023',message='reason_required';end if;
      if v_before.created_by=p_actor_id or v_before.assigned_staff=p_actor_id then
        raise exception using errcode='42501',message='separation_of_duties_required';
      end if;
    when 'cancel' then v_required_role:='staff_humas';v_to:='cancelled';
      if v_before.status not in ('draft','submitted','revision_required') then raise exception using errcode='22023',message='invalid_transition';end if;
    when 'complete' then v_required_role:='staff_humas';v_to:='completed';
      if v_before.status<>'approved' then raise exception using errcode='22023',message='invalid_transition';end if;
    when 'archive' then v_required_role:='staff_humas';v_to:='archived';
      if v_before.status not in ('completed','rejected','cancelled') then raise exception using errcode='22023',message='invalid_transition';end if;
    else raise exception using errcode='22023',message='unknown_action';
  end case;
  if p_actor_role is distinct from v_required_role then raise exception using errcode='42501',message='forbidden';end if;
  update humas.permit_requests set status=v_to,
    submitted_at=case when p_action='submit' then pg_catalog.now() else submitted_at end,
    decided_at=case when p_action in ('approve','reject') then pg_catalog.now() else decided_at end,
    completed_at=case when p_action='complete' then pg_catalog.now() else completed_at end,
    decision_note=case when p_action in ('approve','reject','request_revision') then nullif(pg_catalog.btrim(p_reason),'') else decision_note end
  where id=p_permit_id returning * into v_after;
  insert into humas.permit_workflow_events(permit_id,event_type,from_status,to_status,actor_id,actor_role,reason)
  values(p_permit_id,p_action,v_before.status,v_to,p_actor_id,p_actor_role,nullif(pg_catalog.btrim(p_reason),''));
  return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.permit_assign(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_assigned_staff uuid
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_before humas.permit_requests%rowtype;v_after humas.permit_requests%rowtype;
begin
  if p_actor_id is null or p_actor_role not in ('staff_humas','vice_principal_humas','principal')
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code=p_actor_role and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_actor_role not in ('vice_principal_humas','principal') then raise exception using errcode='42501',message='forbidden';end if;
  if p_assigned_staff is not null and not exists(select 1 from humas.user_roles ur
    where ur.user_id=p_assigned_staff and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='22023',message='invalid_assignee';
  end if;
  select * into v_before from humas.permit_requests where id=p_permit_id for update;
  if not found then raise exception using errcode='P0002',message='permit_not_found';end if;
  update humas.permit_requests set assigned_staff=p_assigned_staff where id=p_permit_id returning * into v_after;
  insert into humas.permit_workflow_events(permit_id,event_type,actor_id,actor_role,metadata)
  values(p_permit_id,'assignment_changed',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('previous_assignee',v_before.assigned_staff,'new_assignee',p_assigned_staff));
  return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.permit_register_document(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_row humas.permit_documents%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
    or coalesce(p_payload->>'document_type','') not in ('application_letter','proposal','parent_consent','institution_letter','supporting_document','decision_letter','other')
    or coalesce(p_payload->>'storage_bucket','')<>'humas-permit-documents'
    or coalesce(p_payload->>'storage_path','') !~ ('^'||p_permit_id::text||'/[a-f0-9-]{36}\.[a-z0-9]{1,8}$')
    or nullif(pg_catalog.btrim(p_payload->>'file_name'),'') is null
    or coalesce(p_payload->>'file_size_bytes','') !~ '^[1-9][0-9]{0,7}$'
    or (p_payload->>'file_size_bytes')::bigint>26214400
    or coalesce(p_payload->>'mime_type','') not in ('application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') then
    raise exception using errcode='22023',message='invalid_document_payload';
  end if;
  if not exists(select 1 from humas.permit_requests where id=p_permit_id) then raise exception using errcode='P0002',message='permit_not_found';end if;
  if not exists(select 1 from storage.objects where bucket_id='humas-permit-documents' and name=p_payload->>'storage_path') then raise exception using errcode='22023',message='uploaded_object_not_found';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_permit_id::text||':doc:'||(p_payload->>'document_type'),0));
  update humas.permit_documents set is_current=false
    where permit_id=p_permit_id and document_type=p_payload->>'document_type' and is_current=true;
  insert into humas.permit_documents(
    permit_id,document_type,file_name,storage_bucket,storage_path,mime_type,file_size_bytes,
    checksum_sha256,version_number,uploaded_by,is_current
  ) select p_permit_id,p_payload->>'document_type',pg_catalog.left(pg_catalog.btrim(p_payload->>'file_name'),255),
    'humas-permit-documents',p_payload->>'storage_path',p_payload->>'mime_type',
    (p_payload->>'file_size_bytes')::bigint,nullif(p_payload->>'checksum_sha256',''),
    coalesce((select max(version_number)+1 from humas.permit_documents
      where permit_id=p_permit_id and document_type=p_payload->>'document_type'),1),p_actor_id,true
  returning * into v_row;
  insert into humas.permit_workflow_events(permit_id,event_type,actor_id,actor_role,metadata)
  values(p_permit_id,'document_uploaded',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('document_id',v_row.id,'document_type',v_row.document_type,'version',v_row.version_number));
  return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.permit_summary()
returns jsonb language sql stable set search_path=''
as $$
select pg_catalog.jsonb_build_object(
 'total',(select count(*) from humas.permit_requests),
 'draft',(select count(*) from humas.permit_requests where status='draft'),
 'in_review',(select count(*) from humas.permit_requests where status in ('submitted','verified','under_review','revision_required')),
 'approved',(select count(*) from humas.permit_requests where status='approved'),
 'completed',(select count(*) from humas.permit_requests where status='completed'),
 'internal',(select count(*) from humas.permit_requests where permit_type='internal'),
 'external',(select count(*) from humas.permit_requests where permit_type='external'),
 'facility',(select count(*) from humas.permit_requests where permit_type='facility')
);
$$;


create or replace function humas.protocol_agenda_create(
 p_actor_id uuid,p_actor_role text,p_payload jsonb
) returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.protocol_agendas%rowtype;v_code text;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
  or nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
  or coalesce(p_payload->>'agenda_type','') not in ('official_visit','institutional_meeting','school_event','delegation','ceremony','other')
  or nullif(p_payload->>'starts_at','') is null or nullif(p_payload->>'ends_at','') is null
  or (p_payload->>'ends_at')::timestamptz < (p_payload->>'starts_at')::timestamptz then
  raise exception using errcode='22023',message='invalid_protocol_agenda';
 end if;
 if nullif(p_payload->>'permit_id','') is not null and not exists(
  select 1 from humas.permit_requests where id=(p_payload->>'permit_id')::uuid and status not in ('rejected','cancelled','archived')
 ) then raise exception using errcode='22023',message='linked_permit_unavailable';end if;
 v_code:='PRO-'||to_char(pg_catalog.now(),'YYYYMM')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into humas.protocol_agendas(agenda_code,permit_id,title,agenda_type,host_unit,guest_institution,venue,starts_at,ends_at,expected_guests,protocol_notes,created_by,assigned_staff)
 values(v_code,nullif(p_payload->>'permit_id','')::uuid,pg_catalog.btrim(p_payload->>'title'),p_payload->>'agenda_type',
  nullif(pg_catalog.btrim(p_payload->>'host_unit'),''),nullif(pg_catalog.btrim(p_payload->>'guest_institution'),''),
  nullif(pg_catalog.btrim(p_payload->>'venue'),''),(p_payload->>'starts_at')::timestamptz,(p_payload->>'ends_at')::timestamptz,
  nullif(p_payload->>'expected_guests','')::integer,nullif(pg_catalog.btrim(p_payload->>'protocol_notes'),''),p_actor_id,p_actor_id)
 returning * into v_row;
 insert into humas.protocol_workflow_events(agenda_id,event_type,to_status,actor_id,actor_role,metadata)
 values(v_row.id,'created','planned',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('agenda_code',v_code));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.protocol_agenda_transition(
 p_actor_id uuid,p_actor_role text,p_agenda_id uuid,p_action text,p_reason text default null
) returns jsonb language plpgsql set search_path='' as $$
declare v_before humas.protocol_agendas%rowtype;v_after humas.protocol_agendas%rowtype;v_to text;
begin
 if p_actor_id is null or p_actor_role not in ('staff_humas','vice_principal_humas','principal')
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code=p_actor_role and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 select * into v_before from humas.protocol_agendas where id=p_agenda_id for update;
 if not found then raise exception using errcode='P0002',message='agenda_not_found';end if;
 if p_actor_role not in ('staff_humas','vice_principal_humas','principal') then raise exception using errcode='42501',message='forbidden';end if;
 case p_action
  when 'prepare' then v_to:='preparing';if v_before.status<>'planned' then raise exception using errcode='22023',message='invalid_transition';end if;
  when 'ready' then v_to:='ready';if v_before.status<>'preparing' then raise exception using errcode='22023',message='invalid_transition';end if;
  when 'start' then v_to:='in_progress';if v_before.status<>'ready' then raise exception using errcode='22023',message='invalid_transition';end if;
  when 'complete' then v_to:='completed';if v_before.status<>'in_progress' then raise exception using errcode='22023',message='invalid_transition';end if;
  when 'cancel' then v_to:='cancelled';if v_before.status not in ('planned','preparing','ready') then raise exception using errcode='22023',message='invalid_transition';end if;
  else raise exception using errcode='22023',message='unknown_action';
 end case;
 if p_actor_role<>'staff_humas' and p_action not in ('cancel','complete') then raise exception using errcode='42501',message='forbidden';end if;
 if p_action='cancel' and nullif(pg_catalog.btrim(p_reason),'') is null then raise exception using errcode='22023',message='reason_required';end if;
 update humas.protocol_agendas set status=v_to where id=p_agenda_id returning * into v_after;
 insert into humas.protocol_workflow_events(agenda_id,event_type,from_status,to_status,actor_id,actor_role,reason)
 values(p_agenda_id,p_action,v_before.status,v_to,p_actor_id,p_actor_role,nullif(pg_catalog.btrim(p_reason),''));
 return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.protocol_guest_create(
 p_actor_id uuid,p_actor_role text,p_agenda_id uuid,p_payload jsonb
) returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.protocol_guests%rowtype;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if nullif(pg_catalog.btrim(p_payload->>'full_name'),'') is null or pg_catalog.length(pg_catalog.btrim(p_payload->>'full_name')) not between 2 and 180 then
  raise exception using errcode='22023',message='invalid_guest';
 end if;
 if not exists(select 1 from humas.protocol_agendas where id=p_agenda_id and status not in ('completed','cancelled')) then
  raise exception using errcode='P0002',message='agenda_not_available';
 end if;
 insert into humas.protocol_guests(agenda_id,full_name,institution,position_title,attendance_status,notes)
 values(p_agenda_id,pg_catalog.btrim(p_payload->>'full_name'),nullif(pg_catalog.btrim(p_payload->>'institution'),''),
  nullif(pg_catalog.btrim(p_payload->>'position_title'),''),coalesce(p_payload->>'attendance_status','invited'),
  nullif(pg_catalog.btrim(p_payload->>'notes'),'')) returning * into v_row;
 if v_row.attendance_status not in ('invited','confirmed','attended','not_attended','cancelled') then
  raise exception using errcode='22023',message='invalid_guest_status';
 end if;
 insert into humas.protocol_workflow_events(agenda_id,event_type,actor_id,actor_role,metadata)
 values(p_agenda_id,'guest_added',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('guest_id',v_row.id));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.protocol_guest_update(
 p_actor_id uuid,p_actor_role text,p_guest_id uuid,p_payload jsonb
) returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.protocol_guests%rowtype;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if p_payload ? 'attendance_status' and coalesce(p_payload->>'attendance_status','') not in ('invited','confirmed','attended','not_attended','cancelled') then
  raise exception using errcode='22023',message='invalid_guest_status';
 end if;
 update humas.protocol_guests set
  full_name=case when p_payload?'full_name' then pg_catalog.btrim(p_payload->>'full_name') else full_name end,
  institution=case when p_payload?'institution' then nullif(pg_catalog.btrim(p_payload->>'institution'),'') else institution end,
  position_title=case when p_payload?'position_title' then nullif(pg_catalog.btrim(p_payload->>'position_title'),'') else position_title end,
  attendance_status=case when p_payload?'attendance_status' then p_payload->>'attendance_status' else attendance_status end,
  notes=case when p_payload?'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end,
  arrival_at=case when p_payload?'arrival_at' then nullif(p_payload->>'arrival_at','')::timestamptz else arrival_at end
 where id=p_guest_id returning * into v_row;
 if not found then raise exception using errcode='P0002',message='guest_not_found';end if;
 insert into humas.protocol_workflow_events(agenda_id,event_type,actor_id,actor_role,metadata)
 values(v_row.agenda_id,'guest_updated',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('guest_id',v_row.id,'attendance_status',v_row.attendance_status));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.protocol_task_create(
 p_actor_id uuid,p_actor_role text,p_agenda_id uuid,p_payload jsonb
) returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.protocol_tasks%rowtype;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if coalesce(p_payload->>'task_category','') not in ('reception','venue','accommodation','consumption','equipment','ceremony','documentation','security','transport','other')
  or nullif(pg_catalog.btrim(p_payload->>'task_title'),'') is null then
  raise exception using errcode='22023',message='invalid_protocol_task';
 end if;
 if not exists(select 1 from humas.protocol_agendas where id=p_agenda_id and status not in ('completed','cancelled')) then
  raise exception using errcode='P0002',message='agenda_not_available';
 end if;
 insert into humas.protocol_tasks(agenda_id,task_category,task_title,due_at,task_status,notes)
 values(p_agenda_id,p_payload->>'task_category',pg_catalog.btrim(p_payload->>'task_title'),
  nullif(p_payload->>'due_at','')::timestamptz,'pending',nullif(pg_catalog.btrim(p_payload->>'notes'),'')) returning * into v_row;
 insert into humas.protocol_workflow_events(agenda_id,event_type,actor_id,actor_role,metadata)
 values(p_agenda_id,'task_created',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('task_id',v_row.id));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.protocol_task_update(
 p_actor_id uuid,p_actor_role text,p_task_id uuid,p_payload jsonb
) returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.protocol_tasks%rowtype;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if p_payload ? 'task_status' and coalesce(p_payload->>'task_status','') not in ('pending','in_progress','done','blocked','cancelled') then
  raise exception using errcode='22023',message='invalid_task_status';
 end if;
 update humas.protocol_tasks set
  task_title=case when p_payload?'task_title' then pg_catalog.btrim(p_payload->>'task_title') else task_title end,
  task_category=case when p_payload?'task_category' then p_payload->>'task_category' else task_category end,
  task_status=case when p_payload?'task_status' then p_payload->>'task_status' else task_status end,
  due_at=case when p_payload?'due_at' then nullif(p_payload->>'due_at','')::timestamptz else due_at end,
  notes=case when p_payload?'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end,
  completed_at=case when p_payload->>'task_status'='done' then pg_catalog.now() when p_payload?'task_status' then null else completed_at end
 where id=p_task_id returning * into v_row;
 if not found then raise exception using errcode='P0002',message='task_not_found';end if;
 insert into humas.protocol_workflow_events(agenda_id,event_type,actor_id,actor_role,metadata)
 values(v_row.agenda_id,'task_updated',p_actor_id,p_actor_role,pg_catalog.jsonb_build_object('task_id',v_row.id,'task_status',v_row.task_status));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.protocol_summary()
returns jsonb language sql stable set search_path='' as $$
select pg_catalog.jsonb_build_object(
 'total',(select count(*) from humas.protocol_agendas),
 'upcoming',(select count(*) from humas.protocol_agendas where starts_at>=now() and status not in ('completed','cancelled')),
 'preparing',(select count(*) from humas.protocol_agendas where status in ('preparing','ready')),
 'in_progress',(select count(*) from humas.protocol_agendas where status='in_progress'),
 'open_tasks',(select count(*) from humas.protocol_tasks where task_status in ('pending','in_progress','blocked'))
);
$$;

revoke all on function humas.protocol_agenda_create(uuid,text,jsonb),
 humas.protocol_agenda_transition(uuid,text,uuid,text,text),
 humas.protocol_guest_create(uuid,text,uuid,jsonb),
 humas.protocol_guest_update(uuid,text,uuid,jsonb),
 humas.protocol_task_create(uuid,text,uuid,jsonb),
 humas.protocol_task_update(uuid,text,uuid,jsonb),
 humas.protocol_summary() from public,anon,authenticated;
grant execute on function humas.protocol_agenda_create(uuid,text,jsonb),
 humas.protocol_agenda_transition(uuid,text,uuid,text,text),
 humas.protocol_guest_create(uuid,text,uuid,jsonb),
 humas.protocol_guest_update(uuid,text,uuid,jsonb),
 humas.protocol_task_create(uuid,text,uuid,jsonb),
 humas.protocol_task_update(uuid,text,uuid,jsonb),
 humas.protocol_summary() to service_role;

revoke all on function humas.permit_create(uuid,text,jsonb),
 humas.permit_update_draft(uuid,text,uuid,jsonb),
 humas.permit_transition(uuid,text,uuid,text,text),
 humas.permit_assign(uuid,text,uuid,uuid),
 humas.permit_register_document(uuid,text,uuid,jsonb),
 humas.permit_summary() from public,anon,authenticated;
grant execute on function humas.permit_create(uuid,text,jsonb),
 humas.permit_update_draft(uuid,text,uuid,jsonb),
 humas.permit_transition(uuid,text,uuid,text,text),
 humas.permit_assign(uuid,text,uuid,uuid),
 humas.permit_register_document(uuid,text,uuid,jsonb),
 humas.permit_summary() to service_role;

comment on function humas.permit_transition(uuid,text,uuid,text,text) is
 'Validates active HUMAS role, legal state transition, and separation of duties in one transaction.';
