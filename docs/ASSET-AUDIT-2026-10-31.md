# Asset Audit & Integration — 31 Oktober 2026

## Status

**Tahap: audit awal / prioritas tinggi.** Dokumen ini mencatat hasil pemeriksaan 40 berkas prioritas dari modul Akademik, Kesiswaan, Sarpras, dan PINTUKU. Pemeriksaan difokuskan pada entrypoint, halaman utama, manifest PWA, konfigurasi aset, shell JavaScript, dan CSS yang diketahui memuat media.

Repository memiliki 639 berkas HTML/CSS/JavaScript pada empat area modul tersebut. Karena audit ini belum memeriksa seluruh 639 berkas satu per satu, hasil di bawah tidak boleh dianggap sebagai sertifikasi bahwa semua referensi aset telah bersih. Audit lanjutan perlu memperluas pemeriksaan ke halaman legacy, komponen, dan JavaScript lain.

## Baseline

- Aset statis terpusat di `public/assets/`.
- Registry sumber berada di `src/shared/assets/registry.js`.
- Registry mengekspos `window.SMANAssets.get("namespace.key")`.
- URL publik kanonis dimulai dengan `/assets/`.
- File source HTML/CSS/JS tetap berada di `src/`; source registry harus dipetakan oleh build ke URL runtime `/js/asset-registry.js`.
- Audit ini tidak mengubah konfigurasi Vercel atau route produksi.

## Temuan prioritas

### P0 — Referensi lama yang perlu dimigrasikan

| Modul | Berkas / referensi | Temuan |
|---|---|---|
| Akademik | `src/akademik/js/shell.js:176` | Logo masih memakai `/assets/logo/logo.png`; ganti dengan registry `shared.logos.school`. |
| Akademik | `src/akademik/js/kelulusan/config.js:117-153` | Masih memakai `../assets/images/scc.jpg`, `../assets/logo/logo.png`, `../assets/icons/icon.png`, `../assets/favicon.ico`, dan `../assets/audio/lulus.mp3`. |
| Akademik | `src/akademik/js/kelulusan/ui.js:135` | Logo dinamis masih memakai `../assets/logo/logo.png`. |
| Akademik | Halaman di `src/akademik/pages/` | Sampel halaman absensi-scan dan pengumuman masih merujuk `../assets/icons/icon.png` dan/atau `../assets/logo/logo.png`. Perlu audit semua halaman. |
| Akademik | `src/akademik/manifest.json:16-51` | Ikon PWA masih merujuk `assets/icons/icon-*.png`; file-file ini tidak tercantum dalam katalog `public/assets/`. Perlu putuskan apakah semua ukuran diganti dengan ikon publik yang tersedia atau aset ukuran lengkap disediakan. |
| Kesiswaan | `src/kesiswaan/js/shell.js:155` | Logo masih memakai `/kesiswaan/assets/logo/logo.png`. |
| Kesiswaan | Halaman di `src/kesiswaan/pages/` | Halaman admin, cek-poin, QR, wali kelas, dan eksekutif masih memuat referensi relatif `../assets/logo/logo.png` dan/atau `../assets/icons/icon.png`. |
| Kesiswaan | `src/kesiswaan/css/kesiswaan.css:706` | Background tayang masih memakai `../assets/images/scc.jpg`; target kanonis adalah `/assets/shared/images/scc.jpg`. |

**Dampak:** referensi lama berpotensi menghasilkan 404 setelah file fisik dipusatkan di root `public/assets/`. Dampak runtime aktual tetap perlu dikonfirmasi setelah build/output deployment tersedia.

### P1 — Kesiapan aset dan konsistensi

