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

## Invitation acceptance flow

- Production acceptance page: `/tata-usaha/accept-invite`.
- Configure the Supabase **Site URL** as `https://sookosip.vercel.app` and add `https://sookosip.vercel.app/**` to allowed Redirect URLs.
- In **Authentication → Email Templates → Invite User**, use a token-hash link:
  `{{ .SiteURL }}/tata-usaha/accept-invite?token_hash={{ .TokenHash }}&type=invite`
- The page removes the token hash from browser history before calling the same-origin API.
- The API verifies the one-time invite token with Supabase Auth, holds the short-lived access token only in page memory, and updates the password through the authenticated Auth user endpoint.
- No service/secret key is sent to the browser. The invite acceptance endpoint does not assign business roles or persist an application session.
- Expired, invalid, and already-used tokens return an actionable error; issue a fresh invitation after confirming the production URL and template.

## Account activation

1. Create or invite the user in Supabase Auth using an approved school email address.
2. Verify the account through the school's approved identity process.
3. Assign the first `head_tu` role using the restricted SQL procedure documented in [Secure Head TU Bootstrap](TU-HEAD-TU-BOOTSTRAP.md). Subsequent role governance will be implemented separately.
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


## First Head TU bootstrap

The first Head TU role is provisioned only by a trusted database administrator through Supabase SQL Editor. There is no public bootstrap API, browser-side role grant, or self-escalation path. See [TU Head TU Bootstrap](TU-HEAD-TU-BOOTSTRAP.md) and `scripts/tu/bootstrap-first-head-tu.sql`.
