# PINTUKU HUMAS — Sprint 3F: Staging & Integration Test Plan

Tanggal penyusunan: 2026-11-02  
Status: **ZERO-COST SOURCE VALIDATION PREPARED — DATABASE INTEGRATION BLOCKED**

## Tujuan dan batas keselamatan

Sprint ini memvalidasi migrations 001–005, API HUMAS, kontrol akses, dan alur pembuatan data pada database non-produksi. Project Supabase produksi `cnctlcpqpgqtbhgyocjq` tidak boleh menerima DDL, seed data, atau perubahan konfigurasi selama pengujian ini.

Lingkungan staging harus memiliki project ref, URL, publishable key, dan secret key sendiri. Jangan menyalin data produksi atau kredensial produksi. Gunakan akun dan data uji sintetis.

## 3F.1 — Persiapan staging

- [ ] Tentukan Organization ID dan periksa biaya pembuatan Development Branch.
- [ ] Dapatkan persetujuan eksplisit atas biaya non-zero.
- [ ] Buat branch/database staging terisolasi.
- [ ] Pastikan project ref staging berbeda dari production.
- [ ] Pastikan staging tidak berisi data produksi.
- [ ] Simpan kredensial staging hanya pada secret store server-side; jangan commit ke Git.

**Gate:** tidak boleh lanjut ke DDL sebelum isolasi staging dan biaya dikonfirmasi.

## 3F.2 — Penerapan migrations

Urutan wajib:

1. `202611020001_humas_partnership_foundation.sql`
2. `202611020002_humas_rbac_foundation.sql`
3. `202611020003_humas_partner_management.sql`
4. `202611020004_humas_agreement_drafts.sql`
5. `202611020005_humas_security_hardening.sql`

Setelah setiap migration, catat hasil eksekusi dan migration version. Jangan menggabungkan atau mengubah urutan. Jika gagal, hentikan rangkaian, simpan error lengkap tanpa kredensial, perbaiki sumber, reset staging bila perlu, lalu ulangi dari awal.

## 3F.3 — Pemeriksaan struktur database

| ID | Pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| DB-01 | Schema `humas` | Ada |
| DB-02 | Tabel partners, agreements, agreement_documents, agreement_approvals, agreement_workflow_events | Semua ada |
| DB-03 | Tabel user_roles dan partner_events | Ada |
| DB-04 | Foreign key partner dan user | Valid; delete partner yang masih direferensikan ditolak |
| DB-05 | Check constraints jenis mitra, tipe/status perjanjian, tanggal, nilai | Menolak nilai tidak valid |
| DB-06 | Updated-at triggers | Mengubah updated_at saat record diperbarui |
| DB-07 | Actor validation triggers | Menolak actor tanpa role staff_humas aktif |
| DB-08 | Audit table privileges | service_role hanya SELECT/INSERT pada partner_events dan agreement_workflow_events |
| DB-09 | RLS | Aktif di seluruh tabel HUMAS |
| DB-10 | Browser roles | anon/authenticated tidak memperoleh akses tabel atau RPC |
| DB-11 | Indexes | Index partner, status, end_date, timeline dan register tersedia |
| DB-12 | RPCs | partner_create, partner_update, partner_set_status, agreement_create_draft tersedia |

Catatan: `agreement_workflow_events` baru memiliki actor guard untuk event `draft_created`. Event transisi status lain belum boleh diimplementasikan sebelum guard dan RPC transisi per status dibuat serta diuji.

## 3F.4 — Uji autentikasi dan RBAC

Siapkan akun sintetis terpisah untuk role:
- `staff_humas`
- `vice_principal_humas`
- `principal`
- `system_operator`
- akun tanpa role aktif

| ID | Aktor | Operasi | Hasil yang diharapkan |
|---|---|---|---|
| AUTH-01 | Tanpa token | GET me | 401 |
| AUTH-02 | Token invalid/expired | GET me | 401 |
| AUTH-03 | User tanpa role aktif | GET me | Tidak ada business permission |
| AUTH-04 | Staff HUMAS | Baca mitra/perjanjian | Diizinkan |
| AUTH-05 | Wakasek HUMAS | Baca mitra/perjanjian | Diizinkan |
| AUTH-06 | Kepala Sekolah | Baca mitra/perjanjian | Diizinkan |
| AUTH-07 | Operator | Baca data mitra/perjanjian | 403 |
| AUTH-08 | Operator | Fungsi teknis yang diizinkan | Tidak memperoleh kewenangan persetujuan |
| AUTH-09 | Client browser | Akses REST tabel HUMAS langsung | Ditolak |
| AUTH-10 | User | Mengirim role palsu di body | Diabaikan/ditolak; role ditentukan server |
| AUTH-11 | Staff dicabut role-nya | Operasi tulis berikutnya | Ditolak |

