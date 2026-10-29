# Arsitektur Integrasi SMANSASOO Digital Portal

Status: rancangan kerja pada branch `integration/portal-terpadu`. Belum menjadi deployment produksi.

## Keputusan dasar

- Repository pusat: `rakajuliantoro17-art/Kelulusan`.
- Bentuk produk: satu portal utama dengan modul terpisah.
- Target deployment: satu proyek Vercel utama.
- Modul sumber:
  - Akademik: `rakajuliantoro17-art/smansasoo-academic-portal`
  - Sarpras: `rakajuliantoro17-art/Sarprasin`
  - Kesiswaan: `src/kesiswaan/` di repository Kelulusan, berasal dari `yasmincntk99/kesiswaan`.
- Portal kelulusan tidak dipertahankan sebagai aplikasi mandiri yang terpisah; fitur kelulusan mengikuti modul Akademik.
- Repository sumber tidak boleh diubah/dihapus sebagai dampak integrasi.

## Prinsip integrasi

1. Integrasikan bertahap dan uji setiap modul sebelum mengalihkan route utama.
2. Pertahankan kontrak API, struktur data, fitur, peran pengguna, dan alur kerja masing-masing modul.
3. Jangan menyalin file root secara membabi buta. Ketiga proyek memiliki file bernama sama seperti `index.html`, `css/`, `js/`, `assets/`, `vercel.json`, dan konfigurasi build.
4. Pertahankan layanan backend saat ini pada tahap awal: Google Sheets/Apps Script, Firebase Authentication, Firestore, Storage, dan fungsi server yang sudah digunakan. Migrasi backend harus menjadi pekerjaan tersendiri.
5. Semua secret dan kredensial produksi hanya boleh berada di Environment Variables Vercel/Firebase, bukan di HTML, JavaScript publik, atau commit.
6. Data kesiswaan adalah data sensitif. Gunakan akses Google Sheets berbasis service account dan jangan menjadikan sheet pelanggaran dapat diakses publik.

## Struktur target (bertahap)

```text
/
├── index.html                  # Beranda portal terpadu
├── portal/                     # Komponen shell, menu, token UI bersama
├── modules/
│   ├── akademik/                # Halaman dan aset Akademik
│   ├── sarpras/                 # Aplikasi Sarprasin
│   └── kesiswaan/               # Halaman dan aset GDS
├── api/                         # Serverless entrypoint Vercel di root
│   ├── akademik*.js             # API akademik yang dipertahankan/diadaptasi
│   ├── sarpras*.js              # Hanya jika backend perlu diproxy
│   └── kesiswaan.js             # Dispatcher ke handler kesiswaan yang ada
├── docs/
└── vercel.json
```

Nama dan lokasi akhir adalah sasaran, bukan perintah untuk memindahkan semua file sekaligus. Pemindahan dilakukan setelah pemetaan dependency dan route selesai.

## Modul Kesiswaan: perhatian teknis

- Saat ini kode sumber ada di `src/kesiswaan/`, termasuk `api/`, `js/`, `css/`, `pages/`, `data/`, dan asetnya.
- Banyak tautan internal dan endpoint memakai root path seperti `/pages/...` dan `/api/...`. Saat diberi prefix `/kesiswaan/`, seluruh referensi tersebut perlu direbase agar tidak menabrak halaman Akademik.
- Vercel menjalankan fungsi serverless dari direktori `/api` root, bukan dari `src/kesiswaan/api`. Handler yang sudah ada dapat dipanggil dari dispatcher root dengan tetap mempertahankan relative imports; route dan batas jumlah fungsi harus diverifikasi.
- Kesiswaan memiliki layanan gabungan `api/layanan.js` untuk beberapa endpoint agar jumlah fungsi tetap terkendali.
- Endpoint yang menulis data harus tetap memverifikasi sesi dan peran di server; menyembunyikan menu di UI saja tidak cukup.
- Manifest, service worker, cache, dan URL aset PWA harus menggunakan scope yang tidak mengambil alih scope portal utama.

## Modul Sarpras: perhatian teknis

- Sarprasin adalah aplikasi Vite multi-page, bukan hanya kumpulan file statis. `vite.config.js` mendefinisikan sejumlah halaman entry.
- Build output, asset base path, navigasi internal, Firebase config, dan service worker perlu disesuaikan agar modul dapat hidup pada prefix `/sarpras/`.
- Firebase Functions/Firestore/Storage rules tetap merupakan layanan backend terpisah kecuali ada rencana migrasi yang diuji khusus.
- Jangan menyalin `.env.local` atau nilai secret ke repository portal.

## Modul Akademik: perhatian teknis

- Pertahankan seluruh halaman, shell, modul nilai, kenaikan kelas, pengumuman, dan kelulusan yang ada.
- API serverless harus tetap di `/api` root pada deployment Vercel. Kontrak endpoint yang digunakan oleh frontend tidak boleh berubah tanpa adaptor kompatibilitas.
- Hindari bentrok nama `CONFIG`, `Shell`, CSS global, localStorage key, service worker, dan manifest dengan modul lain. Isolasi tiap modul dan berbagi hanya komponen yang memang sudah disepakati.

## Urutan implementasi

1. Audit inventaris file, route, API, environment variables, dependency, storage, PWA, dan peran tiap modul.
2. Siapkan shell portal utama dan design tokens bersama, tanpa mengubah perilaku modul.
3. Buat route/prefix modul serta adaptor API, lalu uji semua aset dan deep link.
4. Integrasikan Akademik dan verifikasi kontrak API.
5. Integrasikan Kesiswaan dengan namespace route/API, verifikasi kontrol akses, data sensitif, surat/QR/CSV/offline queue, dan alur pembinaan.
6. Integrasikan build Sarprasin dan uji autentikasi, QR, laporan, upload, dan akses Firebase.
7. Jalankan pemeriksaan build, smoke test route/API, PWA/cache, aksesibilitas, dan konfigurasi keamanan.
8. Setelah lulus uji dan ditinjau, ajukan perubahan untuk digabung ke `main`.

## Environment variables

Buat inventaris nama variabel dari dokumentasi dan kode setiap modul. Nilai aktual tidak dicatat di dokumen ini. Sebelum deployment, tetapkan pemilik dan scope setiap variabel untuk menghindari nama bentrok, lalu masukkan nilainya melalui Vercel/Firebase settings.

## Kriteria selesai

- Satu beranda portal menjadi pintu masuk ke tiga modul.
- Semua fitur penting dari ketiga sumber tetap dapat diakses.
- Deep links, aset, dan API bekerja di bawah namespace modul masing-masing.
- Tidak ada secret yang ditambahkan ke client bundle atau commit.
- Tidak ada endpoint tulis yang kehilangan pemeriksaan otorisasi.
- Build dan smoke test lulus sebelum merge/deploy produksi.
