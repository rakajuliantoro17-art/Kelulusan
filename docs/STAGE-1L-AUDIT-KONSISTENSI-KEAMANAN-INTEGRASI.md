# Stage 1L — Audit Konsistensi dan Keamanan Integrasi PINTUKU–Kesiswaan

Tanggal audit: 30 Oktober 2026  
Branch: `main`  
Ruang lingkup: PINTUKU portal shell dan modul mandiri Kesiswaan/Gerakan Disiplin Sekolah (GDS).

## 1. Hasil audit sesi login

- Kunci sesi modul Kesiswaan adalah `kesiswaan-admin-session` di `sessionStorage`.
- Token disimpan bersama waktu kedaluwarsa; pembacaan sesi memeriksa `exp` dan menghapus sesi yang kedaluwarsa.
- Navigasi normal antarhalaman same-origin pada tab yang sama mempertahankan `sessionStorage`. Perpindahan dari Kesiswaan ke PINTUKU lalu kembali pada tab yang sama tidak dengan sendirinya menghapus sesi.
- Logout secara eksplisit menghapus kunci sesi dan memicu event `adminauth:change`.
- Pemeriksaan keabsahan token dilakukan melalui `/api/kesiswaan/admin-auth`; respons 401 dianggap sesi tidak valid. Gangguan jaringan/HTTP selain 401 tidak langsung menghapus sesi.
- PINTUKU tidak membaca, menulis, atau menghapus kunci sesi Kesiswaan.

Kesimpulan: tidak ditemukan konflik sesi antara PINTUKU dan Kesiswaan pada source yang diperiksa. Perilaku lintas-tab dan perilaku browser aktual tetap perlu diuji.

## 2. Kesesuaian peran, menu, dan page guard

- Halaman Admin menggunakan `data-require-admin`, yang memetakan guard klien ke peran Komisi/Kesiswaan.
- Halaman Eksekutif menggunakan `data-require-role="eksekutif"`.
- Halaman Wali Kelas dan QR menggunakan `data-require-role="walikelas,komisi,kesiswaan"`.
- Sidebar membangun kelompok menu dari daftar `roles` pada sesi: Eksekutif, Wali Kelas, Komisi, atau Kesiswaan.
- Peran Kesiswaan non-Komisi dibatasi pada tab Data dan Pembinaan pada halaman Admin; sidebar Kesiswaan juga hanya menampilkan Data/Pembinaan dan tautan rujukan.
- Akun Wali Kelas non-Komisi/Kesiswaan diarahkan ke halaman Wali Kelas.
- Page guard klien bukan satu-satunya pengaman. Handler API di server tetap menjadi otoritas autentikasi dan otorisasi.

Kesimpulan: tidak ditemukan ketidaksesuaian struktural yang cukup kuat untuk membenarkan perubahan menu atau guard. Pengujian akses langsung per peran dan pengujian API tetap wajib dilakukan di browser/deployment.

## 3. Penyimpanan browser

Kunci yang teridentifikasi pada kode inti:
- Kesiswaan: `kesiswaan-admin-session` di `sessionStorage`.
- Preferensi tema Kesiswaan: `kesiswaan-theme` di `localStorage`.
- Antrean pelanggaran offline: `kd-pelanggaran-queue` di `localStorage`.
- Preferensi tema PINTUKU: `pintuku-theme` di `localStorage`.

Nama kunci berbeda dan memiliki fungsi terpisah. Tidak ada alasan untuk mengganti atau memigrasikan kunci tersebut pada tahap ini. Audit ini tidak menyimpulkan bahwa semua key di seluruh repositori telah terindeks; pemeriksaan dilakukan pada berkas inti portal dan Kesiswaan yang relevan.

## 4. Manifest dan Service Worker / PWA

