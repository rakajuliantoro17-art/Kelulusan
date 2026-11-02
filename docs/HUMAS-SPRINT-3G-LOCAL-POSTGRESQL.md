# HUMAS Sprint 3G — Local PostgreSQL Integration

## Tujuan dan batas keselamatan

Sprint ini memvalidasi migrasi HUMAS 001–005 pada PostgreSQL lokal sebelum ada keputusan integrasi ke Supabase.

- Target database wajib bernama `pintuku_humas_test`.
- Runner PowerShell menolak host selain `localhost`, `127.0.0.1`, atau `::1`.
- Tidak membuat Supabase Branch atau proyek cloud.
- Tidak mengubah Supabase Production.
- Bootstrap menyediakan simulasi minimal `auth.users` dan role `anon`, `authenticated`, `service_role`. Ini bukan implementasi Supabase Auth.
- Semua fixture integration test berada dalam transaksi yang di-rollback.

## Prasyarat

1. Windows 10/11.
2. PostgreSQL lokal terinstal (disarankan PostgreSQL 17 untuk mendekati versi Supabase Production saat audit).
3. PostgreSQL Command Line Tools tersedia di PATH (`psql` dan `createdb`).
4. Repository `rakajuliantoro17-art/Kelulusan` sudah di-clone dan terminal berada di root repository.
5. Akun administrator PostgreSQL lokal untuk membuat database dan role test.

Tidak perlu Docker, Supabase Branch, atau layanan berbayar.

## Langkah 1 — Buat database kosong

Di PowerShell:

```powershell
createdb -U postgres pintuku_humas_test
```

Alternatif melalui pgAdmin: buat database baru bernama `pintuku_humas_test`.

Gunakan database khusus ini. Jangan arahkan runner ke database aplikasi lain.

## Langkah 2 — Atur koneksi lokal

Di PowerShell yang sama:

```powershell
$env:HUMAS_TEST_DATABASE_URL = "postgresql://postgres:<PASSWORD_LOKAL>@localhost:5432/pintuku_humas_test"
```

Ganti placeholder dengan password PostgreSQL lokal. Jika password berisi karakter khusus URI (misalnya `@`, `#`, atau `%`), lakukan URL-encoding. Jangan commit URI, jangan masukkan ke file repository, dan jangan kirim password ke chat.

## Langkah 3 — Jalankan runner

Dari root repository:

```powershell
.\scripts\humas-local-test.ps1
```

Runner melakukan tiga tahap:
1. Bootstrap compatibility scaffold.
2. Menjalankan migrasi 001 sampai 005 berurutan.
3. Menjalankan integration smoke tests.

Runner berhenti pada error pertama. Periksa pesan PostgreSQL dan jangan lanjutkan dengan mengubah database Production.

## Cakupan integration smoke test

- Staff HUMAS aktif dapat membuat mitra.
- Perubahan data dan status mitra tercatat sebagai audit event.
- Draft MoU hanya dapat dibuat terhadap mitra aktif.
- Pembuatan draft menghasilkan satu event `draft_created`; tidak menyetujui atau menandatangani perjanjian.
- Principal ditolak dari RPC tulis khusus staff.
- Staff HUMAS yang sudah nonaktif ditolak oleh trigger audit.
- Fixture test di-rollback setelah skenario selesai.

## Batas cakupan

Runner ini adalah integration smoke test awal, bukan bukti bahwa seluruh sistem siap produksi. Ia belum menguji:
- Supabase Auth sesungguhnya, JWT, refresh token, atau session revocation.
- Supabase Data API, schema exposure, dan konfigurasi Storage.
- Seluruh kombinasi RLS dan privilege pada semua tabel.
- Concurrency, deadlock, race condition, dan beban tinggi.
- Browser, Vercel runtime, atau integrasi UI.
- Approval, rekomendasi, tanda tangan, registrasi, dan arsip MoU.

## Kriteria hasil

- **PASS lokal:** bootstrap, seluruh migrasi, dan seluruh smoke test selesai tanpa error.
- **FAIL lokal:** salah satu migrasi atau assertion gagal; temuan harus diperbaiki dan seluruh runner diulang pada database test lokal yang bersih.
- **Belum dijalankan:** PostgreSQL belum tersedia di komputer pengguna atau runner belum dieksekusi.

Status dokumen ini: runner dan test SQL telah disiapkan di repository; eksekusi pada komputer Windows pengguna masih menunggu lingkungan PostgreSQL lokal. Tidak ada klaim bahwa integrasi database sudah lulus.
