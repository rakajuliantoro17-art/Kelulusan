-- PINTUKU HUMAS Sprint 2C: public permit intake, secure tracking, inbox and email outbox.
-- Apply after 202611020012_humas_permit_transactions.sql.

create table if not exists humas.permit_public_access (
  permit_id uuid primary key references humas.permit_requests(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists humas.permit_rate_limits (
  scope text not null check (scope in ('create_ip','create_email','track_ip')),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  hit_count integer not null check (hit_count > 0),
  updated_at timestamptz not null default now(),
  primary key(scope,key_hash)
);

create table if not exists humas.permit_inbox_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  permit_id uuid references humas.permit_requests(id) on delete cascade,
  notification_type text not null,
  title text not null check (length(btrim(title)) between 2 and 180),
  message text not null check (length(btrim(message)) between 2 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists humas.permit_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid references humas.permit_requests(id) on delete cascade,
  recipient_email text not null check (length(recipient_email) between 5 and 254),
  event_type text not null,
  subject text not null check (length(subject) between 2 and 180),
  body_text text not null check (length(body_text) between 2 and 4000),
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 10),
  next_attempt_at timestamptz not null default now(),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists permit_public_access_expiry_idx on humas.permit_public_access(expires_at);
create index if not exists permit_rate_limits_updated_idx on humas.permit_rate_limits(updated_at);
create index if not exists permit_inbox_user_unread_idx on humas.permit_inbox_notifications(user_id,read_at,created_at desc);
create index if not exists permit_outbox_pending_idx on humas.permit_notification_outbox(status,next_attempt_at,created_at);

alter table humas.permit_public_access enable row level security;
alter table humas.permit_rate_limits enable row level security;
alter table humas.permit_inbox_notifications enable row level security;
alter table humas.permit_notification_outbox enable row level security;

revoke all on humas.permit_public_access,humas.permit_rate_limits,
 humas.permit_inbox_notifications,humas.permit_notification_outbox
 from public,anon,authenticated;
grant select,insert,update,delete on humas.permit_public_access,humas.permit_rate_limits,
 humas.permit_inbox_notifications,humas.permit_notification_outbox to service_role;
grant usage,select on all sequences in schema humas to service_role;

create or replace function humas.permit_enqueue_staff_notifications(
  p_permit_id uuid,p_type text,p_title text,p_message text
) returns integer
language plpgsql
set search_path=''
as $$
declare v_count integer:=0; v_user record;
begin
  for v_user in
    select distinct ur.user_id,u.email
    from humas.user_roles ur
    left join auth.users u on u.id=ur.user_id
    where ur.role_code in ('staff_humas','vice_principal_humas','principal')
      and ur.is_active=true and ur.revoked_at is null
  loop
    insert into humas.permit_inbox_notifications(user_id,permit_id,notification_type,title,message)
    values(v_user.user_id,p_permit_id,p_type,p_title,p_message);
    if v_user.email is not null and length(v_user.email) between 5 and 254 then
      insert into humas.permit_notification_outbox(permit_id,recipient_email,event_type,subject,body_text)
      values(p_permit_id,v_user.email,p_type,p_title,p_message);
    end if;
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;

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

create or replace function humas.permit_status_notification_trigger()
returns trigger
language plpgsql
set search_path=''
as $$
declare v_title text; v_message text;
begin
  if new.status is distinct from old.status then
    v_title:='Status permohonan diperbarui · '||new.request_code;
    v_message:='Status permohonan "'||new.title||'" berubah menjadi '||new.status||'.';
    perform humas.permit_enqueue_staff_notifications(new.id,'permit_status',v_title,v_message);
    if new.applicant_email is not null then
      insert into humas.permit_notification_outbox(permit_id,recipient_email,event_type,subject,body_text)
      values(new.id,new.applicant_email,'permit_status',v_title,
        'Status permohonan '||new.request_code||' berubah menjadi '||new.status||
        case when new.decision_note is not null then '. Catatan: '||new.decision_note else '' end||
        '. Gunakan kode dan token pelacakan yang Anda simpan untuk melihat detail terbaru.');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists permit_status_notification on humas.permit_requests;
create trigger permit_status_notification after update of status on humas.permit_requests
for each row execute function humas.permit_status_notification_trigger();

create or replace function humas.permit_notifications_list(p_user_id uuid)
returns jsonb
language plpgsql
set search_path=''
as $$
begin
  if p_user_id is null or not exists(select 1 from humas.user_roles ur where ur.user_id=p_user_id
    and ur.role_code in ('staff_humas','vice_principal_humas','principal')
    and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  return pg_catalog.jsonb_build_object(
    'unread',(select count(*) from humas.permit_inbox_notifications where user_id=p_user_id and read_at is null),
    'items',(select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id',n.id,'permit_id',n.permit_id,'notification_type',n.notification_type,
      'title',n.title,'message',n.message,'read_at',n.read_at,'created_at',n.created_at
    ) order by n.created_at desc),'[]'::jsonb)
    from (select * from humas.permit_inbox_notifications where user_id=p_user_id order by created_at desc limit 30) n)
  );
