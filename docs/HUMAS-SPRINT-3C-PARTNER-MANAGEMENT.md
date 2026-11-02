# PINTUKU HUMAS — Sprint 3C: Partner Management API

## Delivered
- Paginated partner directory (`GET /api/humas?op=partners&page=1&limit=25`). Maximum page size: 100.
- Optional filters: `status`, `type`, and search across partner name/contact person.
- Create partner (`POST`, `op=partners`).
- Update partner (`PATCH`, `op=partners`, body includes `id`).
- Change partner status (`PATCH`, body `action: status`, `record_status`, optional `reason`). This is a soft status change; no hard-delete operation exists.
- Writes are transactional Postgres RPC calls and create `humas.partner_events` audit records.

## Authorization
Only `staff_humas` can create/update/change status. `vice_principal_humas` and `principal` can read. `system_operator` remains technical-only. Actor ID and role are derived server-side; client-supplied authority fields are ignored.

## Important limits
- No hard delete.
- No direct browser table access.
- No production migration applied.
- API depends on migrations 001–006, `humas` Data API exposure, and server-only Vercel environment variables.


## Security hardening follow-up
Migration 005 validates active staff role membership for audit events. Migration 006 prevents an active `system_operator` assignment from coexisting with an active business role. Both are required before enabling the API in a real environment. Neither migration has been executed against PostgreSQL yet.
