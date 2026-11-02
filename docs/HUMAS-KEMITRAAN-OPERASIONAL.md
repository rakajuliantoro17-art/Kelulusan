# PINTUKU HUMAS — Kemitraan & MoU Operasional

Tanggal: 2 November 2026  
Status: **IMPLEMENTASI SUMBER SELESAI — AKTIVASI DATABASE DAN UJI RUNTIME BELUM DILAKUKAN**

## Tujuan

Modul ini menjadi tempat kerja Staf HUMAS, Wakasek HUMAS, dan Kepala Sekolah untuk mengelola direktori mitra serta register MoU/PKS. Prioritas implementasi adalah fungsi inti, alur sederhana, biaya minimum, dan pemeliharaan yang mudah.

## Fitur yang sudah tersedia pada source

### Direktori mitra
- Tambah mitra.
- Lihat daftar dengan pagination.
- Cari berdasarkan nama/narahubung.
- Filter kategori dan status.
- Ubah data mitra.
- Aktifkan/nonaktifkan mitra.
- Catatan perubahan melalui tabel audit.

Kategori: pemerintah, pendidikan, dunia usaha, komunitas, nirlaba, alumni, dan lainnya.

### Register MoU/PKS
- Membuat draft terhadap mitra aktif.
- Mengubah draft atau draft yang dikembalikan untuk revisi.
- Daftar register, pencarian, filter status, dan pagination.
- Detail perjanjian, informasi masa berlaku, nilai perkiraan, dan koordinator.
- Ringkasan dashboard menggunakan satu aggregate RPC.
- Timeline peristiwa dan daftar metadata dokumen jika sudah ada.

### Alur kerja
1. Staf HUMAS membuat draft.
2. Staf HUMAS mengajukan dan memverifikasi administrasi.
3. Wakasek HUMAS memberi rekomendasi atau meminta revisi.
4. Wakasek meneruskan ke Kepala Sekolah.
5. Kepala Sekolah menyetujui, menolak, atau meminta revisi.
6. Setelah disetujui, Kepala Sekolah menyiapkan tahap penandatanganan.
7. Staf HUMAS mencatat tanda tangan fisik atau elektronik yang benar-benar telah dilakukan.
8. Staf HUMAS mendaftarkan dokumen dan mengarsipkannya.

**Pemisahan penting:** rekomendasi tidak sama dengan persetujuan; persetujuan tidak sama dengan penandatanganan. Database menolak Kepala Sekolah menyetujui dokumen yang dibuat/ditugaskan kepada akun yang sama.

### Login dan sesi
- Login dan refresh token diproses melalui endpoint serverless PINTUKU dan Supabase Auth.
- Access/refresh token disimpan di sessionStorage tab browser, bukan localStorage.
- Tombol keluar menghapus sesi lokal.
- Sesi kedaluwarsa meminta pengguna masuk kembali.
- Akun harus lebih dahulu dibuat pada Supabase Auth dan diberi role HUMAS aktif.

## Modul lanjutan: Proposal & Sponsorship

Proposal & Sponsorship kini tersedia sebagai workspace terpisah untuk pencatatan proposal kegiatan, target dukungan, calon sponsor, komitmen, dan realisasi. Modul memakai direktori mitra yang sama sehingga sponsor dapat ditautkan ke data mitra tanpa input ulang. Dokumentasi: [HUMAS Proposal & Sponsorship](HUMAS-PROPOSAL-SPONSORSHIP.md). Migration 008 menambah tabel proposal, dukungan sponsor, dan audit append-only. Fitur ini juga masih menunggu aktivasi database Production.

## Matriks hak akses

| Fungsi | Staf HUMAS | Wakasek HUMAS | Kepala Sekolah |
|---|---:|---:|---:|
| Melihat direktori dan register | Ya | Ya | Ya |
| Tambah/ubah/status mitra | Ya | Tidak | Tidak |
| Membuat/mengubah draft | Ya | Tidak | Tidak |
| Ajukan dan verifikasi administrasi | Ya | Tidak | Tidak |
| Rekomendasi dan teruskan | Tidak | Ya | Tidak |
| Minta revisi pada telaah | Tidak | Ya | Ya |
| Setujui/tolak final | Tidak | Tidak | Ya |
| Catat tanda tangan, registrasi, arsip | Ya | Tidak | Tidak |
| Mengelola role teknis | Tidak | Tidak | Tidak |

Operator sistem bukan role bisnis dan tidak mendapat akses ke data kemitraan.

## Endpoint API

Semua endpoint memakai `/api/humas`, respons privat menggunakan `Cache-Control: no-store`.

| Operasi | Metode | Fungsi |
|---|---|---|
| `op=login` | POST | Login Supabase Auth |
| `op=refresh` | POST | Memperbarui sesi |
| `op=me` | GET | Identitas dan role aktif |
| `op=workspace` | GET | Satu permintaan awal untuk identitas, role, ringkasan, dan halaman pertama data mitra/register |\n| `op=dashboard` | GET | Satu ringkasan aggregate |
| `op=partners` | GET/POST/PATCH | Direktori mitra |
| `op=agreements` | GET/POST/PATCH | Register, draft, dan transisi workflow |
| `op=agreement-detail&id=...` | GET | Detail, approvals, dokumen, dan timeline |

