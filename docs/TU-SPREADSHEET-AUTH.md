# PINTUKU Tata Usaha — Spreadsheet Authentication

Login dan otorisasi workspace TU menggunakan Google Spreadsheet serta token sesi HMAC-SHA256. Akun petugas TU tidak memerlukan Supabase Auth. Supabase menyimpan UUID identitas internal pada schema \`tu\`; spreadsheet tetap menjadi sumber akun dan role.

## 1. Format spreadsheet

Spreadsheet khusus TU harus memiliki tab bernama persis \`Pengguna\`, dengan header pada baris pertama:

| Username | Nama | Password | Status | Peran | UnitCode |
|---|---|---|---|---|---|

- \`Username\`: identitas login; pencocokan tidak membedakan huruf besar/kecil dan harus unik.
- \`Nama\`: nama yang ditampilkan pada dashboard.
- \`Password\`: format \`scrypt:<salt-32-hex>:<hash-128-hex>\` direkomendasikan; \`sha256:<64 karakter hex>\` hanya kompatibilitas; teks biasa hanya fallback migrasi awal.
- \`Status\`: akun dianggap aktif kecuali nilainya salah satu dari \`Tidak\`, \`Nonaktif\`, \`Non-aktif\`, \`No\`, \`N\`, \`False\`, \`0\`, atau \`Off\`.
- \`Peran\`: salah satu peran yang dikenali di bawah.
- \`UnitCode\`: opsional untuk semua role selain Petugas Unit. Untuk Petugas Unit, wajib berisi kode unit aktif dari \`tu.units\`, misalnya \`humas\`, \`sarpras\`, atau \`tata_usaha\`. Header ini boleh tidak ada jika belum ada akun Petugas Unit.

Akun dengan peran kosong atau tidak dikenal ditolak. Username duplikat harus diselesaikan sebelum operasional. Jangan membagikan spreadsheet sebagai publik; bagikan sebagai **Viewer** hanya kepada Google Service Account.

## 2. Peran yang dikenali

| Nilai pada kolom Peran | Dashboard role | Database role |
|---|---|---|
| Kepala TU / Head TU | \`head_tu\` | \`head_tu\` |
| Staf TU / Staff TU / Operator TU | \`staff_tu\` | \`tu_operator\` |
| Resepsionis / Petugas Front Office | \`receptionist\` | \`fo_receptionist\` |
| Koordinator Front Office | \`fo_coordinator\` | \`fo_coordinator\` |
| Petugas Unit | \`unit_officer\` | \`unit_officer\` |
| Kepala Sekolah | \`principal\` | \`principal\` |

Spreadsheet menjadi sumber kebenaran role. \`tu.user_roles\` hanya disinkronkan sebagai representasi internal untuk otorisasi dan audit.

## 3. Environment variables

| Variable | Isi |
|---|---|
| \`GOOGLE_SHEET_ID_TU\` | ID spreadsheet TU |
| \`GOOGLE_SERVICE_ACCOUNT_EMAIL\` | Email Service Account dengan akses Viewer |
| \`GOOGLE_SERVICE_ACCOUNT_KEY\` | Private key Service Account |
| \`TU_SESSION_SECRET\` | Secret acak khusus TU, minimal 32 byte |
| \`SUPABASE_URL\` | URL project Supabase |
| \`SUPABASE_SECRET_KEY\` atau \`SUPABASE_SERVICE_ROLE_KEY\` | Kredensial server-only untuk API operasional |

Jangan menaruh private key atau secret di source code, spreadsheet, atau commit Git. Kredensial Supabase tidak boleh dikirim ke browser.

Buat secret secara lokal:

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
\`\`\`

## 4. Perilaku sesi dan sinkronisasi

- Server membaca tab \`Pengguna\` melalui Google Sheets API dengan scope read-only.
- Password diperiksa di server; password tidak dikirim ke browser atau disimpan di Supabase.
- Percobaan login dibatasi 5 kali per kombinasi IP dan username dalam 10 menit (limiter sementara per instance).
- Sesi HMAC-SHA256 berlaku 8 jam dan disimpan browser hanya di \`sessionStorage\`.
- Endpoint verifikasi dan setiap API operasional memvalidasi tanda tangan, masa berlaku, status akun, dan role terbaru pada spreadsheet.
- Perubahan status menjadi nonaktif atau perubahan role membuat token lama ditolak.
- Setiap akses API operasional menyinkronkan username ke \`tu.identities\` dan role ke \`tu.user_roles\`.
- \`tu.identities\` menyediakan UUID internal stabil; password tidak pernah disalin ke tabel ini.
- \`system:spreadsheet-sync\` menjadi aktor audit untuk sinkronisasi role.
- \`system:lobby-public-intake\` disediakan untuk proses penerimaan tamu publik tanpa login.
- Jika spreadsheet tidak dapat diverifikasi, API operasional gagal tertutup.

## 5. Catatan migrasi

Migration \`202611050001_tu_independent_identity.sql\` dan rollback guard tersedia pada branch pengembangan. Keduanya belum diterapkan pada Supabase production. API operasional yang menggunakan kolom identitas mandiri memerlukan migration tersebut sebelum dapat dijalankan.

\`tu.identity_links\` tetap dipertahankan untuk kebutuhan integrasi lintas modul berbasis Supabase Auth; tabel itu bukan sumber login petugas TU.

Logout menghapus token dari browser. Token stateless yang telah diterbitkan tetap tidak dapat digunakan setelah akun dinonaktifkan karena server memeriksa spreadsheet pada setiap permintaan, dan token juga berakhir setelah 8 jam.
