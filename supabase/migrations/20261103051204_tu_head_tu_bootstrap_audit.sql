-- PINTUKU TU first Head TU bootstrap + role audit trail.
-- Bootstrap is intentionally callable only by a trusted SQL administrator.
create schema if not exists tu_private;
revoke all on schema tu_private from public, anon, authenticated, service_role;

create table if not exists tu.role_audit_logs (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_label text not null,
  action text not null check (action in ('bootstrap','assigned','revoked','updated','deleted')),
  role_code text not null,
  unit_id uuid references tu.units(id) on delete set null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tu_role_audit_target_time_idx
  on tu.role_audit_logs(target_user_id, created_at desc);
create index if not exists tu_role_audit_time_idx
  on tu.role_audit_logs(created_at desc);

alter table tu.role_audit_logs enable row level security;
revoke all on table tu.role_audit_logs from public, anon, authenticated;
grant select, insert on table tu.role_audit_logs to service_role;

create unique index if not exists tu_single_active_head_tu_idx
  on tu.user_roles(role_code)
  where role_code = 'head_tu' and is_active and revoked_at is null;

create or replace function tu_private.audit_user_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_target_user_id uuid;
  v_role_code text;
  v_unit_id uuid;
  v_action text;
  v_actor_id_text text;
  v_actor_id uuid;
  v_actor_label text;
  v_override text;
begin
  if tg_op = 'INSERT' then
    v_after := to_jsonb(new);
    v_target_user_id := new.user_id;
    v_role_code := new.role_code;
    v_unit_id := new.unit_id;
    v_action := 'assigned';
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    v_target_user_id := new.user_id;
    v_role_code := new.role_code;
    v_unit_id := new.unit_id;
    if old.is_active and not new.is_active then
      v_action := 'revoked';
    else
      v_action := 'updated';
    end if;
  else
    v_before := to_jsonb(old);
    v_target_user_id := old.user_id;
    v_role_code := old.role_code;
    v_unit_id := old.unit_id;
    v_action := 'deleted';
  end if;

  v_override := nullif(current_setting('tu.audit_action_override', true), '');
  if v_override = 'bootstrap' and v_action = 'assigned' and v_role_code = 'head_tu' then
    v_action := 'bootstrap';
  end if;

  v_actor_id_text := nullif(current_setting('tu.audit_actor_user_id', true), '');
  if v_actor_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    v_actor_id := v_actor_id_text::uuid;
  end if;
  v_actor_label := coalesce(
    nullif(current_setting('tu.audit_actor_label', true), ''),
    current_user
  );

  insert into tu.role_audit_logs (
    target_user_id, actor_user_id, actor_label, action,
    role_code, unit_id, before_state, after_state
  ) values (
    v_target_user_id, v_actor_id, left(v_actor_label, 120), v_action,
    v_role_code, v_unit_id, v_before, v_after
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function tu_private.audit_user_role_change() from public, anon, authenticated, service_role;

drop trigger if exists tu_user_roles_audit_change on tu.user_roles;
create trigger tu_user_roles_audit_change
after insert or update or delete on tu.user_roles
for each row execute function tu_private.audit_user_role_change();

create or replace function tu_private.bootstrap_first_head_tu(
  p_target_user_id uuid,
  p_actor_label text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_confirmed_at timestamptz;
  v_banned_until timestamptz;
  v_deleted_at timestamptz;
  v_unit_id uuid;
begin
  if current_user not in ('postgres', 'supabase_admin') then
    raise exception using errcode = '42501', message = 'Bootstrap hanya dapat dijalankan oleh administrator database tepercaya.';
  end if;
  if p_target_user_id is null then
    raise exception using errcode = '22023', message = 'UUID akun tujuan wajib diisi.';
  end if;
  if p_actor_label is null or length(btrim(p_actor_label)) < 5 or length(p_actor_label) > 120
     or p_actor_label ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Label administrator wajib 5–120 karakter tanpa karakter kontrol.';
  end if;

  select email_confirmed_at, banned_until, deleted_at
    into v_confirmed_at, v_banned_until, v_deleted_at
  from auth.users
  where id = p_target_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Akun Supabase Auth dengan UUID tersebut tidak ditemukan.';
  end if;
  if v_confirmed_at is null then
    raise exception using errcode = '22023', message = 'Email akun harus sudah terverifikasi sebelum bootstrap.';
  end if;
  if v_deleted_at is not null or (v_banned_until is not null and v_banned_until > now()) then
    raise exception using errcode = '22023', message = 'Akun tidak aktif atau sedang diblokir.';
  end if;

  if exists (
    select 1 from tu.user_roles
    where role_code = 'head_tu' and is_active and revoked_at is null
  ) then
    raise exception using errcode = '23505', message = 'Bootstrap ditutup: sudah ada Head TU aktif.';
  end if;

  select id into v_unit_id
  from tu.units
  where unit_code = 'tata_usaha' and is_active;

  if v_unit_id is null then
    raise exception using errcode = 'P0002', message = 'Unit Tata Usaha aktif tidak ditemukan.';
  end if;

  perform set_config('tu.audit_actor_label', btrim(p_actor_label), true);
  perform set_config('tu.audit_actor_user_id', '', true);
  perform set_config('tu.audit_action_override', 'bootstrap', true);

  insert into tu.user_roles (
    user_id, role_code, unit_id, is_active, assigned_by, notes
  ) values (
    p_target_user_id, 'head_tu', v_unit_id, true, null,
    'Penetapan Head TU pertama melalui prosedur bootstrap administrator database.'
  );

  return p_target_user_id;
end;
$$;

revoke all on function tu_private.bootstrap_first_head_tu(uuid, text) from public, anon, authenticated, service_role;

comment on schema tu_private is 'Private administrative routines. Not exposed through Supabase Data API and not executable by application roles.';
comment on table tu.role_audit_logs is 'Server-side audit trail for every TU role assignment, update, revocation, deletion, and first Head TU bootstrap.';
comment on function tu_private.bootstrap_first_head_tu(uuid, text) is 'One-time first Head TU bootstrap. Invoke only from trusted SQL Editor as postgres/supabase_admin after independently verifying the target auth.users UUID.';