API memvalidasi access token melalui Supabase Auth, membaca role aktif di server, membatasi pagination, memvalidasi input, dan menjalankan operasi tulis melalui SQL RPC transaksional. Kunci secret Supabase tidak dikirim ke browser.

## Konfigurasi aktivasi (belum dijalankan)

Environment variables Vercel yang diperlukan:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-side only)

Setelah migrasi lolos uji PostgreSQL lokal:
1. Terapkan migration HUMAS 001–008 ke Supabase melalui proses terpisah yang disetujui.
2. Tambahkan schema `humas` pada Data API Exposed Schemas.
3. Pastikan hanya `service_role` yang memperoleh USAGE dan hak tabel/RPC sesuai migration. Jangan memberi akses langsung ke `anon` atau `authenticated`.
4. Buat akun Auth dan tetapkan role secara administratif melalui jalur yang aman.
5. Atur tiga environment variables di Vercel untuk Production/Preview sesuai lingkungan.
6. Uji login, direktori, pembuatan draft, seluruh transisi workflow, dan pembatasan role sebelum dipakai.

Jangan menjalankan migration database otomatis pada setiap deploy frontend. Auto-deploy Vercel tidak boleh sekaligus mengubah skema Production.

## Beban Vercel dan database

- Tidak ada polling otomatis.
- Daftar memakai pagination 25 data per halaman.
- Pencarian memakai debounce 350 ms.
- Muat awal dashboard memakai satu permintaan serverless yang menggabungkan identitas, role, ringkasan RPC, dan dua halaman data pertama.\n- Pencarian/pagination berikutnya hanya memanggil daftar yang sedang dibuka.
- Refresh hanya ketika pengguna menekan tombol atau setelah tindakan berhasil.
- Data privat tidak menggunakan shared CDN cache.
- Tidak ada server fisik atau proses background yang harus dijaga.

## Batas yang masih tersisa

Fitur berikut belum termasuk implementasi operasional saat ini:
- Upload, preview, dan unduh file melalui Supabase Storage.
- Versioning file final, scan tanda tangan fisik, dan penyimpanan bukti TTE.
- Integrasi penyedia TTE/PSrE.
- Notifikasi email/WhatsApp.
- Pembuatan nomor MoU otomatis sesuai tata naskah sekolah.
- Pengujian browser, Vercel runtime, Supabase Auth nyata, dan PostgreSQL runtime.

Untuk sementara, modul hanya menampilkan metadata dokumen jika record dokumen sudah tersedia. Jangan menganggap tombol/fitur upload atau TTE sudah aktif. PIN, OTP, password, dan private key TTE tidak boleh disimpan di PINTUKU.

## Status validasi

- JavaScript API dan dashboard: pemeriksaan sintaks sumber.
- HTML: pemeriksaan ID duplikat.
- SQL migration: pemeriksaan konsistensi sumber dan static assertions.
- Test harness API: diperbarui untuk login, dashboard, dan transisi.
- Local PostgreSQL runner: diperbarui untuk migration 001–008 dan jalur workflow penuh.\n- GitHub Actions workflow memakai PostgreSQL 17 ephemeral container untuk menjalankan migration dan test secara otomatis; tidak membuat database permanen atau mengakses Supabase Production.

GitHub Actions berhasil menjalankan migration 001–007 pada PostgreSQL 17 ephemeral, menjalankan integrasi transaksi penuh, memverifikasi RLS/grant/trigger, dan menjalankan 30 test Node.js (30 PASS, 0 FAIL). Ini membuktikan SQL dan test harness berjalan pada PostgreSQL 17 lokal CI, bukan pada Supabase Production. Belum ada migration yang diterapkan ke Supabase Production, belum ada akun Auth yang dibuat, dan belum ada deploy yang dilakukan. Status release tetap **NO-GO untuk penggunaan operasional** sampai aktivasi Supabase dan uji Auth/Storage/Vercel nyata diselesaikan.


## Tracer Study Alumni
Workspace direktori alumni dan tracer study tersedia pada `/humas/alumni`. Data profil, status setelah lulus, persetujuan komunikasi per tujuan, dan riwayat kontak dikelola melalui migration 009. Pengiriman pesan otomatis belum termasuk. Aktivasi Production menunggu persetujuan dan konfigurasi terpisah.


## Formulir publik Tracer Study
Formulir publik tersedia pada `/alumni/tracer`. Pengajuan disimpan sebagai `pending` dan harus diperiksa Staf HUMAS sebelum menjadi profil aktif. Persetujuan informasi sekolah, kegiatan/reuni, donasi, dan jejaring karier dipisahkan. Detail teknis dan aktivasi ada pada [HUMAS-ALUMNI-TRACER-STUDY.md](HUMAS-ALUMNI-TRACER-STUDY.md).
