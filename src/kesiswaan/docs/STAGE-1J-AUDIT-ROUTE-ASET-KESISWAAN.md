# Stage 1J — Audit Route dan Aset PINTUKU–Kesiswaan

Tanggal: 30 Oktober 2026  
Repository: `rakajuliantoro17-art/Kelulusan`  
Branch: `main`  
Cakupan: route, halaman, aset, manifest, dan navigasi modul Kesiswaan/GDS.

## 1. Ringkasan hasil

Audit statis terhadap 10 halaman HTML GDS, file konfigurasi, shell, stylesheet, manifest, dan Git tree menemukan dua mismatch navigasi/path yang diperbaiki secara terarah.

Tidak ditemukan alasan untuk memindahkan folder GDS. Lokasi `src/kesiswaan/` tetap menjadi sumber modul.

## 2. Perbaikan yang diterapkan

### A. Basis URL dashboard GDS

File: `src/kesiswaan/index.html`

Ditambahkan:
```html
<base href="/kesiswaan/">
```

Alasan: dashboard menggunakan referensi relatif untuk CSS, JavaScript, logo, ikon, dan manifest. Pada akses tanpa trailing slash melalui route rewrite `/kesiswaan`, browser dapat menyelesaikan referensi relatif dari root URL. Base URL memastikan semua referensi relatif dashboard tetap berada di namespace `/kesiswaan/`.

### B. Tautan dashboard di halaman Gerakan Disiplin

File: `src/kesiswaan/pages/gerakan-disiplin.html`

Tautan “Lihat dashboard” sebelumnya menuju `/index.html` (landing PINTUKU). Tujuannya diperbaiki menjadi `/kesiswaan/` agar kembali ke dashboard GDS.

## 3. Route dan halaman

Halaman yang diperiksa:
- `/kesiswaan/` — dashboard GDS.
- `/kesiswaan/pages/gerakan-disiplin.html`
- `/kesiswaan/pages/cek-poin.html`
- `/kesiswaan/pages/tata-tertib.html`
- `/kesiswaan/pages/about.html`
- `/kesiswaan/pages/privacy.html`
- `/kesiswaan/pages/admin.html`
- `/kesiswaan/pages/eksekutif.html`
- `/kesiswaan/pages/walikelas.html`
- `/kesiswaan/pages/qr.html`

Semua halaman menggunakan path aset relatif yang konsisten terhadap direktori modul atau URL absolut berprefix `/kesiswaan/`. Halaman dengan akses berbasis peran tetap memuat guard client yang sudah ada; otorisasi server tidak digantikan oleh guard tersebut.

## 4. Aset dan stylesheet

Pemeriksaan Git tree memastikan keberadaan aset yang direferensikan oleh halaman dan CSS, termasuk:
- `assets/icons/icon.png`
- `assets/logo/logo.png`
- `assets/logo/jatim-transparan.png`
- `assets/images/scc.jpg`
- `assets/images/syari.jpg`
- `assets/images/drh.jpg`
- File JavaScript halaman: dashboard, admin, cek-poin, QR, tata-tertib, eksekutif, wali kelas, tanya, theme, dan UI kit.
- Stylesheet: variables, theme, style, responsive, glass, animation, shell, stats-panel, dan kesiswaan.

CSS background image yang ditemukan menunjuk ke aset di dalam `src/kesiswaan/assets/images/`; seluruh path yang diperiksa tersedia di Git tree.

## 5. PWA dan API

Manifest GDS tetap:
- `start_url: /kesiswaan/`
- `scope: /kesiswaan/`

Konfigurasi frontend `src/kesiswaan/js/config.js` menggunakan endpoint `/api/kesiswaan/{endpoint}`. Root `vercel.json` memiliki rewrite yang sesuai ke dispatcher `/api/kesiswaan.js`. Tidak ada perubahan pada kontrak endpoint atau dispatcher dalam tahap ini.

## 6. File yang berubah

1. `src/kesiswaan/index.html` — penambahan base URL modul.
2. `src/kesiswaan/pages/gerakan-disiplin.html` — koreksi tautan dashboard GDS.

Kedua perubahan telah dikirim ke branch `main` dan sumbernya diperiksa kembali.

## 7. Batas validasi

Audit ini merupakan pemeriksaan source dan keberadaan file pada Git tree. Belum dilakukan browser smoke test, HTTP status test, runtime Vercel rewrite test, autentikasi terhadap Spreadsheet, pengujian role API, atau validasi PWA pada perangkat. Status deployment tidak boleh dianggap lulus sebelum pengujian tersebut dilakukan.
