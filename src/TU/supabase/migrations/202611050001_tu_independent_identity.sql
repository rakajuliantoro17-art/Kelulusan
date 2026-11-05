-- PINTUKU TU independent identity foundation.
-- PREPARED ONLY: do not apply to production without an explicit deployment approval.
-- Spreadsheet usernames are external subjects; this table provides stable internal UUIDs.

begin;

create table if not exists tu.identities (
  id uuid primary key default gen_random_uuid(),
  external_subject text not null,
  display_name text not null,
  identity_type text not null default 'staff'
    check (identity_type in ('staff','system')),
  identity_source text not null default 'spreadsheet'
    check (identity_source in ('spreadsheet','system')),
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tu_identities_external_subject_nonempty
    check (length(btrim(external_subject)) between 1 and 80),
  constraint tu_identities_display_name_nonempty
    check (length(btrim(display_name)) between 1 and 120)
);

create unique index if not exists tu_identities_external_subject_uidx
  on tu.identities (external_subject);
create index if not exists tu_identities_active_idx
  on tu.identities (is_active, display_name);

drop trigger if exists tu_identities_set_updated_at on tu.identities;
create trigger tu_identities_set_updated_at
before update on tu.identities
for each row execute function tu.set_updated_at();

insert into tu.identities (
  external_subject, display_name, identity_type, identity_source, is_active, last_synced_at
) values
  ('system:spreadsheet-sync', 'TU Spreadsheet Sync', 'system', 'system', true, now()),
  ('system:lobby-public-intake', 'TU Lobby Public Intake', 'system', 'system', true, now())
on conflict (external_subject) do update
set display_name = excluded.display_name,
    identity_type = excluded.identity_type,
    identity_source = excluded.identity_source,
    is_active = true,
    last_synced_at = now();

-- The old bootstrap routine creates Auth-backed role assignments. Spreadsheet
-- account provisioning replaces that workflow; retain role audit trigger instead.
drop function if exists tu_private.bootstrap_first_head_tu(uuid, text);

-- Rename role assignment references.
alter table tu.user_roles drop constraint if exists user_roles_user_id_fkey;
alter table tu.user_roles drop constraint if exists user_roles_assigned_by_fkey;
alter table tu.user_roles rename column user_id to identity_id;
alter table tu.user_roles rename column assigned_by to assigned_by_identity_id;
alter table tu.user_roles
  add constraint user_roles_identity_id_fkey
  foreign key (identity_id) references tu.identities(id) on delete restrict;
alter table tu.user_roles
  add constraint user_roles_assigned_by_identity_id_fkey
  foreign key (assigned_by_identity_id) references tu.identities(id) on delete set null;

-- The existing tu_user_roles_active_unique index follows the renamed identity_id
-- column automatically and continues enforcing one active role per identity/unit.

-- Role audit references.
alter table tu.role_audit_logs drop constraint if exists role_audit_logs_target_user_id_fkey;
alter table tu.role_audit_logs drop constraint if exists role_audit_logs_actor_user_id_fkey;
alter table tu.role_audit_logs rename column target_user_id to target_identity_id;
alter table tu.role_audit_logs rename column actor_user_id to actor_identity_id;
alter table tu.role_audit_logs
  add constraint role_audit_logs_target_identity_id_fkey
  foreign key (target_identity_id) references tu.identities(id) on delete restrict;
alter table tu.role_audit_logs
  add constraint role_audit_logs_actor_identity_id_fkey
  foreign key (actor_identity_id) references tu.identities(id) on delete set null;

-- Integration log actor.
alter table tu.integration_sync_logs drop constraint if exists integration_sync_logs_initiated_by_fkey;
alter table tu.integration_sync_logs rename column initiated_by to initiated_by_identity_id;
alter table tu.integration_sync_logs
  add constraint integration_sync_logs_initiated_by_identity_id_fkey
  foreign key (initiated_by_identity_id) references tu.identities(id) on delete set null;

-- Notifications addressed to an internal TU identity or a unit.
alter table tu.visit_notifications drop constraint if exists visit_notifications_recipient_user_id_fkey;
alter table tu.visit_notifications rename column recipient_user_id to recipient_identity_id;
alter table tu.visit_notifications
  add constraint visit_notifications_recipient_identity_id_fkey
  foreign key (recipient_identity_id) references tu.identities(id) on delete cascade;

