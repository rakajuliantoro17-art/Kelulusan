# PINTUKU HUMAS — Sprint 3B: Authentication Gateway & API Base

## Status
Server-side authentication gateway and read API are implemented. Partner and agreement operations are extended in Sprints 3C and 3D. Source code is committed, but the feature is not production-operational until database migrations, schema exposure, Vercel environment variables, and runtime tests are completed.

## Current endpoints
- `GET /api/humas?op=me`: validates the Supabase access token and returns active HUMAS role codes.
- `GET /api/humas?op=partners`: paginated partner directory (Sprints 3C).
- `POST /api/humas?op=partners`: create partner (Staf HUMAS only).
- `PATCH /api/humas?op=partners`: update partner or change status (Staf HUMAS only).
- `GET /api/humas?op=agreements`: paginated agreement register.
- `POST /api/humas?op=agreements`: create a draft agreement (Staf HUMAS only).

The `system_operator` role is technical-only and does not receive business-data access. Wakasek HUMAS and Kepala Sekolah are read-only for partner/agreement records at this stage.

## Server environment variables
Configure these in Vercel Project Settings → Environment Variables for the intended deployment environments:
- `SUPABASE_URL`: project URL.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (or compatible legacy anon key).
- `SUPABASE_SECRET_KEY`: modern secret key (`sb_secret_...`), server-only and recommended.
- `SUPABASE_SERVICE_ROLE_KEY`: legacy compatibility fallback only.

Never expose secret/service-role credentials using `NEXT_PUBLIC_`, `VITE_`, or any browser-exposed prefix. Never commit credentials. Modern `sb_secret_...` keys are sent in the `apikey` header only; legacy JWT-based `service_role` keys use both headers.

## Supabase Data API prerequisite
The API uses PostgREST against the `humas` schema with a server-only secret credential and `Accept-Profile: humas`. Before enabling the endpoints:
1. Review and apply migrations 001–006 in a controlled sequence, including audit and operator-role hardening.
2. Add `humas` to the Data API exposed schemas.
3. Grant schema usage and table/function privileges to `service_role` only.
4. Do not grant `anon` or `authenticated` access to HUMAS tables/functions.
5. Confirm RLS is enabled on all HUMAS tables.

All user authentication is validated through Supabase Auth `GET /auth/v1/user`. Active roles are read server-side from `humas.user_roles`; user-editable metadata and client-supplied actor/role fields are not trusted.

## Security and workflow boundaries
- Partner writes are transactional RPC calls with a partner audit event.
- Agreement creation always creates a `draft` record and workflow event in one transaction.
- No hard-delete partner operation exists.
- No agreement approval, recommendation, signing, registration, archive, document upload, or TTE operation is exposed yet.
- Approval and signature remain separate stages.
- Responses use `Cache-Control: no-store`; upstream credentials and raw error bodies are not returned.

## Deployment and verification status
- JavaScript syntax parse of `src/server/api/humas.js`: passed.
- SQL migrations 003 and 004 are committed as source only; they have not been applied or executed against the production database.
- No Vercel runtime/deployment test has been performed.
- No live Supabase schema/data change has been performed in Sprints 3C–3D.
