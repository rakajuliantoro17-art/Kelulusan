# PINTUKU — Dashboard UX Standard

## Tujuan

Dashboard PINTUKU berfungsi sebagai pusat informasi dan panduan kerja sekolah. Dashboard bukan halaman pemantauan server atau panel teknis. Pengguna harus dapat memahami kondisi pekerjaan, informasi terbaru, agenda, dan tindakan yang perlu dilakukan tanpa memahami istilah IT.

Standar ini berlaku untuk dashboard utama dan seluruh modul: HUMAS, Tata Usaha, Sarpras, Akademik, Kesiswaan, serta modul operasional lain.

## Prinsip desain

1. **Informative first** — informasi penting dan tindak lanjut lebih menonjol daripada statistik dekoratif.
2. **Human friendly** — gunakan Bahasa Indonesia yang jelas, profesional, dan tidak birokratis.
3. **One consistent system** — pola navigasi, label status, ukuran teks, dan perilaku komponen konsisten antarmodul.
4. **Accessible across generations** — satu antarmuka yang nyaman bagi Gen X, Milenial, dan Gen Z; bukan tiga versi UI terpisah.
5. **Preserve module identity** — jangan mengganti background, aset visual, atau karakter desain modul yang telah ditetapkan tanpa persetujuan.
6. **Honest status** — data contoh, data belum tersedia, layanan bermasalah, dan data aktual harus dibedakan secara jelas.

## Informasi prioritas pada dashboard

Urutan yang direkomendasikan:
1. Salam dan konteks halaman.
2. Ringkasan kondisi yang benar-benar membantu keputusan.
3. Pengumuman atau informasi penting.
4. Agenda dan tenggat terdekat.
5. Daftar pekerjaan yang perlu ditindaklanjuti.
6. Akses cepat ke layanan yang sering digunakan.
7. Laporan dan statistik lebih rinci sebagai bagian sekunder.

Jangan menampilkan angka KPI jika sumber data belum tersedia atau angka tersebut tidak memicu tindakan yang jelas. Gunakan "Belum tersedia" alih-alih angka nol yang dapat disalahartikan.

## Bahasa antarmuka

| Istilah teknis | Label yang disarankan |
|---|---|
| Pending | Menunggu proses |
| Workflow | Tahapan proses |
| Approval | Persetujuan |
| Revision Required | Perlu diperbaiki |
| Rejected | Tidak disetujui |
| Audit Log | Riwayat aktivitas |
| Database Status | Status layanan |
| API Error | Layanan sedang mengalami kendala |
| User Management | Pengelolaan pengguna |
| CRUD | Kelola data |

Istilah teknis hanya ditampilkan pada halaman operator/pemeliharaan yang memang memerlukannya.

## Komponen dan aksesibilitas

- Ikon selalu disertai label teks untuk navigasi utama.
- Gunakan ukuran teks yang terbaca, kontras memadai, dan target klik yang nyaman.
- Status tidak dibedakan hanya dengan warna; sertakan kata seperti "Menunggu", "Diproses", "Selesai", atau "Perlu perhatian".
- Gunakan kartu ringkasan secukupnya; hindari dashboard yang penuh angka.
- Pencarian dan filter menggunakan label yang mudah dimengerti.
- Tampilan responsif untuk desktop, tablet, dan ponsel.
- Pesan kosong menjelaskan mengapa belum ada data dan apa langkah berikutnya.
- Pesan kendala menjelaskan dampak kepada pengguna dan langkah tindak lanjut, bukan stack trace atau kode error.

## Penyesuaian berdasarkan kewenangan

- Kepala Sekolah: ringkasan lintas bidang, agenda, laporan, dan hal yang membutuhkan keputusan.
- Wakil Kepala Sekolah: progres bidang, agenda, dan pekerjaan yang perlu ditindaklanjuti.
- Guru/Wali Kelas: pengumuman, informasi akademik, agenda, dan layanan yang relevan.
- Tata Usaha: surat, layanan administrasi, dan pekerjaan yang perlu diproses.
- HUMAS: mitra, dokumen kerja sama, publikasi, agenda kunjungan, dan layanan informasi.
- Sarpras: kondisi fasilitas, laporan kerusakan, pemeliharaan, dan inventaris.
- Operator: konfigurasi, akun, hak akses, dan pemeliharaan teknis pada ruang khusus operator.

Hak akses data ditentukan server-side. Menyembunyikan menu di browser bukan pengganti otorisasi backend.

## Status data dan layanan

Gunakan label yang jujur:
- **Data contoh** — data demonstrasi, bukan data sekolah.
- **Belum tersedia** — sumber data belum terhubung atau belum ada data.
- **Menunggu proses** — permohonan sudah tercatat tetapi belum ditangani.
- **Sedang diproses** — pekerjaan sedang ditangani.
- **Selesai** — pekerjaan telah dituntaskan.
- **Perlu perhatian** — ada tenggat, kekurangan, atau kendala yang perlu ditindaklanjuti.
- **Layanan terganggu** — layanan tidak dapat digunakan sementara.

## Batas teknis

- Jangan tampilkan URL database, token, API key, SQL, stack trace, atau konfigurasi server pada dashboard pengguna umum.
- Jangan tampilkan fitur sebagai aktif jika backend, autentikasi, otorisasi, dan penyimpanan belum tersedia.
- Jangan gunakan angka contoh seolah-olah merupakan data aktual.
- Jangan memberi kewenangan persetujuan hanya berdasarkan tampilan tombol; validasi wajib di backend dan database.
- Setiap keputusan penting harus memiliki riwayat aktor, waktu, alasan, dan versi dokumen bila relevan.

## Kriteria penerimaan

Dashboard dianggap memenuhi standar apabila:
- pengguna baru dapat memahami fungsi halaman tanpa pelatihan teknis;
- informasi penting dan tindak lanjut terlihat jelas;
- istilah teknis tidak muncul di area pengguna umum;
- status data aktual dan data contoh tidak tertukar;
- tampilan tetap konsisten dengan identitas visual modul;
- navigasi dapat digunakan dengan keyboard dan perangkat sentuh;
- akses data tetap dibatasi oleh autentikasi, RBAC, dan kebijakan server.
