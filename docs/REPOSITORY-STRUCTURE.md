# Struktur Repository Kelulusan / PINTUKU

## Tujuan
Memisahkan source berdasarkan domain aplikasi dan meminimalkan folder aplikasi di root repository.

## Direktori
- `src/pintuku/dashboard/`: halaman beranda portal dan dashboard Sarpras.
- `src/pintuku/assets/css/`: stylesheet shell portal.
- `src/pintuku/assets/js/`: script shell portal.
- `src/pintuku/pwa/`: manifest dan service worker portal.
- `src/Sarpras/`: source utama Sarprasin.
- `src/Sarpras/legacy/`: konfigurasi, init, layout, halaman, dan router lama yang dipertahankan.
- `src/akademik/`: source modul Akademik.
- `src/kesiswaan/`: source modul Kesiswaan.
- `src/server/api/`: dispatcher API modul.
- `src/humas/scripts/`, `src/humas/supabase/migrations/`, `src/humas/tests/`: script, migrasi, dan pengujian HUMAS.
- `src/TU/scripts/`, `src/TU/supabase/migrations/`, `src/TU/tests/`: script, migrasi, dan pengujian Tata Usaha.
- `public/assets/`: ikon dan favicon publik.
- `docs/`: dokumentasi repository.

## Catatan migrasi
Folder `scripts/`, `supabase/`, dan `tests/` di root dipindahkan ke dalam `src/` dan dipisahkan menurut domain HUMAS dan TU. Kedua modul tetap menggunakan project Supabase yang sama; pemisahan ini hanya mengatur ownership file source, migrasi, script, dan test. Workflow GitHub Actions diperbarui untuk menggunakan lokasi baru. Konfigurasi Vercel dan route runtime tidak diubah.