1. **Sarpras fonts:** `src/Sarpras/assets/css/fonts.css` sudah menunjuk ke `/assets/shared/fonts/...`, tetapi file font yang tercatat di repository sebelumnya terdeteksi sebagai placeholder 1 byte. Jangan menganggap font siap produksi sebelum diganti file font valid dan berlisensi.
2. **Akademik manifest PWA:** referensi ikon ukuran 72–512 perlu diselaraskan dengan aset yang benar-benar ada. Jangan hanya mengganti path tanpa memeriksa kebutuhan ukuran dan maskable icon.
3. **Kesiswaan manifest PWA:** entrypoint manifest sudah memakai ikon publik bersama; tetap perlu uji URL hasil build dan instalasi PWA.
4. **Tanda tangan kepala sekolah:** `/assets/kesiswaan/signatures/ttd-kepsek.png` berada di area publik. Jika tidak dimaksudkan untuk diunduh publik, pindahkan ke penyimpanan terautentikasi dan layani melalui endpoint berizin.
5. **PINTUKU registry:** dashboard sudah memuat `/js/asset-registry.js`, tetapi source registry berada di `src/shared/assets/registry.js`. Build adapter wajib memetakan source ini ke URL tersebut sebelum deployment; mapping belum diuji.

### P2 — Hal yang tidak boleh dicampur dengan migrasi aset

- Path CSS/JS/HTML relatif seperti `css/style.css`, `../js/config.js`, dan route aplikasi bukan otomatis aset media yang harus dipindah.
- URL eksternal seperti Google Fonts atau CDN bukan aset lokal. Audit dan migrasi ini tidak mengunduh atau mengganti dependency eksternal.
- Data aplikasi, file JSON operasional, API, dan dokumen privat bukan aset publik.
- Jangan menghapus folder atau file legacy hanya karena path-nya tampak lama; verifikasi apakah halaman tersebut masih dipakai dan apakah route/build masih menyajikannya.

## Referensi publik yang tersedia

Katalog `public/assets/` saat audit memuat kelompok berikut:

- `shared/icons`: app icon dan favicon.
- `shared/logos`: logo sekolah.
- `shared/images`: drh.jpg, scc.jpg, syari.jpg.
- `shared/fonts`: Inter, Poppins, JetBrainsMono.
- `akademik/audio`: lulus.mp3, naik-kelas.mp3.
- `akademik/images`: Skr.jpg, gbl.jpg, gtr.jpg, syari.png, tyr.jpg.
- `kesiswaan/logos`: kop/logo Jawa Timur.
- `kesiswaan/signatures`: tanda tangan kepala sekolah.
- `sarpras/images`: 119.jpg.

## Rencana eksekusi setelah audit

1. Selesaikan inventaris seluruh referensi aset pada 639 file HTML/CSS/JS, termasuk halaman legacy dan string path yang dibangun secara dinamis.
2. Validasi setiap target terhadap file aktual di `public/assets/`; tandai setiap referensi sebagai valid, usang, hilang, atau belum dapat dipastikan.
3. Perbaiki referensi lama pada Akademik, Kesiswaan, dan Sarpras tanpa mengubah logika aplikasi.
4. Tambahkan registry ke halaman modul dengan urutan pemuatan yang benar. Untuk kode klasik gunakan `SMANAssets.get(...)`; untuk CSS gunakan URL publik kanonis langsung karena CSS tidak dapat memanggil JavaScript registry.
5. Uji halaman, manifest PWA, audio, gambar, background, dan font pada hasil build. Jangan menyatakan selesai hanya berdasarkan pemeriksaan source.
6. Setelah hasil uji build tersedia, baru evaluasi perubahan route/deployment.

## Kriteria selesai

- Tidak ada referensi ke path aset lama yang tidak lagi tersedia.
- Semua referensi lokal mengarah ke file yang benar-benar ada.
- Semua halaman yang memakai registry memuat registry lebih dahulu.
- Manifest PWA dan service worker memakai URL yang valid.
- Tidak ada font placeholder yang dipakai sebagai font produksi.
- Halaman utama dan halaman legacy yang masih didukung lulus smoke test.
- Tidak ada perubahan pada API, autentikasi, hak akses, atau data aplikasi sebagai efek samping migrasi aset.


## Hasil perluasan audit — 31 Oktober 2026

### Cakupan yang sudah diperiksa

Pemeriksaan lanjutan dilakukan terhadap **270 dari 639 berkas HTML/CSS/JavaScript** pada empat modul. Seluruh berkas HTML dan CSS dalam cakupan modul sudah ditelusuri untuk referensi aset; **369 berkas JavaScript belum diperiksa menyeluruh**. Dengan demikian, status audit tetap parsial dan belum boleh disebut audit tuntas.

### Temuan tambahan dari HTML/CSS

