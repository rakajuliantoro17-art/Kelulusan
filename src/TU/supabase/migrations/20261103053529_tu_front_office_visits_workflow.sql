-- PINTUKU Front Office visit workflow foundation.
-- Browser access remains server-mediated; no anon/authenticated table grants.

create table if not exists tu.visits (
  id uuid primary key default gen_random_uuid(),
  visit_code text not null unique,
  visitor_name text not null,
  organization text,
  contact_phone text,
  purpose text not null,
  destination_unit_id uuid not null references tu.units(id) on delete restrict,
  host_name text,
  notes text,
  status_note text,
  visit_kind text not null default 'walk_in' check (visit_kind in ('walk_in','appointment')),
  scheduled_at timestamptz,
  source text not null default 'receptionist' check (source in ('receptionist','kiosk')),
  status text not null default 'pending_unit' check (status in (
    'pending_unit','approved','clarification_requested','rejected',
    'checked_in','completed','cancelled'
  )),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete restrict,
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id) on delete restrict,
  checked_out_at timestamptz,
  checked_out_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tu_visits_name_length check (length(btrim(visitor_name)) between 2 and 100),
  constraint tu_visits_purpose_length check (length(btrim(purpose)) between 2 and 160),
  constraint tu_visits_org_length check (organization is null or length(organization) <= 120),
  constraint tu_visits_phone_length check (contact_phone is null or length(contact_phone) <= 25),
  constraint tu_visits_host_length check (host_name is null or length(host_name) <= 100),
  constraint tu_visits_notes_length check (notes is null or length(notes) <= 1000),
  constraint tu_visits_status_note_length check (status_note is null or length(status_note) <= 500),
  constraint tu_visits_appointment_schedule check (visit_kind <> 'appointment' or scheduled_at is not null),
  constraint tu_visits_checkin_consistency check (
    (checked_in_at is null and checked_in_by is null)
    or (checked_in_at is not null and checked_in_by is not null)
  ),
  constraint tu_visits_checkout_consistency check (
    (checked_out_at is null and checked_out_by is null)
    or (checked_out_at is not null and checked_out_by is not null)
  ),
  constraint tu_visits_completed_requires_checkout check (
    status <> 'completed' or checked_out_at is not null
  )
);

create index if not exists tu_visits_status_created_idx on tu.visits(status, created_at desc);
create index if not exists tu_visits_destination_status_created_idx on tu.visits(destination_unit_id, status, created_at desc);
create index if not exists tu_visits_scheduled_idx on tu.visits(scheduled_at) where visit_kind = 'appointment';
create index if not exists tu_visits_created_by_idx on tu.visits(created_by, created_at desc);
create index if not exists tu_visits_checked_in_by_idx on tu.visits(checked_in_by) where checked_in_by is not null;
create index if not exists tu_visits_checked_out_by_idx on tu.visits(checked_out_by) where checked_out_by is not null;

create table if not exists tu.visit_events (
  id bigint generated always as identity primary key,
  visit_id uuid not null references tu.visits(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (event_type in (
    'registered','approved','clarification_requested','rejected',
    'checked_in','completed','cancelled','resubmitted'
  )),
  from_status text,
  to_status text not null,
  event_note text,
  created_at timestamptz not null default now(),
  constraint tu_visit_events_note_length check (event_note is null or length(event_note) <= 500)
);
create index if not exists tu_visit_events_visit_time_idx on tu.visit_events(visit_id, created_at desc);
create index if not exists tu_visit_events_actor_time_idx on tu.visit_events(actor_id, created_at desc);

drop trigger if exists tu_visits_set_updated_at on tu.visits;
create trigger tu_visits_set_updated_at before update on tu.visits
for each row execute function tu.set_updated_at();

create or replace function tu.handle_visit_workflow()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_actor uuid;
  v_front_office_id uuid;
  v_event text;
begin
  v_actor := coalesce(new.updated_by, new.created_by);
  select id into v_front_office_id from tu.units where unit_code = 'front_office' and is_active;
  if tg_op = 'INSERT' then
    insert into tu.visit_events(visit_id, actor_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, 'registered', null, new.status, null);
    insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
    values (new.destination_unit_id, 'visit_approval_needed', 'Permintaan kunjungan baru',
      'Ada permintaan kunjungan yang menunggu respons unit. Buka Front Office untuk melihat detail.',
      '/tata-usaha/front-office', 'visit', new.id, 'normal');
    return new;
  end if;
  if new.status is distinct from old.status then
    v_event := case new.status
      when 'approved' then 'approved'
      when 'clarification_requested' then 'clarification_requested'
      when 'rejected' then 'rejected'
      when 'checked_in' then 'checked_in'
      when 'completed' then 'completed'
      when 'cancelled' then 'cancelled'
      when 'pending_unit' then 'resubmitted'
      else 'registered'
    end;
    insert into tu.visit_events(visit_id, actor_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, v_event, old.status, new.status, new.status_note);
    if new.status in ('approved','clarification_requested','rejected','completed','cancelled') and v_front_office_id is not null then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (
        v_front_office_id,
        case new.status when 'approved' then 'visit_approved'
          when 'clarification_requested' then 'visit_approval_needed'
          when 'rejected' then 'visit_rejected' else 'system_notice' end,
        case new.status when 'approved' then 'Kunjungan disetujui unit tujuan'
          when 'clarification_requested' then 'Unit tujuan meminta klarifikasi'
          when 'rejected' then 'Permintaan kunjungan ditolak'
          when 'completed' then 'Kunjungan telah selesai' else 'Status kunjungan diperbarui' end,
        'Status permintaan kunjungan berubah. Buka Front Office untuk melihat tindak lanjut.',
        '/tata-usaha/front-office', 'visit', new.id,
        case when new.status in ('rejected','clarification_requested') then 'high' else 'normal' end
      );
    elsif new.status = 'checked_in' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visitor_arrived', 'Tamu telah tiba',
        'Petugas Front Office telah mencatat kedatangan tamu untuk unit Anda.',
        '/tata-usaha/front-office', 'visit', new.id, 'normal');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tu_visits_workflow_events on tu.visits;
create trigger tu_visits_workflow_events after insert or update on tu.visits
for each row execute function tu.handle_visit_workflow();

insert into tu.units(unit_code, unit_name, unit_type, sort_order) values
 ('humas','Wakasek Humas','service_unit',35),
 ('guru_wali_kelas','Guru / Wali Kelas','service_unit',60),
 ('keamanan','Satpam / Keamanan','technical',70)
on conflict (unit_code) do update set unit_name=excluded.unit_name, unit_type=excluded.unit_type, sort_order=excluded.sort_order;

alter table tu.visits enable row level security;
alter table tu.visit_events enable row level security;
revoke all on tu.visits, tu.visit_events from public, anon, authenticated;
grant select, insert, update, delete on tu.visits, tu.visit_events to service_role;
grant usage, select on sequence tu.visit_events_id_seq to service_role;
revoke all on function tu.handle_visit_workflow() from public, anon, authenticated;
grant execute on function tu.handle_visit_workflow() to service_role;

comment on table tu.visits is 'Front Office visitor and appointment transactions. Access exclusively through the authenticated TU server API.';
comment on table tu.visit_events is 'Append-only audit trail for visitor workflow transitions.';
comment on function tu.handle_visit_workflow() is 'Writes visit audit events and internal PINTUKU notifications in the same database transaction.';
