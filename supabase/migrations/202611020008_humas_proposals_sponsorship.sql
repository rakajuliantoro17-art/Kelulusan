-- PINTUKU HUMAS — Proposal & Sponsorship
-- Source migration only. Apply after HUMAS migrations 001–007 are reviewed and tested.
-- No Supabase Production schema is modified by committing this file.

create table if not exists humas.proposals (
  id uuid primary key default gen_random_uuid(),
  proposal_code text unique,
  title text not null check (length(btrim(title)) between 3 and 250),
  category text not null check (category in (
    'education','student_activity','sports','facility','community','event','other'
  )),
  description text not null,
  objectives text,
  target_audience text,
  requested_amount numeric(16,2) not null default 0 check (requested_amount >= 0),
  proposal_date date not null default current_date,
  submission_deadline date,
  activity_start_date date,
  activity_end_date date,
  owner_unit text,
  coordinator_name text,
  coordinator_contact text,
  status text not null default 'draft' check (status in (
    'draft','submitted','under_review','revision_required','approved','rejected',
    'fundraising','funded','in_progress','completed','cancelled','archived'
  )),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposal_deadline_order check (
    submission_deadline is null or submission_deadline >= proposal_date
  ),
  constraint proposal_activity_date_order check (
    activity_start_date is null or activity_end_date is null
    or activity_end_date >= activity_start_date
  )
);

create table if not exists humas.proposal_supports (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references humas.proposals(id) on delete restrict,
  partner_id uuid references humas.partners(id) on delete set null,
  sponsor_name text not null check (length(btrim(sponsor_name)) between 2 and 180),
  support_type text not null check (support_type in (
    'cash','goods','services','facility','other'
  )),
  support_description text,
  estimated_value numeric(16,2) not null default 0 check (estimated_value >= 0),
  realized_value numeric(16,2) not null default 0 check (realized_value >= 0),
  support_status text not null default 'prospect' check (support_status in (
    'prospect','contacted','proposed','committed','partially_realized','realized','declined'
  )),
  contact_person text,
  contact_date date,
  commitment_date date,
  realization_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_realized_not_overflow check (
    estimated_value = 0 or realized_value <= estimated_value
  )
);

create table if not exists humas.proposal_events (
  id bigint generated always as identity primary key,
  proposal_id uuid not null references humas.proposals(id) on delete restrict,
  support_id uuid references humas.proposal_supports(id) on delete set null,
  event_type text not null check (event_type in (
    'created','updated','status_changed','support_created','support_updated'
  )),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null check (actor_role = 'staff_humas'),
  before_data jsonb,
  after_data jsonb,
  reason text,
  occurred_at timestamptz not null default now()
);

create index if not exists proposals_status_created_idx
  on humas.proposals(status, created_at desc);
create index if not exists proposals_category_created_idx
  on humas.proposals(category, created_at desc);
create index if not exists proposals_deadline_idx
  on humas.proposals(submission_deadline)
  where submission_deadline is not null;
create index if not exists proposal_supports_proposal_idx
  on humas.proposal_supports(proposal_id, created_at desc);
create index if not exists proposal_supports_partner_idx
  on humas.proposal_supports(partner_id)
  where partner_id is not null;
create index if not exists proposal_events_timeline_idx
  on humas.proposal_events(proposal_id, occurred_at desc);

create or replace function humas.enforce_proposal_audit_actor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.actor_id is null or new.actor_role is distinct from 'staff_humas'
     or not exists (
       select 1 from humas.user_roles ur
       where ur.user_id = new.actor_id
         and ur.role_code = 'staff_humas'
         and ur.is_active = true
         and ur.revoked_at is null
     ) then
    raise exception using errcode='42501', message='active_staff_humas_role_required';
  end if;
  return new;
end;
$$;

create or replace function humas.reject_proposal_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode='42501', message='proposal_events_are_append_only';
end;
$$;

drop trigger if exists proposals_set_updated_at on humas.proposals;
create trigger proposals_set_updated_at
before update on humas.proposals
for each row execute function humas.set_updated_at();

drop trigger if exists proposal_supports_set_updated_at on humas.proposal_supports;
create trigger proposal_supports_set_updated_at
before update on humas.proposal_supports
for each row execute function humas.set_updated_at();

drop trigger if exists proposal_events_validate_actor on humas.proposal_events;
create trigger proposal_events_validate_actor
before insert on humas.proposal_events
for each row execute function humas.enforce_proposal_audit_actor();

drop trigger if exists proposal_events_append_only on humas.proposal_events;
create trigger proposal_events_append_only
before update or delete on humas.proposal_events
for each row execute function humas.reject_proposal_event_mutation();

