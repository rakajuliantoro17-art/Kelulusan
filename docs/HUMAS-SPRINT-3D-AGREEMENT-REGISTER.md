# PINTUKU HUMAS — Sprint 3D: Agreement Register & Draft API

## Delivered
- Paginated agreement register (`GET /api/humas?op=agreements&page=1&limit=25`).
- Optional status and partner filters.
- Create draft (`POST /api/humas?op=agreements`). New records are always created with `draft` status.
- Draft creation checks that the partner exists and is active, and writes a workflow event in the same transaction.

## Separation of duties
Only `staff_humas` can create drafts. HUMAS staff, Wakasek HUMAS, and Kepala Sekolah can read the register. The operator role has no business-data access.

## Not included in this sprint
No edit-draft endpoint, submission, verification, recommendation, principal approval/rejection, signature, registration, archive, document upload, or TTE integration. Approval and signature remain distinct and must be implemented as separately authorized transactional workflows.

## Deployment status
Migrations 003, 004, 005, and 006 are committed as source only and have not been applied to the production Supabase project. API code is not yet runtime-tested or deployed.


## Database security prerequisites
The draft workflow relies on migration 005 to validate active staff actors for the `draft_created` event and migration 006 to keep technical operator accounts separate from business roles. The local integration runner includes all six migrations; runtime verification remains pending.
