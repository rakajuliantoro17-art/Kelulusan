# Stage 1G — Audit Struktur dan Navigasi PINTUKU ↔ Kesiswaan

Tanggal: 30 Oktober 2026  
Repository: `rakajuliantoro17-art/Kelulusan`  
Branch: `main`  
Cakupan: PINTUKU dan Kesiswaan/Gerakan Disiplin Sekolah (GDS) saja.

## 1. Ringkasan

Audit struktur Git tree dan file konfigurasi menunjukkan bahwa repository sudah memiliki pola integrasi aktif berbasis root portal + modul di bawah `src/`. PINTUKU menggunakan `index.html`, `css/`, `js/`, `manifest.json`, dan `sw.js` pada root. Modul Kesiswaan yang menjadi target deployment berada di `src/kesiswaan/`.

Namun, terdapat beberapa direktori tingkat root yang memiliki nama modul atau struktur aplikasi lama/placeholder. Keberadaannya berpotensi membingungkan pengembangan, tetapi tidak boleh dihapus sebelum seluruh referensi dan riwayat penggunaannya dipastikan.

Tidak ada file aplikasi yang dipindah atau diubah dalam tahap audit ini.

## 2. Struktur yang aktif dan terverifikasi dari source

### PINTUKU (portal induk)
- `index.html`: landing/dashboard PINTUKU.
- `css/portal-shell.css`, `css/portal.css`: styling shell dan landing.
- `js/portal-shell.js`: renderer header/footer dan navigasi portal.
- `js/portal.js`: interaksi landing, tema, dan registrasi service worker.
- `manifest.json`: PWA portal dengan scope `/`.
- `sw.js`: service worker network-only pada scope root.
- `vercel.json`: konfigurasi deployment utama dan seluruh rewrite aktif.

### Kesiswaan / GDS
- `src/kesiswaan/index.html`: dashboard GDS.
- `src/kesiswaan/pages/`: halaman publik dan halaman berbasis peran.
- `src/kesiswaan/css/`, `js/`, `assets/`, `data/`: aset dan frontend modul.
- `src/kesiswaan/api/`: handler API modul.
- `api/kesiswaan.js`: dispatcher serverless root.
- `src/kesiswaan/manifest.json`: PWA GDS dengan scope `/kesiswaan/`.
- `src/kesiswaan/vercel.json`: konfigurasi standalone modul; bukan konfigurasi deployment root selama Vercel menggunakan root project repository.

## 3. Routing yang terverifikasi dari source

Root `vercel.json` memetakan:
- `/kesiswaan` → `/src/kesiswaan/index.html`
- `/kesiswaan/(.*)` → `/src/kesiswaan/$1`
- `/api/kesiswaan/{nama-endpoint}` → dispatcher `/api/kesiswaan?op={nama-endpoint}`

Konfigurasi `src/kesiswaan/js/config.js` menggunakan endpoint dengan prefix `/api/kesiswaan/`. Navigasi internal di `src/kesiswaan/js/shell.js` menggunakan URL absolut `/kesiswaan/...`. Dengan demikian, frontend modul telah menggunakan namespace PINTUKU dan tidak memerlukan pemindahan direktori untuk mengaktifkan route tersebut.

PINTUKU landing menghubungkan kartu Kesiswaan ke `/kesiswaan/`. Header bersama juga menggunakan tautan yang sama. Dashboard GDS menyediakan navigasi internal berprefix `/kesiswaan/`.

## 4. Direktori duplikat, placeholder, dan area legacy

Direktori tingkat root berikut ditemukan:
- `kesiswaan/index.html`: halaman placeholder integrasi; bukan dashboard GDS aktif karena rewrite root mengarah ke `src/kesiswaan/index.html`.
- `akademik/index.html`: placeholder modul Akademik.
- `sarpras/index.html`: placeholder modul Sarpras.
- `pages/`, `layouts/`, `router/`, `config/`, dan sebagian `css/`/ `js/`: berisi struktur aplikasi Sarprasin/struktur lama; bukan bagian dari shell PINTUKU saat ini kecuali ada referensi eksplisit.
- `src/akademik/` dan `src/Sarpras/`: modul yang berada dalam proses integrasi tersendiri dan berada di luar cakupan perubahan tahap ini.

