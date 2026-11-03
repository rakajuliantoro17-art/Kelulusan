# PINTUKU HUMAS — Sprint 5: Direktori Alumni & Pembaruan Data

## Tujuan

Menyederhanakan pendataan alumni agar mudah digunakan lintas generasi, termasuk alumni yang tidak terbiasa dengan formulir digital. PINTUKU berfungsi sebagai sarana pendataan, verifikasi, dan administrasi; sekolah dan Ikatan Alumni SMANSASOO tetap dapat mengumpulkan data secara bertahap melalui jejaring masing-masing.

## Perubahan pengalaman pengguna

### Formulir publik
- Nama lengkap dan angkatan/tahun lulus menjadi isian wajib.
- Status/kesibukan saat ini dapat dipilih sederhana; pilihan “Belum ingin menyampaikan” tersedia.
- Domisili, WhatsApp, email, dan instansi/bidang pekerjaan bersifat opsional.
- Untuk menjaga saluran tindak lanjut, minimal satu kontak (WhatsApp atau email) tetap diperlukan. WhatsApp sendiri tidak diwajibkan.
- Tidak meminta akun, NISN, tanggal lahir, dokumen, kelas terakhir, program studi, rincian jabatan, maupun tahun survei.
- Target pengisian sekitar satu menit, satu kolom per data, dan ramah ponsel.
- Persetujuan pengolahan data wajib; persetujuan komunikasi tetap pilihan terpisah.

### Workspace internal
- Mengganti istilah Tracer Study menjadi Direktori Alumni / Perbarui Data Alumni.
- Dashboard menampilkan data alumni terhimpun, terverifikasi, menunggu verifikasi, dan waktu pembaruan terakhir.
- Analitik cakupan survei, periode tracer, dan grafik status lulusan tidak lagi ditampilkan pada dashboard operasional.
- Direktori, pencarian, filter, antrean verifikasi, detail profil, persetujuan komunikasi, dan riwayat kontak tetap dipertahankan.
- Data kontak tetap hanya tersedia di workspace internal sesuai hak akses.

## API dan penyimpanan

- Formulir publik tetap menggunakan endpoint POST /api/humas-alumni-public.
- Validasi server, rate limit, honeypot, pemeriksaan origin, dan persetujuan pengolahan data tetap dipertahankan.
- WhatsApp boleh kosong jika alumni memberikan email; email boleh kosong jika alumni memberikan WhatsApp.
- Workspace internal mengambil waktu pembaruan terakhir dari profil aktif terbaru.
- Tidak ada perubahan skema database pada penyederhanaan ini. Migration analitik Sprint 5 yang telah diterapkan tetap dipertahankan dan tidak dihapus; hanya tidak ditampilkan pada alur kerja utama.

## Catatan penghitungan

- **Terverifikasi**: profil aktif yang sudah masuk ke direktori utama.
- **Menunggu verifikasi**: pengajuan publik yang masih berstatus pending. Tampilan antrean mengambil hingga 100 data; indikator memberi tanda 100+ bila batas tampilan tercapai.
- **Data alumni terhimpun**: profil aktif ditambah pengajuan yang masih menunggu verifikasi. Jika antrean mencapai batas 100, indikator ditampilkan sebagai batas bawah (≥) agar tidak memberi kesan jumlah pasti.
- **Pembaruan terbaru**: waktu updated_at paling baru dari profil alumni aktif.

## Privasi dan tata kelola

- Data kontak tidak ditampilkan pada halaman publik.
- Pengajuan publik tidak otomatis masuk direktori; petugas HUMAS memeriksa dan menyetujui terlebih dahulu.
- Persetujuan komunikasi tetap terpisah per tujuan dan tidak diasumsikan dari persetujuan pendataan.
- Ikatan Alumni dapat tetap mengumpulkan data melalui jalur luring/jejaring, lalu sekolah dapat memasukkan atau memperbarui data melalui workspace internal.

## Validasi

Validasi otomatis dilakukan melalui test source/API dan CI setelah perubahan ini. Pengujian alur pengiriman formulir dan workspace dengan akun HUMAS produksi tetap memerlukan smoke test terautentikasi; status tersebut tidak diasumsikan dari pemeriksaan kode saja.

## File utama

- src/pintuku/dashboard/humas-alumni.html
- src/pintuku/dashboard/humas-alumni-public.html
- src/pintuku/assets/js/humas-alumni.js
- src/pintuku/assets/js/humas-alumni-public.js
- src/server/api/humas.js
- src/server/api/humas-alumni-public.js
- tests/humas-permit-transactions.test.js
