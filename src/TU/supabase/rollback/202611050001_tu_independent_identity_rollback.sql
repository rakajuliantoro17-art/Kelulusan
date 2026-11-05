-- GUARDED ROLLBACK for 202611050001_tu_independent_identity.sql.
-- Run only in a maintenance window after disabling TU API traffic.
-- This rollback is intentionally blocked once standalone identities have been provisioned.
begin;

do $$
begin
  if exists (select 1 from tu.identities where identity_type = 'staff') then
    raise exception 'Rollback blocked: staff identities have been provisioned. Use a reviewed data-migration/PITR plan; do not delete identity history blindly.';
  end if;
  if exists (select 1 from tu.user_roles) or exists (select 1 from tu.role_audit_logs)
     or exists (select 1 from tu.visits) or exists (select 1 from tu.visit_events)
     or exists (select 1 from tu.integration_sync_logs)
     or exists (select 1 from tu.visit_notifications) then
    raise exception 'Rollback blocked: TU operational or audit records exist. Use point-in-time recovery or a reviewed reverse data migration.';
  end if;
end;
$$;

drop trigger if exists tu_visits_workflow_events on tu.visits;
drop trigger if exists tu_user_roles_audit_change on tu.user_roles;
drop function if exists tu.handle_visit_workflow();
drop function if exists tu_private.audit_user_role_change();

alter table tu.visit_events drop constraint if exists visit_events_actor_identity_id_fkey;
alter table tu.visit_events rename column actor_identity_id to actor_id;
alter table tu.visit_events add constraint visit_events_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete restrict;

alter table tu.visits drop constraint if exists visits_created_by_identity_id_fkey;
alter table tu.visits drop constraint if exists visits_updated_by_identity_id_fkey;
alter table tu.visits drop constraint if exists visits_checked_in_by_identity_id_fkey;
alter table tu.visits drop constraint if exists visits_checked_out_by_identity_id_fkey;
alter table tu.visits rename column created_by_identity_id to created_by;
alter table tu.visits rename column updated_by_identity_id to updated_by;
alter table tu.visits rename column checked_in_by_identity_id to checked_in_by;
alter table tu.visits rename column checked_out_by_identity_id to checked_out_by;
alter table tu.visits add constraint visits_created_by_fkey foreign key (created_by) references auth.users(id) on delete restrict;
alter table tu.visits add constraint visits_updated_by_fkey foreign key (updated_by) references auth.users(id) on delete restrict;
alter table tu.visits add constraint visits_checked_in_by_fkey foreign key (checked_in_by) references auth.users(id) on delete restrict;
alter table tu.visits add constraint visits_checked_out_by_fkey foreign key (checked_out_by) references auth.users(id) on delete restrict;

alter table tu.visit_notifications drop constraint if exists visit_notifications_recipient_identity_id_fkey;
alter table tu.visit_notifications rename column recipient_identity_id to recipient_user_id;
alter table tu.visit_notifications add constraint visit_notifications_recipient_user_id_fkey
  foreign key (recipient_user_id) references auth.users(id) on delete cascade;

alter table tu.integration_sync_logs drop constraint if exists integration_sync_logs_initiated_by_identity_id_fkey;
alter table tu.integration_sync_logs rename column initiated_by_identity_id to initiated_by;
alter table tu.integration_sync_logs add constraint integration_sync_logs_initiated_by_fkey
  foreign key (initiated_by) references auth.users(id) on delete set null;

alter table tu.role_audit_logs drop constraint if exists role_audit_logs_target_identity_id_fkey;
alter table tu.role_audit_logs drop constraint if exists role_audit_logs_actor_identity_id_fkey;
alter table tu.role_audit_logs rename column target_identity_id to target_user_id;
alter table tu.role_audit_logs rename column actor_identity_id to actor_user_id;
alter table tu.role_audit_logs add constraint role_audit_logs_target_user_id_fkey
  foreign key (target_user_id) references auth.users(id) on delete restrict;
alter table tu.role_audit_logs add constraint role_audit_logs_actor_user_id_fkey
  foreign key (actor_user_id) references auth.users(id) on delete set null;

alter table tu.user_roles drop constraint if exists user_roles_identity_id_fkey;
alter table tu.user_roles drop constraint if exists user_roles_assigned_by_identity_id_fkey;
alter table tu.user_roles rename column identity_id to user_id;
alter table tu.user_roles rename column assigned_by_identity_id to assigned_by;
alter table tu.user_roles add constraint user_roles_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
alter table tu.user_roles add constraint user_roles_assigned_by_fkey
  foreign key (assigned_by) references auth.users(id) on delete set null;

drop trigger if exists tu_identities_set_updated_at on tu.identities;
drop table tu.identities;


-- Restore the previous Auth-backed trigger functions after the columns and
-- foreign keys have been returned to their original names.
create or replace function tu_private.audit_user_role_change()
returns trigger language plpgsql set search_path = ''
as $
declare
  v_before jsonb; v_after jsonb; v_target_user_id uuid; v_role_code text;
  v_unit_id uuid; v_action text; v_actor_id_text text; v_actor_id uuid;
  v_actor_label text; v_override text;
