# PINTUKU TU Core Foundation

## Status
- Database migration applied to the connected Supabase project: `202611030006_tu_core_foundation`.
- Git migration file committed separately for reproducibility.
- Domain schema: `tu`, isolated from `humas`.
- No direct browser access is granted to the schema. Access is server-mediated using Supabase server credentials.

## Initial objects
- `tu.units`: organizational units for Lobby, TU, Academic, Student Affairs, Facilities, and Principal.
- `tu.user_roles`: server-managed role assignments tied to Supabase Auth UUIDs.
- `tu.identity_links`: explicit identity mapping for PINTUKU, Academic, Student Affairs, and Facilities external subjects.
- `tu.integration_sources`: allowlisted integration registry; all integrations start disabled.
- `tu.integration_sync_logs`: operational audit of reads and synchronization.
- `tu.visit_notifications`: internal portal notifications for Lobby and Back Office.

## Security boundaries
- RLS is enabled on every table.
- `anon`, `authenticated`, and `public` receive no schema/table privileges.
- Only `service_role` receives schema usage and table privileges; its key must remain server-side.
- No role is assigned automatically. No account is linked automatically by matching email.
- Identity links must be explicitly verified by an authorized operator.
- Integration secrets are not stored in database configuration.

## Role codes
`principal`, `head_tu`, `fo_coordinator`, `fo_receptionist`, `unit_officer`, `tu_operator`, `teacher`, `homeroom_teacher`, `system_operator`.

## Integration policy
Academic, Student Affairs, and Facilities remain the source of truth for their own data. TU uses namespaced server APIs and stores only references, minimum required snapshots, and operational transactions. Initial integration sources are registered but disabled until authentication contracts and endpoint authorization are verified.

## Not included yet
- No users or role assignments have been provisioned.
- No legacy identity has been mapped.
- No cross-module API calls are active.
- No visitor or appointment transaction tables are created yet.
- Notification delivery UI/API and realtime subscriptions are not implemented yet.
- Build/deployment has not been run as part of this database foundation step.

## Next implementation
1. Establish server-side TU authentication and role resolution.
2. Define verified identity-linking workflow.
3. Add module-specific read adapters after auditing each module's authentication and data contract.
4. Build Front Office transactional schema and Notification Center.
