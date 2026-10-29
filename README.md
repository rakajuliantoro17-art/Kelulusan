# SMANSASOO Digital Portal

Portal digital terpadu SMAN 1 Sooko Mojokerto yang menyatukan layanan sekolah dalam satu pintu masuk dengan modul yang tetap terpisah secara fungsi dan akses.

> **Status:** tahap restrukturisasi dan integrasi. Jangan gunakan branch ini sebagai deployment produksi sebelum seluruh route, API, autentikasi, dan fitur modul selesai diuji.

## Tujuan

Membangun fondasi portal baru di repository ini dengan satu deployment utama Vercel dan tiga modul:

- **Akademik** — diadaptasi dari [smansasoo-academic-portal](https://github.com/rakajuliantoro17-art/smansasoo-academic-portal), termasuk fitur kelulusan yang sudah menjadi bagian portal Akademik.
- **Sarpras** — diadaptasi dari [Sarprasin](https://github.com/rakajuliantoro17-art/Sarprasin), untuk inventaris, kondisi aset, audit QR, laporan, dan dashboard.
- **Kesiswaan** — Portal Gerakan Disiplin Sekolah dari `src/kesiswaan/`, berasal dari [yasmincntk99/kesiswaan](https://github.com/yasmincntk99/kesiswaan), untuk tata tertib, pencatatan pelanggaran, pembinaan, surat, QR, rekap, dan layanan terkait.

## Prinsip pengembangan

1. Repository ini menjadi pusat integrasi; source repository tetap tidak diubah oleh proses integrasi.
2. Fitur yang sudah ada tidak boleh dihapus hanya karena nama file, CSS, API, atau konfigurasi saling bertabrakan.
3. Modul memakai namespace route dan aset masing-masing, sedangkan komponen shell bersama digunakan hanya jika kompatibel.
4. Backend yang sudah digunakan (Google Sheets/Apps Script, Firebase, dan Vercel Functions) dipertahankan pada tahap awal dengan adaptor seperlunya.
5. Data sensitif dan kredensial produksi harus tetap di server/environment variables. Tidak boleh memasukkan secret ke client bundle atau commit.
6. Setiap perubahan dikerjakan di branch, diuji, lalu ditinjau sebelum digabung ke `main`.

## Dokumentasi

- [Arsitektur integrasi dan tahapan implementasi](docs/PORTAL-TERPADU-ARCHITECTURE.md)

## Branch kerja

`integration/portal-terpadu`

Branch ini adalah ruang kerja integrasi. Deployment produksi belum dianggap siap sampai checklist uji dan audit keamanan dinyatakan lulus.

## Teknologi

- HTML, CSS, JavaScript
- Vercel (satu deployment utama)
- Google Sheets / Google Apps Script untuk layanan yang sudah ada
- Firebase Authentication, Firestore, Storage, dan Cloud Functions untuk Sarprasin sesuai kebutuhan modul

## Konfigurasi

Nilai Environment Variables tidak dicatat di repository. Inventaris variabel, pemetaan per modul, dan kebutuhan rotasi kredensial akan diselesaikan sebelum deployment produksi.
