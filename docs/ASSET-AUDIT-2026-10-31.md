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
