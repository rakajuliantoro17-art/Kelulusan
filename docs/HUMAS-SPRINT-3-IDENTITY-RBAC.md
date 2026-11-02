# PINTUKU HUMAS — Sprint 3A: Identity & RBAC Foundation

## Status
Sprint 3A prepares the database authorization model and implementation contract. It does not activate production access.

## Scope
- Map Supabase Auth users to explicit HUMAS roles.
- Keep role assignments server-managed.
- Define deny-by-default authorization.
- Preserve the separation between technical administration and substantive approval.

## Role codes
| Role code | Operational authority |
|---|---|
| `staff_humas` | Manage partner directory; create and submit agreement drafts; perform administrative verification only when explicitly authorized by workflow rules |
| `vice_principal_humas` | Read assigned agreements; review substance; request revision or recommend; cannot approve finally |
| `principal` | Make final approve/reject/return decision |
| `system_operator` | Technical account/configuration support; no substantive agreement decision |

An account may hold more than one role only if school governance explicitly authorizes it. Avoid conflicting role assignments for the same transaction; the application must prevent self-approval and enforce separation of duties.

## Database change
Migration: `supabase/migrations/202611020002_humas_rbac_foundation.sql`

Creates `humas.user_roles` with:
- FK to `auth.users(id)`
- constrained role codes
- active/revoked state
- assigning actor and timestamp
- unique user-role pair

RLS is enabled. No grants or policies are provided to `anon` or `authenticated`. Only the server-side `service_role` may manage/read role mappings. Never place the service-role key in browser code.

## Authentication and authorization contract
1. Every protected API request must require a Bearer access token.
2. Validate the token against Supabase Auth (do not trust decoded JWT claims alone).
3. Resolve the authenticated user ID from the validated Auth response.
4. Read active role assignments server-side.
5. Apply least-privilege checks per operation.
6. Reject missing, expired, invalid, or insufficient credentials with 401/403.
7. Record actor, role, action, target record, timestamp, and outcome for sensitive changes.
8. Never accept `actor_id`, `actor_role`, or approval status from the browser as authoritative.
9. Final approval belongs only to `principal`; a `vice_principal_humas` recommendation must never advance directly to approved.
10. `system_operator` is technical-only and must not receive approval rights.

## API implementation sequence
- 3B: server-side Supabase client/configuration and Auth token verification.
- 3C: read/create partner and agreement draft endpoints.
- 3D: transactional workflow RPCs for verification, recommendation, principal decision, signature registration, and archival.
- 3E: document Storage upload/download with private bucket and short-lived signed URLs.
- 3F: connect UI, remove preview-only behavior after end-to-end tests pass.

Workflow transitions must be atomic on the database side (RPC/transaction). Do not implement multi-step status changes as independent browser requests.

## Not yet implemented / not production-ready
- Migration has not been applied to Supabase.
- No Auth users or role assignments have been provisioned.
- No API endpoints have been activated.
- No Storage bucket or document upload exists.
- No RLS policies for browser access exist by design.
- No end-to-end or production test has been run.

## Deployment gate
Before applying migrations: inspect current schemas, grants, policies, triggers, and migration history; validate both migrations in a disposable/staging Supabase project; then apply in a reviewed maintenance window. Create users and assign roles through an audited administrative procedure. Do not share secrets in chat or commit them to Git.
