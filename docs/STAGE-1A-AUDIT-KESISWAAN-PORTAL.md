# Audit Tahap 1A — PINTUKU & Modul Kesiswaan

**Status:** Audit awal selesai; belum ada perubahan kode  
**Cakupan:** Landing page PINTUKU dan modul Kesiswaan  
**Branch:** `main`  
**Commit dasar audit:** `2e8f64500191bd5751f8e922ea5d8bad5e40cf53`  
**Pedoman visual:** [PINTUKU-VISUAL-GUIDELINES.md](./PINTUKU-VISUAL-GUIDELINES.md)

## 1. Ruang lingkup

Audit dibatasi pada:
- Root landing page: `index.html`
- Gaya dan skrip portal: `css/portal-shell.css`, `css/portal.css`, `js/portal-shell.js`, `js/portal.js`
- Routing induk: `vercel.json`, `api/kesiswaan.js`
- Modul: `src/kesiswaan/` (halaman, aset, CSS, JS, API, konfigurasi)

Modul Akademik dan Sarpras tidak diaudit atau diubah pada tahap ini.

## 2. Temuan landing page PINTUKU

| Area | Kondisi teramati | Tindak lanjut |
|---|---|---|
| Identitas | Judul, metadata, navbar, footer masih memakai “SMANSASOO Digital Portal” | Ganti konsisten menjadi PINTUKU setelah pemetaan seluruh kemunculan |
| Tampilan | Sudah memakai latar midnight navy, aksen biru/cyan, dan panel transparan | Kembangkan menjadi deep glassmorphism sesuai pedoman visual |
| Kartu Kesiswaan | Kartu masih berstatus “Tahap integrasi” dan tombol memakai `data-module-pending` | Arahkan ke `/kesiswaan/` setelah uji route |
| Kartu Akademik/Sarpras | Masih berstatus tahap integrasi | Di luar cakupan implementasi Tahap 1A |
| Navigasi desktop | Link modul tersedia melalui shell portal | Selaraskan label dan identitas PINTUKU |
| Navigasi mobile | Link dengan `data-optional=true` disembunyikan pada lebar <=650px | Evaluasi pola navigasi mobile agar akses modul tetap jelas |
| Aksesibilitas | Sudah ada struktur section, label navigasi, dan dukungan reduced-motion pada scroll | Pertahankan dan uji kontras/focus saat desain diperbarui |

## 3. Temuan modul Kesiswaan

### 3.1 Struktur halaman

Halaman yang teridentifikasi:
- `index.html`
- `pages/about.html`
- `pages/admin.html`
- `pages/cek-poin.html`
- `pages/eksekutif.html`
- `pages/gerakan-disiplin.html`
- `pages/privacy.html`
- `pages/qr.html`
- `pages/tata-tertib.html`
- `pages/walikelas.html`

Semua halaman menggunakan kelompok stylesheet utama Kesiswaan: variables, theme, style, responsive, glass, animation, shell, stats-panel, dan kesiswaan. Halaman tertentu memuat skrip khusus sesuai fungsi.

### 3.2 Identitas dan tema

- Identitas internal modul adalah **Portal Gerakan Disiplin Sekolah**.
- Unit: Kesiswaan & Kedisiplinan.
- Program: Gerakan Disiplin Sekolah.
- Modul memiliki pengaturan tema gelap/terang melalui `js/theme.js` dan `css/theme.css`.
- Tema gelap Kesiswaan sudah menggunakan warna gelap, permukaan kaca, dan aksen biru bergaya antarmuka modern.
- PINTUKU harus menjadi identitas induk; identitas Gerakan Disiplin Sekolah tetap dipertahankan.
- Integrasi visual perlu menyelaraskan token dan komponen, bukan memaksa semua halaman memakai satu tema yang menghilangkan pilihan tema Kesiswaan.

### 3.3 Navigasi dan peran

