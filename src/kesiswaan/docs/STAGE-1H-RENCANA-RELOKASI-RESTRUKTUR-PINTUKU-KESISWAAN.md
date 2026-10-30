# Stage 1H — Rancangan Relokasi dan Restrukturisasi PINTUKU–Kesiswaan

Tanggal: 30 Oktober 2026  
Repository: `rakajuliantoro17-art/Kelulusan`  
Branch: `main`  
Cakupan perubahan: perancangan saja; belum ada pemindahan atau penghapusan file.

## 1. Keputusan arsitektur

Gunakan pola **PINTUKU Portal Shell + modul independen**.

- PINTUKU adalah portal induk dan pemilik beranda, identitas portal, navigasi tingkat atas, serta titik masuk ke setiap modul.
- GDS adalah modul Kesiswaan mandiri yang mempertahankan identitas, halaman, CSS/JS, data, API, autentikasi, role, dan PWA sendiri.
- Integrasi dilakukan melalui route publik stabil dan API dispatcher di root Vercel.
- Shell PINTUKU tidak mengambil alih shell internal GDS. Kedua shell memiliki tanggung jawab berbeda: shell induk untuk perpindahan modul, shell GDS untuk navigasi operasional GDS.
- Modul Akademik dan Sarpras tidak direstruktur atau diubah pada tahap ini.

## 2. Matriks klasifikasi file

| Lokasi | Klasifikasi | Tindakan pada tahap PINTUKU–GDS |
|---|---|---|
| `index.html` | Aktif — PINTUKU | Pertahankan di root |
| `css/portal-shell.css`, `css/portal.css` | Aktif — shell/landing PINTUKU | Pertahankan |
| `js/portal-shell.js`, `js/portal.js` | Aktif — shell/landing PINTUKU | Pertahankan |
| `assets/` | Shared — aset PINTUKU | Pertahankan; audit referensi sebelum perubahan |
| `manifest.json`, `sw.js` | Aktif — PWA PINTUKU | Pertahankan scope root |
| `vercel.json` | Aktif — konfigurasi deployment root | Satu-satunya sumber rewrite deployment utama |
| `api/kesiswaan.js` | Aktif — dispatcher GDS | Pertahankan di root; jangan pindah ke dalam src |
| `src/kesiswaan/**` | Aktif — modul GDS | Pertahankan sebagai satu unit mandiri |
| `src/kesiswaan/manifest.json` | Aktif — PWA GDS | Pertahankan scope `/kesiswaan/` |
| `src/kesiswaan/vercel.json` | Konfigurasi standalone/legacy untuk deployment terpisah | Jangan anggap sebagai konfigurasi root; jangan hapus tanpa pemeriksaan riwayat deployment |
| `kesiswaan/index.html` | Placeholder namespace | Kandidat penghapusan atau penggantian hanya setelah audit referensi; route produksi saat ini rewrite ke `src/kesiswaan/index.html` |
| `src/akademik/**`, `akademik/**` | Modul di luar cakupan | Jangan sentuh |
| `src/Sarpras/**`, `sarpras/**` | Modul di luar cakupan | Jangan sentuh |
| `pages/**`, `layouts/**`, `router/**`, `config/**`, `data/**`, `init/**` | Struktur Sarprasin/legacy di root | Jangan relokasi dalam pekerjaan GDS; perlu audit Sarpras tersendiri |
| `js/app.js`, `js/api.js`, `js/config.js`, `js/search.js`, `js/ui.js`, `js/utils.js` | File pendukung struktur Sarprasin/legacy | Jangan dicampur ke PINTUKU shell; verifikasi referensi sebelum perubahan |
| `docs/**` | Dokumentasi | Pertahankan; tambahkan catatan tahapan |
| `README.md` | Dokumentasi root | Perbarui setelah perubahan aktual, bukan sebelum relokasi |

## 3. Struktur target yang disetujui

Struktur target untuk area yang sedang dikerjakan:

```text
/
├── index.html
├── manifest.json
├── sw.js
├── vercel.json
├── assets/                    # aset portal PINTUKU
├── css/
│   ├── portal-shell.css
│   └── portal.css
├── js/
│   ├── portal-shell.js
│   └── portal.js
├── api/
│   └── kesiswaan.js           # dispatcher Vercel root
├── src/
│   └── kesiswaan/             # GDS independen
│       ├── index.html
│       ├── pages/
│       ├── css/
│       ├── js/
│       ├── assets/
│       ├── data/
│       ├── api/
│       ├── manifest.json
│       └── ...
└── docs/
```

Direktori modul lain tetap berada pada posisi masing-masing sampai pekerjaan integrasi modul tersebut dimulai. Struktur legacy Sarprasin di root tidak dimasukkan ke dalam pohon target PINTUKU–GDS.

