# Spesifikasi Implementasi UI/UX Tata Usaha PINTUKU

Status: disetujui untuk implementasi UI pada branch pengembangan  
Tanggal: 4 November 2026

## Keputusan desain
- Mode adaptive: mengikuti preferensi sistem pada kunjungan pertama; preferensi manual PINTUKU tetap dihormati.
- Background existing dipertahankan pada halaman yang sudah ada. Halaman publik baru menggunakan palet dan treatment glassmorphism yang kompatibel dengan identitas TU.
- Navigasi dashboard internal menggunakan side panel.
- Visual professional glassmorphism, kontras tinggi, responsif, touch-friendly, dan reduced-motion aware.
- Pengunjung tidak perlu login.
- Staf TU mengakses login melalui Floating Gear PINTUKU; panel gear menambahkan tautan login staf hanya pada halaman publik TU.

## Rute
- `/tata-usaha/`: Buku Tamu Digital publik.
- `/tata-usaha/queue-display/`: layar antrean TV/videotron.
- `/tata-usaha/dashboard/`: dashboard internal yang tetap menggunakan guard autentikasi saat ini.
- `/tata-usaha/front-office/`: workspace Front Office internal.
- `/tata-usaha/akses/`: governance akses internal.
- `/tata-usaha/login/`: login staf.
- `/lobby`: halaman informasi pengunjung lama tetap dipertahankan.

## Buku Tamu Digital
- Identitas sekolah, sapaan, jam/tanggal, alur pelayanan, tombol registrasi, tautan layar antrean.
- Formulir: nama, kategori, instansi, kontak opsional, unit tujuan, keperluan, pihak yang dituju, catatan opsional, persetujuan privasi.
- UI-only preview: form melakukan validasi browser, tetapi tidak mengirim atau menyimpan data karena endpoint intake publik belum disiapkan.
- Konfirmasi nomor antrean akan dihubungkan pada tahap backend terpisah.

## Layar antrean
- Rasio 16:9, mode fullscreen, jam/tanggal, nomor dipanggil, unit, loket, status per unit, pengumuman.
- Tidak boleh menampilkan nama, nomor kontak, atau keperluan pribadi pengunjung.
- Saat ini data antrean belum tersambung; layar menunjukkan status belum terhubung dan tidak membuat data contoh seolah-olah aktual.
- Integrasi real-time, audio panggilan, dan pemulihan koneksi merupakan tahap backend/operasional berikutnya.

## Dashboard internal
- Dashboard existing dipertahankan dan dipindahkan ke rute `/tata-usaha/dashboard/`.
- Side panel existing dipertahankan.
- Navigasi dashboard diarahkan ke rute dashboard yang baru.
- Role-specific content tetap membutuhkan integrasi otorisasi server; tahap ini tidak mengubah role atau autentikasi.

## Batasan keamanan dan deployment
- Tidak ada perubahan database, schema, migrasi, akun, atau role.
- Tidak ada API publik baru pada tahap UI.
- Tidak ada perubahan kredensial atau environment variables.
- Tidak ada merge PR atau deployment produksi.
- Data layar antrean saat ini berupa placeholder kosong, bukan data operasional.
