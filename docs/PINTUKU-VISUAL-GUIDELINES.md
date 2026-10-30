# Pedoman Identitas Visual PINTUKU & Modul Kesiswaan

**Status:** Pedoman konsep disetujui untuk Tahap 1A  
**Cakupan:** Portal utama PINTUKU dan modul Kesiswaan  
**Repository:** `rakajuliantoro17-art/Kelulusan`  
**Dokumen ini bukan implementasi CSS.** Nilai teknis final dan penerapannya ditetapkan setelah audit struktur serta aset selesai.

---

## 1. Tujuan

Dokumen ini menjadi acuan tunggal agar desain portal dan modul Kesiswaan konsisten selama proses perapian dan pengembangan. Perubahan visual harus mengikuti pedoman ini, bukan dibuat secara terpisah pada setiap halaman.

Target pengalaman visual:
- Elegan, modern, tenang, dan profesional.
- Menggunakan pendekatan **deep glassmorphism** yang terinspirasi antarmuka sistem operasi modern bergaya iOS (referensi arah visual, bukan meniru komponen atau merek secara persis).
- Memiliki hierarki informasi yang jelas dan mudah dipahami oleh siswa, guru, wali kelas, operator, dan pimpinan sekolah.
- Tetap ringan, responsif, mudah diakses, dan nyaman digunakan dalam waktu lama.

## 2. Arsitektur identitas

### 2.1 Portal induk

**Nama:** PINTUKU  
**Kepanjangan:** Pelayanan Integrasi & Data Sekolah Terpadu  
**Peran:** Pintu masuk dan identitas bersama bagi layanan digital sekolah.

Portal induk menggunakan identitas PINTUKU secara konsisten pada halaman beranda, navigasi utama, metadata, dan elemen pengenal portal.

Slogan **“Satu Pintu, Terintegrasi, Terpercaya.”** merupakan usulan kerja dan belum dianggap sebagai keputusan final.

### 2.2 Modul Kesiswaan

Modul Kesiswaan tetap mempertahankan identitas operasionalnya, yaitu **Gerakan Disiplin Sekolah**. PINTUKU berfungsi sebagai identitas induk dan jalur masuk, bukan menggantikan nama program, istilah, alur kerja, atau karakter internal Kesiswaan.

Keselarasan dilakukan melalui sistem visual bersama seperti warna dasar, tipografi, radius, elevasi, pola navigasi, dan perilaku responsif. Identitas program Kesiswaan tetap terlihat pada halaman dan fitur internalnya.

## 3. Arah visual: Deep Glassmorphism

Gunakan lapisan antarmuka transparan yang memiliki kedalaman visual. Efek kaca harus terasa halus dan premium, bukan ramai atau berlebihan.

Prinsip utama:
1. **Layered depth:** latar, panel utama, kartu, dan elemen mengambang memiliki tingkat kedalaman yang terukur.
2. **Frosted surfaces:** panel menggunakan transparansi dan blur secukupnya; konten tetap menjadi fokus.
3. **Subtle borders:** garis tepi tipis untuk memisahkan permukaan kaca dari latar.
4. **Controlled glow:** cahaya atau gradasi aksen hanya digunakan untuk membantu fokus dan orientasi.
5. **Consistent elevation:** komponen dengan fungsi dan tingkat prioritas sama harus memiliki perlakuan visual yang sama.
6. **Content first:** dekorasi tidak boleh mengurangi keterbacaan, kecepatan, atau kemudahan penggunaan.

## 4. Palet warna konseptual

Palet dasar yang disepakati pada tingkat konsep:

| Peran | Arah warna | Penggunaan |
|---|---|---|
| Latar utama | Midnight navy / deep blue | Latar halaman dan area aplikasi |
| Latar sekunder | Navy atau slate gelap | Lapisan latar tambahan |
| Permukaan kaca | Putih kebiruan transparan | Kartu, panel, dialog, navigasi |
| Aksen utama | Ice blue | Tautan, fokus, elemen interaktif |
| Aksen sekunder | Cyan terkontrol | Indikator aktif dan sorotan seperlunya |
| Aksen netral | Silver / cool gray | Garis, ikon sekunder, metadata |
| Teks utama | Putih atau near-white | Judul dan informasi utama |
| Teks sekunder | Cool gray dengan kontras memadai | Keterangan dan metadata |

Kode HEX, opacity, dan kombinasi final ditentukan setelah pengujian kontras pada latar serta perangkat nyata. Jangan menetapkan warna final secara berbeda-beda per halaman.

## 5. Komponen dan pola antarmuka