| Modul | Lokasi | Temuan / tindakan |
|---|---|---|
| Sarpras | `src/Sarpras/assets/css/layout/body.css:48` | Background memakai `/images/119.jpg`, sedangkan file yang tersedia berada di `/assets/sarpras/images/119.jpg`. Kandidat path tidak cocok. |
| Sarpras | `src/Sarpras/cards/asset-card.html:19`, `user-card.html:21` | Referensi `/public/images/no-image.png` dan `/public/images/avatar-default.png`; target tersebut tidak ditemukan dalam katalog aset publik saat ini. |
| Sarpras | `src/Sarpras/forms/login-form.html:19`, beberapa komponen layout | Memakai `/logo/icon.png`; target tersebut tidak ada di katalog aset. Gunakan ikon publik bersama setelah memastikan ukuran dan tampilan. |
| Sarpras | `src/Sarpras/layout/app-profile-menu.html`, `app-sidebar.html` | Referensi `../../assets/img/avatar.png` dan `../../assets/img/logo.png`; folder/file target tidak ditemukan dalam katalog aset publik. |
| Sarpras | `src/Sarpras/index.html` dan banyak halaman legacy | Ada referensi absolut `/src/assets/css/app.css`, `/src/assets/js/pages/*.js`, dan `/src/pages/public/*.js`. Berkas sumber sebenarnya berada di bawah `src/Sarpras/...`; perlu verifikasi routing/build karena URL root tersebut tidak identik dengan lokasi source. |
| Sarpras | `src/Sarpras/legacy/pages/public/*.html` | Beberapa halaman memakai `/assets/logo/logo.png`; katalog publik sekarang menyediakan logo di `/assets/shared/logos/sman1-sooko.png`, bukan di jalur lama. |
| Akademik | `src/akademik/css/*.css`, `css/kelulusan/glass.css`, dan `css/legacy-graduation/glass.css` | Background masih merujuk `../assets/images/*` atau `../../assets/images/*`. Aset gambar yang tersedia sekarang berada di `/assets/akademik/images/*` dan `/assets/shared/images/*`. |
| Akademik | `src/akademik/pages/*.html` | Halaman-halaman masih memakai ikon `../assets/icons/icon.png` dan logo `../assets/logo/logo.png`; target lama tidak tersedia dalam katalog aset. |
| Akademik | `src/akademik/pages/_template.html` | Favicon `../assets/logo/favicon.ico` dan logo `../assets/logo/logo.png` masih menggunakan lokasi lama. |
| Akademik | `src/akademik/pages/kelulusan.html` | Halaman ini sudah memakai ikon dan logo publik bersama; menjadi contoh pola URL kanonis. |
| Kesiswaan | `src/kesiswaan/css/glass.css`, `kesiswaan.css:706` | Background masih memakai `../assets/images/scc.jpg` dan `../assets/images/syari.jpg`; aset tersedia di `/assets/shared/images/`. |
| Kesiswaan | `src/kesiswaan/pages/*.html` | Logo dan ikon masih memakai `../assets/logo/logo.png` serta `../assets/icons/icon.png`; target tersebut tidak ada di katalog aset saat ini. |
| PINTUKU | `src/pintuku/dashboard/index.html` | Menggunakan ikon/favicon publik bersama yang valid secara struktur; tetap ada ketergantungan pemetaan registry runtime yang belum dibuat. |

### Catatan validasi struktur dan routing

- File `public/assets/sarpras/images/119.jpg` memang tersedia; CSS Sarpras yang meminta `/images/119.jpg` tidak menunjuk ke lokasi kanonis tersebut.
- File ikon publik yang tersedia adalah `/assets/shared/icons/app-icon.png` dan `/assets/shared/icons/favicon.ico`. Tidak ditemukan folder root `/logo/` atau `/public/images/` dalam katalog file saat ini.
- `vercel.json` memiliki rewrite khusus Akademik dan Kesiswaan, tetapi tidak terlihat rewrite khusus untuk direktori Sarpras. Ini perlu diperiksa bersama pola URL `/src/assets/...` sebelum perubahan dilakukan.
- Jangan menyimpulkan semua route Sarpras pasti gagal hanya dari nama path: hasil akhirnya bergantung pada konfigurasi deployment/build yang benar-benar digunakan. Namun, konfigurasi saat ini belum memberi bukti pemetaan untuk seluruh path tersebut.
- Jalur CSS/JS lokal, route halaman, URL CDN, dan fragment seperti `href="#"` bukan otomatis referensi media yang harus dimigrasikan. Audit berikutnya perlu memisahkan kategori-kategori itu.

