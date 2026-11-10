# SARPRASIN Inventory Workspace — Implementation Notes

## Implemented in this stage
- Admin/Staff workspace sections for assets, purchases, movements, locations/warehouse, import preview, and activity history.
- Authenticated read-only asset endpoint: `GET /api/sarpras/assets`.
- The endpoint reads the existing `Aset!A:O` range and is restricted to `admin_sarpras`, `staff_sarpras`, and `arsiparis`.
- The endpoint returns at most 1,000 rows (default 500) and never writes to Google Sheets or Firestore.
- Browser-side asset search and condition filter.
- XLSX and CSV local preview. No import commit action is enabled.

## Existing security retained
- Account source remains the private `Pengguna` sheet.
- Session remains HMAC-SHA256 bearer token with an 8-hour expiry.
- Service-account credentials remain server-side.
- This stage does not change OAuth scopes, production spreadsheet permissions, or authentication flow.

## Import behavior
- CSV parser handles quoted cells, escaped double quotes, CRLF, and comma/semicolon/tab separators.
- XLSX uses a version-pinned browser ESM parser loaded only after file selection.
- Header detection is heuristic and for preview only; it is not a mapping approval.
- BPOPP 2025 is a procurement-history source, not a verified current inventory snapshot.
- No data from the uploaded BPOPP workbook is seeded into production.

## Remaining implementation gates
1. Confirm exact current headers and sample rows for live `Aset`, `Ruangan`, and `Log_Aktivitas`.
2. Confirm the unique asset identity and BPOPP KIB B mapping.
3. Agree on headers for `Riwayat_Aset`, `Mutasi_Aset`, `Pembelian`, `Lokasi`, and `Import_Batch`.
4. Implement server-side writes behind a disabled-by-default feature flag with role checks, validation, request idempotency, optimistic revision checks, and append-only audit writes.
5. Test against a non-production spreadsheet before enabling production writes.
6. Prevent the legacy Firestore importer from writing the same inventory concurrently.

## Inventory model
- Per-unit records for individually identifiable devices.
- Per-group records for homogeneous quantities.
- Partial group movement creates a child group with provenance and reduces the source group quantity; aggregate quantity must remain invariant.
- Current asset state is a projection. Historical revisions and movement events are append-only.
