# HUMAS Sprint 3G — Local PostgreSQL Integration

## Tujuan dan batas keselamatan

Sprint ini memvalidasi migrasi HUMAS 001–006 pada PostgreSQL lokal sebelum ada keputusan integrasi ke Supabase.

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
5. Repository `rakajuliantoro17-art/Kelulusan` sudah di-clone dan terminal berada di root repository.
6. Akun administrator PostgreSQL lokal untuk membuat database dan role test.

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

Runner melakukan empat tahap:
1. Bootstrap compatibility scaffold.
2. Menjalankan migrasi 001 sampai 006 berurutan.
3. Menjalankan integration smoke tests.
4. Menjalankan assertion katalog untuk RLS, schema/table grants, function EXECUTE, dan hak mutasi audit.

Runner berhenti pada error pertama. Periksa pesan PostgreSQL dan jangan lanjutkan dengan mengubah database Production.

## Cakupan integration smoke test

- Staff HUMAS aktif dapat membuat mitra.
- Perubahan data dan status mitra tercatat sebagai audit event.
- Draft MoU hanya dapat dibuat terhadap mitra aktif.
- Pembuatan draft menghasilkan satu event `draft_created`; tidak menyetujui atau menandatangani perjanjian.
- Principal ditolak dari RPC tulis khusus staff.
- Staff HUMAS yang sudah nonaktif ditolak oleh trigger audit dan tidak meninggalkan record mitra.
- Label role `NULL` ditolak oleh RPC partner dan draft.
- Status mitra `NULL` ditolak.
- Pemeriksaan security memastikan RLS aktif pada tujuh tabel, tidak ada policy browser, role browser tidak mendapat akses langsung, serta audit timeline tidak dapat di-update/delete oleh `service_role`.
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

## Status pekerjaan Sprint 3G.2–3G.9

| Tahap | Status saat ini | Bukti |
|---|---|---|
| 3G.2 Migrasi 001–006 | **NOT RUN** | Runner sudah menjalankan urutan migrasi, tetapi belum dieksekusi pada PostgreSQL lokal pengguna |
| 3G.3 RBAC/RLS | **TEST READY** | Assertion RLS, privilege, dan function grants tersedia |
| 3G.4 Partner transaction | **TEST READY** | Create, update, status, audit atomik, dan rollback actor tidak aktif |
| 3G.5 Agreement draft | **TEST READY** | Draft-only dan event `draft_created` |
| 3G.6 Security | **TEST READY** | Null-role guard, active-role trigger, browser access denial, append-only audit |
| 3G.7 Remediasi | **SOURCE FIX APPLIED** | Perbandingan role menggunakan `IS DISTINCT FROM`; status NULL ditolak; migration 006 membuat role `system_operator` eksklusif dari role bisnis aktif |
| 3G.8 Dokumentasi/release gate | **DOCUMENTED** | Hasil dan batas pengujian dicatat di dokumen ini |
| 3G.9 Pemisahan operator | **SOURCE FIX APPLIED** | Migration 006 menolak akun `system_operator` yang juga memegang role bisnis aktif; diuji pada integration harness |

### Pemeriksaan sumber setelah penguatan

Pemeriksaan konsistensi sumber sebelumnya dilakukan terhadap lima migration, tiga SQL test, PowerShell runner, dan dokumen Sprint 3G. Migration 006 dan pengujian pemisahan operator ditambahkan setelah audit lanjutan. Hasilnya **22/22 assertion sumber PASS pada baseline sebelumnya; pemeriksaan tambahan untuk migration 006 harus dijalankan kembali dari checkout lokal**. Cakupan meliputi urutan migrasi, RLS, RPC, active-role guard, penolakan NULL role/status, append-only privilege, rollback fixture, database guard, dan pemanggilan test runner.

Satu temuan diperbaiki sebelum pemeriksaan ini: penggunaan operator `<>` untuk validasi role dan status dapat menghasilkan UNKNOWN ketika input NULL. Migrasi 003, 004, dan 005 kini menggunakan `IS DISTINCT FROM` untuk label role; fungsi perubahan status juga menolak status NULL.

Pemeriksaan 22 assertion tersebut adalah validasi teks/sumber, bukan eksekusi SQL oleh PostgreSQL. Ia tidak membuktikan bahwa sintaks seluruh SQL berhasil diparse atau bahwa privilege/RLS bekerja di server nyata.

**Penting:** TEST READY bukan PASS runtime. Status keseluruhan Sprint 3G tetap **BLOCKED / NO-GO** sampai runner berhasil dijalankan pada PostgreSQL lokal dan seluruh hasilnya diperiksa. Tidak ada klaim bahwa integrasi database sudah lulus.


## Pembaruan audit lanjutan — Sprint 3G.9

Review ulang terhadap branch `main` menemukan dua pemeriksaan role pada `partner_update` dan `partner_set_status` yang masih memakai operator SQL `<>`. Keduanya telah diganti menjadi `IS DISTINCT FROM` agar role bernilai NULL selalu ditolak. Perbaikan ini harus diuji ulang pada PostgreSQL lokal.

Migration `202611020006_humas_operator_role_separation.sql` menambahkan trigger yang menjaga akun `system_operator` tetap eksklusif dari role bisnis aktif. Perubahan identitas role pada satu assignment dibuat immutable; pencabutan dilakukan melalui status aktif/revoked. Integration harness dan security assertion diperbarui untuk memeriksa aturan ini.

Status tetap **NOT RUN** sampai pengguna menjalankan runner pada PostgreSQL lokal. Perubahan sumber dan test harness bukan bukti runtime.
