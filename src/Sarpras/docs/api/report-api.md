# Report API
## Sarprasin 2.0

---

# Overview

Report API merupakan layanan yang bertugas menghasilkan laporan inventaris, statistik, analitik, dan dokumen resmi berdasarkan data pada Cloud Firestore.

Seluruh laporan dibuat secara dinamis menggunakan data terbaru dan dapat diekspor ke berbagai format.

---

# Report Architecture

```
Firestore

↓

Asset Service

↓

Dashboard Service

↓

Report Service

↓

Report API

↓

PDF
Excel
CSV
Print
Dashboard
n8n
```

---

# Data Sources

Report API menggunakan collection berikut.

```
aset
```

```
users
```

```
masterRuangan
```

```
masterKondisi
```

```
masterSumberDana
```

```
logAktivitas
```

```
maintenance
```

*(Phase 2)*

---

# Report Categories

Sarprasin mendukung beberapa jenis laporan.

---

## Asset Report

Berisi daftar seluruh aset.

Informasi:

- Kode Barang
- Nama Barang
- Ruangan
- Kondisi
- Tahun
- Nilai
- Sumber Dana

---

## Room Report

Laporan berdasarkan ruangan.

Contoh:

```
Lab Komputer 1

Jumlah Barang

54

Total Nilai

Rp468.000.000
```

---

## Condition Report

Laporan kondisi aset.

Kategori:

- Baik
- Perlu Perbaikan
- Rusak Berat

---

## Financial Report

Laporan nilai aset.

Informasi:

- Total Nilai
- Nilai per Ruangan
- Nilai per Sumber Dana
- Nilai per Tahun

---

## Maintenance Report

*(Phase 2)*

Berisi:

- Jadwal servis
- Riwayat servis
- Biaya servis
- Prediksi servis

---

## AI Report

*(Phase 2)*

Berisi:

- Asset Health Score
- Recommendation
- Predictive Maintenance
- Data Quality Score
- Self Correction Summary

---

## Activity Report

Berisi histori aktivitas pengguna.

Informasi:

- Login
- Logout
- Input Aset
- Edit Aset
- Delete
- Approval
- Backup
- Restore

---

# Report Format

Laporan dapat diekspor ke:

- PDF
- Excel (XLSX)
- CSV
- JSON
- Print Preview

---

# Report Filters

Filter yang tersedia.

- Ruangan
- Tahun
- Kondisi
- Sumber Dana
- Rentang Tanggal
- Pengguna
- Nilai Aset

---

# Example Request

```json
{
  "type": "asset",
  "format": "pdf",
  "filter": {
    "kodeRuang": "LABKOM01",
    "tahun": 2026
  }
}
```

---

# Example Response

```json
{
  "success": true,
  "fileName": "asset-report-2026.pdf",
  "downloadUrl": "https://..."
}
```

---

# Report Metadata

Setiap laporan memiliki metadata.

```json
{
  "generatedBy": "admin",
  "generatedAt": "Timestamp",
  "version": "2.0",
  "totalRecord": 842
}
```

---

# Scheduled Report

Report dapat dibuat otomatis.

Contoh.

```
Setiap Senin

↓

Generate

↓

PDF

↓

Email Kepala Sekolah
```

Workflow ini dijalankan menggunakan n8n.

---

# Report Workflow

```
User

↓

Request Report

↓

Validation

↓

Firestore

↓

Report Service

↓

Formatter

↓

Export

↓

Download
```

---

# Security

Public

Tidak dapat membuat laporan.

---

User

Hanya laporan sesuai hak akses.

---

Executive

Laporan strategis dan ringkasan.

---

Admin

Seluruh laporan.

---

# Logging

Seluruh proses pembuatan laporan dicatat.

Collection

```
logAktivitas
```

Aktivitas:

```
GENERATE_REPORT

EXPORT_PDF

EXPORT_EXCEL

EXPORT_CSV

PRINT_REPORT
```

---

# Performance Target

| Report | Target |
|----------|--------|
| PDF | < 5 detik |
| Excel | < 3 detik |
| CSV | < 2 detik |
| JSON | < 1 detik |

---

# Integration

Report API digunakan oleh:

- Dashboard
- Executive Dashboard
- Admin Dashboard
- AI Engine
- Recommendation Engine
- n8n Workflow
- Backup Service

---

# Future Development

Fase berikutnya akan mendukung:

- Template laporan dinamis
- Digital Signature
- QR Verification
- Watermark Dokumen
- Scheduled Report
- Email Otomatis
- WhatsApp Notification
- Google Drive Archive
- Versioning Dokumen

---

# API Version

Current Version

```
v2.0
```

Status

```
Development
```
