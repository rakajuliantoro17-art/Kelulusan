# PINTUKU HUMAS — Sprint 3B: Authentication Gateway & Read API

## Status
Server-side API scaffold committed. It is not production-operational until the database migrations, Vercel environment variables, and schema exposure are configured and tested.

## Endpoints
- `GET /api/humas?op=me`: validates the Supabase access token and returns the user's active HUMAS role codes.
- `GET /api/humas?op=partners`: returns up to 100 partner records to `staff_humas`, `vice_principal_humas`, and `principal`.

The `system_operator` role is technical-only and cannot read partner data through this endpoint.

## Server environment variables
Configure these in Vercel Project Settings → Environment Variables for the intended deployment environments:
- `SUPABASE_URL`: project URL.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (or compatible legacy anon key).
- `SUPABASE_SERVICE_ROLE_KEY`: legacy service-role key, server-only.

Do not prefix secrets with `NEXT_PUBLIC_`, `VITE_`, or any browser-exposed prefix. Do not commit credentials. The service-role key must never be returned to a browser or placed in static assets.

## Supabase Data API prerequisite
The API uses PostgREST to read the private `humas` schema with the service credential and `Accept-Profile: humas`. Before enabling this endpoint:
1. Apply the reviewed HUMAS migrations in a controlled environment.
2. Add `humas` to the Data API exposed schemas in Supabase API settings.
3. Grant schema usage to `service_role` only; do not grant `anon` or `authenticated`.
4. Ensure table privileges for `service_role` are present.
5. Confirm RLS is enabled on all HUMAS tables.

The API does not make direct browser-to-database calls. User token validation is performed against Supabase Auth `GET /auth/v1/user`; user-editable metadata is not used for authorization. Active role assignments are read server-side from `humas.user_roles`.

## Response and failure behavior
- 401: missing or invalid/expired session.
- 403: valid user without the required active role.
- 404: unknown operation.
- 405: unsupported HTTP method.
- 503: missing server configuration or unavailable database/schema dependency.

Responses are marked `Cache-Control: no-store`. API errors do not expose upstream bodies or credentials.

## Security boundaries
- No sign-in/sign-out UI is implemented in this sprint.
- No account provisioning or role assignment endpoint exists.
- No create/update/delete partner endpoint exists.
- No agreement or approval mutation endpoint exists.
- The service credential is only used server-side.
- Operator role does not imply business approval authority.
- Sensitive write operations must be transactional and audited in subsequent sprints.

## Known limitation
The live Supabase project inspection on 2026-11-02 returned no application tables in `humas` or `public`, no migrations, and no development branches. Therefore the API will not return partner data until migrations are applied and environment/schema prerequisites are completed. No live schema change was performed as part of Sprint 3B.
