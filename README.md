# SMANSASOO Digital Portal

PINTUKU adalah portal terpadu layanan digital SMAN 1 Sooko Mojokerto. Repository ini menggabungkan modul PINTUKU, Akademik, Sarpras, dan Kesiswaan dengan pemisahan source berdasarkan domain.

## Struktur repository

```text
/
├── src/
│   ├── pintuku/
│   │   ├── dashboard/       # Landing page dan dashboard modul
│   │   ├── assets/          # CSS dan JavaScript shell portal
│   │   └── pwa/             # Manifest dan service worker
│   ├── Sarpras/
│   │   ├── ...              # Source utama Sarprasin
│   │   └── legacy/          # Struktur Sarpras lama yang dipertahankan
│   ├── akademik/            # Modul Akademik beserta API dan asetnya
│   ├── kesiswaan/           # Modul Kesiswaan beserta API dan asetnya
│   └── server/
│       └── api/             # Dispatcher API untuk seluruh modul
├── public/
│   └── assets/              # Ikon dan aset publik bersama
├── docs/                    # Dokumentasi arsitektur, integrasi, dan proses
├── .github/                 # Workflow CI GitHub
├── vercel.json              # Konfigurasi deployment (akan disesuaikan di tahap build)
├── README.md
└── LICENSE
```

## Prinsip pemisahan source

- Seluruh source aplikasi, termasuk dispatcher API, berada di bawah `src/`.
- `src/pintuku/` hanya memuat shell, halaman portal, dan aset bersama PINTUKU.
- `src/Sarpras/`, `src/akademik/`, dan `src/kesiswaan/` menjaga isolasi kode masing-masing modul.
- `src/Sarpras/legacy/` mempertahankan struktur lama yang sebelumnya berada di root agar tidak hilang selama konsolidasi dan dapat ditinjau sebelum dibersihkan.
- `src/server/api/` menjadi lokasi source dispatcher API. Adaptasi runtime/deployment akan dikerjakan pada tahap build tersendiri.
- `public/` hanya untuk aset publik yang perlu disajikan sebagai file statis.
- `docs/` menyimpan dokumentasi repository. `.github/` tetap di root karena merupakan metadata workflow platform.

## Modul

- **PINTUKU** — portal utama dan navigasi ekosistem layanan.
- **Akademik** — pengumuman, nilai, kenaikan kelas, kelulusan, dan layanan akademik.
- **Sarpras / Sarprasin** — inventaris, kondisi aset dan ruang, pemeliharaan, pengadaan, audit QR, dan pelaporan.
- **Kesiswaan** — layanan data kesiswaan, poin, pelanggaran, pembinaan, dan layanan terkait.

## Status restrukturisasi

Tahap ini adalah reposisi source dan perapian struktur repository. Konfigurasi Vercel dan pemetaan URL produksi belum disesuaikan pada commit restrukturisasi ini. Jangan gunakan commit ini sebagai penanda bahwa deployment sudah tervalidasi. Penyesuaian static output, serverless functions, route, PWA scope, dan asset URL akan dilakukan pada tahap build berikutnya.

## Prinsip keamanan

- Rahasia produksi hanya disimpan pada environment variables di platform, bukan di repository.
- Endpoint tulis dan data siswa harus tetap dilindungi autentikasi serta otorisasi server.
- Service worker tidak boleh menyimpan respons API privat atau data siswa.
- Integrasi modul harus mempertahankan kontrak backend dan sumber data masing-masing.


## Asset management

Seluruh aset statis bersama (gambar, background, ikon, logo, font, audio, dan media) dikelola di `public/assets/`. Aturan folder dan pemakaian URL dijelaskan di [docs/ASSET-ARCHITECTURE.md](docs/ASSET-ARCHITECTURE.md).
