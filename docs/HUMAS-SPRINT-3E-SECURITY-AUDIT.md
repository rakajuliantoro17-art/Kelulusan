# PINTUKU HUMAS — Sprint 3E: Database Readiness & Security Audit

## Current production state (checked 2026-11-02)
- Supabase project is healthy, PostgreSQL 17.6.
- No HUMAS tables are present in `public` or `humas`.
- No migrations are recorded by the Supabase migration listing.
- No development branches exist.
- Supabase security and performance advisors returned no lints. This is not proof that uncreated application schema is secure; there is currently no HUMAS schema for advisors to inspect.
- No production DDL or data mutation was performed.

## Static migration review
Migrations 001–006 are ordered by dependency and their table/column references were reviewed against the source:
- 001 creates partners, agreements, documents, approvals, workflow events and updated_at triggers.
- 002 creates the server-managed user_roles mapping.
- 003 adds partner_events and transactional partner create/update/status RPCs.
- 004 adds the agreement register indexes and transactional draft creation.

## Findings and remediation
1. The audit timeline tables should not retain UPDATE/DELETE privileges for the application service role. Migration 005 revokes all table privileges and restores SELECT/INSERT only.
2. Audit actor identity and role must be checked against the current active `humas.user_roles` record at insert time, not only trusted from request payload. Migration 005 adds a trigger guard for partner events and agreement draft-created events.
3. The API pagination is bounded to page 1–1000 and page size 1–100.
4. Partner search limits its generated PostgREST filter token to Unicode letters/digits, preventing logic-tree metacharacters from being injected into the filter expression. It currently searches using the first token only.
5. Agreement dates are validated as real calendar dates and date order is checked before RPC invocation. Monetary values are constrained to numeric(16,2)-compatible decimal input.
6. API errors map invalid query and common database validation SQLSTATEs to client errors without exposing raw upstream error bodies.

## Required deployment prerequisites
1. Apply migrations 001 through 006 in order to a disposable local/non-production database first.
2. Review and test all constraints, triggers, grants and RPCs in that environment.
3. Expose the `humas` schema in Supabase Data API settings. Do not grant `anon` or `authenticated` privileges on HUMAS tables or RPCs.
4. Confirm `service_role` is the only role with schema/table/function access needed by the server API.
5. Configure server-only Vercel environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` (preferred) or legacy `SUPABASE_SERVICE_ROLE_KEY`.
6. Provision Auth users and assign roles through a controlled administrative process. Do not infer or self-assign business roles from user metadata.
7. Run integration tests for each role and operation before enabling the frontend.

## Verification status
- API source syntax parser: passed after hardening.
- Live production migration state: unchanged and still empty.
- SQL migrations 001–006: source reviewed; not executed.
- API integration/runtime tests: pending because no HUMAS database objects or test Auth users exist in the production project.
- Vercel deployment/build: not performed.

## Explicit non-goals
No approval/recommendation transitions, signatures/TTE, document upload, storage buckets, hard delete, or public/browser table access are introduced by this audit.


## Audit follow-up — Sprint 3G
A final source review found two remaining NULL-unsafe role comparisons in `partner_update` and `partner_set_status` within migration 003. Both now use `IS DISTINCT FROM`. Migration 006 adds an exclusive-role guard for `system_operator`, including a preflight check for existing conflicting assignments. The local test harness checks both directions of role conflict and immutability of role identity. These additions have passed source-level assertions only; PostgreSQL execution is still pending.
