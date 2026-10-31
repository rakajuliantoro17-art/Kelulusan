# SMANSASOO Digital Portal

Portal digital terpadu SMAN 1 Sooko Mojokerto yang menjadi satu pintu masuk untuk layanan sekolah dengan modul Akademik, Sarana dan Prasarana, serta Kesiswaan.

**Status:** fondasi portal dan shell bersama sedang dibangun. Integrasi modul dilakukan bertahap dan harus divalidasi melalui smoke test sebelum dianggap siap produksi.

## Modul sumber

- **Akademik** — [smansasoo-academic-portal](https://github.com/rakajuliantoro17-art/smansasoo-academic-portal), terisolasi di `src/akademik/`.
- **Sarpras** — [Sarprasin](https://github.com/rakajuliantoro17-art/Sarprasin).
- **Kesiswaan** — kode GDS di `src/kesiswaan/`, dari [yasmincntk99/kesiswaan](https://github.com/yasmincntk99/kesiswaan).

## Prinsip arsitektur

- Satu portal utama dan target satu deployment Vercel.
- Setiap modul memiliki direktori, route, hak akses, dan kontrak API sendiri.
- Fitur dari repository sumber dipertahankan; repository sumber tidak diubah sebagai dampak integrasi.
- Backend Google Sheets/Apps Script dan Firebase dipertahankan selama adaptasi.
- Rahasia produksi hanya berada di environment variables server/platform.
- Data siswa dan endpoint tulis harus terlindungi oleh otorisasi server.

## Struktur global

```text
/
├── index.html                 # Beranda PINTUKU
├── manifest.json              # PWA portal utama
├── sw.js                      # Service worker portal utama
├── assets/                    # Hanya ikon/favicon bersama
├── css/                       # Hanya CSS shell dan landing portal
├── js/                        # Hanya JavaScript shell dan landing portal
├── api/                       # Dispatcher serverless Vercel (wajib di root)
├── config/                    # Konfigurasi integrasi portal
├── src/
│   ├── akademik/               # Seluruh modul Akademik
│   │   ├── api/
│   │   ├── assets/
│   │   ├── css/
│   │   ├── data/
│   │   ├── js/
│   │   ├── pages/
│   │   ├── dashboard/
│   │   └── legacy-graduation/  # Arsip aplikasi lama, bukan entrypoint aktif
│   ├── kesiswaan/              # Modul Kesiswaan
│   └── Sarpras/                # Modul Sarpras
├── pages/                      # Halaman Sarpras (struktur sumber yang sedang diadaptasi)
├── layouts/                    # Layout Sarpras
├── router/                     # Router Sarpras
├── init/                       # Inisialisasi Sarpras
└── docs/
```

Folder root `assets/`, `css/`, dan `js/` hanya boleh berisi aset bersama Portal PINTUKU. Kode atau aset khusus Akademik harus berada di `src/akademik/`. Dispatcher `api/akademik.js` tetap di root karena Vercel mendaftarkan serverless functions dari direktori `/api`.

## Shell bersama

Halaman yang menggunakan shell memasang dua titik mount dan memberi identitas modul pada body:

```html
<body data-portal-module="akademik">
  <div data-portal-header></div>
  <!-- konten halaman modul -->
  <div data-portal-footer></div>
</body>
```

File global portal:

```html
<link rel="stylesheet" href="/css/portal-shell.css">
<script src="/js/portal-shell.js" defer></script>
```

Shell tidak menggantikan pemeriksaan login dan otorisasi pada server.

## Route Akademik

- Halaman utama layanan Akademik: `/akademik/`
- Dashboard ringkasan modul: `/akademik/dashboard`
- Halaman fitur: `/akademik/pages/...`
- API utama: `/api/akademik/{operasi}`
- Dispatcher Vercel: `api/akademik.js`
- Handler bisnis: `src/akademik/api/`
- Service worker: `/akademik/sw.js`, dengan scope modul.

## Environment variables

Nama variabel Akademik yang perlu dikonfigurasi pada project Vercel (isi nilainya hanya di Vercel, jangan di commit):

- `GOOGLE_SHEET_ID_KENAIKAN`
- `GOOGLE_SHEET_ID_KELULUSAN`
- `GOOGLE_SHEET_ID` dan opsional `GOOGLE_SHEET_ID_<TAHUN>` untuk nilai
- `GOOGLE_SHEET_ID_ABSENSI`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` dan `GOOGLE_SERVICE_ACCOUNT_KEY` untuk penulisan absensi
- `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `ADMIN_SESSION_SECRET`

## Tahapan integrasi

1. Struktur direktori dan isolasi namespace modul.
2. Audit route, aset, dan API.
3. Audit autentikasi, peran, data sensitif, PWA, dan service worker.
4. Build, smoke test, uji manual, lalu rilis.

Lihat `docs/PORTAL-TERPADU-ARCHITECTURE.md` dan `docs/AKADEMIK-INTEGRATION.md`.
