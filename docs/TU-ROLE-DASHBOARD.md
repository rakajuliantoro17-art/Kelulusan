# PINTUKU Tata Usaha — Role-based Dashboard

## Tujuan

Setelah login menggunakan akun pada Google Spreadsheet tab `Pengguna`, dashboard membaca kode peran dari token sesi yang ditandatangani server. Parameter `workspace` pada URL hanya untuk konteks tampilan dan tidak menjadi sumber kewenangan.

## Matriks dashboard

| Role code | Dashboard | Menu utama |
|---|---|---|
| `head_tu` | Dashboard Kepala Tata Usaha | Semua administrasi, Spreadsheet, Front Office, Akses & Identitas, laporan |
| `staff_tu` | Ruang Kerja Staf Tata Usaha | Pusat tugas, Spreadsheet, persuratan, arsip, administrasi siswa, helpdesk, laporan |
| `receptionist` | Dashboard Front Office | Ringkasan dan akses Front Office |
| `fo_coordinator` | Dashboard Koordinator Front Office | Front Office, pusat tugas, koordinasi, laporan |
| `unit_officer` | Dashboard Petugas Unit | Pusat tugas dan konfirmasi unit melalui Front Office |
| `principal` | Dashboard Eksekutif Tata Usaha | Ringkasan, koordinasi, dan laporan |

## Implementasi

- Judul, deskripsi, identitas pengguna, menu navigasi, kartu layanan, dan bagian dashboard disesuaikan berdasarkan role code.
- Role diambil dari hasil verifikasi token server-side melalui `GET /api/tu/auth`.
- Nilai `workspace` di URL diselaraskan kembali dengan role dari token.
- Route Front Office dibatasi ke Kepala TU, Koordinator Front Office, Resepsionis, Petugas Unit, dan Kepala Sekolah.
- Route Akses & Identitas dibatasi ke Kepala TU.
- Role yang tidak dikenali diarahkan kembali ke halaman login.
- Seluruh perubahan hanya pada source code di branch fitur. Tidak ada perubahan database.

## Batas keamanan dan integrasi

Penyembunyian menu dan pembatasan route pada browser merupakan kontrol antarmuka, bukan pengganti otorisasi server. API operasional TU yang sudah ada untuk kunjungan, notifikasi, dan data unit masih memvalidasi token Supabase Auth dan role database Supabase.

Karena itu, login spreadsheet sudah dapat mengidentifikasi role dan menampilkan dashboard yang sesuai, tetapi fitur operasional tersebut belum otomatis dapat digunakan dengan sesi spreadsheet. Integrasi token spreadsheet dan pemeriksaan role pada setiap endpoint API adalah tahap terpisah yang wajib diselesaikan sebelum penggunaan operasional. Tidak ada skema atau isi database yang diubah dalam tahap dashboard ini.
