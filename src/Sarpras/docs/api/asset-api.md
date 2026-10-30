# Asset API
## Sarprasin 2.0

---

# Overview

Asset API merupakan layanan utama yang bertanggung jawab terhadap seluruh operasi data aset pada Sarprasin.

Seluruh dashboard (User, Executive, Admin, Public), Automation (n8n), dan modul AI menggunakan layanan ini sebagai sumber data utama.

Database utama menggunakan Cloud Firestore.

---

# Collection

```
aset
```

---

# Firestore Structure

```
aset/

    {kodeBarang}

        namaBarang

        kodeRuang

        kodeKondisi

        tahun

        kodeSumber

        nilai

        foto

        createdAt

        updatedAt
```

---

# Asset Model

```json
{
  "kodeBarang": "KOMP-2026-001",
  "namaBarang": "Komputer Lenovo ThinkCentre",
  "kodeRuang": "LABKOM01",
  "kodeKondisi": "BAIK",
  "tahun": 2026,
  "kodeSumber": "BOSP",
  "nilai": 8500000,
  "foto": "https://...",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

# Operations

Asset API mendukung operasi berikut.

| Operasi | Status |
|----------|--------|
| Create Asset | ✅ |
| Read Asset | ✅ |
| Update Asset | ✅ |
| Delete Asset | ✅ |
| Search Asset | ✅ |
| Filter Asset | ✅ |
| Upload Photo | ✅ |
| Asset History | Phase 2 |
| QR Inventory | Phase 2 |

---

# Create Asset

## Description

Menambahkan aset baru.

---

Input

```json
{
  "namaBarang": "...",
  "kodeRuang": "...",
  "kodeKondisi": "...",
  "tahun": 2026,
  "kodeSumber": "...",
  "nilai": 0
}
```

---

Validation

- namaBarang wajib
- kodeRuang harus ada di masterRuangan
- kodeKondisi harus valid
- tahun tidak boleh melebihi tahun berjalan
- nilai ≥ 0

---

Output

```json
{
  "success": true,
  "kodeBarang": "KOMP-2026-001"
}
```

---

# Read Asset

Mengambil satu aset berdasarkan kodeBarang.

Input

```
kodeBarang
```

Output

Seluruh data aset.

---

# Update Asset

Field yang dapat diperbarui:

- namaBarang
- kodeRuang
- kodeKondisi
- tahun
- kodeSumber
- nilai
- foto

Setiap perubahan harus memperbarui

```
updatedAt
```

---

# Delete Asset

Penghapusan dilakukan menggunakan Soft Delete.

Field tambahan:

```
deleted

deletedAt

deletedBy
```

Data tidak langsung dihapus dari Firestore.

---

# Search Asset

Mendukung pencarian berdasarkan:

- kodeBarang
- namaBarang
- ruangan
- kondisi
- sumber dana
- tahun

---

# Filter Asset

Contoh filter:

```
Ruangan

↓

Lab Komputer
```

---

```
Kondisi

↓

Baik
```

---

```
Tahun

↓

2025
```

---

```
Sumber Dana

↓

BOSP
```

---

# Upload Photo

Foto disimpan pada Firebase Storage.

Firestore hanya menyimpan URL.

---

Supported Format

- JPG
- PNG
- WEBP

---

Maximum Size

5 MB

---

# QR Code

Setiap aset memiliki QR Code unik.

Contoh

```
QR

↓

kodeBarang

↓

Detail Aset
```

---

# Logging

Setiap perubahan aset menghasilkan log.

Collection

```
logAktivitas
```

Field

- tanggal
- aktivitas
- user
- kodeBarang

---

# Security

Role User

- Create
- Read
- Update

Tidak dapat menghapus aset.

---

Role Executive

- Read
- Dashboard
- Report

---

Role Admin

- Full Access

---

# Automation

Setelah Create Asset.

```
Firestore

↓

Trigger

↓

n8n

↓

Backup Spreadsheet

↓

Notification

↓

Dashboard Update
```

---

# AI Integration

Setiap aset menjadi input bagi:

- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Machine Learning

---

# Error Response

Contoh

```json
{
  "success": false,
  "message": "Kode Ruangan tidak ditemukan."
}
```

---

# Success Response

```json
{
  "success": true,
  "message": "Asset berhasil disimpan."
}
```

---

# Future Development

Pada fase berikutnya Asset API akan mendukung:

- Batch Import (Excel/CSV)
- Bulk Update
- Bulk Delete
- Asset Versioning
- Asset History
- Barcode Scanner
- QR Scanner
- Offline Synchronization
- Computer Vision untuk identifikasi aset dari foto

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
