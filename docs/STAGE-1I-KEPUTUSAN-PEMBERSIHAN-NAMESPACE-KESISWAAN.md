# Stage 1I — Keputusan Pembersihan Namespace Kesiswaan

Tanggal: 30 Oktober 2026  
Repository: `rakajuliantoro17-art/Kelulusan`  
Branch: `main`

## 1. Hasil

Tahap ini memeriksa dua kandidat yang sebelumnya teridentifikasi:
- `kesiswaan/index.html`
- `src/kesiswaan/vercel.json`

Tidak ada file aplikasi yang dihapus, dipindahkan, atau diubah dalam tahap ini. Keputusan ini disengaja karena bukti yang tersedia belum cukup untuk menyimpulkan kedua file aman dihapus.

## 2. `kesiswaan/index.html`

Isi file menunjukkan bahwa halaman ini adalah placeholder integrasi Portal Gerakan Disiplin Sekolah. File memuat:
- manifest root PINTUKU;
- stylesheet dan shell portal induk;
- status integrasi;
- tautan kembali ke beranda PINTUKU.

Pada deployment utama, `vercel.json` root memetakan:
- `/kesiswaan` → `/src/kesiswaan/index.html`
- `/kesiswaan/(.*)` → `/src/kesiswaan/$1`

Karena itu, placeholder tidak menjadi dashboard GDS pada jalur rewrite utama. Namun, file tersebut dapat tetap relevan untuk fallback hosting, preview statis, atau konfigurasi deployment lain. Penghapusan ditunda sampai seluruh workflow deployment dan referensi repository dapat diverifikasi.

## 3. `src/kesiswaan/vercel.json`

File ini berisi konfigurasi standalone modul, termasuk header keamanan dan rewrite endpoint generik `/api/...` ke dispatcher layanan lokal.

Deployment repository terpadu menggunakan `/vercel.json` di root, yang mempunyai namespace `/api/kesiswaan/...` dan dispatcher `/api/kesiswaan.js`. File standalone tidak otomatis menjadi konfigurasi aktif pada root deployment, tetapi mungkin diperlukan jika modul GDS kelak dipasang sebagai proyek Vercel tersendiri.

Keputusan: pertahankan sebagai konfigurasi standalone/arsip operasional sampai dipastikan tidak ada workflow deployment terpisah yang menggunakannya.

## 4. Status pencarian referensi

Pencarian kode melalui indeks GitHub tidak menghasilkan referensi yang dapat digunakan untuk membuktikan tidak adanya pemanggilan terhadap kedua file. Hasil kosong dari indeks pencarian bukan bukti bahwa file tidak direferensikan. Oleh karena itu, tidak digunakan sebagai dasar penghapusan.

Pemeriksaan source yang sudah dilakukan hanya cukup untuk memastikan bahwa rewrite utama mengarah ke `src/kesiswaan/index.html`, bukan untuk menjamin kedua file tidak digunakan oleh workflow lain.

## 5. Status perubahan

- Tidak ada penghapusan file.
- Tidak ada pemindahan direktori.
- Tidak ada perubahan route atau API.
- Tidak ada perubahan akun Komisi, Spreadsheet, environment variables, atau data.
- Tidak ada perubahan pada Akademik dan Sarpras.
- GDS tetap berlokasi di `src/kesiswaan/`.

## 6. Tindak lanjut

Tahap 1J dilanjutkan dengan audit route dan aset yang lebih terarah:
1. Cocokkan setiap route halaman GDS dengan file tujuan.
2. Cocokkan stylesheet, script, gambar, font, manifest, dan ikon.
3. Audit deep link, QR, serta navigasi internal.
4. Cocokkan endpoint frontend, rewrite root, dispatcher, dan handler API.
5. Laporkan mismatch yang benar-benar ditemukan sebelum mengubah file.

Validasi browser, deployment Vercel, dan API runtime tetap menjadi pekerjaan pengujian terpisah.