Shell Kesiswaan membangun navigasi berbeda untuk pengguna publik, Komisi Disiplin, Kesiswaan/BK, wali kelas, dan akun eksekutif. Logika tampilan navigasi di browser bukan pengganti otorisasi server; pemeriksaan peran pada endpoint harus tetap dipertahankan dan diuji.

### 3.4 API dan routing

- Root `vercel.json` memiliki rewrite `/kesiswaan` dan `/kesiswaan/(.*)` menuju `src/kesiswaan`.
- Root `api/kesiswaan.js` bertindak sebagai dispatcher ke handler API modul.
- `src/kesiswaan/js/config.js` menggunakan namespace `/api/kesiswaan/...`.
- Handler API utama dan handler multiplexer layanan berada di `src/kesiswaan/api/`.
- `src/kesiswaan/vercel.json` berisi konfigurasi standalone. Pada deployment root, konfigurasi induk adalah acuan routing utama; jangan menganggap rewrite standalone otomatis aktif.
- Jangan mengubah nama endpoint atau kontrak respons selama perapian visual.

### 3.5 Aset dan PWA

Modul memiliki aset logo, foto latar, tanda tangan, ikon, dan vendor QR. Manifest Kesiswaan menggunakan scope `/kesiswaan/`, sedangkan manifest root berlaku untuk `/`. Perlu verifikasi jalur aset dan perilaku instalasi PWA setelah perubahan route/identitas.

## 4. Matriks tindak lanjut

| Prioritas | Area | Tindakan | Status |
|---|---|---|---|
| P1 | Landing page | Perbarui identitas PINTUKU pada title, metadata, navbar, footer, dan manifest | Belum dikerjakan |
| P1 | Kartu Kesiswaan | Ganti aksi pending menjadi tautan aktif ke modul setelah uji route | Belum dikerjakan |
| P1 | Visual portal | Terapkan sistem token deep glassmorphism yang terdokumentasi | Belum dikerjakan |
| P1 | Kesiswaan | Pertahankan Gerakan Disiplin Sekolah dan fungsi tema gelap/terang | Ketentuan tetap |
| P1 | Routing/API | Uji seluruh halaman dan endpoint Kesiswaan melalui root deployment | Perlu pengujian |
| P2 | Konsistensi CSS | Petakan token warna, radius, border, blur, shadow, dan tipografi antara portal dan Kesiswaan | Belum dikerjakan |
| P2 | Mobile | Evaluasi navigasi dan layout pada lebar ponsel/tablet | Belum dikerjakan |
| P2 | Aksesibilitas | Uji kontras, keyboard focus, reduced motion, dan status komponen | Belum dikerjakan |
| P2 | PWA | Verifikasi manifest, icon, scope, cache, dan service worker | Perlu pengujian |
| P3 | File lama/duplikat | Lakukan analisis referensi sebelum menyatakan file tidak terpakai | Belum dikerjakan |

## 5. Catatan keamanan dan kehati-hatian

- Pertahankan autentikasi dan otorisasi di sisi server pada seluruh endpoint terlindungi.
- Jangan memindahkan secret atau kredensial ke JavaScript sisi klien.
- Jangan mengubah data siswa, Google Sheet, atau kontrak API dalam pekerjaan desain.
- Pengujian autentikasi perlu mencakup akun dengan peran berbeda dan akses lintas kelas wali kelas.
- Jangan menghapus `src/kesiswaan/vercel.json`, stylesheet, skrip, atau aset sebelum dependensinya diverifikasi.
- Jangan menyimpulkan konfigurasi environment produksi dari source code; status environment Vercel perlu diverifikasi terpisah oleh pemilik deployment.

## 6. Status perubahan

Audit ini hanya membaca struktur dan isi repository. Tidak ada file aplikasi, API, konfigurasi, aset, atau data Kesiswaan yang diubah dalam proses audit.

**Tahap berikutnya:** menyelesaikan pemetaan dependensi file dan pemeriksaan route, lalu menyusun urutan perapian per file sebelum implementasi dilakukan.
