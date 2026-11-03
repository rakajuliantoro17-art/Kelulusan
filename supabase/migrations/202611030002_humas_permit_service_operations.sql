-- PINTUKU HUMAS Sprint 4: permit service operations, SLA controls and internal activity.
-- Depends on permit foundation/transactions (011-015) and protocol task assignment (016).
-- Additive migration: no existing permit or workflow rows are deleted or rewritten.

alter table humas.permit_requests
  add column if not exists priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  add column if not exists first_response_due_at timestamptz,
  add column if not exists first_responded_at timestamptz,
  add column if not exists resolution_due_at timestamptz,
  add column if not exists sla_paused_at timestamptz,
  add column if not exists sla_pause_reason text,
  add column if not exists last_activity_at timestamptz;

update humas.permit_requests
set last_activity_at = coalesce(last_activity_at, updated_at, created_at)
where last_activity_at is null;

create index if not exists permit_requests_priority_sla_idx
  on humas.permit_requests(priority, resolution_due_at, status)
  where status not in ('completed','rejected','cancelled','archived');

create index if not exists permit_requests_response_sla_idx
  on humas.permit_requests(first_response_due_at, status)
  where submitted_at is not null and status not in ('completed','rejected','cancelled','archived');

create table if not exists humas.permit_internal_notes (
  id bigint generated always as identity primary key,
  permit_id uuid not null references humas.permit_requests(id) on delete cascade,
  note text not null check (length(btrim(note)) between 1 and 5000),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  created_at timestamptz not null default now()
);

create table if not exists humas.permit_communications (
  id bigint generated always as identity primary key,
  permit_id uuid not null references humas.permit_requests(id) on delete cascade,
  channel text not null check (channel in ('email','phone','whatsapp','in_person','letter','other')),
  direction text not null check (direction in ('inbound','outbound','internal')),
  contact_name text,
  subject text,
  summary text not null check (length(btrim(summary)) between 1 and 5000),
  contacted_at timestamptz not null default now(),
  follow_up_at timestamptz,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  created_at timestamptz not null default now(),
  constraint permit_communication_followup_after_contact
    check (follow_up_at is null or follow_up_at >= contacted_at)
);

create index if not exists permit_internal_notes_timeline_idx
  on humas.permit_internal_notes(permit_id, created_at desc);
create index if not exists permit_communications_timeline_idx
  on humas.permit_communications(permit_id, contacted_at desc);
create index if not exists permit_communications_followup_idx
  on humas.permit_communications(follow_up_at)
  where follow_up_at is not null;

alter table humas.permit_internal_notes enable row level security;
alter table humas.permit_communications enable row level security;

revoke all on table humas.permit_internal_notes,humas.permit_communications
  from public,anon,authenticated;
grant select,insert on table humas.permit_internal_notes,humas.permit_communications
  to service_role;
grant usage,select on sequence humas.permit_internal_notes_id_seq,
  humas.permit_communications_id_seq to service_role;

drop trigger if exists permit_internal_notes_append_only on humas.permit_internal_notes;
create trigger permit_internal_notes_append_only
before update or delete on humas.permit_internal_notes
for each row execute function humas.reject_permit_protocol_event_mutation();

drop trigger if exists permit_communications_append_only on humas.permit_communications;
create trigger permit_communications_append_only
before update or delete on humas.permit_communications
for each row execute function humas.reject_permit_protocol_event_mutation();

