# Migration Workflow
## Sarprasin 2.0

Version : 1.0.0

---

# Overview

Dokumen ini menjelaskan prosedur migrasi data pada Sarprasin 2.0.

Migrasi dilakukan ketika terdapat perubahan struktur data, perpindahan sumber data, atau pembaruan versi aplikasi yang memerlukan penyesuaian skema.

Seluruh proses migrasi harus dapat ditelusuri, divalidasi, dan apabila diperlukan dapat dikembalikan (rollback).

---

# Objectives

Migration Workflow bertujuan untuk:

- Menjaga integritas data.
- Memastikan tidak ada kehilangan data.
- Mendukung perubahan skema.
- Menyediakan rollback.
- Mendokumentasikan seluruh proses migrasi.

---

# Supported Migration

## Spreadsheet → Firestore

Migrasi awal dari Google Spreadsheet menuju Cloud Firestore.

---

## Firestore Schema Upgrade

Migrasi struktur koleksi atau field.

---

## CSV Import

Import data dari CSV.

---

## Excel Import

Import data dari Excel.

---

## Backup Restore

Migrasi dari hasil backup menuju Firestore.

---

## Version Upgrade

Migrasi akibat perubahan versi aplikasi.

---

# Migration Principles

Migrasi harus:

- Aman
- Dapat diulang (idempotent)
- Memiliki validasi
- Memiliki rollback
- Tercatat pada audit log

---

# Migration Flow

```
Source Data

↓

Validation

↓

Backup

↓

Transformation

↓

Migration

↓

Verification

↓

Log

↓

Notification
```

---

# Source Data

Data dapat berasal dari:

- Google Spreadsheet
- Firestore
- CSV
- Excel
- JSON
- Backup Archive

---

# Validation

Sebelum migrasi dilakukan:

- Validasi format.
- Validasi tipe data.
- Validasi referensi.
- Validasi field wajib.
- Validasi duplikasi.

Migrasi tidak dijalankan apabila validasi gagal.

---

# Backup

Sebelum migrasi:

- Full Backup Firestore.
- Backup Spreadsheet.
- Backup Storage Metadata.

Backup wajib berhasil sebelum proses dilanjutkan.

---

# Transformation

Tahap transformasi digunakan untuk:

- Rename Field
- Rename Collection
- Konversi Format
- Mapping Data
- Normalisasi Nilai
- Pembersihan Data

Contoh:

```
nama_barang

↓

assetName
```

---

# Migration Execution

Urutan eksekusi:

1. Backup.
2. Validasi.
3. Transformasi.
4. Migrasi.
5. Verifikasi.
6. Audit Log.
7. Notifikasi.

---

# Verification

Setelah migrasi selesai:

- Hitung jumlah record.
- Bandingkan jumlah sebelum dan sesudah migrasi.
- Pastikan relasi tetap valid.
- Pastikan tidak ada data yang hilang.
- Pastikan tidak ada field wajib yang kosong.

---

# Rollback

Rollback dilakukan apabila:

- Migrasi gagal.
- Validasi akhir gagal.
- Terjadi inkonsistensi data.
- Administrator membatalkan proses.

Alur:

```
Migration Failed

↓

Restore Backup

↓

Validation

↓

Audit Log

↓

Notification
```

---

# Migration Status

Status yang tersedia:

- Pending
- Running
- Completed
- Failed
- Rolled Back
- Cancelled

---

# Logging

Setiap migrasi mencatat:

- Migration ID
- Tanggal
- Waktu
- Operator
- Versi aplikasi
- Versi skema
- Jumlah data
- Durasi
- Status
- Catatan

---

# Notification

Setelah migrasi selesai:

Administrator menerima:

- Dashboard Notification
- Email (Opsional)
- Telegram (Opsional)

Jika gagal:

- Error Report
- Validation Report
- Rollback Status

---

# Security

Migrasi hanya dapat dilakukan oleh:

- Super Admin
- Administrator

Seluruh aktivitas dicatat pada Audit Log.

---

# Recovery Plan

Apabila terjadi kegagalan:

1. Hentikan proses.
2. Jalankan rollback.
3. Validasi hasil restore.
4. Periksa audit log.
5. Lakukan investigasi sebelum migrasi ulang.

---

# Performance Targets

| Parameter | Target |
|------------|---------|
| Validasi | < 30 detik |
| Transformasi | < 60 detik |
| Migrasi | Bergantung pada volume data |
| Verifikasi | < 60 detik |

---

# Migration Checklist

Sebelum migrasi:

- Backup berhasil.
- Validasi selesai.
- Pengguna diberi pemberitahuan jika diperlukan.
- Operator memiliki hak akses.

Sesudah migrasi:

- Verifikasi berhasil.
- Audit log tersimpan.
- Notifikasi dikirim.
- Dokumentasi diperbarui.

---

# Related Documents

- database/firestore-schema.md
- database/migration-plan.md
- database/validation-rules.md
- workflows/backup.md
- workflows/restore.md
- architecture/system-architecture.md

---

# Long-Term Vision

Migration Workflow memastikan seluruh perubahan struktur data pada Sarprasin 2.0 dapat dilakukan secara aman, terdokumentasi, dan dapat dipulihkan apabila terjadi kegagalan. Dengan proses validasi, backup, verifikasi, dan rollback yang terstandar, sistem tetap andal seiring berkembangnya fitur dan versi aplikasi.
