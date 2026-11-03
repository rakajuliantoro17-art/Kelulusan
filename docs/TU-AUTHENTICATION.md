# PINTUKU Tata Usaha — Dedicated Authentication

## Scope

Tata Usaha uses a dedicated Supabase Auth login. It does not reuse the separate Firebase, Akademik, or Kesiswaan sessions.

- Login page: `/tata-usaha/login`
- Auth endpoint: `POST /api/tu/auth`
- Workspace endpoints: `/api/tu/context`, `/api/tu/units`, and notification endpoints
- Protected pages: TU dashboard, Front Office, and Access Governance

## Required deployment configuration

The serverless API requires:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

The database schema `tu` must be present in Supabase **Settings → API → Exposed schemas** for server-side PostgREST calls. Do not grant browser roles direct access to schema `tu`; server code uses the secret credential.

## Account activation

1. Create or invite the user in Supabase Auth using an approved school email address.
2. Verify the account through the school's approved identity process.
3. Assign an active business role in `tu.user_roles` using a trusted administrative process.
4. Only these roles can enter the TU workspace: `principal`, `head_tu`, `fo_coordinator`, `fo_receptionist`, `unit_officer`, and `tu_operator`.
5. `teacher`, `homeroom_teacher`, and `system_operator` alone do not authorize entry to the TU workspace.

There is intentionally no public role-assignment or bootstrap endpoint. Do not let a user grant a role to themselves. The first Head TU assignment must be provisioned by a trusted database administrator after the designated account UUID has been verified.

## Session behavior

- Password login, refresh-token rotation, and logout are proxied through the same-origin serverless API.
- Browser session data is held in tab-scoped `sessionStorage`; it is not written to `localStorage`.
- The API validates Supabase Auth identity and checks active TU business roles before returning a session.
- Protected pages validate the server-side TU context before displaying workspace content.
- Tokens are never logged by this implementation and responses are marked `Cache-Control: no-store`.

## Security boundary and known limitation

The access and refresh tokens are readable by JavaScript in the active tab. This is a pragmatic compatibility choice for the current static multi-page portal, not equivalent to an HttpOnly cookie. A strict Content Security Policy, XSS review, and server-managed HttpOnly session are recommended before broad production rollout.

The login flow cannot be considered operational until the deployment environment variables, exposed-schema setting, Supabase Auth account, and at least one authorized TU business-role assignment are configured and verified. No account, role, or credential is created by this code change.