end;
$$;

create or replace function humas.permit_notification_mark_read(p_user_id uuid,p_notification_id uuid)
returns boolean
language plpgsql
set search_path=''
as $$
begin
  if p_user_id is null or not exists(select 1 from humas.user_roles ur where ur.user_id=p_user_id
    and ur.role_code in ('staff_humas','vice_principal_humas','principal')
    and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  update humas.permit_inbox_notifications set read_at=coalesce(read_at,pg_catalog.now())
  where id=p_notification_id and user_id=p_user_id;
  return found;
end;
$$;

create or replace function humas.permit_notification_claim(p_limit integer default 10)
returns setof humas.permit_notification_outbox
language plpgsql
set search_path=''
as $$
begin
  return query
  with picked as (
    select id from humas.permit_notification_outbox
    where status='pending' and next_attempt_at<=pg_catalog.now() and attempt_count<5
    order by created_at for update skip locked limit greatest(1,least(coalesce(p_limit,10),25))
  )
  update humas.permit_notification_outbox o
  set status='sending',attempt_count=o.attempt_count+1,last_error=null
  from picked where o.id=picked.id
  returning o.*;
end;
$$;

create or replace function humas.permit_notification_finish(
  p_id uuid,p_success boolean,p_error text default null
) returns boolean
language plpgsql
set search_path=''
as $$
begin
  update humas.permit_notification_outbox
  set status=case when p_success then 'sent' when attempt_count>=5 then 'failed' else 'pending' end,
      sent_at=case when p_success then pg_catalog.now() else null end,
      next_attempt_at=case when p_success then next_attempt_at else pg_catalog.now()+(interval '1 minute'*power(2,least(attempt_count,6))) end,
      last_error=case when p_success then null else left(coalesce(p_error,'delivery_failed'),500) end
  where id=p_id and status='sending';
  return found;
end;
$$;

revoke all on function humas.permit_public_create(jsonb,text,text,text),
 humas.permit_public_track(text,text,text),humas.permit_public_cancel(text,text,text),
 humas.permit_notifications_list(uuid),humas.permit_notification_mark_read(uuid,uuid),
 humas.permit_notification_claim(integer),humas.permit_notification_finish(uuid,boolean,text),
 humas.permit_enqueue_staff_notifications(uuid,text,text,text),
 humas.permit_status_notification_trigger()
 from public,anon,authenticated;
grant execute on function humas.permit_public_create(jsonb,text,text,text),
 humas.permit_public_track(text,text,text),humas.permit_public_cancel(text,text,text),
 humas.permit_notifications_list(uuid),humas.permit_notification_mark_read(uuid,uuid),
 humas.permit_notification_claim(integer),humas.permit_notification_finish(uuid,boolean,text)
 to service_role;

comment on table humas.permit_public_access is 'Stores only a SHA-256 digest of applicant tracking tokens; raw token is shown once.';
comment on table humas.permit_notification_outbox is 'Transactional email outbox. Delivery requires server-side Resend configuration.';
comment on table humas.permit_inbox_notifications is 'Private HUMAS staff notifications for permit intake and status changes.';
