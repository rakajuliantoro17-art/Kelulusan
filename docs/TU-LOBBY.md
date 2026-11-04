# PINTUKU — Front Office Lobby Display

## Tujuan
Halaman `/lobby` adalah layar informasi publik untuk area lobby SMAN 1 Sooko. Halaman menyambut pengunjung, menampilkan alur pelayanan, dan memberi petunjuk awal berdasarkan tujuan kunjungan.

## Batas fungsi
- Tidak memerlukan login dan tidak mengakses API.
- Tidak menerima nama, nomor telepon, NIK, atau data pribadi pengunjung.
- Tidak menampilkan antrean, notifikasi, identitas petugas, atau riwayat kunjungan.
- Pemilihan kategori layanan hanya mengubah petunjuk di layar dan tidak mengirim data.
- Tombol layar penuh disediakan untuk monitor/TV lobby.
- Pencatatan kunjungan tetap dilakukan petugas pada buku layanan sesuai prosedur sekolah yang berlaku.

## Penggunaan
1. Buka `/lobby` pada perangkat display di area penerimaan.
2. Aktifkan layar penuh bila browser dan perangkat mendukung.
3. Pengunjung memilih kategori layanan untuk membaca petunjuk.
4. Pengunjung menyampaikan tujuan kepada petugas Front Office.
5. Petugas mencatat kunjungan pada buku layanan dan menghubungi unit tujuan sesuai prosedur.

## Catatan tata kelola
Nama unit merupakan kategori pengarahan, bukan janji lokasi ruangan atau jam layanan tertentu. Penempatan ruangan, jam operasional, nomor kontak, standar waktu layanan, dan isi SOP harus ditetapkan sekolah sebelum ditambahkan sebagai informasi publik.


## Identitas visual dan tampilan layar
- Header menggunakan logo resmi sekolah dari `/assets/shared/logos/sman1-sooko.png`.
- Palet visual menggunakan navy, biru, putih, dan aksen emas lembut dengan kontras tinggi.
- Layout desktop dioptimalkan untuk layar lebar/TV 16:9; breakpoint tablet dan ponsel tetap disediakan.
- Informasi pengunjung ditandai pada header, sedangkan jam dan tanggal lokal tetap diperbarui otomatis.
- Logo hanya menggunakan aset yang sudah ada di repository; tidak ada logo baru atau identitas rekaan.

## Penyempurnaan visual tahap lanjutan
- Delapan kategori layanan menggunakan ikon SVG garis yang konsisten, tanpa dependensi ikon eksternal.
- Ukuran teks alur layanan, kategori, dan petunjuk diperbesar dengan skala responsif untuk keterbacaan layar lebar.
- Area informasi pengunjung menampilkan tiga pesan umum secara bergilir setiap 8,5 detik; rotasi otomatis dihentikan saat preferensi reduced-motion aktif.
- Pesan bergilir tidak memuat jadwal, lokasi ruangan, nama petugas, kontak, atau ketentuan operasional yang belum divalidasi sekolah.
