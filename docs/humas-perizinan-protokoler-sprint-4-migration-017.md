# HUMAS Sprint 4 — Migration 017

## Scope

Migration `202611030002_humas_permit_service_operations.sql` introduces the database foundation for operational control of permit requests:

- Priority classification: `low`, `normal`, `high`, `urgent`.
- First-response and resolution SLA deadlines.
- First-response timestamp, SLA pause timestamp/reason, and last activity timestamp.
- Private append-only internal notes.
- Private append-only communication records with channel, direction, contact summary, and optional follow-up.
- Operational summary counters for open requests, unassigned requests, priority, overdue SLAs, follow-ups, and overdue protocol tasks.

## Security model

- New tables have RLS enabled.
- No direct table privileges are granted to `anon` or `authenticated`.
- Only `service_role` receives table read/insert privileges and sequence usage.
- All write RPCs validate the active `staff_humas` assignment in `humas.user_roles`.
- Internal notes and communication records are append-only and are written to the existing permit workflow audit stream.
- Public permit tracking endpoints must not select or serialize internal notes or communication logs.

## SLA semantics

- `first_response_due_at` tracks the first response deadline.
- An outbound communication log records `first_responded_at` once, without overwriting the original response timestamp.
- `resolution_due_at` tracks the resolution deadline.
- Pausing requires a non-empty reason. Resuming shifts the existing deadlines by the pause duration.
- Closed permits cannot have service-level controls, internal notes, or communication logs added.

## Deployment state

Applied to Supabase production project `cnctlcpqpgqtbhgyocjq` on 2026-11-03 and confirmed in `supabase_migrations.schema_migrations`.

Verified objects:
- Columns on `humas.permit_requests`: `priority`, `first_response_due_at`, `first_responded_at`, `resolution_due_at`, `sla_paused_at`, `sla_pause_reason`, `last_activity_at`.
- Tables: `humas.permit_internal_notes`, `humas.permit_communications`.
- RPCs: `permit_set_service_level`, `permit_internal_note_create`, `permit_communication_log_create`, `permit_operational_summary`.
- RLS enabled on both new tables; no direct policies exist, and direct browser-role grants are revoked.

## Remaining application integration

This migration establishes the database layer. The authenticated HUMAS API and workspace UI still need to expose SLA editing, internal notes, communication history, and operational KPI summaries. Do not expose these records through public tracking endpoints. No Vercel cron schedule is added or changed.
