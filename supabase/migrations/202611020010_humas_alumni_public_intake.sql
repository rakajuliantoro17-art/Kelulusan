-- PINTUKU HUMAS — public alumni tracer intake with staff review.
-- Source only; Production activation requires separate approval.

create table if not exists humas.alumni_intake_submissions (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check(length(btrim(full_name)) between 2 and 180),
 graduation_year integer not null check(graduation_year between 1950 and 2100),
 last_class text,whatsapp text,email text,city text,province text,
 current_status text not null default 'not_reported' check(current_status in('studying','employed','entrepreneur','seeking_work','other','not_reported')),
 institution text,study_program text,employer text,job_title text,business_name text,industry text,
 survey_year integer check(survey_year between 2000 and 2100),
 contact_preference text not null default 'none' check(contact_preference in('whatsapp','email','phone','none')),
 consent_data_processing boolean not null check(consent_data_processing=true),
 consent_school_updates boolean not null default false,consent_events boolean not null default false,
 consent_fundraising boolean not null default false,consent_career_network boolean not null default false,
 consent_recorded_at timestamptz not null default now(),
 consent_source text not null default 'Formulir publik Tracer Study Alumni',
 status text not null default 'pending' check(status in('pending','approved','rejected')),
 submitted_at timestamptz not null default now(),reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id) on delete set null,review_note text,
 created_profile_id uuid references humas.alumni_profiles(id) on delete set null,
 check(nullif(btrim(whatsapp),'') is not null or nullif(btrim(email),'') is not null)
);
create index if not exists alumni_intake_status_submitted_idx on humas.alumni_intake_submissions(status,submitted_at desc);
create index if not exists alumni_intake_year_name_idx on humas.alumni_intake_submissions(graduation_year desc,full_name);
create table if not exists humas.alumni_intake_rate_limits(
 ip_hash text primary key check(ip_hash ~ '^[a-f0-9]{64}$'),
 window_started_at timestamptz not null default now(),
 request_count integer not null default 0 check(request_count>=0),
 updated_at timestamptz not null default now()
);
create index if not exists alumni_intake_rate_limits_updated_idx on humas.alumni_intake_rate_limits(updated_at);

alter table humas.alumni_intake_submissions enable row level security;
alter table humas.alumni_intake_rate_limits enable row level security;
revoke all on table humas.alumni_intake_submissions,humas.alumni_intake_rate_limits from public,anon,authenticated,service_role;
grant select,insert,update on table humas.alumni_intake_submissions to service_role;
grant select,insert,update,delete on table humas.alumni_intake_rate_limits to service_role;

