-- PINTUKU HUMAS — Sprint 3E: database privilege and audit hardening
-- Apply only after migrations 001–004, in order. Not applied to production.

create or replace function humas.enforce_humas_audit_actor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.actor_id is null or new.actor_role <> 'staff_humas'
     or not exists (
       select 1
       from humas.user_roles ur
       where ur.user_id = new.actor_id
         and ur.role_code = 'staff_humas'
         and ur.is_active = true
         and ur.revoked_at is null
     ) then
    raise exception using errcode = '42501',
      message = 'active_staff_humas_role_required';
  end if;
  return new;
end;
$$;

drop trigger if exists partner_events_validate_actor on humas.partner_events;
create trigger partner_events_validate_actor
before insert on humas.partner_events
for each row execute function humas.enforce_humas_audit_actor();

drop trigger if exists agreement_draft_event_validate_actor on humas.agreement_workflow_events;
create trigger agreement_draft_event_validate_actor
before insert on humas.agreement_workflow_events
for each row
when (new.event_type = 'draft_created')
execute function humas.enforce_humas_audit_actor();

-- Audit timelines are append-only for the server application.
revoke all on table humas.partner_events from service_role;
grant select, insert on table humas.partner_events to service_role;

revoke all on table humas.agreement_workflow_events from service_role;
grant select, insert on table humas.agreement_workflow_events to service_role;

-- Trigger functions and timestamp helper are not callable as public RPC endpoints.
revoke all on function humas.enforce_humas_audit_actor() from public, anon, authenticated;
grant execute on function humas.enforce_humas_audit_actor() to service_role;

revoke all on function humas.set_updated_at() from public, anon, authenticated;
grant execute on function humas.set_updated_at() to service_role;

comment on function humas.enforce_humas_audit_actor() is
  'Rejects audit events unless the actor currently has an active staff_humas role.';