### Langkah audit berikutnya

1. Periksa 369 berkas JavaScript yang tersisa, terutama string path yang dibangun dinamis, konfigurasi, shell, service, dan modul upload/preview gambar.
2. Cocokkan semua path lokal dengan daftar file aktual serta rewrite Vercel.
3. Buat daftar final per file: path lama, target yang disarankan, tingkat kepastian, dan apakah memerlukan perubahan routing.
4. Setelah inventaris JavaScript selesai, baru mulai tahap perbaikan sumber secara terkontrol. Jangan mengubah API, autentikasi, atau route aplikasi sebagai efek samping.

## Log tindak lanjut — 31 Oktober 2026

### Pemeriksaan JavaScript lanjutan

- Tree repository pada branch `main` memuat **373 berkas JavaScript** pada area `src/akademik`, `src/kesiswaan`, `src/Sarpras`, `src/pintuku`, `src/shared`, dan `src/server`.
- Pemeriksaan lanjutan secara terarah dilakukan pada 16 berkas inti, termasuk registry, shell portal, shell Akademik/Kesiswaan, konfigurasi kelulusan, layanan aset Sarpras, dan dispatcher API.
- Pemeriksaan ini **belum mencakup seluruh 373 berkas**. Karena itu, status audit tetap parsial; string path dinamis pada berkas JavaScript lain masih perlu diperiksa.

### Perbaikan sumber yang sudah diterapkan

Tiga berkas Akademik diperbarui agar menggunakan lokasi aset publik kanonis yang memang ada di repository:

| Berkas | Perbaikan |
|---|---|
| `src/akademik/js/shell.js` | Logo navbar dari `/assets/logo/logo.png` ke `/assets/shared/logos/sman1-sooko.png`. |
| `src/akademik/js/kelulusan/config.js` | Background, logo, ikon, favicon, dan audio kelulusan dipindahkan ke URL kanonis di `/assets/shared/` dan `/assets/akademik/audio/`. |
| `src/akademik/js/kelulusan/ui.js` | Logo kop hasil cetak memakai `/assets/shared/logos/sman1-sooko.png`. |

Total **7 referensi** diperbaiki. File target telah ditemukan pada katalog `public/assets/` saat audit. Perubahan ini hanya mengganti URL media; logika pencarian, hasil kelulusan, audio, dan alur aplikasi tidak diubah.

Commit terakhir perbaikan sumber: `1ec5691c92f63d0bede534ab467e1998bd5523e0`.

### Status integrasi registry

- `src/shared/assets/registry.js` tersedia dan memuat pemetaan aset bersama serta aset per modul.
- Dashboard PINTUKU memanggil `/js/asset-registry.js`, sedangkan sumber registry masih berada di `src/shared/assets/registry.js`.
- Pemetaan build dari source registry ke URL runtime tersebut belum dibuktikan. Oleh sebab itu, perubahan di atas memakai URL publik kanonis langsung dan tidak menambah ketergantungan runtime pada registry.
- Integrasi registry lintas modul ditunda sampai mekanisme build/output statis ditetapkan dan diuji. Ini mencegah halaman bergantung pada URL JavaScript yang belum tentu disajikan deployment.

### Pekerjaan yang masih terbuka

1. Lanjutkan pemeriksaan seluruh JavaScript, khususnya path media yang dibangun dari variabel/template string dan pemanggilan upload/preview.
2. Audit manifest Akademik dan validitas file ikon PWA; audit font Sarpras yang masih berupa placeholder 1 byte.
3. Periksa path komponen/halaman Sarpras yang belum memiliki target publik kanonis.
4. Tentukan adapter build untuk registry dan source aplikasi sebelum memetakan URL runtime.
5. Jalankan smoke test pada hasil build/deployment untuk memastikan gambar, audio, ikon, font, dan halaman benar-benar termuat.

**Batas validasi:** commit sumber berhasil dibuat di GitHub. Belum ada klaim bahwa hasil deployment Vercel atau seluruh halaman runtime telah lulus pengujian.