create or replace function humas.permit_set_service_level(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_priority text,
  p_first_response_due_at timestamptz,p_resolution_due_at timestamptz,
  p_pause boolean default false,p_pause_reason text default null
) returns jsonb
language plpgsql
set search_path=''
as $$
declare
  v_before humas.permit_requests%rowtype;
  v_after humas.permit_requests%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_priority is null or p_priority not in ('low','normal','high','urgent')
    or (p_pause and nullif(pg_catalog.btrim(coalesce(p_pause_reason,'')),'') is null)
    or (p_first_response_due_at is not null and p_resolution_due_at is not null
      and p_resolution_due_at < p_first_response_due_at) then
    raise exception using errcode='22023',message='invalid_service_level';
  end if;
  select * into v_before from humas.permit_requests where id=p_permit_id for update;
  if not found then raise exception using errcode='P0002',message='permit_not_found'; end if;
  if v_before.status in ('completed','rejected','cancelled','archived') then
    raise exception using errcode='22023',message='permit_closed';
  end if;

  update humas.permit_requests set
    priority=p_priority,
    first_response_due_at=p_first_response_due_at,
    resolution_due_at=case
      when not p_pause and sla_paused_at is not null
        then resolution_due_at + (pg_catalog.now()-sla_paused_at)
      else p_resolution_due_at end,
    first_response_due_at=case
      when not p_pause and sla_paused_at is not null
        then first_response_due_at + (pg_catalog.now()-sla_paused_at)
      else p_first_response_due_at end,
    sla_paused_at=case when p_pause then coalesce(sla_paused_at,pg_catalog.now()) else null end,
    sla_pause_reason=case when p_pause then nullif(pg_catalog.btrim(p_pause_reason),'') else null end,
    last_activity_at=pg_catalog.now()
  where id=p_permit_id returning * into v_after;

  insert into humas.permit_workflow_events(
    permit_id,event_type,actor_id,actor_role,metadata
  ) values (
    p_permit_id,'service_level_updated',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object(
      'previous_priority',v_before.priority,'priority',v_after.priority,
      'first_response_due_at',v_after.first_response_due_at,
      'resolution_due_at',v_after.resolution_due_at,
      'sla_paused_at',v_after.sla_paused_at,
      'sla_pause_reason',v_after.sla_pause_reason
    )
  );
  return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.permit_internal_note_create(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_note text
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_row humas.permit_internal_notes%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_note is null or pg_catalog.length(pg_catalog.btrim(p_note)) not between 1 and 5000 then
    raise exception using errcode='22023',message='invalid_internal_note';
  end if;
  if not exists(select 1 from humas.permit_requests p
    where p.id=p_permit_id and p.status not in ('completed','rejected','cancelled','archived')) then
    raise exception using errcode='P0002',message='permit_not_available';
  end if;
  insert into humas.permit_internal_notes(permit_id,note,actor_id,actor_role)
  values(p_permit_id,pg_catalog.btrim(p_note),p_actor_id,p_actor_role)
  returning * into v_row;
  update humas.permit_requests set last_activity_at=pg_catalog.now() where id=p_permit_id;
  insert into humas.permit_workflow_events(permit_id,event_type,actor_id,actor_role,metadata)
  values(p_permit_id,'internal_note_added',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('note_id',v_row.id));
  return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.permit_communication_log_create(
  p_actor_id uuid,p_actor_role text,p_permit_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_row humas.permit_communications%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
    or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
      and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object'
    or coalesce(p_payload->>'channel','') not in ('email','phone','whatsapp','in_person','letter','other')
    or coalesce(p_payload->>'direction','') not in ('inbound','outbound','internal')
    or pg_catalog.length(pg_catalog.btrim(coalesce(p_payload->>'summary',''))) not between 1 and 5000 then
    raise exception using errcode='22023',message='invalid_communication_log';
  end if;
  if not exists(select 1 from humas.permit_requests p
    where p.id=p_permit_id and p.status not in ('completed','rejected','cancelled','archived')) then
    raise exception using errcode='P0002',message='permit_not_available';
  end if;
  insert into humas.permit_communications(
    permit_id,channel,direction,contact_name,subject,summary,contacted_at,follow_up_at,actor_id,actor_role
  ) values (
    p_permit_id,p_payload->>'channel',p_payload->>'direction',
    nullif(pg_catalog.btrim(p_payload->>'contact_name'),''),
    nullif(pg_catalog.btrim(p_payload->>'subject'),''),
    pg_catalog.btrim(p_payload->>'summary'),
    coalesce(nullif(p_payload->>'contacted_at','')::timestamptz,pg_catalog.now()),
    nullif(p_payload->>'follow_up_at','')::timestamptz,p_actor_id,p_actor_role
  ) returning * into v_row;
  update humas.permit_requests set
    last_activity_at=pg_catalog.now(),
    first_responded_at=case
      when v_row.direction='outbound' then coalesce(first_responded_at,v_row.contacted_at)
      else first_responded_at end
  where id=p_permit_id;
  insert into humas.permit_workflow_events(permit_id,event_type,actor_id,actor_role,metadata)
  values(p_permit_id,'communication_logged',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('communication_id',v_row.id,'channel',v_row.channel,'direction',v_row.direction));
  return pg_catalog.to_jsonb(v_row);
end;
$$;

create or replace function humas.permit_operational_summary()
returns jsonb
language sql stable
set search_path=''
as $$
select pg_catalog.jsonb_build_object(
  'open_total',(select count(*) from humas.permit_requests
    where status not in ('completed','rejected','cancelled','archived')),
  'unassigned',(select count(*) from humas.permit_requests
    where status not in ('draft','completed','rejected','cancelled','archived') and assigned_staff is null),
  'urgent',(select count(*) from humas.permit_requests
    where priority='urgent' and status not in ('completed','rejected','cancelled','archived')),
  'high_priority',(select count(*) from humas.permit_requests
    where priority='high' and status not in ('completed','rejected','cancelled','archived')),
  'response_overdue',(select count(*) from humas.permit_requests
    where submitted_at is not null and first_responded_at is null
      and first_response_due_at < pg_catalog.now() and sla_paused_at is null and status not in ('completed','rejected','cancelled','archived')),
  'resolution_overdue',(select count(*) from humas.permit_requests
    where resolution_due_at < pg_catalog.now() and sla_paused_at is null
      and status not in ('completed','rejected','cancelled','archived')),
  'followups_due',(select count(*) from humas.permit_communications c
    join humas.permit_requests p on p.id=c.permit_id
    where c.follow_up_at <= pg_catalog.now()
      and p.status not in ('completed','rejected','cancelled','archived')),
  'protocol_tasks_overdue',(select count(*) from humas.protocol_tasks t
    join humas.protocol_agendas a on a.id=t.agenda_id
    where t.due_at < pg_catalog.now() and t.task_status in ('pending','in_progress','blocked')
      and a.status not in ('completed','cancelled'))
);
$$;

revoke all on function humas.permit_set_service_level(uuid,text,uuid,text,timestamptz,timestamptz,boolean,text),
  humas.permit_internal_note_create(uuid,text,uuid,text),
  humas.permit_communication_log_create(uuid,text,uuid,jsonb),
  humas.permit_operational_summary()
  from public,anon,authenticated;
grant execute on function humas.permit_set_service_level(uuid,text,uuid,text,timestamptz,timestamptz,boolean,text),
  humas.permit_internal_note_create(uuid,text,uuid,text),
  humas.permit_communication_log_create(uuid,text,uuid,jsonb),
  humas.permit_operational_summary()
  to service_role;

comment on table humas.permit_internal_notes is
  'Private append-only operational notes visible only through trusted HUMAS server APIs.';
comment on table humas.permit_communications is
  'Private append-only communication and follow-up register for permit requests.';
comment on function humas.permit_operational_summary() is
  'Operational KPI summary for active permit SLAs, follow-ups and overdue protocol checklist tasks.';
