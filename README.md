# SMANSASOO Digital Portal

Portal digital terpadu SMAN 1 Sooko Mojokerto yang menjadi satu pintu masuk untuk layanan sekolah dengan modul Akademik, Sarana dan Prasarana, serta Kesiswaan.

**Status:** fondasi portal dan shell bersama sedang dibangun. Modul sumber belum seluruhnya dipindahkan ke namespace produksi; jangan menganggap seluruh layanan sudah terintegrasi hanya karena beranda portal tersedia.

## Modul sumber

- **Akademik** — [smansasoo-academic-portal](https://github.com/rakajuliantoro17-art/smansasoo-academic-portal), diduplikasi ke `src/akademik/` termasuk kenaikan kelas, nilai, kelulusan, pengumuman, jadwal, rapor, prestasi, simulasi TKA, dan halaman pendukung.
- **Sarpras** — [Sarprasin](https://github.com/rakajuliantoro17-art/Sarprasin).
- **Kesiswaan** — kode GDS di `src/kesiswaan/`, dari [yasmincntk99/kesiswaan](https://github.com/yasmincntk99/kesiswaan).

## Prinsip arsitektur

- Satu portal utama dan target satu deployment Vercel.
- Modul tetap terpisah secara fungsi, route, hak akses, dan kontrak API.
- Fitur dari repository sumber dipertahankan; repository sumber tidak diubah sebagai dampak integrasi.
- Backend yang sudah digunakan (Google Sheets/Apps Script dan Firebase) dipertahankan selama tahap adaptasi.
- Rahasia produksi hanya boleh berada di environment variables server/platform; jangan memasukkan kredensial ke client bundle atau commit.
- Data kesiswaan adalah data sensitif. Spreadsheet dan endpoint tulis harus terlindungi oleh otorisasi server.

## Struktur global saat ini

```text
/
├── index.html                 # Beranda portal terpadu
├── manifest.json              # Identitas PWA portal utama
├── sw.js                      # Service worker jaringan (tanpa cache data privat)
├── css/
│   ├── portal.css             # Tampilan landing/beranda
│   └── portal-shell.css       # Gaya shell bersama
├── js/
│   ├── portal.js              # Interaksi beranda
│   └── portal-shell.js        # Header/footer bersama
├── api/                       # Fungsi serverless Vercel root (dipetakan pada tahap berikutnya)
├── src/akademik/              # Duplikasi modul Academic Portal
├── src/kesiswaan/             # Modul Kesiswaan yang sedang dipetakan
└── docs/
    └── PORTAL-TERPADU-ARCHITECTURE.md
```

## Shell bersama

Halaman yang menggunakan shell memasang dua titik mount dan memberi identitas modul pada body:

```html
<body data-portal-module="akademik">
  <div data-portal-header></div>
  <!-- konten halaman modul -->
  <div data-portal-footer></div>
</body>
```

Lalu muat file global berikut dengan path absolut:

```html
<link rel="stylesheet" href="/css/portal-shell.css">
<script src="/js/portal-shell.js" defer></script>
```

Nilai `data-portal-module` yang tersedia saat ini: `home`, `akademik`, `sarpras`, dan `kesiswaan`. Route modul akan diaktifkan setelah halaman dan endpoint sumber selesai dipindahkan/diadaptasi. Shell tidak menggantikan pemeriksaan login dan otorisasi pada server.

## Route Akademik

- Halaman utama: `/akademik/`
- Halaman fitur: `/akademik/pages/...`
- API kompatibel: `/api/akademik/kenaikan`, `kelulusan`, `nilai`, `kelas-list`, `kelas-summary`, `stats`, `admin-auth`, dan `announcements`.
- Handler API sumber disimpan di `src/akademik/api/` dan dipanggil melalui `api/akademik.js`, karena Vercel hanya mendaftarkan fungsi serverless dari direktori `/api` root.
- Namespace service worker dibatasi ke `/akademik/sw.js`; jangan mendaftarkan service worker modul ini di scope `/`.

**Status duplikasi:** HTML, CSS, JavaScript, data JSON, dan handler API inti telah disalin ke repo ini dan URL internal disesuaikan ke namespace Akademik. Aset biner gambar/audio sementara dilayani melalui rewrite ke aset repo sumber; repo sumber tidak diubah. Build dan smoke test Vercel belum dikonfirmasi.

## Environment variables

Nama variabel Akademik yang perlu dikonfigurasi pada project Vercel terpadu (isi nilainya hanya di Vercel, jangan di commit):

- `GOOGLE_SHEET_ID_KENAIKAN`
- `GOOGLE_SHEET_ID_KELULUSAN`
- `GOOGLE_SHEET_ID` dan opsional `GOOGLE_SHEET_ID_<TAHUN>` untuk nilai
- `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` untuk statistik
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `ADMIN_SESSION_SECRET` untuk autentikasi admin Akademik

Dokumentasikan nama variabel yang dibutuhkan setiap modul, tetapi jangan menulis nilainya ke repository. Konfigurasi produksi dilakukan melalui Vercel/Firebase settings. Sebelum deployment, audit fallback secret dan rotasi kredensial yang pernah tertanam dalam kode publik.

## Tahapan integrasi

1. Shell portal bersama dan sistem desain global.
2. Namespace route dan aset untuk Akademik, Kesiswaan, dan Sarpras.
3. Dispatcher/adaptor API Vercel root dengan kompatibilitas endpoint.
4. Audit autentikasi, peran, data sensitif, PWA, service worker, dan URL deep link.
5. Build, smoke test, uji manual, lalu rilis.

Lihat [dokumen arsitektur integrasi](docs/PORTAL-TERPADU-ARCHITECTURE.md).
