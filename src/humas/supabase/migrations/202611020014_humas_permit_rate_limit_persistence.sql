-- Fix rate-limit persistence after public throttling. A returned error commits the counter.
create or replace function humas.permit_public_create(
  p_payload jsonb,p_token_hash text,p_ip_hash text,p_email_hash text
) returns jsonb
language plpgsql
set search_path=''
as $$
declare
  v_row humas.permit_requests%rowtype;
  v_code text;
  v_hits integer;
  v_ip text:=p_ip_hash;
  v_email text:=p_email_hash;
begin
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
    or p_token_hash !~ '^[0-9a-f]{64}$'
    or v_ip !~ '^[0-9a-f]{64}$' or v_email !~ '^[0-9a-f]{64}$'
    or coalesce(p_payload->>'permit_type','') not in ('external','facility')
    or nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'title')) not between 3 and 200
    or nullif(pg_catalog.btrim(p_payload->>'purpose'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'purpose')) not between 3 and 4000
    or nullif(pg_catalog.btrim(p_payload->>'applicant_name'),'') is null
    or pg_catalog.length(pg_catalog.btrim(p_payload->>'applicant_name')) not between 2 and 180
    or nullif(pg_catalog.btrim(p_payload->>'applicant_email'),'') is null
    or p_payload->>'applicant_email' !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or nullif(p_payload->>'requested_start_at','') is null
    or nullif(p_payload->>'requested_end_at','') is null
    or (p_payload->>'requested_start_at')::timestamptz < pg_catalog.now()
    or (p_payload->>'requested_end_at')::timestamptz < (p_payload->>'requested_start_at')::timestamptz
    or (nullif(p_payload->>'expected_attendees','') is not null and p_payload->>'expected_attendees' !~ '^[0-9]{1,6}$')
    or (p_payload ? 'facility_details' and pg_catalog.jsonb_typeof(p_payload->'facility_details')<>'object')
    or (p_payload->>'permit_type'='facility' and nullif(pg_catalog.btrim(p_payload->'facility_details'->>'facility_name'),'') is null)
  then raise exception using errcode='22023',message='invalid_public_permit_payload'; end if;

  insert into humas.permit_rate_limits as rl(scope,key_hash,window_started_at,hit_count)
  values('create_ip',v_ip,pg_catalog.now(),1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when rl.window_started_at+interval '1 hour'<=pg_catalog.now() then pg_catalog.now() else rl.window_started_at end,
    hit_count=case when rl.window_started_at+interval '1 hour'<=pg_catalog.now() then 1 else rl.hit_count+1 end,
    updated_at=pg_catalog.now()
  returning hit_count into v_hits;
  if v_hits>5 then return pg_catalog.jsonb_build_object('error','rate_limit_exceeded'); end if;

  insert into humas.permit_rate_limits as rl(scope,key_hash,window_started_at,hit_count)
  values('create_email',v_email,pg_catalog.now(),1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when rl.window_started_at+interval '24 hours'<=pg_catalog.now() then pg_catalog.now() else rl.window_started_at end,
    hit_count=case when rl.window_started_at+interval '24 hours'<=pg_catalog.now() then 1 else rl.hit_count+1 end,
    updated_at=pg_catalog.now()
  returning hit_count into v_hits;
  if v_hits>2 then return pg_catalog.jsonb_build_object('error','rate_limit_exceeded'); end if;

  v_code:='IZN-'||to_char(pg_catalog.now(),'YYYYMM')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into humas.permit_requests(
    request_code,permit_type,title,purpose,applicant_name,applicant_unit,applicant_email,
    applicant_phone,related_institution,activity_location,requested_start_at,requested_end_at,
    expected_attendees,facility_details,status,created_by,assigned_staff,submitted_at
  ) values (
    v_code,p_payload->>'permit_type',pg_catalog.btrim(p_payload->>'title'),
    pg_catalog.btrim(p_payload->>'purpose'),pg_catalog.btrim(p_payload->>'applicant_name'),
    nullif(pg_catalog.btrim(p_payload->>'applicant_unit'),''),pg_catalog.lower(pg_catalog.btrim(p_payload->>'applicant_email')),
    nullif(pg_catalog.btrim(p_payload->>'applicant_phone'),''),nullif(pg_catalog.btrim(p_payload->>'related_institution'),''),
    nullif(pg_catalog.btrim(p_payload->>'activity_location'),''),(p_payload->>'requested_start_at')::timestamptz,
    (p_payload->>'requested_end_at')::timestamptz,nullif(p_payload->>'expected_attendees','')::integer,
    coalesce(p_payload->'facility_details','{}'::jsonb),'submitted',null,null,pg_catalog.now()
  ) returning * into v_row;

  insert into humas.permit_public_access(permit_id,token_hash,expires_at)
  values(v_row.id,p_token_hash,pg_catalog.now()+interval '180 days');

  insert into humas.permit_workflow_events(permit_id,event_type,from_status,to_status,actor_role,metadata)
  values(v_row.id,'public_submitted',null,'submitted','public_applicant',
    pg_catalog.jsonb_build_object('request_code',v_code,'channel','public_portal'));

  insert into humas.permit_notification_outbox(permit_id,recipient_email,event_type,subject,body_text)
  values(v_row.id,v_row.applicant_email,'permit_received',
    'Permohonan diterima · PINTUKU SMAN 1 Sooko',
    'Permohonan '||v_code||' telah diterima dan masuk antrean verifikasi HUMAS. Simpan kode permohonan dan token pelacakan yang ditampilkan pada halaman konfirmasi. Token tidak dikirim melalui email demi keamanan.');

  perform humas.permit_enqueue_staff_notifications(v_row.id,'permit_new',
    'Permohonan izin baru · '||v_code,
    v_row.title||' — diajukan oleh '||v_row.applicant_name||'. Mohon periksa register Perizinan & Protokoler.');

  return pg_catalog.jsonb_build_object('id',v_row.id,'request_code',v_row.request_code,'status',v_row.status,'submitted_at',v_row.submitted_at);
end;
$$;
create or replace function humas.permit_public_track(
  p_request_code text,p_token_hash text,p_ip_hash text
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_permit humas.permit_requests%rowtype; v_hits integer; v_access humas.permit_public_access%rowtype; v_events jsonb;
begin
  if p_request_code !~ '^IZN-[0-9]{6}-[A-F0-9]{8}$' or p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode='P0002',message='permit_not_found';
  end if;
  insert into humas.permit_rate_limits as rl(scope,key_hash,window_started_at,hit_count)
  values('track_ip',p_ip_hash,pg_catalog.now(),1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when rl.window_started_at+interval '15 minutes'<=pg_catalog.now() then pg_catalog.now() else rl.window_started_at end,
    hit_count=case when rl.window_started_at+interval '15 minutes'<=pg_catalog.now() then 1 else rl.hit_count+1 end,
    updated_at=pg_catalog.now()
  returning hit_count into v_hits;
  if v_hits>30 then return pg_catalog.jsonb_build_object('error','rate_limit_exceeded'); end if;

  select a.* into v_access from humas.permit_public_access a
  join humas.permit_requests p on p.id=a.permit_id
  where p.request_code=pg_catalog.upper(pg_catalog.btrim(p_request_code))
    and a.token_hash=p_token_hash and a.revoked_at is null and a.expires_at>pg_catalog.now();
  if not found then raise exception using errcode='P0002',message='permit_not_found'; end if;
  select * into v_permit from humas.permit_requests where id=v_access.permit_id;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'event_type',e.event_type,'from_status',e.from_status,'to_status',e.to_status,
    'reason',e.reason,'occurred_at',e.occurred_at
  ) order by e.occurred_at asc),'[]'::jsonb) into v_events
  from humas.permit_workflow_events e where e.permit_id=v_permit.id
    and e.event_type not in ('document_uploaded','assigned');
  return pg_catalog.jsonb_build_object(
    'request_code',v_permit.request_code,'permit_type',v_permit.permit_type,'title',v_permit.title,
    'applicant_name',v_permit.applicant_name,'status',v_permit.status,
    'requested_start_at',v_permit.requested_start_at,'requested_end_at',v_permit.requested_end_at,
    'activity_location',v_permit.activity_location,'decision_note',v_permit.decision_note,
    'submitted_at',v_permit.submitted_at,'updated_at',v_permit.updated_at,'events',v_events
  );
end;
$$;
create or replace function humas.permit_public_cancel(
  p_request_code text,p_token_hash text,p_ip_hash text
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_access humas.permit_public_access%rowtype; v_before humas.permit_requests%rowtype; v_after humas.permit_requests%rowtype; v_hits integer;
begin
  if p_request_code !~ '^IZN-[0-9]{6}-[A-F0-9]{8}$' or p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode='P0002',message='permit_not_found';
  end if;
  insert into humas.permit_rate_limits as rl(scope,key_hash,window_started_at,hit_count)
  values('track_ip',p_ip_hash,pg_catalog.now(),1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when rl.window_started_at+interval '15 minutes'<=pg_catalog.now() then pg_catalog.now() else rl.window_started_at end,
    hit_count=case when rl.window_started_at+interval '15 minutes'<=pg_catalog.now() then 1 else rl.hit_count+1 end,
    updated_at=pg_catalog.now()
  returning hit_count into v_hits;
  if v_hits>30 then raise exception using errcode='P0001',message='rate_limit_exceeded'; end if;
  select a.* into v_access from humas.permit_public_access a join humas.permit_requests p on p.id=a.permit_id
  where p.request_code=pg_catalog.upper(pg_catalog.btrim(p_request_code)) and a.token_hash=p_token_hash
    and a.revoked_at is null and a.expires_at>pg_catalog.now() for update of a;
  if not found then raise exception using errcode='P0002',message='permit_not_found'; end if;
  select * into v_before from humas.permit_requests where id=v_access.permit_id for update;
  if v_before.status not in ('submitted','revision_required') then raise exception using errcode='22023',message='public_cancel_not_allowed'; end if;
  update humas.permit_requests set status='cancelled',decision_note='Dibatalkan oleh pemohon',updated_at=pg_catalog.now()
  where id=v_before.id returning * into v_after;
  insert into humas.permit_workflow_events(permit_id,event_type,from_status,to_status,actor_role,reason)
  values(v_before.id,'public_cancelled',v_before.status,'cancelled','public_applicant','Dibatalkan oleh pemohon');
  return pg_catalog.jsonb_build_object('request_code',v_after.request_code,'status',v_after.status);
end;
$$;