### 5.1 Kartu dan panel
- Gunakan permukaan kaca dengan radius konsisten.
- Berikan batas visual tipis dan bayangan lembut untuk membedakan lapisan.
- Hindari panel yang terlalu transparan hingga teks atau kontrol sulit dibaca.
- Kartu yang dapat diklik harus memiliki affordance dan status interaksi yang jelas.

### 5.2 Navigasi
- Navigasi portal induk harus sederhana dan konsisten.
- Status aktif, hover, focus, dan disabled harus dapat dibedakan.
- Navigasi internal Kesiswaan boleh memiliki struktur sesuai kebutuhan operasionalnya, tetapi tetap mengikuti token visual bersama.
- Jangan menampilkan menu yang belum berfungsi seolah-olah sudah aktif.

### 5.3 Tombol dan formulir
- Tombol utama, sekunder, dan destruktif harus memiliki hierarki yang jelas.
- Formulir harus mengutamakan label yang eksplisit, pesan validasi yang terbaca, dan status proses.
- Area klik harus memadai untuk penggunaan layar sentuh.

### 5.4 Ikon dan ilustrasi
- Gunakan satu gaya ikon yang konsisten.
- Hindari pencampuran ikon dengan ketebalan garis atau gaya visual yang tidak seragam.
- Ikon tidak boleh menggantikan label pada tindakan yang berpotensi ambigu.

## 6. Tipografi dan hierarki informasi

- Gunakan keluarga tipografi sans-serif yang bersih dan mudah dibaca.
- Tetapkan skala konsisten untuk judul halaman, judul bagian, isi, label, dan metadata.
- Batasi penggunaan variasi ketebalan dan ukuran yang tidak memiliki fungsi hierarkis.
- Pastikan teks sekunder tetap terbaca pada permukaan transparan.

## 7. Kontras, aksesibilitas, dan responsivitas

- Keterbacaan lebih penting daripada efek kaca.
- Uji kontras teks dan kontrol, termasuk pada panel transparan dengan latar yang bervariasi.
- Sediakan indikator focus yang terlihat untuk navigasi keyboard.
- Jangan menyampaikan status hanya melalui warna; tambahkan teks atau ikon yang relevan.
- Hormati preferensi reduced motion bila animasi diterapkan.
- Layout harus berfungsi pada ponsel, tablet, laptop, dan desktop.
- Hindari blur, animasi, atau efek berlapis yang membebani perangkat atau menurunkan performa.

## 8. Gerak dan transisi

Gunakan transisi singkat dan fungsional untuk membantu pengguna memahami perubahan status atau perpindahan antarmuka. Hindari animasi dekoratif yang terus bergerak, parallax berlebihan, dan efek yang mengganggu fokus.

## 9. Konsistensi lintas halaman

Sebelum halaman baru atau halaman hasil perapian dinyatakan selesai, periksa:
- Identitas portal atau modul ditampilkan dengan benar.
- Warna, tipografi, radius, border, dan elevasi mengikuti token bersama.
- Navigasi dan status aktif konsisten.
- Kontras dan keterbacaan tetap baik.
- Tampilan responsif pada ukuran layar utama.
- Komponen interaktif memiliki status hover, focus, active, disabled, loading, dan error sesuai kebutuhan.
- Tidak ada elemen dekoratif yang menghalangi tugas utama pengguna.

## 10. Batas cakupan Tahap 1A

Tahap 1A saat ini hanya mencakup:
1. Halaman awal / landing page PINTUKU.
2. Audit dan perapian modul Kesiswaan.

Modul Akademik dan Sarpras tidak termasuk dalam pekerjaan Tahap 1A ini. Tidak ada penggabungan spreadsheet, perubahan backend lintas modul, atau penambahan fitur baru pada tahap audit dan perapian awal.

## 11. Aturan perubahan

- Dokumen ini menjadi referensi desain selama Tahap 1A.
- Perubahan yang memengaruhi identitas, palet, atau pola visual inti harus dicatat di dokumen ini.
- Jangan mengubah identitas internal Gerakan Disiplin Sekolah tanpa keputusan terpisah.
- Jangan menghapus aset atau komponen sebelum dependensi dan pemakaiannya diverifikasi.
- Implementasi dilakukan bertahap setelah audit dan rencana perapian disepakati.

---

**Ringkasan keputusan:** PINTUKU menggunakan arah visual deep glassmorphism yang elegan, dalam, modern, dan berkontras tinggi. Modul Kesiswaan mengikuti sistem visual bersama, tetapi tetap mempertahankan identitas Gerakan Disiplin Sekolah.
