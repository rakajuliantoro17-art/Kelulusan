# Secure Head TU Bootstrap

## Design

The first Head TU is not provisioned through a public HTTP endpoint or browser UI. It is assigned once by an authorized database administrator from the Supabase SQL Editor. This avoids self-escalation, guessed identity matching, and exposure of a bootstrap secret in browser code.

The database migration creates:

- `tu.role_audit_logs`: RLS-enabled server-side audit trail for role insert/update/revocation/deletion.
- `tu_private.bootstrap_first_head_tu(uuid, text)`: one-time bootstrap routine, restricted to trusted database administrators.
- `tu_single_active_head_tu_idx`: database-level guarantee that at most one active `head_tu` role exists.
- `tu_private.audit_user_role_change()`: trigger routine that records every role mutation.

## Required operator procedure

1. Obtain formal approval from the Principal / authorized school leadership for the named Head TU.
2. Create or invite that person's account in Supabase Authentication.
3. Verify the person's identity outside the application using the school's official personnel process. Do not use email-only auto-matching.
4. Confirm the account's email and ensure it is not deleted or currently banned.
5. In Supabase Dashboard → Authentication → Users, copy the UUID from that exact verified account.
6. Open Supabase Dashboard → SQL Editor using an account with trusted database-administrator access.
7. Open `scripts/tu/bootstrap-first-head-tu.sql`, replace both all-zero UUID placeholders with the exact verified UUID, and replace the actor label with the accountable administrator's role/name.
8. Review the preview query. It must return exactly the intended account and show a non-null `email_confirmed_at`, null `deleted_at`, and no active ban.
9. Execute the bootstrap call. The function rejects unconfirmed, deleted, banned, missing, or duplicate targets and fails if an active Head TU already exists.
10. Verify `tu.user_roles` and `tu.role_audit_logs` using the queries at the end of the script.

## Security properties

- The private schema `tu_private` is not exposed to the Supabase Data API.
- `anon`, `authenticated`, and `service_role` have no schema usage or function execution privilege on `tu_private`.
- The bootstrap function is `SECURITY INVOKER`, has an empty `search_path`, and checks `current_user` against trusted database-administrator roles.
- The active Head TU uniqueness constraint is enforced by PostgreSQL, not only by application logic.
- Browser roles have no direct access to the audit table.
- No account UUID, role, or user record is created by this repository change.

## After successful bootstrap

The designated Head TU signs in at `/tata-usaha/login`. The TU API verifies the Supabase Auth token and active business role before issuing the workspace session. The login then opens the TU dashboard and Access Governance workspace.

## Important limitation

The bootstrap script intentionally contains an all-zero placeholder UUID. It is not executable as-is and must never be replaced with an assumed UUID. The actual Head TU account must be independently verified and selected by an authorized school administrator.