- Manifest PINTUKU: `/manifest.json`, `start_url: /`, `scope: /`.
- Manifest GDS: `/kesiswaan/manifest.json`, `start_url: /kesiswaan/`, `scope: /kesiswaan/`.
- PINTUKU mendaftarkan `/sw.js` dengan scope `/`.
- Service worker root saat ini meneruskan permintaan GET ke jaringan dan tidak menyimpan respons API atau data siswa.
- Tidak ditemukan pendaftaran service worker khusus di bawah `/kesiswaan/` pada halaman inti yang diperiksa.

Kesimpulan: cakupan manifest terpisah dan tidak tumpang tindih secara keliru. GDS tetap dapat menampilkan halaman melalui route web; namun perilaku instalasi/offline khusus GDS belum dapat dinyatakan tervalidasi. Jangan menambahkan caching data siswa atau respons API privat.

## 5. Route dan API

- Route halaman Kesiswaan diarahkan oleh root `vercel.json` ke `/src/kesiswaan/`.
- Endpoint `/api/kesiswaan/{endpoint}` diarahkan ke dispatcher root `api/kesiswaan.js`.
- Dispatcher memetakan delapan handler langsung dan tujuh operasi layanan ke handler asli di `src/kesiswaan/api/`.
- Konfigurasi klien Kesiswaan memakai namespace `/api/kesiswaan/`.
- Route internal shell dan halaman menggunakan prefix `/kesiswaan/`.
- Perbaikan sebelumnya pada fetch interceptor memakai namespace `/api/kesiswaan/`, sehingga cocok dengan route deployment.

Kesimpulan: tidak ditemukan mismatch namespace route/API pada konfigurasi sumber yang diperiksa.

## 6. Keputusan perubahan

Tidak ada perubahan kode aplikasi pada Stage 1L. Tidak ada perubahan terhadap:
- kredensial atau environment variables Vercel;
- akun Komisi, Spreadsheet, data siswa, atau kontrak API;
- autentikasi dan otorisasi server;
- modul Akademik dan Sarpras;
- tema, aset, atau struktur halaman GDS.

Keputusan ini disengaja: audit sumber tidak menunjukkan cacat integrasi baru yang dapat diperbaiki dengan aman tanpa bukti runtime.

## 7. Status validasi

**Terverifikasi dari source GitHub:**
- route dan namespace API;
- pemisahan manifest;
- kunci sesi dan preferensi browser utama;
- aturan menu dan guard peran pada halaman yang diperiksa;
- perilaku service worker root dari kode sumber.

**Belum terverifikasi di runtime:**
- halaman live `https://sookosip.vercel.app/kesiswaan/` berhasil dirender di browser;
- status deployment Vercel dan hasil build;
- login, refresh, logout, dan navigasi lintas halaman untuk setiap peran;
- respons API terhadap token valid, kedaluwarsa, dan role yang tidak sesuai;
- pembacaan/penulisan Google Sheets dan layanan eksternal;
- instalasi PWA dan perilaku browser/perangkat.

Catatan: percobaan membuka URL deployment melalui alat inspeksi web tidak berhasil mengakses halaman. Hal ini bukan bukti bahwa deployment gagal; runtime harus diuji langsung melalui browser pengguna atau pemeriksaan deployment yang memiliki akses.

## 8. Langkah berikutnya

Tahap berikutnya adalah **Stage 1M — Validasi halaman live dan smoke test fungsional**. Uji berurutan:
1. Buka `/kesiswaan/` dan pastikan dashboard, CSS, gambar, font, serta JavaScript termuat.
2. Uji halaman publik: Gerakan Disiplin, Cek Poin, Tata Tertib, Tentang, dan Privasi.
3. Uji login Komisi, Kesiswaan, Eksekutif, dan Wali Kelas; periksa menu dan pembatasan halaman.
4. Uji endpoint API dan Google Sheets dengan akun uji yang berwenang.
5. Uji QR, antrean offline, dan alur kembali ke PINTUKU.
6. Catat error console/network sebelum mengubah kode.

Jangan menganggap integrasi selesai hanya berdasarkan audit source. Status akhir memerlukan hasil uji runtime.
