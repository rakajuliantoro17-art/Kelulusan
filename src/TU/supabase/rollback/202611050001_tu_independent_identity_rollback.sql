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
     or exists (select 1 from tu.visits) or exists (select 1 from tu.visit_events) then
    raise exception 'Rollback blocked: TU operational or audit records exist. Use point-in-time recovery or a reviewed reverse data migration.';
  end if;
end;
$$;

drop index if exists tu.tu_user_roles_identity_active_uidx;
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

-- The legacy role audit and visit workflow functions must be restored from the
-- immediately preceding migrations before traffic is re-enabled. This script
-- deliberately does not recreate the Auth-only bootstrap routine.

commit;