Catatan: keberadaan file tidak membuktikan bahwa file tersebut tidak dipakai. Penghapusan, penggabungan, atau pemindahan direktori di atas ditunda sampai audit dependensi lintas-file dan kebutuhan modul masing-masing selesai.

## 5. Batas aplikasi dan isolasi

- PINTUKU shell hanya bertugas sebagai navigasi dan presentasi bersama.
- GDS tetap mempertahankan shell internalnya, identitas Gerakan Disiplin Sekolah, login Komisi, role, API, Google Sheets, QR, dan alur kerja.
- PWA PINTUKU menggunakan scope `/`; PWA GDS menggunakan scope `/kesiswaan/`. Keduanya perlu tetap dibedakan.
- Service worker root meneruskan GET ke jaringan dan tidak menyimpan respons API atau data siswa.
- Endpoint Kesiswaan ditangani oleh dispatcher root. Batas fungsi Vercel dan kontrak endpoint harus dipertahankan.
- Tidak ada perubahan terhadap Akademik, Sarpras, akun Komisi, Spreadsheet, environment variables, atau backend.

## 6. Struktur target untuk tahap relokasi berikutnya

Untuk tahap integrasi PINTUKU–GDS, struktur logis yang disarankan:

```text
/
├── index.html                  # PINTUKU landing
├── css/                        # PINTUKU shell dan landing
├── js/                         # PINTUKU shell dan landing
├── assets/                     # aset portal induk
├── manifest.json               # PWA PINTUKU, scope /
├── sw.js                       # service worker portal induk
├── api/
│   └── kesiswaan.js             # dispatcher API GDS
├── src/
│   └── kesiswaan/               # modul GDS mandiri
│       ├── index.html
│       ├── pages/
│       ├── css/
│       ├── js/
│       ├── assets/
│       ├── data/
│       └── api/
├── docs/
└── [modul lain tetap tidak disentuh pada tahap ini]
```

Struktur ini menggambarkan batas tanggung jawab, bukan instruksi untuk memindahkan file yang sudah berada di lokasi tersebut. Pada tahap berikutnya, relokasi diprioritaskan untuk menghilangkan ambiguitas placeholder/legacy hanya setelah referensi dan route diuji.

## 7. Temuan dan tindak lanjut

1. Tidak ditemukan mismatch source antara route `/kesiswaan/`, konfigurasi endpoint frontend, dan rewrite API root pada pemeriksaan statis.
2. Root `kesiswaan/index.html` adalah placeholder yang tertimpa oleh rewrite ke `src/kesiswaan/index.html`; jangan menjadikannya sumber dashboard.
3. `src/kesiswaan/vercel.json` bukan konfigurasi utama deployment root. Perubahan route harus dilakukan pada `/vercel.json`.
4. Navigasi GDS sudah memakai namespace `/kesiswaan/`; identitas GDS tetap terpisah dari branding PINTUKU.
5. Direktori Sarprasin legacy di root perlu dibiarkan tidak tersentuh pada tahap ini.
6. Tahap 1H perlu menyusun matriks file: aktif, placeholder, legacy, shared, serta kandidat relokasi; setelah itu baru perubahan fisik dilakukan.

## 8. Batas validasi

Audit ini memeriksa Git tree dan isi source pada branch `main`. Ini bukan pengujian browser atau deployment produksi. Status HTTP, rewrite runtime, autentikasi dengan environment Vercel, perilaku PWA, dan operasi API perlu diuji pada tahap validasi runtime setelah konfigurasi deployment tersedia.
