# Arsitektur Integrasi SMANSASOO Digital Portal

## Tujuan

Menjadikan repository ini fondasi portal digital terpadu SMAN 1 Sooko Mojokerto dengan satu pintu masuk dan tiga modul terpisah: Akademik, Sarpras, dan Kesiswaan. Portal kelulusan mandiri tidak dipertahankan sebagai aplikasi terpisah karena fitur kelulusan telah menjadi bagian dari portal Akademik.

## Source of truth

- Akademik: `rakajuliantoro17-art/smansasoo-academic-portal`
- Sarpras: `rakajuliantoro17-art/Sarprasin`
- Kesiswaan: `src/kesiswaan/` di repository ini, berasal dari `yasmincntk99/kesiswaan`

Repository sumber tidak boleh diubah oleh proses integrasi. Semua perubahan integrasi dilakukan di repository portal ini.

## Prinsip

1. Satu deployment Vercel utama, dengan namespace route `/akademik/`, `/sarpras/`, dan `/kesiswaan/`.
2. Fitur, kontrak API, struktur data, hak akses, dan workflow modul harus dipertahankan.
3. Jangan salin file root secara membabi buta; nama file seperti `index.html`, `css/`, `js/`, `assets/`, `vercel.json`, dan konfigurasi build saling bertabrakan.
4. Pertahankan backend saat ini pada tahap awal: Google Sheets/Apps Script, Firebase Authentication, Firestore, Storage, dan layanan server yang sudah ada.
5. Vercel menjalankan fungsi serverless dari direktori `/api` di root. Handler dari subfolder harus dihubungkan melalui dispatcher root, dengan relative import dan batas jumlah fungsi diuji.
6. Data Kesiswaan sensitif. Akses data dan semua endpoint tulis harus diverifikasi di server; menyembunyikan menu di UI bukan mekanisme keamanan.
7. Jangan pernah menyalin `.env.local`, service account key, atau secret ke source tree baru. Gunakan environment variables dan rotasi kredensial yang pernah terpapar di kode publik.

## Shell dan sistem desain bersama

Global UI files:

- `css/portal-shell.css`: gaya header/footer bersama dengan class prefix `portal-shell-`.
- `js/portal-shell.js`: renderer header/footer bersama; membaca `data-portal-module` pada body.
- `css/portal.css`: styling beranda/landing portal.
- `js/portal.js`: interaksi beranda.

Setiap halaman modul yang memakai shell menyertakan `<div data-portal-header></div>` dan `<div data-portal-footer></div>`, memuat stylesheet/script shell, dan mengatur `data-portal-module`. Shell hanya UI; autentikasi dan otorisasi tetap milik modul/server.

## Rencana struktur target

```text
/
├── index.html
├── css/portal-shell.css
├── js/portal-shell.js
├── modules/
│   ├── akademik/
│   ├── sarpras/
│   └── kesiswaan/
├── api/                         # semua entrypoint serverless Vercel
├── manifest.json
├── sw.js
└── docs/
```

Ini target akhir bertahap, bukan instruksi memindahkan seluruh file tanpa audit. Kesiswaan saat ini masih berada di `src/kesiswaan/`; Sarprasin perlu proses build Vite multi-page dan penyesuaian base path; Akademik memerlukan preservasi halaman serta API yang digunakan modul kenaikan kelas, nilai, dan kelulusan.

## Risiko dan langkah mitigasi

### Kesiswaan
- Banyak URL menggunakan path absolut seperti `/pages/...` dan `/api/...`; semuanya harus diubah/adaptasi untuk namespace Kesiswaan.
- `api/layanan.js` menggabungkan sejumlah endpoint; route lama perlu rewrite/dispatcher kompatibel.
- PWA manifest dan service worker harus dibatasi agar tidak mengendalikan scope portal lain.
- Periksa konfigurasi auth dan pastikan secret berasal dari environment variable wajib, bukan fallback publik.

### Sarpras
- Sarprasin adalah Vite multi-page; seluruh entry di `vite.config.js`, asset base, navigasi, Firebase config, upload, dan fungsi Firebase harus diuji.
- Jangan menyalin `.env.local` ke repository pusat.
- Firebase Functions/Firestore/Storage tetap backend terpisah sampai migrasi khusus dirancang dan diuji.

### Akademik
- Pertahankan modul pengumuman, nilai, kenaikan kelas, kelulusan, dan shell yang ada.
- Fungsi serverless tetap ditempatkan di `/api` root; kontrak frontend tidak boleh berubah tanpa adaptor kompatibilitas.
- Hindari bentrok nama global seperti `CONFIG`, `Shell`, CSS global, localStorage keys, manifest, dan service worker.

## Urutan implementasi

1. Fondasi portal dan shell bersama.
2. Inventaris route, file, API, variabel environment, autentikasi, storage, dan PWA.
3. Integrasi Akademik dan pengujian kontrak API.
4. Integrasi Kesiswaan, otorisasi, data sensitif, dan alur offline/QR.
5. Integrasi build Sarprasin dan pengujian Firebase.
6. Build/smoke test, audit keamanan, dan pengujian manual sebelum rilis.

## Kriteria selesai

- Satu beranda portal dan shell yang konsisten.
- Ketiga modul dapat dibuka melalui namespace masing-masing.
- Deep links, aset, dan API berfungsi.
- Fitur dan role dari semua sumber tetap tersedia.
- Tidak ada secret dalam commit atau client bundle.
- Build dan smoke test lulus sebelum rilis produksi.