-- Visit transaction actors.
alter table tu.visits drop constraint if exists visits_created_by_fkey;
alter table tu.visits drop constraint if exists visits_updated_by_fkey;
alter table tu.visits drop constraint if exists visits_checked_in_by_fkey;
alter table tu.visits drop constraint if exists visits_checked_out_by_fkey;
alter table tu.visits rename column created_by to created_by_identity_id;
alter table tu.visits rename column updated_by to updated_by_identity_id;
alter table tu.visits rename column checked_in_by to checked_in_by_identity_id;
alter table tu.visits rename column checked_out_by to checked_out_by_identity_id;
alter table tu.visits
  add constraint visits_created_by_identity_id_fkey
  foreign key (created_by_identity_id) references tu.identities(id) on delete restrict;
alter table tu.visits
  add constraint visits_updated_by_identity_id_fkey
  foreign key (updated_by_identity_id) references tu.identities(id) on delete restrict;
alter table tu.visits
  add constraint visits_checked_in_by_identity_id_fkey
  foreign key (checked_in_by_identity_id) references tu.identities(id) on delete restrict;
alter table tu.visits
  add constraint visits_checked_out_by_identity_id_fkey
  foreign key (checked_out_by_identity_id) references tu.identities(id) on delete restrict;

-- Visit event actor.
alter table tu.visit_events drop constraint if exists visit_events_actor_id_fkey;
alter table tu.visit_events rename column actor_id to actor_identity_id;
alter table tu.visit_events
  add constraint visit_events_actor_identity_id_fkey
  foreign key (actor_identity_id) references tu.identities(id) on delete restrict;

-- Replace the role audit trigger implementation for spreadsheet identities.
create or replace function tu_private.audit_user_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_target_identity_id uuid;
  v_role_code text;
  v_unit_id uuid;
  v_action text;
  v_actor_id_text text;
  v_actor_identity_id uuid;
  v_actor_label text;
begin
  if tg_op = 'INSERT' then
    v_after := to_jsonb(new);
    v_target_identity_id := new.identity_id;
    v_role_code := new.role_code;
    v_unit_id := new.unit_id;
    v_action := 'assigned';
    v_actor_identity_id := new.assigned_by_identity_id;
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    v_target_identity_id := new.identity_id;
    v_role_code := new.role_code;
    v_unit_id := new.unit_id;
    if old.is_active and not new.is_active then
      v_action := 'revoked';
    else
      v_action := 'updated';
    end if;
    v_actor_identity_id := new.assigned_by_identity_id;
  else
    v_before := to_jsonb(old);
    v_target_identity_id := old.identity_id;
    v_role_code := old.role_code;
    v_unit_id := old.unit_id;
    v_action := 'deleted';
    v_actor_identity_id := old.assigned_by_identity_id;
  end if;

  v_actor_id_text := nullif(current_setting('tu.audit_actor_identity_id', true), '');
  if v_actor_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    v_actor_identity_id := v_actor_id_text::uuid;
  end if;
  select display_name into v_actor_label
  from tu.identities where id = v_actor_identity_id;
  v_actor_label := coalesce(
    nullif(current_setting('tu.audit_actor_label', true), ''),
    v_actor_label,
    current_user
  );

  insert into tu.role_audit_logs (
    target_identity_id, actor_identity_id, actor_label, action,
    role_code, unit_id, before_state, after_state
  ) values (
    v_target_identity_id, v_actor_identity_id, left(v_actor_label, 120), v_action,
    v_role_code, v_unit_id, v_before, v_after
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Workflow events and actor columns now reference tu.identities.
create or replace function tu.handle_visit_workflow()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid;
  v_front_office_id uuid;
  v_event text;
begin
  v_actor := coalesce(new.updated_by_identity_id, new.created_by_identity_id);
  select id into v_front_office_id
  from tu.units where unit_code = 'front_office' and is_active;

  if tg_op = 'INSERT' then
    insert into tu.visit_events(visit_id, actor_identity_id, event_type, from_status, to_status, event_note)
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
    insert into tu.visit_events(visit_id, actor_identity_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, v_event, old.status, new.status, new.status_note);

    if new.status = 'pending_unit' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visit_approval_needed', 'Klarifikasi kunjungan telah dikirim',
        'Front Office telah mengirim klarifikasi. Permintaan kunjungan menunggu respons unit.',
        '/tata-usaha/front-office', 'visit', new.id, 'high');
    elsif new.status in ('approved','clarification_requested','rejected','completed','cancelled') and v_front_office_id is not null then
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

alter table tu.identities enable row level security;
revoke all on tu.identities from public, anon, authenticated;
grant select, insert, update on tu.identities to service_role;

comment on table tu.identities is
  'Internal TU identities synchronized from the private Google Spreadsheet Pengguna tab. No passwords are stored here.';
comment on column tu.identities.external_subject is
  'Normalized spreadsheet username; stable external subject mapped to an internal UUID.';
comment on function tu.handle_visit_workflow() is
  'Writes visit audit events and internal PINTUKU notifications using standalone TU identity UUIDs.';

commit;
