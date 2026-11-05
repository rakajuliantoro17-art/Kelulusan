# HUMAS Account Governance — Backend Integration Specification

Status: **AUDIT / PROPOSAL ONLY**  
Target branch: `feature/humas-public-signup`  
Production database changes: **none**  
Production deployment: **none**

## 1. Purpose

Connect the HUMAS Admin account-governance workspace to Supabase without allowing public users to grant themselves access or alter review decisions.

Confirmed product decisions:
- Preserve the existing Supabase Auth UID as the stable account identity.
- Staff role source of truth remains the Google Spreadsheet; `humas.user_roles` is a synchronized mirror.
- Dedicated reviewer role: `admin_humas`.
- Public profile completion and email verification are prerequisites/data points, not approval.
- New public accounts begin in `pending_review`.
- Existing/legacy accounts require manual review; no automatic approval.
- Decision history is append-only.
- Staff session target: 8 hours (separate from the Supabase public-user session).

## 2. Audit findings (2026-11-05)

The current `src/server/api/humas-account.js` calls:
- `humas.external_profiles`
- `humas.external_profile_upsert`

Neither object exists in the inspected database schema. The public account flow therefore has a source/database contract mismatch and cannot safely be treated as production-ready.

The current `humas.user_roles.role_code` check constraint allows:
- `staff_humas`
- `vice_principal_humas`
- `principal`
- `system_operator`

It does not allow `admin_humas`.

The existing `humas.alumni_profiles` and `humas.alumni_intake_submissions` are alumni-specific and are not a valid replacement for a unified profile store for alumni, partners, committee members, and public users.

Security Advisor findings:
- 38 tables have RLS enabled without policies. This is an informational finding that still requires grant and server-access review; it is not proof of public exposure by itself.
- Leaked-password protection is disabled.

## 3. Proposed data model (not applied)

### 3.1 `humas.external_profiles`

One row per Supabase Auth UID. Suggested fields:
- `user_id uuid primary key references auth.users(id)`
- `account_type text` constrained to `alumni | partner | committee | public`
- `full_name text not null`
- `phone text`
- `school_relationship text`
- `graduation_year integer null`
- `organization_name text null`
- `organization_role text null`
- `city text null`
- `province text null`
- `purpose text null`
- `profile_status text` for profile completeness only
- `access_status text not null default 'pending_review'`, constrained to `pending_review | approved | rejected`
- `reviewed_at timestamptz null`
- `reviewed_by uuid null references auth.users(id)`
- `review_reason text null`
- `created_at / updated_at timestamptz`

Do not store email verification as an independently editable profile flag. Derive it from the authenticated Supabase Auth user record (for example, the provider's confirmed-email timestamp) through a trusted server-side lookup.

### 3.2 `humas.external_profile_review_events`

Append-only decision audit:
- identity key and event ID
- `user_id` (target profile UID)
- `actor_id` (Admin HUMAS UID)
- `decision` (`approved | rejected`)
- mandatory non-empty `reason`
- previous and new access status
- event timestamp
- optional request correlation / metadata with strict allow-list

The application role must not be able to update or delete review events. Corrections should be represented by a new event, not by rewriting history.

### 3.3 `humas.user_roles`

Extend the HUMAS role constraint to include `admin_humas`, without changing existing assignments. The spreadsheet remains the source of truth; synchronization must be idempotent and must not grant access merely because a spreadsheet row is malformed or inactive.

## 4. Authorization model

1. Browser sends the Supabase access token to the server API.
2. Server validates the token against Supabase Auth `/auth/v1/user`; never trust a client-supplied UID or role.
3. Server resolves the caller's active `humas.user_roles` membership using server-only credentials.
4. Only active `admin_humas` membership may read the account-review queue/details and submit a decision.
5. The decision operation validates target UID, allowed transition, and a non-empty reason.
6. Database operation independently verifies that the actor is an active `admin_humas` member. Do not treat possession of a service-role key as proof of actor permission.
7. Review event insert and profile status update occur atomically.
8. No direct browser write access to role assignments, review state, or audit events.

Never expose the Supabase secret/service-role key to the browser. Do not use user-editable `user_metadata` for authorization.

## 5. API contract proposal

All endpoints are server-side and require a validated bearer token.

- `GET /api/humas-account?op=admin-queue&page=1&limit=25&status=pending_review&q=...`
  - Requires active `admin_humas`.
  - Returns paginated profile records and server-derived email verification state.
- `GET /api/humas-account?op=admin-detail&user_id=<uuid>`
  - Requires active `admin_humas`.
  - Returns profile, Auth email verification metadata, and review history.
- `POST /api/humas-account?op=admin-decision`
  - Body: `{ user_id, decision, reason }`.
  - Requires active `admin_humas`.
  - `reason` is mandatory for both approval and rejection.
  - Returns the committed decision and audit event only after transaction success.

Public profile upsert must never accept `access_status`, `reviewed_by`, `reviewed_at`, role codes, or audit actor fields from the browser.

## 6. Legacy-account treatment

- Do not infer approval from `profile_status = complete`.
- Do not infer approval from email verification.
- Existing records are assigned `pending_review` during a controlled backfill, then reviewed manually.
- Preserve the original Supabase UID.
- Keep an auditable backfill record and do not silently overwrite prior account/profile data.
- Do not bulk-approve legacy users.

## 7. Required verification before enabling decisions

- Confirm table grants and schema exposure; RLS alone is not sufficient.
- Verify `anon` cannot read/write review data or role assignments.
- Verify ordinary `authenticated` users cannot access admin queue or submit decisions.
- Verify a user with any HUMAS role except `admin_humas` is denied.
- Verify inactive/revoked `admin_humas` membership is denied.
- Verify missing/blank reason is rejected.
- Verify profile update and audit event are atomic.
- Verify duplicate/replayed requests cannot create conflicting decisions.
- Verify audit rows cannot be updated/deleted by browser or ordinary application roles.
- Run Supabase Security Advisor after schema implementation.
- Test all cases in a development database before any production migration.

## 8. Explicitly out of scope for this proposal

- No schema migration has been executed.
- No Auth user has been created, invited, or modified.
- No account has been approved or rejected.
- No spreadsheet contents have been read or synchronized.
- No service credentials or passwords are included.
- No production deployment has been performed.

## 9. Next implementation sequence

1. Review and approve the proposed schema and authorization contract.
2. Prepare a versioned migration using the repository's established Supabase migration workflow.
3. Apply only to a development database and run verification queries.
4. Implement server API endpoints and automated tests on this branch.
5. Connect the admin UI to the API with empty/loading/error states.
6. Conduct security review before requesting production migration/deployment approval.
