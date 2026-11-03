# PINTUKU TU Core API

## Endpoints
All endpoints require a valid Supabase access token in the Authorization Bearer header and an active assignment in `tu.user_roles`.

- `GET /api/tu/context` (rewrite ke `/api/tu?op=context`): authenticated identity, active role assignments, active units.
- `GET /api/tu/units` (rewrite ke `/api/tu?op=units`): active organizational units.
- `GET /api/tu/notifications` (rewrite ke `/api/tu?op=notifications`): inbox for the authenticated user and assigned units (maximum 50, newest first).
- `PATCH /api/tu/notifications/read` (rewrite ke `/api/tu?op=notification-read`): marks one notification as read only if addressed to the user or one of their assigned units.

## Security
- Service credentials are read only from server environment variables.
- Supabase Auth validates the caller's access token.
- TU roles are read from the private `tu.user_roles` table on the server.
- Notification reads and updates are scoped to the authenticated user and assigned unit IDs.
- No role provisioning endpoint is exposed.
- No external messaging provider is called.

## Supabase API configuration prerequisite
The database schema `tu` must be added to Supabase **Settings → API → Exposed schemas** for server-side PostgREST requests to use the `Accept-Profile: tu` header. This does not grant browser access: database privileges remain revoked for `anon` and `authenticated`, while the API uses a server-only secret key. Do not add `tu` to client-side SDK schema access.

## Not implemented
- Role assignment UI and approval workflow.
- Front Office visit transactions and notification producers.
- Realtime subscription (to be enabled after the notification UI and publication policy are completed).
- Cross-module API adapters.