## 3F.5 — Uji pengelolaan mitra

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| PART-01 | Staff membuat mitra valid | 201; record dan audit event tercipta atomik |
| PART-02 | Nama mitra kosong | 400 |
| PART-03 | Jenis mitra tidak valid | 400 |
| PART-04 | Wakasek/Kepala Sekolah membuat mitra | 403 |
| PART-05 | Operator membuat mitra | 403 |
| PART-06 | Staff memperbarui mitra | Berhasil; before/after tercatat |
| PART-07 | Update payload kosong | 400 |
| PART-08 | Update nama menjadi kosong | 400; transaksi rollback |
| PART-09 | Perubahan status mitra valid | Berhasil; alasan dan audit tercatat |
| PART-10 | Status mitra tidak valid | 400 |
| PART-11 | Pencarian, filter, pagination | Hasil konsisten; batas page 1–1000 dan limit 1–100 |
| PART-12 | Payload pencarian berisi karakter filter PostgREST | Ditolak/di-normalisasi; tidak mengubah logika query |

## 3F.6 — Uji register perjanjian dan draft

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| AGR-01 | Staff membuat draft MoU untuk mitra aktif | Draft tercipta |
| AGR-02 | Mitra tidak ada/tidak aktif | Ditolak |
| AGR-03 | Judul atau tujuan kosong | 400 |
| AGR-04 | Tipe perjanjian tidak valid | 400 |
| AGR-05 | Format tanggal tidak valid | 400 |
| AGR-06 | Tanggal akhir sebelum tanggal mulai | 400 |
| AGR-07 | Nilai estimasi negatif/format berlebih | 400 |
| AGR-08 | Wakasek/Kepala Sekolah membuat draft | 403 |
| AGR-09 | Draft dibuat | Satu event draft_created tercatat atomik |
| AGR-10 | Membaca daftar perjanjian | Search/filter/pagination sesuai role |
| AGR-11 | Membuat draft gagal di tengah transaksi | Tidak ada record parsial maupun event yatim |

Pengujian ini hanya mencakup register dan pembuatan draft. Approval, rekomendasi, tanda tangan, TTE, registrasi final, dan pengarsipan belum tersedia sebagai API transaksi.

## 3F.7 — Uji keamanan dan penyalahgunaan

- [ ] Tidak ada secret/service key pada bundle frontend, HTML, JavaScript, source map, atau log.
- [ ] Tidak ada akses browser langsung ke tabel HUMAS.
- [ ] Tidak ada self-assignment role melalui user metadata atau request body.
- [ ] Tidak ada operator yang dapat menyetujui perjanjian.
- [ ] Tidak ada Wakasek yang dapat melewati keputusan Kepala Sekolah.
- [ ] Approval tidak dianggap sebagai tanda tangan.
- [ ] Audit events tidak dapat diubah/dihapus oleh service_role.
- [ ] Actor audit harus memiliki role aktif yang sesuai.
- [ ] ID mitra/perjanjian acak milik user lain tidak membuka akses (IDOR/BOLA).
- [ ] Error response tidak membocorkan SQL, token, key, atau response upstream.
- [ ] Rate limit dan secure headers diperiksa sebelum rilis publik.
- [ ] Uji file upload ditunda sampai kebijakan bucket, MIME allowlist, ukuran, checksum, dan akses signed URL ditetapkan.

## 3F.8 — Laporan, perbaikan, dan release gate

Setiap kasus uji dicatat sebagai PASS / FAIL / BLOCKED dengan:
- ID kasus;
- environment/project ref (tanpa credential);
- waktu uji;
- role akun uji;
- request ringkas dan status HTTP;
- hasil aktual vs ekspektasi;
- bukti log yang sudah disanitasi;
- issue dan tindakan koreksi.

Release gate:
1. Semua test kritis AUTH, DB, PART, AGR, dan SECURITY lulus.
2. Tidak ada temuan Critical/High terbuka.
3. Security dan performance advisors diperiksa setelah migration.
4. API diuji terhadap staging, bukan production.
5. Build dan browser smoke test lulus.
6. Vercel staging memakai environment variables staging.
7. Production release memerlukan persetujuan terpisah dan rencana rollback.

## Temuan awal dari review statis migration

