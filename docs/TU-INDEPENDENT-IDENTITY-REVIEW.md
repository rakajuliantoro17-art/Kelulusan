# TU Standalone Identity — Technical Review

Review date: 2026-11-05
Branch: \`feature/tu-independent-identity\`
Status: **reviewed for development testing; not approved for production migration**

## Scope and safety boundary

This review covers the SQL migration, guarded rollback, spreadsheet authentication, API authorization, current Supabase TU schema, grants, triggers, and advisor findings.

All database inspection queries were read-only. No migration was applied, no production data was changed, no production environment variables were modified, and no production deployment or merge to \`main\` was performed.

## Current database observations

Project: \`cnctlcpqpgqtbhgyocjq\`

The operational tables currently contain no rows:

| Table | Rows |
|---|---:|
| \`tu.user_roles\` | 0 |
| \`tu.role_audit_logs\` | 0 |
| \`tu.integration_sync_logs\` | 0 |
| \`tu.visit_notifications\` | 0 |
| \`tu.visits\` | 0 |
| \`tu.visit_events\` | 0 |
| \`tu.identity_links\` | 0 |

The \`tu.units\` table has 9 records. These records are not changed by the migration.

The original schema has 13 foreign keys from \`tu\` to \`auth.users\`:
- 11 operational actor/role/notification references are moved to \`tu.identities(id)\`.
- 2 references in \`tu.identity_links\` are intentionally retained because that table remains the verified cross-module Supabase Auth mapping.

No dependent views or materialized views were found referencing the changed TU tables during the catalog query.

Existing trigger names verified against the database:
- \`tu_user_roles_audit_change\`
- \`tu_visits_workflow_events\`
- \`tu_visits_set_updated_at\`

The migration replaces the role audit and visit workflow function bodies while preserving the existing trigger names. The rollback drops the two dependent triggers before changing column names, restores the previous functions and bootstrap routine, then commits the old schema shape.

## Access control findings

- RLS is enabled on the TU tables.
- No row-level policies exist in schema \`tu\`.
- The current access model is server-mediated: schema/table privileges are revoked from \`public\`, \`anon\`, and \`authenticated\`; the server uses a Supabase secret/service credential.
- The new \`tu.identities\` table follows the same model: RLS enabled, no browser grants, server-only privileges.
- Do not add broad authenticated policies just to silence the advisor INFO finding. A future direct-browser access design would require a separate authorization review.

Supabase security advisors reported RLS-enabled/no-policy INFO findings across the existing HUMAS and TU schemas, plus a project-level warning that leaked-password protection is disabled for Supabase Auth. The latter does not govern spreadsheet-backed TU login but remains relevant to other modules.

Performance advisors reported 21 unindexed foreign keys in HUMAS tables; no unindexed TU foreign key appeared in the returned findings. Several unused-index findings relate to empty/new TU tables and should be re-evaluated after representative traffic exists, not removed pre-emptively.

## Migration review

The migration:
1. Creates \`tu.identities\` with normalized external username and display name; it stores no password.
2. Seeds two reserved non-login system subjects.
3. Renames operational actor columns and replaces their foreign keys.
4. Replaces role-audit and visit-workflow trigger functions.
5. Retains \`tu.identity_links\` for cross-module Auth identity links.
6. Preserves the existing active-role unique index, whose indexed column follows the \`user_id\` to \`identity_id\` rename. No redundant second unique index is created.
7. Keeps RLS enabled and denies browser roles direct table access.

The migration is transactional. It assumes the reviewed current schema version and should be tested against a dedicated development Supabase project before any production decision.

## Rollback review

The rollback:
- Requires TU API traffic to be disabled.
- Blocks if staff identities, role assignments, audit records, visits, visit events, integration sync logs, or notifications exist.
- Permits only the two seeded system identities to remain during an empty-data rollback.
- Restores old column names and Auth foreign keys.
- Restores the previous audit trigger function, visit workflow function, and deprecated Head TU bootstrap routine.
- Does not delete audit or operational data to force rollback.

If operational data has been created, prefer Supabase PITR or a separately reviewed reverse data migration. Do not run this empty-data rollback.

## Application security review

- Spreadsheet status is fail-closed: only explicit active values are accepted.
- Duplicate usernames are rejected case-insensitively, including duplicates where one row is inactive.
- The \`system:\` username prefix is reserved.
- Session signature, expiry, current spreadsheet status, and current role are checked server-side.
- Unit Officer access requires an active \`UnitCode\` mapped to \`tu.units\`.
- Front Office, unit approver, and Principal read permissions are separated in the API.
- The browser never receives the Supabase secret/service credential.

Remaining production hardening:
1. Replace the in-memory login attempt limiter with a distributed rate limiter and use only platform-verified client IP metadata.
2. Convert every spreadsheet password to scrypt and remove plaintext/SHA-256 compatibility paths before launch.
3. Run role-by-role integration tests against a dedicated development Supabase project, including all visit workflow transitions and notification access.
4. Validate the real spreadsheet header, status values, role values, username uniqueness, and every UnitCode before enabling staff login.

## Verification status

- SQL and API source review: completed.
- Current database catalog and row-count audit: completed read-only.
- Supabase security/performance advisor review: completed read-only.
- Migration execution: **not performed**.
- Rollback execution: **not performed**.
- Development Supabase integration test: pending.
- Production migration/deployment: **not authorized and not performed**.
