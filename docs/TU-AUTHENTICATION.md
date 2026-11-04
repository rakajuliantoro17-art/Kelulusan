# PINTUKU Tata Usaha — Spreadsheet Authentication

## Architecture

Tata Usaha uses a dedicated Google Spreadsheet as its account and role source of truth. It does not use Supabase Auth for staff login and does not reuse Firebase, Akademik, or Kesiswaan sessions.

- Login page: /tata-usaha/login
- Auth endpoint: POST /api/tu/auth
- Protected workspace endpoints: /api/tu/context, /api/tu/units, visit and notification endpoints
- Account source: separate Google Spreadsheet, tab Pengguna
- Required column order: Username | Nama | Password | Status | Peran
- The spreadsheet must be shared with the configured Google Service Account as Viewer.
- Spreadsheet access is server-side only. Password cells are never returned to the browser or copied into Supabase.

## Required deployment configuration

Configure these environment variables in the Vercel project for the intended deployment environment:

| Variable | Purpose |
| --- | --- |
| GOOGLE_SHEET_ID_TU | ID of the separate TU spreadsheet file |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Service Account email |
| GOOGLE_SERVICE_ACCOUNT_KEY | Service Account private key |
| TU_SESSION_SECRET | Random secret of at least 32 characters for HMAC-SHA256 sessions |
| SUPABASE_URL | Supabase project URL for TU operational data |
| SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY | Server-only credential for the isolated tu schema |

Do not expose the Google private key, TU session secret, or Supabase secret/service-role key through any NEXT_PUBLIC_ variable or browser code. Do not use GOOGLE_SHEET_ID or the Kesiswaan spreadsheet ID for TU. The TU module reads only GOOGLE_SHEET_ID_TU.

## Spreadsheet contract

The first row of tab Pengguna must contain these headers in this exact order:

1. Username
2. Nama
3. Password
4. Status
5. Peran

The login form's email/username field is matched case-insensitively against Username.

- Status must explicitly be an active value: aktif, active, ya, yes, y, true, 1, or on. Empty or unknown status values deny access.
- Explicit inactive values include tidak, nonaktif, non-aktif, no, n, false, 0, and off.
- Unknown roles deny access. There is no fallback role.
- Kepala TU, Kepala-TU, kepala_tu, head_tu, Kepala Tata Usaha, and Kepala-Tata-Usaha map to head_tu.
- Other explicitly supported role labels are mapped in src/TU/api/sheets-auth.js. Do not enter arbitrary role names expecting automatic access.

Password storage accepts:
- scrypt$<salt-base64url>$<hash-base64url> (preferred; 64-byte derived key)
- sha256:<64-hex-character-digest> (compatibility)
- Legacy plaintext (compatibility with the existing school spreadsheet convention)

Plaintext compatibility is retained only to avoid unexpectedly locking out existing spreadsheet accounts. It is not the recommended long-term storage format. Migrate passwords to scrypt hashes through a controlled administrator process; never send passwords to developers or commit them to the repository.

## Session and authorization behavior

- Successful login creates an HMAC-SHA256 signed session with an eight-hour expiry.
- The browser stores the token in tab-scoped sessionStorage, not localStorage.
- There is no refresh token. An expired session requires the user to sign in again.
- Logout clears the tab's local token; because sessions are stateless, a copied token remains usable until expiry unless the account is disabled or its role is changed in the spreadsheet.
- Each protected API request verifies the signature and expiry, then re-reads the TU spreadsheet to confirm that the account remains active and its role is still allowed.
- Deactivating an account or changing its role in the spreadsheet therefore affects the next protected API request.
- Login attempts are limited to five failures per IP/username within ten minutes per server instance. A shared distributed rate limiter should be added before high-volume public exposure.
- The session token is readable by JavaScript in the active tab. This is a compatibility choice for the current static multi-page portal, not equivalent to an HttpOnly cookie. Apply a strict Content Security Policy and complete an XSS review before broad production rollout.

## Supabase's remaining responsibility

Supabase remains the server-side operational data store for TU. It is not the login provider. The migration src/TU/supabase/migrations/202611040001_tu_spreadsheet_identity_provider.sql creates tu.staff_identities, a minimal identity mirror required for referential integrity in visitor audit records. It does not store passwords.

Apply the TU migrations in order in the intended Supabase project before testing login or Front Office transactions. The migration preserves existing actor references as inactive legacy identities and enforces at most one active Head TU identity. The existing tu.user_roles and tu.identity_links tables remain for historical/transition compatibility; the new login flow does not use Supabase Auth role assignments.

## Deployment checklist

1. Confirm the Service Account has Viewer access to the separate TU spreadsheet.
2. Set GOOGLE_SHEET_ID_TU to that file's ID.
3. Set TU_SESSION_SECRET to a cryptographically random value of at least 32 characters.
4. Confirm Supabase operational environment variables are configured server-side.
5. Confirm the tu schema is listed under Supabase API Settings → Exposed schemas; keep access restricted to the server credential. Apply all TU migrations, including the Spreadsheet identity migration, in order.
6. Deploy the feature branch to a preview environment.
7. Verify Head TU login, role mapping, account deactivation, and protected Front Office API operations using a test account.
8. Do not merge to main or promote the deployment until the owner approves the preview tests.

## Legacy Supabase Auth invitation flow

The previous Supabase Auth invite/accept flow is no longer used for TU login. Existing invite-related pages, role-bootstrap SQL, and Auth-specific tables are retained as legacy artifacts for now; do not use them to provision new TU accounts. The Google Spreadsheet Pengguna tab is the sole source of login eligibility and TU role mapping.
