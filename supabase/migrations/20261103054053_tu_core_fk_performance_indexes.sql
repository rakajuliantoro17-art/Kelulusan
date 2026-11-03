-- Cover remaining foreign-key access paths in the TU core schema.
create index if not exists tu_identity_verified_by_idx on tu.identity_links(verified_by) where verified_by is not null;
create index if not exists tu_sync_logs_initiated_by_idx on tu.integration_sync_logs(initiated_by) where initiated_by is not null;
create index if not exists tu_units_parent_unit_idx on tu.units(parent_unit_id) where parent_unit_id is not null;
create index if not exists tu_user_roles_assigned_by_idx on tu.user_roles(assigned_by) where assigned_by is not null;
create index if not exists tu_user_roles_unit_active_idx on tu.user_roles(unit_id, role_code) where is_active;
