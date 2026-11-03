-- Preserve workflow history as append-only audit data.
revoke update, delete on tu.visit_events from service_role;
grant select, insert on tu.visit_events to service_role;
alter table tu.visits drop constraint if exists tu_visits_completed_requires_checkout;
alter table tu.visits add constraint tu_visits_completed_requires_checkout
  check (status <> 'completed' or (checked_in_at is not null and checked_out_at is not null));
