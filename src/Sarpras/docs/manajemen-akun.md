# Manajemen Akun (buat akun & role dari panel Admin)

Halaman **Admin → User Management** bisa membuat akun login baru, mengubah role,
menonaktifkan, mengganti password, mengirim email atur-ulang password, dan menghapus akun.
Semua aksi berjalan lewat **Cloud Function** yang memeriksa di server bahwa pemanggilnya
benar-benar `users/{uid}.role == "admin"` (dan tidak nonaktif). Hak akses tidak bergantung
pada tampilan di browser.

## Aturan yang ditegakkan server

- Hanya role `admin` yang boleh membuat, mengubah, mengganti password, dan menghapus akun.
- Admin tidak bisa menurunkan, menonaktifkan, atau menghapus **akunnya sendiri**.
- Akun yang dinonaktifkan: Auth dinonaktifkan + sesi dicabut, dan `firestore.rules` juga langsung menolaknya.
- Password tidak pernah ditulis ke log. Setiap aksi dicatat di koleksi `logs`
  (`CREATE_USER`, `UPDATE_USER`, `RESET_PASSWORD`, `DELETE_USER`).
- Jika profil gagal ditulis setelah akun login dibuat, akun login otomatis dibatalkan (tidak ada akun yatim).

## Yang dibutuhkan (sekali saja)

1. **Paket Firebase Blaze.** Cloud Functions tidak jalan di paket gratis (Spark). Untuk sekolah dengan
   puluhan user, pemakaiannya masih jauh di dalam kuota gratis Blaze, tetapi akun billing tetap harus terpasang.
2. **Deploy fungsi.** Cara paling mudah tanpa memasang apa pun di komputer: buka
   <https://shell.cloud.google.com> (Google Cloud Shell, login dengan akun Google yang punya akses ke project), lalu:

   ```bash
   git clone https://github.com/rakajuliantoro17-art/Sarprasin.git
   cd Sarprasin
   npm install -g firebase-tools        # lewati jika perintah `firebase` sudah ada
   firebase login --no-localhost
   firebase use <ID-PROJECT-FIREBASE>   # contoh: smansasoo-sarprasin
   (cd functions && npm install && npm test)
   firebase deploy --only functions
   ```

   Jika diminta mengaktifkan API (Cloud Build, Artifact Registry, Cloud Run), jawab **Y**.
   Hanya empat fungsi ini yang ter-deploy: `createUserAccount`, `updateUserAccount`,
   `setUserPassword`, `deleteUserAccount` (region `asia-southeast2`, Jakarta).
   File lain di `functions/` (backup, exportPdf, syncSpreadsheet, webhook) belum diekspor dari `functions/index.js`.
3. Pastikan dokumen `users/{UID-anda}` punya `role: "admin"` dan `status` bukan `nonaktif`.

## Cara pakai

1. Login sebagai admin → **User Management** → **Buat Akun Baru**.
2. Isi nama, email, role, dan (untuk Operator/Guru/Wali Kelas/Viewer) ruangan yang ditugaskan.
   Password awal sudah terisi acak 12 karakter; boleh diganti (minimal 8).
3. Setelah dibuat, muncul kartu berisi alamat login, email, dan password. **Password hanya tampil sekali.**
   Salin dan sampaikan langsung ke yang bersangkutan.
4. Tombol di tiap baris: **Edit** (role/status/ruangan/email), **Password** (ganti langsung),
   **Email reset** (kirim tautan atur password dari Firebase), **Hapus** (permanen).

Tombol **Daftarkan UID yang sudah ada** tetap tersedia untuk akun yang dulu dibuat manual di Firebase Console.

## Jika Function belum ter-deploy

- *Buat Akun*, *Password*, dan *Hapus* menampilkan pesan bahwa Function belum aktif.
- *Edit* tetap bekerja untuk profil di database (role, status, ruangan), dan admin diberi tahu bahwa
  akun login (Auth) baru ikut berubah setelah Function ter-deploy.
- *Email reset* tidak butuh Function dan tetap jalan.

## Mengubah region

Region ada di dua tempat dan harus sama: `functions/index.js` (`OPTIONS.region`) dan
`src/services/firebase/firebase.functions.js` (`FUNCTIONS_REGION`).

## Pengujian

- `cd functions && npm test` menjalankan 14 uji logika (hak akses, validasi, perlindungan akun sendiri, rollback).
  Uji ini memakai Firebase tiruan, **bukan** emulator. Setelah deploy pertama, coba sekali dengan akun uji.

## Mode gratis (paket Spark, tanpa Cloud Functions)

Ini mode bawaan. Tidak perlu Blaze dan tidak perlu deploy functions.

- Buat akun: dari halaman User Management atau **Impor dari Spreadsheet** (contoh: `/contoh/contoh-akun.xlsx`, maks. 100 baris per impor).
- Ubah role/status/ruangan: langsung ke profil `users/{uid}`.
- Lupa password: tombol **Email reset**. Ganti password orang lain secara langsung TIDAK tersedia.
- Hapus: hanya menghapus profil (akun jadi tidak bisa masuk). Akun login tetap ada di Firebase Authentication.
- Ekspor daftar akun: tombol **Ekspor daftar akun** (CSV, tanpa password).

Untuk mengaktifkan fitur penuh (ganti password, hapus akun login) setelah memakai Blaze: deploy functions, lalu set env Vercel `VITE_USE_FUNCTIONS=true` dan redeploy.
