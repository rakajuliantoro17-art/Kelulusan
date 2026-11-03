# PINTUKU HUMAS — Sprint 6: Integrasi Data & Kolaborasi Ikatan Alumni

## Tujuan

Memudahkan sekolah dan Ikatan Alumni SMANSASOO menghimpun data dari berbagai angkatan secara bertahap. Pengurus alumni dapat menyerahkan file rekap CSV; akses pengelolaan dan keputusan verifikasi tetap berada pada Staf HUMAS.

## Alur kerja

1. Pengurus/koordinator menghimpun data melalui jejaring alumni, termasuk formulir kertas atau rekap yang sudah tersedia.
2. Staf HUMAS membuka Direktori Alumni → Impor data alumni.
3. Isi sumber data, pilih berkas CSV, lalu periksa pratinjau.
4. Sistem menyimpan baris sebagai antrean impor; belum ada profil yang otomatis dibuat.
5. Sistem menandai kemungkinan duplikat berdasarkan nama + tahun lulus, email, atau nomor WhatsApp. Duplikat dalam satu file juga dideteksi.
6. Staf HUMAS memeriksa baris satu per satu: setujui data baru, perbarui profil yang cocok, tetap masukkan jika memang orang berbeda, atau lewati data.
7. Data baru masuk direktori setelah disetujui. Data kontak dan persetujuan komunikasi tetap mengikuti aturan direktori.

## Format CSV

Kolom wajib: Nama Lengkap dan Tahun Lulus.

Kolom opsional: WhatsApp, Email, Kota, Provinsi, Status, Instansi, Kelas Terakhir, dan Kampus.

CSV UTF-8 dengan delimiter koma, titik koma, atau tab didukung. Satu batch maksimal 500 baris dan 2 MB. Header bahasa Indonesia dan beberapa alias berbahasa Inggris diterima. Berkas template dapat diunduh dari panel impor.

## Aturan pencocokan dan pembaruan

- Nama + tahun lulus yang cocok menjadi kandidat duplikat.
- Email atau nomor WhatsApp yang cocok juga ditandai, meskipun tahun lulus berbeda.
- Baris duplikat yang memiliki kandidat profil dapat memperbarui profil tersebut setelah persetujuan staf. Kolom kosong tidak menghapus data lama; status yang tidak dilaporkan tidak menimpa status yang sudah diketahui.
- Duplikat tanpa kandidat profil (misalnya pengulangan dalam file yang sama) tidak dapat memperbarui profil secara otomatis.
- Tombol Tetap masukkan hanya untuk kondisi ketika staf memastikan baris duplikat adalah orang yang berbeda.
- Data yang tidak valid tetap tersimpan pada batch sebagai catatan pemeriksaan, tetapi tidak dapat disetujui.

## Persetujuan dan privasi

- Impor tidak menganggap alumni telah memberi persetujuan komunikasi.
- Profil baru dari impor dibuat dengan seluruh persetujuan komunikasi bernilai false dan preferensi kontak none.
- Data impor disimpan dalam tabel staging privat, dengan RLS aktif dan akses tabel dibatasi ke service_role.
- Fungsi RPC memverifikasi aktor sebagai Staf HUMAS aktif.
- Baris batch mencatat sumber, nomor baris, status verifikasi, petugas, waktu, dan catatan review.
- Kontak hanya tersedia bagi pengguna internal yang berwenang.

## Batasan operasional

- Satu batch maksimal 500 baris; file besar perlu dibagi.
- Sistem hanya membaca CSV, bukan XLS/XLSX secara langsung. Simpan lembar kerja sebagai CSV UTF-8 sebelum diunggah.
- Pengurus Ikatan Alumni belum diberi akun PINTUKU khusus pada sprint ini. Mereka dapat menyerahkan rekap kepada HUMAS; akses akun kolaborator terpisah dapat dipertimbangkan setelah tata kelola dan penanggung jawab data disepakati.
- Tidak ada cron Vercel baru atau perubahan jadwal cron.

## Database

Migrations:
- 202611030005_humas_alumni_import_collaboration.sql
- 202611030006_humas_alumni_import_batch_duplicate_fix.sql
- 202611030007_humas_alumni_import_update_existing.sql
- 202611030008_humas_alumni_import_preserve_known_status.sql

Tabel:
- humas.alumni_import_batches
- humas.alumni_import_rows

RPC:
- humas.alumni_import_batch_create
- humas.alumni_import_row_review

## Validasi yang diperlukan

- GitHub Actions: source tests, migration manifest, syntax checks, static build.
- Supabase: migration history, RLS, grants, RPC privileges, database advisors.
- Smoke test dengan akun Staf HUMAS: unggah CSV contoh, periksa deteksi duplikat, setujui data baru, perbarui profil yang cocok, dan pastikan persetujuan komunikasi tidak berubah.
