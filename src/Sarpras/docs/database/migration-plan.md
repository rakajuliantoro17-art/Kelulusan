# Database Migration Plan
## Sarprasin 2.0

---

# Overview

Dokumen ini menjelaskan strategi migrasi data dari sistem Sarpras sebelumnya menuju Sarprasin 2.0.

Migrasi dilakukan secara bertahap agar operasional sekolah tetap berjalan dan risiko kehilangan data dapat diminimalkan.

---

# Migration Objectives

Tujuan migrasi:

- Memindahkan seluruh data ke Cloud Firestore
- Menjaga integritas data
- Mempertahankan histori aset
- Memastikan tidak ada kehilangan data
- Memvalidasi hasil migrasi
- Menyediakan mekanisme rollback

---

# Source System

Sistem lama terdiri dari:

- Google Spreadsheet
- Google Apps Script
- Manual Import
- Dokumen Pendukung

---

# Target System

Seluruh data akan dipindahkan ke:

```
Cloud Firestore
```

Firestore menjadi **Single Source of Truth**.

Google Spreadsheet tetap digunakan sebagai:

- Backup
- Arsip
- Import
- Export
- Pelaporan

---

# Migration Strategy

Menggunakan pendekatan:

```
Parallel Migration
```

```
Old System

↓

Data Export

↓

Validation

↓

Firestore Import

↓

Verification

↓

Parallel Operation

↓

Go Live
```

---

# Migration Phases

## Phase 1

Persiapan.

- Backup Spreadsheet
- Backup Apps Script
- Backup Dokumen

---

## Phase 2

Analisis data.

- Identifikasi tabel
- Identifikasi relasi
- Identifikasi data kosong
- Identifikasi data duplikat

---

## Phase 3

Normalisasi data.

- Standarisasi kode
- Perbaikan format tanggal
- Perbaikan penulisan
- Penghapusan duplikasi

---

## Phase 4

Pemetaan schema.

Spreadsheet → Firestore

---

## Phase 5

Import Firestore.

Menggunakan:

- Firebase Admin SDK
- Migration Script
- Batch Write

---

## Phase 6

Validasi.

- Jumlah record
- Integritas relasi
- Audit sampling
- Pengujian aplikasi

---

## Phase 7

Parallel Operation.

Spreadsheet dan Firestore berjalan bersamaan selama masa transisi.

---

## Phase 8

Go Live.

Seluruh aplikasi menggunakan Firestore.

Spreadsheet berubah fungsi menjadi arsip dan backup.

---

# Migration Workflow

```
Spreadsheet

↓

Validation

↓

Cleaning

↓

Transformation

↓

Firestore Import

↓

Verification

↓

Dashboard
```

---

# Collection Mapping

| Spreadsheet | Firestore |
|-------------|-----------|
| Data Aset | assets |
| Data Ruangan | rooms |
| Data Kondisi | conditions |
| Data Kategori | categories |
| Data Dana | fundingSources |
| User | users |
| Log | logs |

---

# Data Transformation

Contoh.

Spreadsheet:

```
Lab Komputer
```

↓

Firestore

```
kodeRuang

LABKOM01
```

---

Spreadsheet:

```
Baik
```

↓

Firestore

```
kodeKondisi

BAIK
```

---

Spreadsheet:

```
Komputer
```

↓

Firestore

```
kodeKategori

KOMPUTER
```

---

# Data Validation Rules

Setiap record harus memenuhi:

- Kode unik
- Nama tidak kosong
- Relasi valid
- Nilai numerik valid
- Tahun valid
- Referensi master tersedia

---

# Duplicate Handling

Jika ditemukan data ganda.

```
Duplicate

↓

Review

↓

Merge

↓

Import
```

---

# Missing Data

Data yang tidak lengkap.

```
Flag

↓

Manual Review

↓

Correction

↓

Import
```

---

# Migration Scripts

Script utama:

```
migration.service.js
```

Apps Script:

```
Migration.gs
```

---

# Batch Strategy

Import menggunakan batch.

Contoh.

```
500 dokumen

↓

Commit

↓

500 dokumen

↓

Commit
```

Batch kecil mengurangi risiko kegagalan.

---

# Verification

Setelah import.

Periksa:

- Total dokumen
- Total aset
- Total ruangan
- Total kategori
- Total kondisi
- Total sumber dana

---

# Acceptance Criteria

Migrasi dianggap berhasil apabila:

- Seluruh data berhasil dipindahkan
- Tidak ada data hilang
- Tidak ada relasi rusak
- Dashboard dapat membaca data
- Laporan sesuai dengan sistem lama

---

# Rollback Plan

Jika terjadi masalah.

```
Stop Import

↓

Restore Backup

↓

Perbaiki Script

↓

Ulangi Import
```

---

# Logging

Seluruh proses migrasi dicatat.

Collection:

```
logs
```

Contoh.

```
MIGRATION_STARTED

MIGRATION_BATCH

MIGRATION_COMPLETED

MIGRATION_FAILED
```

---

# Testing

Pengujian dilakukan pada:

- Jumlah record
- Relasi data
- Dashboard
- Report
- Automation
- AI Readiness

---

# Risk Assessment

| Risiko | Mitigasi |
|----------|----------|
| Data Hilang | Backup penuh sebelum migrasi |
| Data Duplikat | Validasi & deduplikasi |
| Format Tidak Konsisten | Transformasi data |
| Relasi Rusak | Mapping master data |
| Gagal Import | Batch Write & Retry |

---

# Success Metrics

Target migrasi:

- 100% data utama berhasil dipindahkan
- 0 kehilangan data
- 100% relasi valid
- Waktu migrasi sesuai jadwal
- Dashboard dapat digunakan tanpa perubahan data

---

# Future Migration

Tahap berikutnya mendukung:

- Multi Sekolah
- Import CSV
- Import Excel
- Import API
- Sinkronisasi dua arah (opsional)
- Migrasi otomatis terjadwal

---

# Long-Term Vision

Migrasi menuju Sarprasin 2.0 merupakan langkah strategis untuk memindahkan sistem dari Spreadsheet sebagai basis operasional menjadi Cloud Firestore sebagai pusat data utama. Dengan strategi migrasi bertahap, validasi berlapis, dan operasi paralel, transisi dapat dilakukan secara aman tanpa mengganggu layanan kepada pengguna.