alter table humas.proposals enable row level security;
alter table humas.proposal_supports enable row level security;
alter table humas.proposal_events enable row level security;

revoke all on table humas.proposals, humas.proposal_supports, humas.proposal_events from public, anon, authenticated;
revoke all on table humas.proposals, humas.proposal_supports, humas.proposal_events from service_role;
grant select, insert, update on table humas.proposals, humas.proposal_supports to service_role;
grant select, insert on table humas.proposal_events to service_role;
grant usage, select on sequence humas.proposal_events_id_seq to service_role;

create or replace function humas.proposal_create(
  p_actor_id uuid, p_actor_role text, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_row humas.proposals%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object'
     or nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
     or coalesce(p_payload->>'category','') not in
       ('education','student_activity','sports','facility','community','event','other')
     or nullif(pg_catalog.btrim(p_payload->>'description'),'') is null then
    raise exception using errcode='22023', message='invalid_proposal_payload';
  end if;

  insert into humas.proposals (
    title,category,description,objectives,target_audience,requested_amount,
    proposal_date,submission_deadline,activity_start_date,activity_end_date,
    owner_unit,coordinator_name,coordinator_contact,status,created_by
  ) values (
    pg_catalog.btrim(p_payload->>'title'),p_payload->>'category',
    pg_catalog.btrim(p_payload->>'description'),
    nullif(pg_catalog.btrim(p_payload->>'objectives'),''),
    nullif(pg_catalog.btrim(p_payload->>'target_audience'),''),
    coalesce(nullif(p_payload->>'requested_amount','')::numeric,0),
    coalesce(nullif(p_payload->>'proposal_date','')::date,current_date),
    nullif(p_payload->>'submission_deadline','')::date,
    nullif(p_payload->>'activity_start_date','')::date,
    nullif(p_payload->>'activity_end_date','')::date,
    nullif(pg_catalog.btrim(p_payload->>'owner_unit'),''),
    nullif(pg_catalog.btrim(p_payload->>'coordinator_name'),''),
    nullif(pg_catalog.btrim(p_payload->>'coordinator_contact'),''),
    'draft',p_actor_id
  ) returning * into v_row;

  insert into humas.proposal_events(proposal_id,event_type,actor_id,actor_role,after_data)
  values(v_row.id,'created',p_actor_id,p_actor_role,pg_catalog.to_jsonb(v_row)-'created_by');
  return pg_catalog.to_jsonb(v_row)-'created_by';
end;
$$;

create or replace function humas.proposal_update(
  p_actor_id uuid, p_actor_role text, p_proposal_id uuid, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.proposals%rowtype; v_after humas.proposals%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' or p_payload='{}'::jsonb then
    raise exception using errcode='22023', message='empty_update';
  end if;
  select * into v_before from humas.proposals where id=p_proposal_id for update;
  if not found then raise exception using errcode='P0002', message='proposal_not_found'; end if;
  if v_before.status not in ('draft','revision_required') then
    raise exception using errcode='22023', message='proposal_not_editable';
  end if;
  if p_payload ? 'category' and coalesce(p_payload->>'category','') not in
    ('education','student_activity','sports','facility','community','event','other') then
    raise exception using errcode='22023', message='invalid_category';
  end if;

  update humas.proposals set
    title=case when p_payload?'title' then nullif(pg_catalog.btrim(p_payload->>'title'),'') else title end,
    category=case when p_payload?'category' then p_payload->>'category' else category end,
    description=case when p_payload?'description' then nullif(pg_catalog.btrim(p_payload->>'description'),'') else description end,
    objectives=case when p_payload?'objectives' then nullif(pg_catalog.btrim(p_payload->>'objectives'),'') else objectives end,
    target_audience=case when p_payload?'target_audience' then nullif(pg_catalog.btrim(p_payload->>'target_audience'),'') else target_audience end,
    requested_amount=case when p_payload?'requested_amount' then coalesce(nullif(p_payload->>'requested_amount','')::numeric,0) else requested_amount end,
    proposal_date=case when p_payload?'proposal_date' then coalesce(nullif(p_payload->>'proposal_date','')::date,current_date) else proposal_date end,
    submission_deadline=case when p_payload?'submission_deadline' then nullif(p_payload->>'submission_deadline','')::date else submission_deadline end,
    activity_start_date=case when p_payload?'activity_start_date' then nullif(p_payload->>'activity_start_date','')::date else activity_start_date end,
    activity_end_date=case when p_payload?'activity_end_date' then nullif(p_payload->>'activity_end_date','')::date else activity_end_date end,
    owner_unit=case when p_payload?'owner_unit' then nullif(pg_catalog.btrim(p_payload->>'owner_unit'),'') else owner_unit end,
    coordinator_name=case when p_payload?'coordinator_name' then nullif(pg_catalog.btrim(p_payload->>'coordinator_name'),'') else coordinator_name end,
    coordinator_contact=case when p_payload?'coordinator_contact' then nullif(pg_catalog.btrim(p_payload->>'coordinator_contact'),'') else coordinator_contact end
  where id=p_proposal_id returning * into v_after;

  if v_after.title is null or v_after.description is null then
    raise exception using errcode='22023', message='proposal_required_fields';
  end if;
  insert into humas.proposal_events(proposal_id,event_type,actor_id,actor_role,before_data,after_data)
  values(v_after.id,'updated',p_actor_id,p_actor_role,pg_catalog.to_jsonb(v_before)-'created_by',pg_catalog.to_jsonb(v_after)-'created_by');
  return pg_catalog.to_jsonb(v_after)-'created_by';
end;
$$;

create or replace function humas.proposal_set_status(
  p_actor_id uuid, p_actor_role text, p_proposal_id uuid, p_status text, p_reason text
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.proposals%rowtype; v_after humas.proposals%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if p_status is null or p_status not in ('draft','submitted','under_review','revision_required','approved','rejected',
    'fundraising','funded','in_progress','completed','cancelled','archived') then
    raise exception using errcode='22023', message='invalid_proposal_status';
  end if;
  select * into v_before from humas.proposals where id=p_proposal_id for update;
  if not found then raise exception using errcode='P0002', message='proposal_not_found'; end if;
  if not (
    (v_before.status='draft' and p_status in ('submitted','cancelled')) or
    (v_before.status='submitted' and p_status in ('under_review','revision_required','approved','rejected','cancelled')) or
    (v_before.status='under_review' and p_status in ('revision_required','approved','rejected','cancelled')) or
    (v_before.status='revision_required' and p_status in ('submitted','cancelled')) or
    (v_before.status='approved' and p_status in ('fundraising','in_progress','cancelled')) or
    (v_before.status='fundraising' and p_status in ('funded','in_progress','cancelled')) or
    (v_before.status='funded' and p_status in ('in_progress','cancelled')) or
    (v_before.status='in_progress' and p_status in ('completed','cancelled')) or
    (v_before.status in ('completed','rejected','cancelled') and p_status='archived')
  ) then
    raise exception using errcode='22023', message='invalid_proposal_transition';
  end if;
  update humas.proposals set status=p_status where id=p_proposal_id returning * into v_after;
  insert into humas.proposal_events(proposal_id,event_type,actor_id,actor_role,before_data,after_data,reason)
  values(v_after.id,'status_changed',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('status',v_before.status),
    pg_catalog.jsonb_build_object('status',v_after.status),nullif(pg_catalog.btrim(p_reason),''));
  return pg_catalog.to_jsonb(v_after)-'created_by';
end;
$$;

create or replace function humas.proposal_support_create(
  p_actor_id uuid, p_actor_role text, p_proposal_id uuid, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_row humas.proposal_supports%rowtype; v_partner_name text;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if not exists(select 1 from humas.proposals where id=p_proposal_id) then
    raise exception using errcode='P0002', message='proposal_not_found';
  end if;
  if nullif(pg_catalog.btrim(p_payload->>'sponsor_name'),'') is null
     or coalesce(p_payload->>'support_type','') not in ('cash','goods','services','facility','other') then
    raise exception using errcode='22023', message='invalid_support_payload';
  end if;
  if nullif(p_payload->>'partner_id','') is not null then
    select partner_name into v_partner_name from humas.partners
      where id=(p_payload->>'partner_id')::uuid and record_status='active';
    if not found then raise exception using errcode='22023', message='partner_not_active'; end if;
  end if;
  insert into humas.proposal_supports(
    proposal_id,partner_id,sponsor_name,support_type,support_description,
    estimated_value,realized_value,support_status,contact_person,contact_date,
    commitment_date,realization_date,notes,created_by
  ) values(
    p_proposal_id,nullif(p_payload->>'partner_id','')::uuid,
    coalesce(v_partner_name,pg_catalog.btrim(p_payload->>'sponsor_name')),
    p_payload->>'support_type',
    nullif(pg_catalog.btrim(p_payload->>'support_description'),''),
    coalesce(nullif(p_payload->>'estimated_value','')::numeric,0),
    0,'prospect',nullif(pg_catalog.btrim(p_payload->>'contact_person'),''),
    nullif(p_payload->>'contact_date','')::date,null,null,
    nullif(pg_catalog.btrim(p_payload->>'notes'),''),p_actor_id
  ) returning * into v_row;
  insert into humas.proposal_events(proposal_id,support_id,event_type,actor_id,actor_role,after_data)
  values(p_proposal_id,v_row.id,'support_created',p_actor_id,p_actor_role,pg_catalog.to_jsonb(v_row)-'created_by');
  return pg_catalog.to_jsonb(v_row)-'created_by';
end;
$$;

create or replace function humas.proposal_support_update(
  p_actor_id uuid, p_actor_role text, p_support_id uuid, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.proposal_supports%rowtype; v_after humas.proposal_supports%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' or p_payload='{}'::jsonb then
    raise exception using errcode='22023', message='empty_update';
  end if;
  select * into v_before from humas.proposal_supports where id=p_support_id for update;
  if not found then raise exception using errcode='P0002', message='support_not_found'; end if;
  if p_payload ? 'support_status' and coalesce(p_payload->>'support_status','') not in
    ('prospect','contacted','proposed','committed','partially_realized','realized','declined') then
    raise exception using errcode='22023', message='invalid_support_status';
  end if;
  update humas.proposal_supports set
    estimated_value=case when p_payload?'estimated_value' then coalesce(nullif(p_payload->>'estimated_value','')::numeric,0) else estimated_value end,
    realized_value=case when p_payload?'realized_value' then coalesce(nullif(p_payload->>'realized_value','')::numeric,0) else realized_value end,
    support_status=case when p_payload?'support_status' then p_payload->>'support_status' else support_status end,
    support_description=case when p_payload?'support_description' then nullif(pg_catalog.btrim(p_payload->>'support_description'),'') else support_description end,
    contact_person=case when p_payload?'contact_person' then nullif(pg_catalog.btrim(p_payload->>'contact_person'),'') else contact_person end,
    contact_date=case when p_payload?'contact_date' then nullif(p_payload->>'contact_date','')::date else contact_date end,
    commitment_date=case when p_payload?'commitment_date' then nullif(p_payload->>'commitment_date','')::date else commitment_date end,
    realization_date=case when p_payload?'realization_date' then nullif(p_payload->>'realization_date','')::date else realization_date end,
    notes=case when p_payload?'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end
  where id=p_support_id returning * into v_after;
  if v_after.realized_value > v_after.estimated_value and v_after.estimated_value > 0 then
    raise exception using errcode='22023', message='realized_value_exceeds_estimate';
  end if;
  insert into humas.proposal_events(proposal_id,support_id,event_type,actor_id,actor_role,before_data,after_data)
  values(v_after.proposal_id,v_after.id,'support_updated',p_actor_id,p_actor_role,
    pg_catalog.to_jsonb(v_before)-'created_by',pg_catalog.to_jsonb(v_after)-'created_by');
  return pg_catalog.to_jsonb(v_after)-'created_by';
end;
$$;

create or replace function humas.proposal_summary()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'total_proposals',(select count(*) from humas.proposals),
    'in_process',(select count(*) from humas.proposals where status in ('submitted','under_review','revision_required','approved','fundraising','funded','in_progress')),
    'approved',(select count(*) from humas.proposals where status in ('approved','fundraising','funded','in_progress','completed')),
    'committed_support',(select coalesce(sum(estimated_value),0) from humas.proposal_supports where support_status in ('committed','partially_realized','realized')),
    'realized_support',(select coalesce(sum(realized_value),0) from humas.proposal_supports where support_status in ('partially_realized','realized'))
  );
$$;

revoke all on function humas.enforce_proposal_audit_actor() from public,anon,authenticated;
revoke all on function humas.reject_proposal_event_mutation() from public,anon,authenticated;
revoke all on function humas.proposal_create(uuid,text,jsonb) from public,anon,authenticated;
revoke all on function humas.proposal_update(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function humas.proposal_set_status(uuid,text,uuid,text,text) from public,anon,authenticated;
revoke all on function humas.proposal_support_create(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function humas.proposal_support_update(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function humas.proposal_summary() from public,anon,authenticated;
grant execute on function humas.proposal_create(uuid,text,jsonb) to service_role;
grant execute on function humas.proposal_update(uuid,text,uuid,jsonb) to service_role;
grant execute on function humas.proposal_set_status(uuid,text,uuid,text,text) to service_role;
grant execute on function humas.proposal_support_create(uuid,text,uuid,jsonb) to service_role;
grant execute on function humas.proposal_support_update(uuid,text,uuid,jsonb) to service_role;
grant execute on function humas.proposal_summary() to service_role;

comment on table humas.proposals is 'Proposal kegiatan dan sponsorship sekolah; dikelola server-side oleh HUMAS.';
comment on table humas.proposal_supports is 'Komitmen dukungan sponsor berupa uang/barang/jasa/fasilitas.';
comment on table humas.proposal_events is 'Audit append-only untuk proposal dan tindak lanjut sponsor.';
