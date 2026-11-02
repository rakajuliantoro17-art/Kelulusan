# PINTUKU — Serverless Read/Write Architecture

## Context and deployment model

PINTUKU is a serverless web application:
- Static HTML, CSS, JavaScript, and image assets are built and served through Vercel's delivery network.
- Dynamic requests are handled by Vercel Serverless Functions under `/api/*`.
- Supabase is the managed PostgreSQL/Auth/Data API layer.
- There is no school-owned physical application server and no always-on application process.

Do not design operational requirements that assume a persistent school server. Local PostgreSQL is only an optional disposable test database on a developer workstation or ephemeral CI runner; it is not a production dependency.

## Current HUMAS implementation observations

- `api/humas.js` is a thin Vercel serverless entry point.
- `src/server/api/humas.js` calls Supabase Auth and the Supabase REST/RPC endpoints over HTTPS. It does not open a persistent PostgreSQL socket.
- The API currently performs an Auth user validation request, a separate `user_roles` lookup, and then a REST data read or transactional RPC write for each business request.
- GET responses currently use `Cache-Control: no-store`, appropriate for private partner and agreement records.
- Partner and agreement lists select explicit columns and use pagination (default 25, maximum 100).
- Writes use transactional Postgres RPCs rather than multiple client-side table mutations.
- The Kemitraan browser script is still demo-only and does not call the API. Therefore the current preview UI does not create live Supabase read/write traffic.

## Resource ownership

| Activity | Primary resource used |
|---|---|
| Static page and asset delivery | Vercel CDN/edge cache |
| API invocation, authentication orchestration | Vercel Serverless Function |
| SQL execution, indexes, constraints, transactions | Supabase PostgreSQL |
| User authentication and token validation | Supabase Auth |
| File transfer and object storage | Supabase Storage when introduced |

Vercel function invocations and Supabase database queries are different resource dimensions. Optimize both, but do not move database work into a long-running server.

## Read policy

1. Request data only when a user opens a module or explicitly refreshes it.
2. Load the first visible page; use pagination or search for more. Do not fetch the entire register.
3. Keep the current default page size of 25 and hard maximum of 100 unless measured usage justifies a change.
4. Select only columns required by the visible screen.
5. Debounce search input by approximately 300–500 ms, or submit search explicitly. Do not query on every keystroke.
6. Do not poll dashboards continuously. Prefer manual refresh, navigation-triggered refresh, or refresh after a successful write.
7. Avoid N+1 requests. A list should include the small set of related display fields needed for the list, or use one aggregate/read RPC.
8. For dashboard summaries, prefer one bounded aggregate RPC that returns counts and latest activity in one database round trip rather than one request per KPI card.
9. Keep sensitive operational data private and non-cacheable at shared CDN level. Do not introduce public `s-maxage` caching for authenticated partner/agreement data.
10. Cache non-sensitive static reference data in the browser session only when it is safe and has a clear refresh/invalidation rule.

## Write policy

1. Writes occur only after an explicit user action (save, submit, status change).
2. Never save on every keystroke. If autosave is later required, debounce and batch it.
3. Keep each logical business action in one transactional Postgres RPC.
4. Do not send one request per field or per row when one batch operation is possible.
5. Prevent duplicate submissions on double-click and network retry; introduce idempotency keys for operations where duplicate creation would be harmful.
6. Return compact response payloads. Do not reload the full register after every write; update the affected row or refresh only the visible page.
7. Keep audit writes in the same database transaction as the business change.
8. Apply server-side authorization and database-side actor/role validation. UI visibility is not authorization.

## Authentication and round-trip optimization

The current request path validates the access token with Supabase Auth, fetches the user's active HUMAS role, then reads data or calls an RPC. This is clear and secure but creates multiple upstream requests per Vercel invocation.

Optimization target for a later measured iteration:
- Keep identity validation authoritative.
- Consider combining active-role verification and the requested read into one narrowly scoped SQL RPC, or using a carefully designed read RPC that checks the actor's active role internally.
- For writes, the transactional RPC must validate the actor's active role itself; do not trust a role string supplied by the browser.
- Remove the separate role lookup only after every read/write RPC independently enforces actor and role authorization and negative tests prove it.
- Do not cache role authorization in a global serverless variable as a security mechanism. Function instances are ephemeral and shared-memory caches can become stale.
- Do not replace token validation with unverified JWT decoding. Any local JWT verification must validate signature, issuer, audience, expiry, and key rotation against current Supabase guidance.

This optimization is not applied yet. Security correctness takes priority over saving one HTTP request.

## Caching policy

- Versioned static assets: long-lived immutable CDN caching is appropriate. The current Vercel configuration already sets one year immutable caching for `/assets/*`.
- Private partner/agreement data: keep `no-store` unless a security-reviewed per-user cache strategy is implemented.
- Public announcements or non-sensitive public content: may use short shared-cache TTLs only after confirming that the endpoint is genuinely public and contains no user-specific fields.
- Never cache responses containing tokens, role assignments, contact details, confidential documents, or approval history in a shared cache.

## Observability and limits

- Log request ID, operation, duration, status, and upstream status; never log bearer tokens, secret keys, full sensitive payloads, or document contents.
- Keep explicit request timeouts and bounded pagination.
- Measure function invocations, function duration, Supabase database load, and slow queries before optimizing.
- Add rate limits to write-heavy or abuse-prone operations.
- Avoid background jobs or scheduled polling unless there is a clear business need.

## Testing and deployment

- Local PostgreSQL is a test tool only, not a production server requirement.
- An ephemeral CI database can run migrations and integration tests without maintaining a physical server, subject to the repository's CI quota and policy.
- Vercel Preview deployments should be used for UI/API smoke tests after code checks pass.
- Do not point untested migrations at Production.
- Keep Production migrations separate from normal frontend auto-deploy. A Vercel deployment must not automatically apply database schema changes.
- Current HUMAS status: preview UI is demo-only; API source exists; migrations are source-only; no live HUMAS tables or users exist in Supabase.

## Acceptance criteria

A PINTUKU module is considered resource-conscious when:
- its initial screen uses a small number of bounded API calls;
- no list loads unbounded records;
- search is debounced or explicit;
- dashboard KPIs are aggregated in one call where possible;
- writes are transactional and user-initiated;
- private responses are not shared-cached;
- static assets are CDN-cached;
- no continuous polling is present without a justified need;
- authorization remains enforced on the server and in database RPCs.
