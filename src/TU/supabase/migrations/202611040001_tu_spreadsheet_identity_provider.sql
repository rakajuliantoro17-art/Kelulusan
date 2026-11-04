-- PINTUKU TU spreadsheet-based identities.
-- Google Spreadsheet is the account and role source of truth; Supabase remains data storage.
-- Existing auth.users foreign keys are redirected to stable TU staff identity records.

create table if not exists tu.staff_identities (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  role_code text not null check (role_code in (
    'principal','head_tu','fo_coordinator','fo_receptionist','unit_officer','tu_operator'
  )),
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tu_staff_username_nonempty check (length(btrim(username)) between 1 and 254),
  constraint tu_staff_display_name_nonempty check (length(btrim(display_name)) between 1 and 120)
);

create index if not exists tu_staff_identities_active_role_idx
  on tu.staff_identities(role_code) where is_active;

drop trigger if exists tu_staff_identities_set_updated_at on tu.staff_identities;
create trigger tu_staff_identities_set_updated_at before update on tu.staff_identities
for each row execute function tu.set_updated_at();

alter table tu.staff_identities enable row level security;
revoke all on tu.staff_identities from public, anon, authenticated;
grant select, insert, update, delete on tu.staff_identities to service_role;

-- Front Office transaction actors now reference the Spreadsheet-backed identity registry.
alter table tu.visit_notifications
  drop constraint if exists visit_notifications_recipient_user_id_fkey;
alter table tu.visit_notifications
  add constraint tu_visit_notifications_recipient_staff_fkey
  foreign key (recipient_user_id) references tu.staff_identities(id) on delete cascade;

alter table tu.visits
  drop constraint if exists visits_created_by_fkey;
alter table tu.visits
  add constraint tu_visits_created_by_staff_fkey
  foreign key (created_by) references tu.staff_identities(id) on delete restrict;

alter table tu.visits
  drop constraint if exists visits_updated_by_fkey;
alter table tu.visits
  add constraint tu_visits_updated_by_staff_fkey
  foreign key (updated_by) references tu.staff_identities(id) on delete restrict;

alter table tu.visits
  drop constraint if exists visits_checked_in_by_fkey;
alter table tu.visits
  add constraint tu_visits_checked_in_by_staff_fkey
  foreign key (checked_in_by) references tu.staff_identities(id) on delete restrict;

alter table tu.visits
  drop constraint if exists visits_checked_out_by_fkey;
alter table tu.visits
  add constraint tu_visits_checked_out_by_staff_fkey
  foreign key (checked_out_by) references tu.staff_identities(id) on delete restrict;

alter table tu.visit_events
  drop constraint if exists visit_events_actor_id_fkey;
alter table tu.visit_events
  add constraint tu_visit_events_actor_staff_fkey
  foreign key (actor_id) references tu.staff_identities(id) on delete restrict;

comment on table tu.staff_identities is
  'Server-maintained identity mirror for active staff accounts in the separate TU Google Spreadsheet. Passwords are never copied into Supabase.';
