# TU Standalone Identity — Sprint Implementation Plan

Status: **prepared on development branch; migration NOT applied**.

## Decisions

- The private Google Spreadsheet tab `Pengguna` remains the authoritative account directory.
- Spreadsheet username is the external subject. `tu.identities.id` is the stable internal UUID used by operational foreign keys and audit trails.
- Spreadsheet passwords are never copied into Supabase.
- `tu.identity_links` remains intact for verified cross-module identity links. It is not the TU login source.
- The current Lobby display remains public and has no intake API. `system:lobby-public-intake` is reserved for a later public guestbook endpoint; it is not yet used by this branch.
- Supabase service credentials remain server-only.

## Files

- Migration: `src/TU/supabase/migrations/202611050001_tu_independent_identity.sql`
- Guarded rollback: `src/TU/supabase/rollback/202611050001_tu_independent_identity_rollback.sql`

The migration renames the Auth-backed actor columns and foreign keys in:
- `tu.user_roles`
- `tu.role_audit_logs`
- `tu.integration_sync_logs`
- `tu.visit_notifications`
- `tu.visits`
- `tu.visit_events`

It creates `tu.identities`, seeds the non-login system identities `system:spreadsheet-sync` and `system:lobby-public-intake`, and replaces the role-audit and visit-workflow trigger functions so audit actors and visit events use standalone TU identity UUIDs. It drops the legacy Auth-only first-Head-TU bootstrap routine; Head TU is provisioned through the spreadsheet account directory and controlled administrative process.

## Spreadsheet contract

The required columns A:E remain:
`Username | Nama | Password | Status | Peran`

Optional column F is:
`UnitCode`

- `UnitCode` is required for `unit_officer` accounts so the API can scope approvals to the assigned unit.
- Other roles may leave it blank.
- Password formats remain scrypt preferred, sha256 compatibility, and plaintext only as a temporary legacy fallback. Migrate all plaintext values to scrypt before operational launch.
- Usernames must be unique after lowercase normalization.
- Spreadsheet status and role changes must be revalidated server-side; the browser's role display is never authorization.

## Role normalization

| Spreadsheet role | Dashboard role | Database role |
|---|---|---|
| Kepala TU | `head_tu` | `head_tu` |
| Staf TU | `staff_tu` | `tu_operator` |
| Resepsionis | `receptionist` | `fo_receptionist` |
| Koordinator Front Office | `fo_coordinator` | `fo_coordinator` |
| Petugas Unit | `unit_officer` | `unit_officer` |
| Kepala Sekolah | `principal` | `principal` |

## Rollback strategy

1. Stop TU API traffic and disable the spreadsheet-auth feature flag/route.
2. Take a database backup or confirm a usable Supabase PITR restore point.
3. Prefer PITR if any staff identity, role assignment, visit, event, notification, or audit data has been created.
4. The guarded rollback SQL is only for a pre-launch/empty-data rollback. It intentionally aborts if any staff identity, role assignment, role audit record, visit, or visit event exists. The two seeded system identities alone do not block an empty-data rollback.
5. Before re-enabling the old API after schema rollback, restore the previous definitions of `tu_private.audit_user_role_change()` and `tu.handle_visit_workflow()` from the immediately preceding migrations. The rollback script intentionally does not recreate the deprecated Auth-only Head TU bootstrap routine.
6. Re-run the full migration and API test suite before restoring traffic.

Do not manually delete audit rows to force rollback.

## Deployment and migration gate

This branch is not production. The SQL migration is a reviewed artifact only. Do not run it against Supabase, alter production environment variables, merge to `main`, or deploy until separately approved.

## Implementation acceptance criteria

- Login reads active accounts from the private `Pengguna` tab and signs a bounded session.
- Every operational API request validates the signature and current spreadsheet account status/role.
- The API upserts a stable `tu.identities` row and synchronizes the role assignment.
- Unit officer authorization requires a valid active `UnitCode` mapped to `tu.units.unit_code`.
- All visit actor columns and role audit references use `tu.identities.id`.
- The public Lobby guestbook submission endpoint remains disabled until a separate anti-spam, rate-limit, privacy-notice, and validation review is complete.
- Role changes, disabled accounts, invalid unit mappings, expired tokens, and spreadsheet outages fail closed.
- RLS remains enabled; browser roles receive no direct table grants. Service credentials remain server-only.
- Tests cover each role, direct API calls, visit workflow transitions, audit events, notification visibility, and spreadsheet outages.
