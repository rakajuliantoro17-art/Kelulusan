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
- `public/assets/`: ikon dan favicon publik.
- `docs/`: dokumentasi repository.

## Catatan migrasi
Reposisi ini mempertahankan konten file dan blob source. Dispatcher API disesuaikan relative import-nya setelah berpindah ke `src/server/api/`. Konfigurasi Vercel belum diubah; route dan output deployment akan dipetakan pada tahap build berikutnya.
