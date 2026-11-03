-- Index audit-log foreign keys for role-audit filtering and referential maintenance.
create index if not exists tu_role_audit_actor_time_idx
  on tu.role_audit_logs(actor_user_id, created_at desc)
  where actor_user_id is not null;
create index if not exists tu_role_audit_unit_time_idx
  on tu.role_audit_logs(unit_id, created_at desc)
  where unit_id is not null;