## 4. Kontrak route yang wajib dipertahankan

### Halaman
- `/` → landing PINTUKU.
- `/kesiswaan` dan `/kesiswaan/` → `src/kesiswaan/index.html`.
- `/kesiswaan/*` → aset dan halaman di `src/kesiswaan/*`.

### API
- `/api/kesiswaan/{endpoint}` → rewrite ke dispatcher `/api/kesiswaan?op={endpoint}`.
- Dispatcher memanggil handler langsung atau service handler di `src/kesiswaan/api/`.
- Pemeriksaan token dan role tetap berada pada server handler. Navigasi atau guard browser bukan pengganti otorisasi server.

### PWA
- PINTUKU: manifest dan service worker scope `/`.
- GDS: manifest scope `/kesiswaan/`.
- Jangan memperluas scope GDS ke root dan jangan membuat service worker PINTUKU meng-cache API privat atau data siswa.

## 5. Relokasi yang benar-benar diperlukan

Audit menunjukkan modul GDS telah berada di `src/kesiswaan/` dan route publik telah diarahkan ke sana. Karena itu **tidak diperlukan pemindahan massal folder GDS**.

Pekerjaan relokasi yang masih mungkin diperlukan hanya:
1. Menetapkan `src/kesiswaan/` sebagai satu-satunya sumber kode frontend/backend GDS.
2. Meninjau placeholder `kesiswaan/index.html` dan memutuskan apakah dipertahankan sebagai fallback dokumentatif atau dihapus setelah pencarian referensi.
3. Meninjau `src/kesiswaan/vercel.json` agar tidak menimbulkan asumsi keliru tentang konfigurasi deployment root.
4. Memastikan aset, halaman, dan deep link tetap memakai prefix `/kesiswaan/`.
5. Menjaga dispatcher `api/kesiswaan.js` di root karena Vercel mendaftarkan fungsi serverless dari direktori root `api/`.

Tidak ada alasan teknis untuk memindahkan `src/kesiswaan/api/` ke root; handler internal tetap dapat dipanggil oleh dispatcher.

## 6. Risiko dan pengendalian

| Risiko | Pengendalian |
|---|---|
| URL halaman atau aset GDS putus | Pertahankan rewrite dan prefix absolut; lakukan pemeriksaan semua referensi |
| API tidak terdaftar oleh Vercel | Dispatcher tetap di `/api` root |
| Token tidak terkirim | Pertahankan perbaikan `PROTECTED_API` dan uji setelah env siap |
| Data/role terbuka karena guard frontend | Otorisasi server tetap wajib di setiap handler |
| PWA saling mengambil scope | Manifest PINTUKU dan GDS dipisah |
| Legacy Sarprasin ikut terhapus | Tidak mengubah direktori legacy tanpa audit Sarpras |
| Placeholder dianggap sebagai aplikasi aktif | Dokumentasikan bahwa rewrite produksi mengarah ke `src/kesiswaan/index.html` |

## 7. Urutan implementasi berikutnya

### Tahap 1I — Pembersihan namespace secara aman
- Cari referensi ke `/kesiswaan/index.html` dan `kesiswaan/index.html`.
- Cari referensi ke `src/kesiswaan/vercel.json` dan evaluasi apakah diperlukan untuk workflow deployment terpisah.
- Tidak mengubah isi halaman, API, akun, atau data GDS.
- Ajukan perubahan file satu per satu berdasarkan hasil pencarian.

### Tahap 1J — Audit route dan aset
- Periksa seluruh link, script, stylesheet, gambar, manifest, QR, dan deep link.
- Pastikan URL publik tetap berada di namespace `/kesiswaan/`.
- Validasi semua rewrite terhadap file/handler tujuan.

### Tahap 1K — Integrasi shell induk
- Pastikan link PINTUKU ↔ GDS konsisten.
- Hindari memuat shell induk di dalam halaman GDS bila dapat mengganggu layout, tema, atau autentikasi.
- Jika diperlukan tombol kembali ke PINTUKU, tambahkan secara terkontrol tanpa mengganti navigasi internal GDS.

### Tahap 1L — Pengujian
- Static route checks dan referensi aset.
- Browser smoke test untuk halaman publik dan role-protected.
- API auth/role test setelah environment variables tersedia.
- Uji PWA scope dan navigasi deep link.
- Uji deployment Vercel; jangan menyatakan lulus sebelum benar-benar dilakukan.

## 8. Batas validasi

Rancangan ini didasarkan pada Git tree dan source branch `main`. Belum dilakukan pemindahan file, penghapusan placeholder, pengujian browser, atau pengujian deployment. Environment variables dan akun Komisi tidak diubah. Spreadsheet, backend, data siswa, dan modul Akademik/Sarpras tetap di luar cakupan.