1. Migration 005 memvalidasi actor untuk `partner_events` dan `draft_created`, tetapi belum melindungi event workflow lain. Jangan menambahkan endpoint transisi status sebelum kontrol ini diperluas.
2. Migration 003 RPC memeriksa nilai role yang dikirim caller, sedangkan trigger 005 memvalidasi role aktif pada actor untuk audit. Tetap diperlukan uji bahwa actor_id berasal dari token tervalidasi server, bukan payload client.
3. Migration 001 memberikan privilege awal `service_role` ke seluruh tabel; migration 005 membatasi dua tabel audit menjadi SELECT/INSERT. Verifikasi effective privileges setelah semua migration.
4. RLS tanpa policy browser memang sesuai rancangan server-only; API harus tetap memeriksa role sebelum setiap operasi.
5. API dan SQL belum memiliki alur approval/signature. Jangan menampilkan kontrol UI seolah-olah fitur tersebut sudah aktif.

## Status eksekusi — mode biaya Rp0

### Keputusan lingkungan

- Tidak membuat Supabase Development Branch karena pengguna menetapkan batas biaya Rp0.
- Tidak menerapkan migration, seed, atau perubahan konfigurasi pada project Supabase Production.
- Tidak membuat project/cloud resource baru.
- Tidak memakai kredensial produksi untuk pengujian lokal.
- Project production ref `cnctlcpqpgqtbhgyocjq` tetap hanya diperiksa secara read-only.

### Pekerjaan zero-cost yang sudah disiapkan

- [x] Migrations 001–005 diambil dari branch `main` dan direview secara statis.
- [x] Test harness API dibuat di `tests/humas-api.test.js` (10 skenario mock: autentikasi, role operator, akses staf, pembatasan Wakasek/Kepala Sekolah, actor ID, tanggal, pagination).
- [x] Static migration checks dibuat di `tests/humas-migrations-static.test.js` (7 pemeriksaan struktur dan privilege).
- [x] Sintaks API dan kedua test file lolos pemeriksaan parser JavaScript.
- [x] Sepuluh skenario API dijalankan terhadap handler dengan mock Supabase HTTP; seluruhnya PASS.
- [x] Delapan pemeriksaan statis terhadap lima migration SQL lolos (RLS, RBAC, RPC, actor guard, append-only audit grants, dan larangan grant browser-role).
- [x] Dokumen ini diperbarui dengan status dan release gate yang eksplisit.

### Yang belum dapat dinyatakan PASS

- [ ] Eksekusi test API terhadap Supabase staging nyata.
- [ ] Eksekusi SQL migrations 001–005 pada PostgreSQL.
- [ ] Verifikasi foreign keys, trigger, RLS, effective grants, dan RPC dengan query runtime.
- [ ] Pengujian akun Auth sintetis dan role revocation pada database.
- [ ] Supabase security/performance advisors setelah migration.
- [ ] Build dan browser smoke test dari checkout repository.
- [ ] Pengujian Vercel staging.

### Perintah pengujian saat repository tersedia secara lokal

```bash
node --check src/server/api/humas.js
node --test tests/humas-api.test.js tests/humas-migrations-static.test.js
```

Test API yang lulus menggunakan mock fetch/HTTP dan tidak membuktikan perilaku PostgREST/PostgreSQL sesungguhnya. Pemeriksaan migration yang lulus bersifat statis dan bukan pengganti eksekusi SQL di PostgreSQL. File test yang disimpan di repository dapat dijalankan dari checkout dengan perintah di atas.

### Hasil audit read-only Supabase Production

Pemeriksaan terakhir pada 2026-11-02:
- Project: `cnctlcpqpgqtbhgyocjq`, status `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- Tabel pada schema `public` dan `humas`: tidak ada.
- Migration history: kosong.
- Development branches: tidak ada.
- Security advisor: tidak ada lint yang dilaporkan.
- Performance advisor: tidak ada lint yang dilaporkan.

Hasil advisor kosong **bukan bukti bahwa migration HUMAS aman**, karena objek aplikasi HUMAS belum ada di database yang diperiksa.

### Keputusan release

**NO-GO untuk production activation.** Pekerjaan source-level dan test harness sudah tersedia tanpa biaya, tetapi Sprint 3F belum dapat diberi status integrasi PASS. Untuk menyelesaikan pengujian database secara nyata, diperlukan PostgreSQL lokal yang bisa dijalankan atau lingkungan staging yang disetujui. Batas Rp0 tetap berlaku; jangan membuat resource berbayar otomatis.

