-- PINTUKU HUMAS — Alumni CRM and tracer study foundation.
-- Apply only after review; this migration is not applied to Production automatically.

create table if not exists humas.alumni_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) between 2 and 180),
  graduation_year integer not null check (graduation_year between 1950 and 2100),
  last_class text,
  whatsapp text,
  email text,
  city text,
  province text,
  current_status text not null default 'not_reported' check (
    current_status in ('studying','employed','entrepreneur','seeking_work','other','not_reported')
  ),
  institution text,
  study_program text,
  employer text,
  job_title text,
  business_name text,
  industry text,
  survey_year integer check (survey_year between 2000 and 2100),
  contact_preference text not null default 'none' check (
    contact_preference in ('whatsapp','email','phone','none')
  ),
  consent_school_updates boolean not null default false,
  consent_events boolean not null default false,
  consent_fundraising boolean not null default false,
  consent_career_network boolean not null default false,
  consent_updated_at timestamptz,
  consent_source text,
  record_status text not null default 'active' check (record_status in ('active','inactive')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists humas.alumni_contact_logs (
  id bigint generated always as identity primary key,
  alumni_id uuid not null references humas.alumni_profiles(id) on delete restrict,
  purpose text not null check (purpose in ('school_update','event','reunion','fundraising','career_network','other')),
  channel text not null check (channel in ('whatsapp','email','phone','in_person')),
  outcome text not null default 'sent' check (outcome in ('planned','sent','responded','no_answer','declined','completed')),
  contacted_at timestamptz not null default now(),
  summary text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null check (actor_role='staff_humas')
);

create index if not exists alumni_profiles_year_name_idx
  on humas.alumni_profiles(graduation_year desc, full_name);
create index if not exists alumni_profiles_status_idx
  on humas.alumni_profiles(current_status, graduation_year desc);
create index if not exists alumni_profiles_fundraising_consent_idx
  on humas.alumni_profiles(graduation_year desc)
  where consent_fundraising=true and record_status='active';
create index if not exists alumni_profiles_event_consent_idx
  on humas.alumni_profiles(graduation_year desc)
  where consent_events=true and record_status='active';
create index if not exists alumni_contact_logs_profile_time_idx
  on humas.alumni_contact_logs(alumni_id, contacted_at desc);

drop trigger if exists alumni_profiles_set_updated_at on humas.alumni_profiles;
create trigger alumni_profiles_set_updated_at
before update on humas.alumni_profiles
for each row execute function humas.set_updated_at();

create or replace function humas.enforce_alumni_contact_actor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.actor_id is null or new.actor_role is distinct from 'staff_humas'
     or not exists (
       select 1 from humas.user_roles ur
       where ur.user_id=new.actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null
     ) then
    raise exception using errcode='42501', message='active_staff_humas_role_required';
  end if;
  return new;
end;
$$;

create or replace function humas.reject_alumni_contact_log_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode='42501', message='alumni_contact_logs_are_append_only';
end;
$$;

drop trigger if exists alumni_contact_logs_validate_actor on humas.alumni_contact_logs;
create trigger alumni_contact_logs_validate_actor
before insert on humas.alumni_contact_logs
for each row execute function humas.enforce_alumni_contact_actor();

drop trigger if exists alumni_contact_logs_append_only on humas.alumni_contact_logs;
create trigger alumni_contact_logs_append_only
before update or delete on humas.alumni_contact_logs
for each row execute function humas.reject_alumni_contact_log_mutation();

alter table humas.alumni_profiles enable row level security;
alter table humas.alumni_contact_logs enable row level security;
revoke all on table humas.alumni_profiles,humas.alumni_contact_logs from public,anon,authenticated;
revoke all on table humas.alumni_profiles,humas.alumni_contact_logs from service_role;
grant select,insert,update on table humas.alumni_profiles to service_role;
grant select,insert on table humas.alumni_contact_logs to service_role;
grant usage,select on sequence humas.alumni_contact_logs_id_seq to service_role;

create or replace function humas.alumni_profile_create(
  p_actor_id uuid,p_actor_role text,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_row humas.alumni_profiles%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
       and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
     or nullif(pg_catalog.btrim(p_payload->>'full_name'),'') is null
     or coalesce(p_payload->>'graduation_year','') !~ '^[0-9]{4}$'
     or (p_payload->>'graduation_year')::integer not between 1950 and 2100
     or coalesce(p_payload->>'current_status','not_reported') not in
       ('studying','employed','entrepreneur','seeking_work','other','not_reported')
     or coalesce(p_payload->>'contact_preference','none') not in ('whatsapp','email','phone','none') then
    raise exception using errcode='22023',message='invalid_alumni_payload';
  end if;
  insert into humas.alumni_profiles(
    full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,
    institution,study_program,employer,job_title,business_name,industry,survey_year,
    contact_preference,consent_school_updates,consent_events,consent_fundraising,
    consent_career_network,consent_updated_at,consent_source,record_status,notes,created_by,updated_by
  ) values(
    pg_catalog.btrim(p_payload->>'full_name'),(p_payload->>'graduation_year')::integer,
    nullif(pg_catalog.btrim(p_payload->>'last_class'),''),
    nullif(pg_catalog.btrim(p_payload->>'whatsapp'),''),
    nullif(pg_catalog.btrim(p_payload->>'email'),''),
    nullif(pg_catalog.btrim(p_payload->>'city'),''),
    nullif(pg_catalog.btrim(p_payload->>'province'),''),
    coalesce(p_payload->>'current_status','not_reported'),
    nullif(pg_catalog.btrim(p_payload->>'institution'),''),
    nullif(pg_catalog.btrim(p_payload->>'study_program'),''),
    nullif(pg_catalog.btrim(p_payload->>'employer'),''),
    nullif(pg_catalog.btrim(p_payload->>'job_title'),''),
    nullif(pg_catalog.btrim(p_payload->>'business_name'),''),
    nullif(pg_catalog.btrim(p_payload->>'industry'),''),
    nullif(p_payload->>'survey_year','')::integer,
    coalesce(p_payload->>'contact_preference','none'),
    coalesce((p_payload->>'consent_school_updates')::boolean,false),
    coalesce((p_payload->>'consent_events')::boolean,false),
    coalesce((p_payload->>'consent_fundraising')::boolean,false),
    coalesce((p_payload->>'consent_career_network')::boolean,false),
    case when coalesce((p_payload->>'consent_school_updates')::boolean,false)
      or coalesce((p_payload->>'consent_events')::boolean,false)
      or coalesce((p_payload->>'consent_fundraising')::boolean,false)
      or coalesce((p_payload->>'consent_career_network')::boolean,false) then now() else null end,
    nullif(pg_catalog.btrim(p_payload->>'consent_source'),''),
    coalesce(p_payload->>'record_status','active'),
    nullif(pg_catalog.btrim(p_payload->>'notes'),''),p_actor_id,p_actor_id
  ) returning * into v_row;
  return pg_catalog.to_jsonb(v_row)-'created_by'-'updated_by';
end;
$$;

create or replace function humas.alumni_profile_update(
  p_actor_id uuid,p_actor_role text,p_alumni_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_before humas.alumni_profiles%rowtype; v_after humas.alumni_profiles%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
       and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' or p_payload='{}'::jsonb then
    raise exception using errcode='22023',message='empty_update';
  end if;
  select * into v_before from humas.alumni_profiles where id=p_alumni_id for update;
  if not found then raise exception using errcode='P0002',message='alumni_not_found'; end if;
  if p_payload ? 'graduation_year' and (coalesce(p_payload->>'graduation_year','') !~ '^[0-9]{4}$'
     or (p_payload->>'graduation_year')::integer not between 1950 and 2100) then
    raise exception using errcode='22023',message='invalid_graduation_year';
  end if;
  if p_payload ? 'current_status' and coalesce(p_payload->>'current_status','') not in
    ('studying','employed','entrepreneur','seeking_work','other','not_reported') then
    raise exception using errcode='22023',message='invalid_current_status';
  end if;
  if p_payload ? 'contact_preference' and coalesce(p_payload->>'contact_preference','') not in
    ('whatsapp','email','phone','none') then
    raise exception using errcode='22023',message='invalid_contact_preference';
  end if;
  update humas.alumni_profiles set
    full_name=case when p_payload?'full_name' then nullif(pg_catalog.btrim(p_payload->>'full_name'),'') else full_name end,
    graduation_year=case when p_payload?'graduation_year' then (p_payload->>'graduation_year')::integer else graduation_year end,
    last_class=case when p_payload?'last_class' then nullif(pg_catalog.btrim(p_payload->>'last_class'),'') else last_class end,
    whatsapp=case when p_payload?'whatsapp' then nullif(pg_catalog.btrim(p_payload->>'whatsapp'),'') else whatsapp end,
    email=case when p_payload?'email' then nullif(pg_catalog.btrim(p_payload->>'email'),'') else email end,
    city=case when p_payload?'city' then nullif(pg_catalog.btrim(p_payload->>'city'),'') else city end,
    province=case when p_payload?'province' then nullif(pg_catalog.btrim(p_payload->>'province'),'') else province end,
    current_status=case when p_payload?'current_status' then p_payload->>'current_status' else current_status end,
    institution=case when p_payload?'institution' then nullif(pg_catalog.btrim(p_payload->>'institution'),'') else institution end,
    study_program=case when p_payload?'study_program' then nullif(pg_catalog.btrim(p_payload->>'study_program'),'') else study_program end,
    employer=case when p_payload?'employer' then nullif(pg_catalog.btrim(p_payload->>'employer'),'') else employer end,
    job_title=case when p_payload?'job_title' then nullif(pg_catalog.btrim(p_payload->>'job_title'),'') else job_title end,
    business_name=case when p_payload?'business_name' then nullif(pg_catalog.btrim(p_payload->>'business_name'),'') else business_name end,
    industry=case when p_payload?'industry' then nullif(pg_catalog.btrim(p_payload->>'industry'),'') else industry end,
    survey_year=case when p_payload?'survey_year' then nullif(p_payload->>'survey_year','')::integer else survey_year end,
    contact_preference=case when p_payload?'contact_preference' then p_payload->>'contact_preference' else contact_preference end,
    consent_school_updates=case when p_payload?'consent_school_updates' then (p_payload->>'consent_school_updates')::boolean else consent_school_updates end,
    consent_events=case when p_payload?'consent_events' then (p_payload->>'consent_events')::boolean else consent_events end,
    consent_fundraising=case when p_payload?'consent_fundraising' then (p_payload->>'consent_fundraising')::boolean else consent_fundraising end,
    consent_career_network=case when p_payload?'consent_career_network' then (p_payload->>'consent_career_network')::boolean else consent_career_network end,
    consent_updated_at=case when (p_payload ? 'consent_school_updates' and (p_payload->>'consent_school_updates')::boolean is distinct from v_before.consent_school_updates)
      or (p_payload ? 'consent_events' and (p_payload->>'consent_events')::boolean is distinct from v_before.consent_events)
      or (p_payload ? 'consent_fundraising' and (p_payload->>'consent_fundraising')::boolean is distinct from v_before.consent_fundraising)
      or (p_payload ? 'consent_career_network' and (p_payload->>'consent_career_network')::boolean is distinct from v_before.consent_career_network)
      then now() else consent_updated_at end,
    consent_source=case when p_payload?'consent_source' then nullif(pg_catalog.btrim(p_payload->>'consent_source'),'') else consent_source end,
    record_status=case when p_payload?'record_status' and p_payload->>'record_status' in ('active','inactive') then p_payload->>'record_status' else record_status end,
    notes=case when p_payload?'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end,
    updated_by=p_actor_id
  where id=p_alumni_id returning * into v_after;
  if v_after.full_name is null then raise exception using errcode='22023',message='full_name_required'; end if;
  return pg_catalog.to_jsonb(v_after)-'created_by'-'updated_by';
end;
$$;

create or replace function humas.alumni_contact_log_create(
  p_actor_id uuid,p_actor_role text,p_alumni_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_profile humas.alumni_profiles%rowtype; v_row humas.alumni_contact_logs%rowtype; v_consent boolean;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
       and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  select * into v_profile from humas.alumni_profiles where id=p_alumni_id and record_status='active';
  if not found then raise exception using errcode='P0002',message='alumni_not_found'; end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
     or coalesce(p_payload->>'purpose','') not in ('school_update','event','reunion','fundraising','career_network','other')
     or coalesce(p_payload->>'channel','') not in ('whatsapp','email','phone','in_person')
     or coalesce(p_payload->>'outcome','sent') not in ('planned','sent','responded','no_answer','declined','completed') then
    raise exception using errcode='22023',message='invalid_contact_payload';
  end if;
  v_consent := case p_payload->>'purpose'
    when 'school_update' then v_profile.consent_school_updates
    when 'event' then v_profile.consent_events
    when 'reunion' then v_profile.consent_events
    when 'fundraising' then v_profile.consent_fundraising
    when 'career_network' then v_profile.consent_career_network
    else false end;
  if not v_consent then
    raise exception using errcode='42501',message='alumni_contact_consent_required';
  end if;
  insert into humas.alumni_contact_logs(alumni_id,purpose,channel,outcome,summary,actor_id,actor_role)
  values(p_alumni_id,p_payload->>'purpose',p_payload->>'channel',
    coalesce(p_payload->>'outcome','sent'),nullif(pg_catalog.btrim(p_payload->>'summary'),''),p_actor_id,p_actor_role)
  returning * into v_row;
  return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.alumni_summary()
returns jsonb
language sql
stable
set search_path=''
as $$
  select pg_catalog.jsonb_build_object(
    'total_alumni',(select count(*) from humas.alumni_profiles where record_status='active'),
    'fundraising_reachable',(select count(*) from humas.alumni_profiles where record_status='active' and consent_fundraising=true),
    'event_reachable',(select count(*) from humas.alumni_profiles where record_status='active' and consent_events=true),
    'tracer_updated',(select count(*) from humas.alumni_profiles where record_status='active' and survey_year is not null),
    'studying',(select count(*) from humas.alumni_profiles where record_status='active' and current_status='studying'),
    'employed',(select count(*) from humas.alumni_profiles where record_status='active' and current_status='employed'),
    'entrepreneur',(select count(*) from humas.alumni_profiles where record_status='active' and current_status='entrepreneur')
  );
$$;

revoke all on function humas.alumni_profile_create(uuid,text,jsonb),
  humas.alumni_profile_update(uuid,text,uuid,jsonb),
  humas.alumni_contact_log_create(uuid,text,uuid,jsonb),
  humas.alumni_summary() from public,anon,authenticated;
grant execute on function humas.alumni_profile_create(uuid,text,jsonb),
  humas.alumni_profile_update(uuid,text,uuid,jsonb),
  humas.alumni_contact_log_create(uuid,text,uuid,jsonb),
  humas.alumni_summary() to service_role;