begin
  if tg_op = 'INSERT' then
    v_after := to_jsonb(new); v_target_user_id := new.user_id;
    v_role_code := new.role_code; v_unit_id := new.unit_id; v_action := 'assigned';
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old); v_after := to_jsonb(new);
    v_target_user_id := new.user_id; v_role_code := new.role_code; v_unit_id := new.unit_id;
    if old.is_active and not new.is_active then v_action := 'revoked'; else v_action := 'updated'; end if;
  else
    v_before := to_jsonb(old); v_target_user_id := old.user_id;
    v_role_code := old.role_code; v_unit_id := old.unit_id; v_action := 'deleted';
  end if;
  v_override := nullif(current_setting('tu.audit_action_override', true), '');
  if v_override = 'bootstrap' and v_action = 'assigned' and v_role_code = 'head_tu' then v_action := 'bootstrap'; end if;
  v_actor_id_text := nullif(current_setting('tu.audit_actor_user_id', true), '');
  if v_actor_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
 then
    v_actor_id := v_actor_id_text::uuid;
  end if;
  v_actor_label := coalesce(nullif(current_setting('tu.audit_actor_label', true), ''), current_user);
  insert into tu.role_audit_logs (
    target_user_id, actor_user_id, actor_label, action, role_code, unit_id, before_state, after_state
  ) values (v_target_user_id, v_actor_id, left(v_actor_label, 120), v_action, v_role_code, v_unit_id, v_before, v_after);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$;
revoke all on function tu_private.audit_user_role_change() from public, anon, authenticated, service_role;

create or replace function tu.handle_visit_workflow()
returns trigger language plpgsql security invoker set search_path = ''
as $
declare v_actor uuid; v_front_office_id uuid; v_event text;
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
      when 'approved' then 'approved' when 'clarification_requested' then 'clarification_requested'
      when 'rejected' then 'rejected' when 'checked_in' then 'checked_in'
      when 'completed' then 'completed' when 'cancelled' then 'cancelled'
      when 'pending_unit' then 'resubmitted' else 'registered' end;
    insert into tu.visit_events(visit_id, actor_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, v_event, old.status, new.status, new.status_note);
    if new.status = 'pending_unit' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visit_approval_needed', 'Klarifikasi kunjungan telah dikirim',
        'Front Office telah mengirim klarifikasi. Permintaan kunjungan menunggu respons unit.',
        '/tata-usaha/front-office', 'visit', new.id, 'high');
    elsif new.status in ('approved','clarification_requested','rejected','completed','cancelled') and v_front_office_id is not null then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (v_front_office_id,
        case new.status when 'approved' then 'visit_approved' when 'clarification_requested' then 'visit_approval_needed'
          when 'rejected' then 'visit_rejected' else 'system_notice' end,
        case new.status when 'approved' then 'Kunjungan disetujui unit tujuan'
          when 'clarification_requested' then 'Unit tujuan meminta klarifikasi'
          when 'rejected' then 'Permintaan kunjungan ditolak'
          when 'completed' then 'Kunjungan telah selesai' else 'Status kunjungan diperbarui' end,
        'Status permintaan kunjungan berubah. Buka Front Office untuk melihat tindak lanjut.',
        '/tata-usaha/front-office', 'visit', new.id,
        case when new.status in ('rejected','clarification_requested') then 'high' else 'normal' end);
    elsif new.status = 'checked_in' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visitor_arrived', 'Tamu telah tiba',
        'Petugas Front Office telah mencatat kedatangan tamu untuk unit Anda.',
        '/tata-usaha/front-office', 'visit', new.id, 'normal');
    end if;
  end if;
  return new;
end;
$;
revoke all on function tu.handle_visit_workflow() from public, anon, authenticated;
grant execute on function tu.handle_visit_workflow() to service_role;

create or replace function tu_private.bootstrap_first_head_tu(p_target_user_id uuid, p_actor_label text)
returns uuid language plpgsql set search_path = ''
as $
declare v_confirmed_at timestamptz; v_banned_until timestamptz; v_deleted_at timestamptz; v_unit_id uuid;
begin
  if current_user not in ('postgres', 'supabase_admin') then
    raise exception using errcode = '42501', message = 'Bootstrap hanya dapat dijalankan oleh administrator database tepercaya.';
  end if;
  if p_target_user_id is null then raise exception using errcode = '22023', message = 'UUID akun tujuan wajib diisi.'; end if;
  if p_actor_label is null or length(btrim(p_actor_label)) < 5 or length(p_actor_label) > 120 or p_actor_label ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Label administrator wajib 5–120 karakter tanpa karakter kontrol.';
  end if;
  select email_confirmed_at, banned_until, deleted_at into v_confirmed_at, v_banned_until, v_deleted_at
  from auth.users where id = p_target_user_id;
  if not found then raise exception using errcode = 'P0002', message = 'Akun Supabase Auth dengan UUID tersebut tidak ditemukan.'; end if;
  if v_confirmed_at is null then raise exception using errcode = '22023', message = 'Email akun harus sudah terverifikasi sebelum bootstrap.'; end if;
  if v_deleted_at is not null or (v_banned_until is not null and v_banned_until > now()) then
    raise exception using errcode = '22023', message = 'Akun tidak aktif atau sedang diblokir.';
  end if;
  if exists (select 1 from tu.user_roles where role_code = 'head_tu' and is_active and revoked_at is null) then
    raise exception using errcode = '23505', message = 'Bootstrap ditutup: sudah ada Head TU aktif.';
  end if;
  select id into v_unit_id from tu.units where unit_code = 'tata_usaha' and is_active;
  if v_unit_id is null then raise exception using errcode = 'P0002', message = 'Unit Tata Usaha aktif tidak ditemukan.'; end if;
  perform set_config('tu.audit_actor_label', btrim(p_actor_label), true);
  perform set_config('tu.audit_actor_user_id', '', true);
  perform set_config('tu.audit_action_override', 'bootstrap', true);
  insert into tu.user_roles(user_id, role_code, unit_id, is_active, assigned_by, notes)
  values (p_target_user_id, 'head_tu', v_unit_id, true, null,
    'Penetapan Head TU pertama melalui prosedur bootstrap administrator database.');
  return p_target_user_id;
end;
$;
revoke all on function tu_private.bootstrap_first_head_tu(uuid, text) from public, anon, authenticated, service_role;


commit;
