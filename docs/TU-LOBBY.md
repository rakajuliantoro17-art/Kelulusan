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

## Uji viewport TV dan laptop
### Matriks viewport target
| Perangkat / profil | Viewport CSS | Perilaku yang diharapkan |
|---|---:|---|
| TV Full HD 16:9 | 1920 × 1080 | Komposisi desktop lebar, seluruh bagian utama terlihat proporsional, tombol layar penuh tersedia |
| TV HD 16:9 | 1366 × 768 | Mode landscape ringkas aktif, informasi utama diprioritaskan |
| Laptop umum | 1366 × 768 | Mode landscape ringkas aktif untuk mengurangi kebutuhan scroll vertikal |
| Laptop HD | 1280 × 720 | Mode landscape ringkas aktif; bila skala browser/OS tinggi, scroll tetap dapat terjadi |
| Tablet landscape | 1024 × 768 | Kolom hero ditumpuk dan kategori menjadi dua kolom |
| Ponsel | 390 × 844 | Satu kolom hero, kategori dua kolom, footer bertumpuk |

### Checklist pengujian visual manual
- [ ] Buka `/lobby` pada browser dengan zoom 100% dan viewport sesuai matriks.
- [ ] Pastikan logo sekolah, jam/tanggal, judul, alur empat langkah, delapan kategori, petunjuk, dan footer tidak saling bertumpuk.
- [ ] Pada TV, cek keterbacaan judul dan teks dari jarak duduk/berdiri area lobby; sesuaikan zoom hanya bila diperlukan.
- [ ] Pada laptop 1366 × 768 dan 1280 × 720, pastikan mode ringkas mengurangi scroll tanpa memotong konten.
- [ ] Uji pemilihan kategori menggunakan mouse dan keyboard; indikator fokus dan `aria-pressed` harus berubah.
- [ ] Uji tombol layar penuh pada browser/perangkat display yang digunakan sekolah.
- [ ] Pastikan rotasi informasi tidak menghalangi pemilihan kategori dan tetap berhenti pada preferensi reduced-motion.
- [ ] Ulangi pemeriksaan saat browser menggunakan zoom 125% sebagai uji toleransi.

**Batas hasil:** pemeriksaan otomatis repository memvalidasi keberadaan breakpoint dan konfigurasi build, bukan pengukuran piksel atau inspeksi fisik TV. Checklist visual di atas perlu dikonfirmasi pada perangkat lobby yang sebenarnya sebelum dianggap lolos UAT.
