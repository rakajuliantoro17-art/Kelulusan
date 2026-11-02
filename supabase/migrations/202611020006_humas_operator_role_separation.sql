-- PINTUKU HUMAS — Sprint 3G.9: enforce technical operator role separation
-- Prevent system_operator from holding active business roles at the same time.
-- Role assignment remains server-managed; this trigger is a database backstop.

create or replace function humas.enforce_operator_role_separation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and (new.user_id is distinct from old.user_id
          or new.role_code is distinct from old.role_code) then
    raise exception using errcode = '22023',
      message = 'role_assignment_identity_immutable';
  end if;

  if new.is_active = true and new.revoked_at is null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(new.user_id::text, 0)
    );

    if new.role_code = 'system_operator' then
      if exists (
        select 1
        from humas.user_roles ur
        where ur.user_id = new.user_id
          and ur.is_active = true
          and ur.revoked_at is null
          and ur.id is distinct from new.id
      ) then
        raise exception using errcode = '23514',
          message = 'system_operator_must_be_exclusive';
      end if;
    elsif exists (
      select 1
      from humas.user_roles ur
      where ur.user_id = new.user_id
        and ur.role_code = 'system_operator'
        and ur.is_active = true
        and ur.revoked_at is null
        and ur.id is distinct from new.id
    ) then
      raise exception using errcode = '23514',
        message = 'business_role_conflicts_with_system_operator';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists user_roles_operator_separation on humas.user_roles;
create trigger user_roles_operator_separation
before insert or update of user_id, role_code, is_active, revoked_at
on humas.user_roles
for each row execute function humas.enforce_operator_role_separation();

revoke all on function humas.enforce_operator_role_separation() from public, anon, authenticated;
grant execute on function humas.enforce_operator_role_separation() to service_role;

comment on function humas.enforce_operator_role_separation() is
  'Ensures system_operator remains exclusive from active HUMAS business roles.';
