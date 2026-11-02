-- PINTUKU / HUMAS — Sprint 1: permits and protocol foundation
-- Source migration only. Apply after HUMAS migrations 001–010 have been reviewed.
-- No browser role receives direct table access. All data operations must use trusted server APIs.

create table if not exists humas.permit_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text unique,
  permit_type text not null check (permit_type in ('internal','external','facility')),
  title text not null check (length(btrim(title)) between 3 and 200),
  purpose text not null check (length(btrim(purpose)) between 3 and 4000),
  applicant_name text not null check (length(btrim(applicant_name)) between 2 and 180),
  applicant_unit text,
  applicant_email text,
  applicant_phone text,
  related_institution text,
  activity_location text,
  requested_start_at timestamptz,
  requested_end_at timestamptz,
  expected_attendees integer check (expected_attendees is null or expected_attendees between 1 and 100000),
  facility_details jsonb not null default '{}'::jsonb check (jsonb_typeof(facility_details) = 'object'),
  status text not null default 'draft' check (status in (
    'draft','submitted','verified','under_review','revision_required',
    'approved','rejected','cancelled','completed','archived'
  )),
  decision_note text,
  created_by uuid references auth.users(id) on delete set null,
  assigned_staff uuid references auth.users(id) on delete set null,
  submitted_at timestamptz,
  decided_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permit_date_order check (
    requested_start_at is null or requested_end_at is null or requested_end_at >= requested_start_at
  )
);

create table if not exists humas.permit_documents (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid not null references humas.permit_requests(id) on delete cascade,
  document_type text not null check (document_type in (
    'application_letter','proposal','parent_consent','institution_letter',
    'supporting_document','decision_letter','other'
  )),
  file_name text not null check (length(btrim(file_name)) between 1 and 255),
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes between 0 and 26214400),
  checksum_sha256 text,
  version_number integer not null default 1 check (version_number > 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  is_current boolean not null default true,
  unique (permit_id, document_type, version_number),
  unique (storage_bucket, storage_path)
);

