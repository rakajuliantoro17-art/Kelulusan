# PINTUKU HUMAS — Perizinan & Protokoler Sprint 3

## Cakupan implementasi

Sprint ini menutup alur penugasan operasional checklist protokoler. Kolom `protocol_tasks.assigned_to` sudah tersedia sejak fondasi Sprint 1, tetapi belum terhubung ke API dan antarmuka. Sprint 3 mengaktifkan pemakaian kolom tersebut tanpa membuat tabel baru.

- Petugas HUMAS dapat mengambil tugas yang belum memiliki penanggung jawab.
- Petugas yang sedang memegang tugas dapat melepas penugasannya.
- Perubahan penanggung jawab divalidasi terhadap role `staff_humas` yang masih aktif.
- Perubahan penugasan dicatat dalam `protocol_workflow_events` sebagai `task_assignment_changed`.
- Agenda yang sudah selesai atau dibatalkan tidak menerima perubahan checklist.
- Antarmuka menampilkan status penugasan dan kontrol sesuai role pengguna.
- API menerima UUID valid atau string kosong untuk melepas penugasan; database tetap menjadi otoritas validasi.

## File

- Migration: `supabase/migrations/202611030001_humas_protocol_task_assignment.sql`
- API: `src/server/api/humas.js`
- UI: `src/pintuku/assets/js/humas-perizinan.js`
- Test: `tests/humas-permit-transactions.test.js`

## Aturan keamanan

- Tidak ada akses langsung browser ke tabel HUMAS.
- Semua perubahan melalui API terautentikasi dan RPC server-side.
- Hanya akun dengan role `staff_humas` aktif yang dapat menjadi penanggung jawab.
- Riwayat penugasan bersifat append-only melalui event protokoler.
- Tidak ada kredensial baru atau environment variable baru.

## Validasi dan penerapan

1. Jalankan pemeriksaan sintaks API dan JavaScript UI.
2. Jalankan test transaksi HUMAS dan integrasi PostgreSQL lokal.
3. Jalankan build statis dan pastikan artefak perizinan tetap tersedia.
4. Terapkan migration ke staging terlebih dahulu, lalu verifikasi penugasan dan audit event.
5. Migration produksi belum dianggap diterapkan hanya karena sudah ada di repository.

## Batas verifikasi

Fitur ini merupakan perubahan source dan migration. Pengujian produksi memerlukan deploy yang berhasil dan migration 016 diterapkan ke Supabase. Konfigurasi Cron Vercel tidak diubah.
