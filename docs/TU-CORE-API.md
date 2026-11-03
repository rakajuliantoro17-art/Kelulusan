# PINTUKU TU Core API

## Endpoints
All endpoints require a valid Supabase access token in the Authorization Bearer header and an active assignment in `tu.user_roles`.

- `GET /api/tu/context` (rewrite ke `/api/tu?op=context`): authenticated identity, active role assignments, active units.
- `GET /api/tu/units` (rewrite ke `/api/tu?op=units`): active organizational units.
- `GET /api/tu/notifications` (rewrite ke `/api/tu?op=notifications`): inbox for the authenticated user and assigned units (maximum 50, newest first).
- `PATCH /api/tu/notifications/read` (rewrite ke `/api/tu?op=notification-read`): marks one notification as read only if addressed to the user or one of their assigned units.
- `GET /api/tu/visits` (rewrite ke `/api/tu?op=visits`): lists up to 100 recent visits; Front Office roles can see the operational register, while unit officers are scoped to assigned destination units.
- `POST /api/tu/visits`: creates a receptionist-assisted walk-in or appointment request. The API derives the actor from the validated Supabase identity; clients cannot set the creator, source, or initial status.
- `PATCH /api/tu/visits`: accepts workflow actions `approve`, `reject`, `clarify`, `resubmit`, `checkin`, and `checkout`. Unit decisions require the destination unit assignment (or supervisory role); check-in/check-out require Front Office roles.

## Security
- Service credentials are read only from server environment variables.
- Supabase Auth validates the caller's access token.
- TU roles are read from the private `tu.user_roles` table on the server.
- Notification reads and updates are scoped to the authenticated user and assigned unit IDs.
- No role provisioning endpoint is exposed.
- No external messaging provider is called.

## Supabase API configuration prerequisite
The database schema `tu` must be added to Supabase **Settings → API → Exposed schemas** for server-side PostgREST requests to use the `Accept-Profile: tu` header. This does not grant browser access: database privileges remain revoked for `anon` and `authenticated`, while the API uses a server-only secret key. Do not add `tu` to client-side SDK schema access.

## Workflow and security boundary
- Visit transactions and audit events are stored in `tu.visits` and `tu.visit_events`; a database trigger writes internal PINTUKU notifications in the same transaction.
- Visitor PII is not included in notification title/body. Unit officers do not receive visitor contact phone numbers from the visit list API.
- Front Office cannot approve or reject its own destination requests. Unit officers can decide only for assigned units. Only Front Office roles can record check-in/check-out.
- The public self-service kiosk is intentionally disabled until a separate anti-abuse, rate-limit, and privacy-safe public intake flow is implemented.

## Not implemented
- Role assignment UI and role governance.
- Public kiosk intake and appointment self-booking.
- Visit event timeline UI and escalation automation.
- Realtime subscription (to be enabled after the notification UI and publication policy are completed).
- Cross-module API adapters.
