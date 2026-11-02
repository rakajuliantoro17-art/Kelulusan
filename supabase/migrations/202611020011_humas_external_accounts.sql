-- PINTUKU HUMAS — self-service external accounts and profile onboarding.
-- Internal HUMAS roles remain separately provisioned and are never self-assignable.

create table if not exists humas.external_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 account_type text not null check(account_type in('alumni','partner','committee','public')),
 full_name text not null check(length(btrim(full_name)) between 2 and 180),
 phone text not null check(length(btrim(phone)) between 8 and 40),
 school_relationship text,
 graduation_year integer check(graduation_year between 1950 and 2100),
 organization_name text,
 organization_role text,
 city text,
 province text,
 purpose text,
 consent_terms boolean not null check(consent_terms=true),
 consent_recorded_at timestamptz not null default now(),
 profile_status text not null default 'pending_review' check(profile_status in('pending_review','verified','rejected')),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id) on delete set null,
 review_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(account_type='alumni' or graduation_year is null),
 check(account_type not in('partner','committee') or nullif(btrim(organization_name),'') is not null)
);
create index if not exists external_profiles_status_created_idx on humas.external_profiles(profile_status,created_at desc);
alter table humas.external_profiles enable row level security;
revoke all on table humas.external_profiles from public,anon,authenticated,service_role;
grant select,insert,update on table humas.external_profiles to service_role;

create or replace function humas.external_profile_upsert(p_user_id uuid,p_payload jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare v_row humas.external_profiles%rowtype;v_year integer;
begin
 if p_user_id is null or p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' then
  raise exception using errcode='22023',message='invalid_external_profile';
 end if;
 if coalesce(p_payload->>'account_type','') not in('alumni','partner','committee','public')
  or nullif(pg_catalog.btrim(p_payload->>'full_name'),'') is null
  or pg_catalog.length(pg_catalog.btrim(p_payload->>'full_name')) not between 2 and 180
  or pg_catalog.length(pg_catalog.btrim(coalesce(p_payload->>'phone',''))) not between 8 and 40
  or coalesce(p_payload->>'consent_terms','false')<>'true' then
  raise exception using errcode='22023',message='invalid_external_profile';
 end if;
 if p_payload->>'account_type'='alumni' then
  if coalesce(p_payload->>'graduation_year','') !~ '^[0-9]{4}$' then raise exception using errcode='22023',message='invalid_graduation_year'; end if;
  v_year:=(p_payload->>'graduation_year')::integer;
  if v_year not between 1950 and 2100 then raise exception using errcode='22023',message='invalid_graduation_year'; end if;
 end if;
 if p_payload->>'account_type' in('partner','committee') and nullif(pg_catalog.btrim(p_payload->>'organization_name'),'') is null then
  raise exception using errcode='22023',message='organization_required';
 end if;
 insert into humas.external_profiles as existing(
  user_id,account_type,full_name,phone,school_relationship,graduation_year,organization_name,
  organization_role,city,province,purpose,consent_terms,consent_recorded_at,profile_status,updated_at
 ) values(
  p_user_id,p_payload->>'account_type',pg_catalog.btrim(p_payload->>'full_name'),pg_catalog.btrim(p_payload->>'phone'),
  nullif(pg_catalog.btrim(p_payload->>'school_relationship'),''),v_year,
  nullif(pg_catalog.btrim(p_payload->>'organization_name'),''),nullif(pg_catalog.btrim(p_payload->>'organization_role'),''),
  nullif(pg_catalog.btrim(p_payload->>'city'),''),nullif(pg_catalog.btrim(p_payload->>'province'),''),
  nullif(pg_catalog.btrim(p_payload->>'purpose'),''),true,now(),'pending_review',now()
 )
 on conflict(user_id) do update set
  account_type=excluded.account_type,full_name=excluded.full_name,phone=excluded.phone,
  school_relationship=excluded.school_relationship,graduation_year=excluded.graduation_year,
  organization_name=excluded.organization_name,organization_role=excluded.organization_role,
  city=excluded.city,province=excluded.province,purpose=excluded.purpose,
  consent_terms=true,consent_recorded_at=now(),
  profile_status=case when existing.profile_status='verified' then 'pending_review' else humas.external_profiles.profile_status end,
  reviewed_at=case when humas.external_profiles.profile_status='verified' then null else existing.reviewed_at end,
  reviewed_by=case when humas.external_profiles.profile_status='verified' then null else existing.reviewed_by end,
  updated_at=now()
 returning * into v_row;
 return pg_catalog.jsonb_build_object(
  'user_id',v_row.user_id,'account_type',v_row.account_type,'full_name',v_row.full_name,
  'phone',v_row.phone,'school_relationship',v_row.school_relationship,'graduation_year',v_row.graduation_year,
  'organization_name',v_row.organization_name,'organization_role',v_row.organization_role,
  'city',v_row.city,'province',v_row.province,'purpose',v_row.purpose,
  'profile_status',v_row.profile_status,'created_at',v_row.created_at,'updated_at',v_row.updated_at
 );
end;
$$;
revoke all on function humas.external_profile_upsert(uuid,jsonb) from public,anon,authenticated;
grant execute on function humas.external_profile_upsert(uuid,jsonb) to service_role;
