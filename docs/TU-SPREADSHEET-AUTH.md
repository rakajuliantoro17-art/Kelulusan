# PINTUKU Tata Usaha — Spreadsheet Authentication

Login workspace TU menggunakan Google Spreadsheet dan token sesi HMAC-SHA256. Supabase Auth tidak dipakai untuk proses login ini. Supabase yang sudah ada pada API operasional TU belum diubah pada tahap ini.

## 1. Format spreadsheet

Spreadsheet khusus TU harus memiliki tab bernama persis `Pengguna`, dengan header pada baris pertama:

| Username | Nama | Password | Status | Peran | UnitCode |
|---|---|---|---|---|

- `Username`: identitas login; pencocokan tidak membedakan huruf besar/kecil.
- `Nama`: nama yang ditampilkan di dashboard.
- `Password`: menerima format `scrypt:<salt-32-hex>:<hash-128-hex>` (direkomendasikan), `sha256:<64 karakter hex>` (kompatibilitas), atau teks biasa (hanya kompatibilitas awal; migrasikan segera ke scrypt).
- `Status`: akun dianggap aktif kecuali nilainya salah satu dari `Tidak`, `Nonaktif`, `Non-aktif`, `No`, `N`, `False`, `0`, atau `Off`.
- `Peran`: salah satu peran yang dikenali di bawah.

`UnitCode` adalah kolom opsional untuk semua role selain Petugas Unit. Untuk `Petugas Unit`, isi dengan `unit_code` aktif yang tersedia pada `tu.units` (contoh: `humas`, `sarpras`, atau `tata_usaha`). Header `UnitCode` boleh belum ada untuk akun non-Petugas Unit. Akun dengan peran kosong atau tidak dikenal ditolak. Jangan membagikan spreadsheet sebagai publik. Cukup bagikan sebagai **Viewer** kepada Google Service Account.

## 2. Peran yang dikenali

| Nilai pada kolom Peran | Kode internal |
|---|---|
| Kepala TU / Head TU | `head_tu` |
| Staf TU / Staff TU / Operator TU | `staff_tu` |
| Resepsionis / Petugas Front Office | `receptionist` |
| Koordinator Front Office | `fo_coordinator` |
| Petugas Unit | `unit_officer` |
| Kepala Sekolah | `principal` |

Setelah login, pengguna diarahkan ke dashboard TU dengan konteks `workspace` sesuai kode peran. Nama dan label peran ditampilkan pada identitas pengguna di dashboard.

## 3. Environment Variables Vercel

Tambahkan pada Project Settings → Environment Variables:

| Variable | Isi |
|---|---|
| `GOOGLE_SHEET_ID_TU` | ID spreadsheet TU dari URL Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email Service Account yang sudah diberi akses Viewer |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Private key Service Account |
| `TU_SESSION_SECRET` | Secret acak khusus TU, minimal 32 byte |

Bila `GOOGLE_SERVICE_ACCOUNT_EMAIL` dan `GOOGLE_SERVICE_ACCOUNT_KEY` sudah dipakai modul lain, gunakan nilai Service Account yang sama. Jangan menaruh private key atau `TU_SESSION_SECRET` di source code, spreadsheet, atau commit Git.

Buat secret acak secara lokal dengan Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Salin hasilnya ke `TU_SESSION_SECRET`. Jangan kirim nilainya ke chat.

## 4. Perilaku sesi

- Server membaca tab `Pengguna` melalui Google Sheets API dengan scope read-only.
- Password diperiksa di server; password tidak dikirim kembali ke browser.
- Percobaan login dibatasi 5 kali per kombinasi IP dan username dalam 10 menit (penyimpanan limiter sementara per instance).
- Sesi ditandatangani HMAC-SHA256 dan berlaku 8 jam.
- Browser menyimpan token hanya di `sessionStorage`; sesi berakhir ketika tab ditutup atau masa berlaku habis.
- Endpoint verifikasi dan setiap API operasional memeriksa tanda tangan, masa berlaku, status akun, serta role terbaru pada spreadsheet. Perubahan status/nonaktif atau perubahan role membuat token lama ditolak.
- Logout menghapus sesi pada browser. Token stateless yang sudah diterbitkan tetap tidak dapat dipakai setelah kedaluwarsa; tidak ada daftar pencabutan token pada tahap ini.

## 5. Batas tahap implementasi

Login dan verifikasi sesi menggunakan spreadsheet. API operasional menggunakan token spreadsheet yang diverifikasi server, menyinkronkan username ke `tu.identities`, dan menyinkronkan role ke `tu.user_roles`. Foreign key actor operasional mengarah ke identitas mandiri. Migration SQL pada branch pengembangan belum diterapkan ke database; API operasional baru akan berjalan setelah migration disetujui dan diterapkan di lingkungan yang sesuai.