create or replace function humas.alumni_intake_submit(p_ip_hash text,p_payload jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare v_count integer;v_row humas.alumni_intake_submissions%rowtype;v_year integer;v_survey_year integer;
begin
 if p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' or p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' then
  raise exception using errcode='22023',message='invalid_intake_request';
 end if;
 if nullif(pg_catalog.btrim(p_payload->>'full_name'),'') is null
  or pg_catalog.length(pg_catalog.btrim(p_payload->>'full_name')) not between 2 and 180
  or coalesce(p_payload->>'graduation_year','') !~ '^[0-9]{4}$'
  or coalesce(p_payload->>'consent_data_processing','false')<>'true'
  or (nullif(pg_catalog.btrim(p_payload->>'whatsapp'),'') is null and nullif(pg_catalog.btrim(p_payload->>'email'),'') is null)
  or coalesce(p_payload->>'current_status','not_reported') not in('studying','employed','entrepreneur','seeking_work','other','not_reported')
  or coalesce(p_payload->>'contact_preference','none') not in('whatsapp','email','phone','none')
  or (nullif(p_payload->>'email','') is not null and p_payload->>'email' !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  or (p_payload?'consent_school_updates' and pg_catalog.jsonb_typeof(p_payload->'consent_school_updates')<>'boolean')
  or (p_payload?'consent_events' and pg_catalog.jsonb_typeof(p_payload->'consent_events')<>'boolean')
  or (p_payload?'consent_fundraising' and pg_catalog.jsonb_typeof(p_payload->'consent_fundraising')<>'boolean')
  or (p_payload?'consent_career_network' and pg_catalog.jsonb_typeof(p_payload->'consent_career_network')<>'boolean') then
  raise exception using errcode='22023',message='invalid_alumni_intake_payload';
 end if;
 v_year:=(p_payload->>'graduation_year')::integer;
 if v_year not between 1950 and 2100 then raise exception using errcode='22023',message='invalid_graduation_year'; end if;
 if nullif(p_payload->>'survey_year','') is not null then
  if p_payload->>'survey_year' !~ '^[0-9]{4}$' then raise exception using errcode='22023',message='invalid_survey_year'; end if;
  v_survey_year:=(p_payload->>'survey_year')::integer;
  if v_survey_year not between 2000 and 2100 then raise exception using errcode='22023',message='invalid_survey_year'; end if;
 end if;
 insert into humas.alumni_intake_rate_limits(ip_hash,window_started_at,request_count,updated_at)
 values(p_ip_hash,now(),1,now())
 on conflict(ip_hash) do update set
  window_started_at=case when humas.alumni_intake_rate_limits.window_started_at<now()-interval '1 hour' then now() else humas.alumni_intake_rate_limits.window_started_at end,
  request_count=case when humas.alumni_intake_rate_limits.window_started_at<now()-interval '1 hour' then 1 else humas.alumni_intake_rate_limits.request_count+1 end,
  updated_at=now()
 returning request_count into v_count;
 if v_count>5 then return pg_catalog.jsonb_build_object('ok',false,'rate_limited',true); end if;
 delete from humas.alumni_intake_rate_limits where updated_at<now()-interval '30 days';
 insert into humas.alumni_intake_submissions(
  full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,institution,study_program,
  employer,job_title,business_name,industry,survey_year,contact_preference,consent_data_processing,
  consent_school_updates,consent_events,consent_fundraising,consent_career_network,consent_recorded_at,consent_source
 ) values(
  pg_catalog.btrim(p_payload->>'full_name'),v_year,nullif(pg_catalog.btrim(p_payload->>'last_class'),''),
  nullif(pg_catalog.btrim(p_payload->>'whatsapp'),''),nullif(pg_catalog.lower(pg_catalog.btrim(p_payload->>'email')),''),
  nullif(pg_catalog.btrim(p_payload->>'city'),''),nullif(pg_catalog.btrim(p_payload->>'province'),''),
  coalesce(p_payload->>'current_status','not_reported'),nullif(pg_catalog.btrim(p_payload->>'institution'),''),
  nullif(pg_catalog.btrim(p_payload->>'study_program'),''),nullif(pg_catalog.btrim(p_payload->>'employer'),''),
  nullif(pg_catalog.btrim(p_payload->>'job_title'),''),nullif(pg_catalog.btrim(p_payload->>'business_name'),''),
  nullif(pg_catalog.btrim(p_payload->>'industry'),''),v_survey_year,coalesce(p_payload->>'contact_preference','none'),
  true,coalesce((p_payload->>'consent_school_updates')::boolean,false),coalesce((p_payload->>'consent_events')::boolean,false),
  coalesce((p_payload->>'consent_fundraising')::boolean,false),coalesce((p_payload->>'consent_career_network')::boolean,false),
  now(),'Formulir publik Tracer Study Alumni'
 ) returning * into v_row;
 return pg_catalog.jsonb_build_object('ok',true,'submission_id',v_row.id,'status',v_row.status);
end;
$$;

create or replace function humas.alumni_intake_review(p_actor_id uuid,p_actor_role text,p_submission_id uuid,p_action text,p_note text default null)
returns jsonb language plpgsql set search_path='' as $$
declare v_intake humas.alumni_intake_submissions%rowtype;v_profile humas.alumni_profiles%rowtype;v_duplicate uuid;
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if p_action is null or p_action not in('approve','reject') then raise exception using errcode='22023',message='invalid_review_action'; end if;
 select * into v_intake from humas.alumni_intake_submissions where id=p_submission_id and status='pending' for update;
 if not found then raise exception using errcode='P0002',message='pending_intake_not_found'; end if;
 if nullif(regexp_replace(coalesce(v_intake.whatsapp,''),'[^0-9]','','g'),'') is not null then
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_intake.graduation_year::text||':phone:'||regexp_replace(coalesce(v_intake.whatsapp,''),'[^0-9]','','g'),0));
 end if;
 if nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(v_intake.email,''))),'') is not null then
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_intake.graduation_year::text||':email:'||pg_catalog.lower(pg_catalog.btrim(coalesce(v_intake.email,''))),0));
 end if;
 if p_action='reject' then
  update humas.alumni_intake_submissions set status='rejected',reviewed_at=now(),reviewed_by=p_actor_id,review_note=nullif(pg_catalog.btrim(p_note),'')
   where id=p_submission_id returning * into v_intake;
  return pg_catalog.jsonb_build_object('status','rejected','submission_id',v_intake.id);
 end if;
 select id into v_duplicate from humas.alumni_profiles p
 where p.record_status='active' and p.graduation_year=v_intake.graduation_year and (
  (nullif(regexp_replace(coalesce(p.whatsapp,''),'[^0-9]','','g'),'') is not null and regexp_replace(coalesce(p.whatsapp,''),'[^0-9]','','g')=regexp_replace(coalesce(v_intake.whatsapp,''),'[^0-9]','','g'))
  or (nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(p.email,''))),'') is not null and pg_catalog.lower(pg_catalog.btrim(coalesce(p.email,'')))=pg_catalog.lower(pg_catalog.btrim(coalesce(v_intake.email,''))))
 ) limit 1;
 if v_duplicate is not null then return pg_catalog.jsonb_build_object('status','duplicate_possible','submission_id',v_intake.id,'matching_profile_id',v_duplicate); end if;
 insert into humas.alumni_profiles(
  full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,institution,study_program,
  employer,job_title,business_name,industry,survey_year,contact_preference,consent_school_updates,consent_events,
  consent_fundraising,consent_career_network,consent_updated_at,consent_source,record_status,created_by,updated_by
 ) values(
  v_intake.full_name,v_intake.graduation_year,v_intake.last_class,v_intake.whatsapp,v_intake.email,v_intake.city,
  v_intake.province,v_intake.current_status,v_intake.institution,v_intake.study_program,v_intake.employer,v_intake.job_title,
  v_intake.business_name,v_intake.industry,v_intake.survey_year,v_intake.contact_preference,v_intake.consent_school_updates,
  v_intake.consent_events,v_intake.consent_fundraising,v_intake.consent_career_network,v_intake.consent_recorded_at,
  v_intake.consent_source,'active',p_actor_id,p_actor_id
 ) returning * into v_profile;
 update humas.alumni_intake_submissions set status='approved',reviewed_at=now(),reviewed_by=p_actor_id,
  review_note=nullif(pg_catalog.btrim(p_note),''),created_profile_id=v_profile.id
 where id=p_submission_id returning * into v_intake;
 return pg_catalog.jsonb_build_object('status','approved','submission_id',v_intake.id,'profile_id',v_profile.id);
end;
$$;
revoke all on function humas.alumni_intake_submit(text,jsonb),humas.alumni_intake_review(uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function humas.alumni_intake_submit(text,jsonb),humas.alumni_intake_review(uuid,text,uuid,text,text) to service_role;