create table if not exists humas.permit_workflow_events (
  id bigint generated always as identity primary key,
  permit_id uuid not null references humas.permit_requests(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  reason text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now()
);

-- Protocol agendas have their own lifecycle and may optionally be linked to a permit.
create table if not exists humas.protocol_agendas (
  id uuid primary key default gen_random_uuid(),
  agenda_code text unique,
  permit_id uuid references humas.permit_requests(id) on delete set null,
  title text not null check (length(btrim(title)) between 3 and 200),
  agenda_type text not null check (agenda_type in (
    'official_visit','institutional_meeting','school_event','delegation','ceremony','other'
  )),
  host_unit text,
  guest_institution text,
  venue text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  expected_guests integer check (expected_guests is null or expected_guests between 0 and 100000),
  status text not null default 'planned' check (status in (
    'planned','preparing','ready','in_progress','completed','cancelled'
  )),
  protocol_notes text,
  created_by uuid references auth.users(id) on delete set null,
  assigned_staff uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint protocol_agenda_date_order check (ends_at >= starts_at)
);

create table if not exists humas.protocol_guests (
  id uuid primary key default gen_random_uuid(),
  agenda_id uuid not null references humas.protocol_agendas(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 2 and 180),
  institution text,
  position_title text,
  attendance_status text not null default 'invited'
    check (attendance_status in ('invited','confirmed','attended','not_attended','cancelled')),
  arrival_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists humas.protocol_tasks (
  id uuid primary key default gen_random_uuid(),
  agenda_id uuid not null references humas.protocol_agendas(id) on delete cascade,
  task_category text not null check (task_category in (
    'reception','venue','accommodation','consumption','equipment',
    'ceremony','documentation','security','transport','other'
  )),
  task_title text not null check (length(btrim(task_title)) between 2 and 200),
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  task_status text not null default 'pending'
    check (task_status in ('pending','in_progress','done','blocked','cancelled')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists humas.protocol_workflow_events (
  id bigint generated always as identity primary key,
  agenda_id uuid not null references humas.protocol_agendas(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  reason text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now()
);

create index if not exists permit_requests_type_status_idx
  on humas.permit_requests(permit_type,status,created_at desc);
create index if not exists permit_requests_schedule_idx
  on humas.permit_requests(requested_start_at,requested_end_at);
create index if not exists permit_requests_assignee_idx
  on humas.permit_requests(assigned_staff,status);
create index if not exists permit_documents_request_idx
  on humas.permit_documents(permit_id,uploaded_at desc);
create index if not exists permit_events_timeline_idx
  on humas.permit_workflow_events(permit_id,occurred_at desc);
create index if not exists protocol_agendas_schedule_idx
  on humas.protocol_agendas(starts_at,ends_at);
create index if not exists protocol_agendas_status_idx
  on humas.protocol_agendas(status,starts_at);
create index if not exists protocol_guests_agenda_idx
  on humas.protocol_guests(agenda_id,full_name);
create index if not exists protocol_tasks_agenda_status_idx
  on humas.protocol_tasks(agenda_id,task_status,due_at);
create index if not exists protocol_events_timeline_idx
  on humas.protocol_workflow_events(agenda_id,occurred_at desc);

drop trigger if exists permit_requests_set_updated_at on humas.permit_requests;
create trigger permit_requests_set_updated_at
before update on humas.permit_requests
for each row execute function humas.set_updated_at();

drop trigger if exists protocol_agendas_set_updated_at on humas.protocol_agendas;
create trigger protocol_agendas_set_updated_at
before update on humas.protocol_agendas
for each row execute function humas.set_updated_at();

drop trigger if exists protocol_tasks_set_updated_at on humas.protocol_tasks;
create trigger protocol_tasks_set_updated_at
before update on humas.protocol_tasks
for each row execute function humas.set_updated_at();

-- Workflow histories are append-only. Corrections must be recorded as new events.
create or replace function humas.reject_permit_protocol_event_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception using errcode = '42501', message = 'workflow_events_are_append_only';
end;
$$;

drop trigger if exists permit_workflow_events_append_only on humas.permit_workflow_events;
create trigger permit_workflow_events_append_only
before update or delete on humas.permit_workflow_events
for each row execute function humas.reject_permit_protocol_event_mutation();

drop trigger if exists protocol_workflow_events_append_only on humas.protocol_workflow_events;
create trigger protocol_workflow_events_append_only
before update or delete on humas.protocol_workflow_events
for each row execute function humas.reject_permit_protocol_event_mutation();

alter table humas.permit_requests enable row level security;
alter table humas.permit_documents enable row level security;
alter table humas.permit_workflow_events enable row level security;
alter table humas.protocol_agendas enable row level security;
alter table humas.protocol_guests enable row level security;
alter table humas.protocol_tasks enable row level security;
alter table humas.protocol_workflow_events enable row level security;

revoke all on table humas.permit_requests,humas.permit_documents,
  humas.permit_workflow_events,humas.protocol_agendas,humas.protocol_guests,
  humas.protocol_tasks,humas.protocol_workflow_events from public,anon,authenticated;
grant select,insert,update,delete on table humas.permit_requests,
  humas.permit_documents,humas.protocol_agendas,humas.protocol_guests,
  humas.protocol_tasks to service_role;
grant select,insert on table humas.permit_workflow_events,
  humas.protocol_workflow_events to service_role;
grant usage,select on sequence humas.permit_workflow_events_id_seq,
  humas.protocol_workflow_events_id_seq to service_role;
revoke all on function humas.reject_permit_protocol_event_mutation() from public,anon,authenticated;
grant execute on function humas.reject_permit_protocol_event_mutation() to service_role;

comment on table humas.permit_requests is
  'Private permit intake for internal, external and school-facility use cases.';
comment on table humas.protocol_agendas is
  'Private protocol schedule; optionally linked to a permit request but with an independent lifecycle.';
comment on table humas.protocol_guests is
  'Guest register for protocol agendas. Contains personal data; server-side access only.';
comment on table humas.protocol_tasks is
  'Protocol preparation checklist and staff assignments for each agenda.';
