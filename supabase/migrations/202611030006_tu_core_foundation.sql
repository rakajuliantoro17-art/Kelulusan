-- PINTUKU TU Core Foundation
-- Isolated Tata Usaha domain. No browser roles receive direct table access.
create schema if not exists tu;

create table if not exists tu.units (
  id uuid primary key default gen_random_uuid(),
  unit_code text not null unique,
  unit_name text not null,
  unit_type text not null check (unit_type in ('front_office','back_office','leadership','service_unit','technical')),
  parent_unit_id uuid references tu.units(id) on delete restrict,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tu_units_code_format check (unit_code ~ '^[a-z][a-z0-9_]{1,39}$'),
  constraint tu_units_name_nonempty check (length(btrim(unit_name)) > 0)
);

create table if not exists tu.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_code text not null check (role_code in (
    'principal','head_tu','fo_coordinator','fo_receptionist',
    'unit_officer','tu_operator','teacher','homeroom_teacher','system_operator'
  )),
  unit_id uuid references tu.units(id) on delete restrict,
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  constraint tu_user_roles_revocation_consistency check (
    (is_active and revoked_at is null) or (not is_active and revoked_at is not null)
  )
);
create unique index if not exists tu_user_roles_active_unique
  on tu.user_roles(user_id, role_code, coalesce(unit_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where is_active;
create index if not exists tu_user_roles_user_active_idx
  on tu.user_roles(user_id, role_code) where is_active;

create table if not exists tu.identity_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  source_system text not null check (source_system in ('pintuku','akademik','kesiswaan','sarpras')),
  external_subject text not null,
  link_status text not null default 'pending' check (link_status in ('pending','verified','revoked')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tu_identity_external_subject_nonempty check (length(btrim(external_subject)) > 0),
  constraint tu_identity_verification_consistency check (
    (link_status = 'verified' and verified_by is not null and verified_at is not null)
    or (link_status <> 'verified')
  ),
  unique (source_system, external_subject)
);
create index if not exists tu_identity_auth_user_idx on tu.identity_links(auth_user_id);

create table if not exists tu.integration_sources (
  source_code text primary key check (source_code in ('akademik','kesiswaan','sarpras')),
  display_name text not null,
  integration_mode text not null default 'api_read' check (integration_mode in ('api_read','webhook','manual_import')),
  base_url_env_key text,
  is_enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tu.integration_sync_logs (
  id bigint generated always as identity primary key,
  source_code text not null references tu.integration_sources(source_code) on delete restrict,
  operation text not null check (operation in ('health_check','read','import','webhook')),
  status text not null check (status in ('started','succeeded','failed','skipped')),
  correlation_id uuid not null default gen_random_uuid(),
  records_seen integer not null default 0 check (records_seen >= 0),
  records_created integer not null default 0 check (records_created >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  error_code text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  initiated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint tu_sync_finish_after_start check (finished_at is null or finished_at >= started_at)
);
create index if not exists tu_sync_logs_source_time_idx
  on tu.integration_sync_logs(source_code, started_at desc);

create table if not exists tu.visit_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_unit_id uuid references tu.units(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'visit_registered','visit_approval_needed','visit_approved','visit_rejected',
    'visitor_arrived','appointment_upcoming','visit_checkout_pending',
    'visit_escalation','complaint_created','system_notice'
  )),
  title text not null,
  body text not null,
  target_path text,
  entity_type text,
  entity_id uuid,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  read_at timestamptz,
  acted_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint tu_notification_recipient_required check (
    recipient_user_id is not null or recipient_unit_id is not null
  ),
  constraint tu_notification_title_nonempty check (length(btrim(title)) > 0),
  constraint tu_notification_body_nonempty check (length(btrim(body)) > 0)
);
create index if not exists tu_notifications_user_inbox_idx
  on tu.visit_notifications(recipient_user_id, created_at desc) where read_at is null;
create index if not exists tu_notifications_unit_inbox_idx
  on tu.visit_notifications(recipient_unit_id, created_at desc) where read_at is null;

create or replace function tu.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tu_units_set_updated_at on tu.units;
create trigger tu_units_set_updated_at before update on tu.units
for each row execute function tu.set_updated_at();
drop trigger if exists tu_identity_links_set_updated_at on tu.identity_links;
create trigger tu_identity_links_set_updated_at before update on tu.identity_links
for each row execute function tu.set_updated_at();
drop trigger if exists tu_integration_sources_set_updated_at on tu.integration_sources;
create trigger tu_integration_sources_set_updated_at before update on tu.integration_sources
for each row execute function tu.set_updated_at();

insert into tu.units (unit_code, unit_name, unit_type, sort_order) values
 ('front_office','Front Office / Lobby','front_office',10),
 ('tata_usaha','Tata Usaha','back_office',20),
 ('akademik','Akademik','service_unit',30),
 ('kesiswaan','Kesiswaan','service_unit',40),
 ('sarpras','Sarana dan Prasarana','service_unit',50),
 ('kepala_sekolah','Kepala Sekolah','leadership',5)
on conflict (unit_code) do update set
 unit_name=excluded.unit_name, unit_type=excluded.unit_type, sort_order=excluded.sort_order;

insert into tu.integration_sources (source_code, display_name, integration_mode, is_enabled) values
 ('akademik','Sistem Akademik','api_read',false),
 ('kesiswaan','Sistem Kesiswaan','api_read',false),
 ('sarpras','Sistem Sarpras','api_read',false)
on conflict (source_code) do nothing;

alter table tu.units enable row level security;
alter table tu.user_roles enable row level security;
alter table tu.identity_links enable row level security;
alter table tu.integration_sources enable row level security;
alter table tu.integration_sync_logs enable row level security;
alter table tu.visit_notifications enable row level security;

revoke all on schema tu from public, anon, authenticated;
grant usage on schema tu to service_role;
revoke all on all tables in schema tu from public, anon, authenticated;
revoke all on all sequences in schema tu from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema tu to service_role;
grant usage, select on all sequences in schema tu to service_role;
grant execute on function tu.set_updated_at() to service_role;
revoke all on function tu.set_updated_at() from public, anon, authenticated;

alter default privileges in schema tu revoke all on tables from public, anon, authenticated;
alter default privileges in schema tu revoke all on sequences from public, anon, authenticated;
alter default privileges in schema tu grant select, insert, update, delete on tables to service_role;
alter default privileges in schema tu grant usage, select on sequences to service_role;

comment on schema tu is 'PINTUKU Tata Usaha domain. Isolated from HUMAS and other operational schemas.';
comment on table tu.user_roles is 'Server-managed TU role assignments. No direct browser access; role changes require authorized administrative workflow.';
comment on table tu.identity_links is 'Verified identity mapping between Supabase Auth and external module subjects. No automatic linking by email.';
comment on table tu.integration_sources is 'Allowlisted integration registry. Secrets and credentials must remain in server environment variables, never in config.';
comment on table tu.integration_sync_logs is 'Operational audit log for cross-module read/sync activity.';
comment on table tu.visit_notifications is 'Internal PINTUKU notifications for Lobby and Back Office only; no external delivery provider.';
