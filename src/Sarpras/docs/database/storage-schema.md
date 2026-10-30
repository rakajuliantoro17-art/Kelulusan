# Storage Schema
## Sarprasin 2.0

---

# Overview

Dokumen ini menjelaskan struktur Firebase Storage yang digunakan pada Sarprasin 2.0.

Firebase Storage berfungsi sebagai media penyimpanan seluruh file digital yang digunakan aplikasi.

Cloud Firestore hanya menyimpan metadata file, sedangkan isi file disimpan di Firebase Storage.

---

# Objectives

Firebase Storage digunakan untuk:

- Foto aset
- Dokumen aset
- QR Code
- Laporan PDF
- Backup
- Avatar pengguna
- Lampiran maintenance
- Dataset AI
- Model AI
- File sementara

---

# Storage Architecture

```
User

↓

Application

↓

Firebase Storage

↓

Firestore Metadata

↓

Dashboard
```

---

# Storage Structure

```
storage/

assets/

avatars/

documents/

maintenance/

reports/

backup/

imports/

exports/

qrcode/

settings/

temporary/

ai/

logs/
```

---

# Folder Description

## assets/

Menyimpan foto aset.

Contoh.

```
assets/

2026/

LABKOM-2026-001/

foto1.jpg

foto2.jpg
```

---

## avatars/

Foto profil pengguna.

```
avatars/

UID/

profile.jpg
```

---

## documents/

Dokumen aset.

Contoh.

```
documents/

LABKOM-2026-001/

invoice.pdf

manual.pdf

garansi.pdf
```

---

## maintenance/

Dokumentasi maintenance.

```
maintenance/

maintenanceId/

before.jpg

after.jpg

report.pdf
```

---

## reports/

Laporan PDF.

```
reports/

2026/

inventory.pdf

executive.pdf
```

---

## backup/

File backup.

```
backup/

daily/

weekly/

monthly/
```

---

## imports/

File import.

```
imports/

excel/

csv/
```

---

## exports/

File export.

```
exports/

excel/

pdf/

csv/
```

---

## qrcode/

QR Code.

```
qrcode/

LABKOM-2026-001.png
```

---

## settings/

Logo sekolah.

Background.

Favicon.

Theme.

---

## temporary/

Temporary upload.

File otomatis dihapus setelah proses selesai.

---

## ai/

Folder AI.

```
datasets/

models/

prediction/

recommendation/
```

---

## logs/

File log.

Import.

Export.

Migration.

Backup.

---

# Metadata

Metadata file disimpan pada Firestore.

Contoh.

```json
{
  "fileName":"foto1.jpg",

  "storagePath":"assets/2026/LABKOM-2026-001/foto1.jpg",

  "downloadURL":"",

  "size":512000,

  "mimeType":"image/jpeg",

  "uploadedBy":"uid",

  "uploadedAt":"Timestamp"
}
```

---

# Supported File Types

## Image

- JPG
- JPEG
- PNG
- WEBP

---

## Document

- PDF
- DOCX
- XLSX
- CSV

---

## Archive

- ZIP

---

# File Naming

Gunakan nama yang konsisten.

Contoh.

```
LABKOM-2026-001.jpg
```

```
maintenance-00021.pdf
```

```
inventory-report-20260715.pdf
```

---

# Maximum File Size

| Jenis | Maksimum |
|---------|----------:|
| Foto | 10 MB |
| PDF | 20 MB |
| Spreadsheet | 20 MB |
| ZIP | 100 MB |

---

# Upload Workflow

```
User

↓

Validation

↓

Upload Storage

↓

Generate URL

↓

Save Metadata

↓

Firestore
```

---

# Download Workflow

```
Firestore

↓

Storage Path

↓

Generate URL

↓

Download
```

---

# Storage Security

Seluruh akses mengikuti Firebase Storage Rules.

Role:

| Folder | Admin | Executive | Operator | Viewer |
|---------|:----:|:---------:|:--------:|:------:|
| assets | RW | R | RW | R |
| documents | RW | R | RW | R |
| reports | RW | R | R | R |
| backup | RW | - | - | - |
| ai | RW | R | - | - |
| settings | RW | R | - | R |

Keterangan:

- R = Read
- RW = Read & Write

---

# Versioning

Dokumen penting dapat memiliki versi.

Contoh.

```
manual-v1.pdf

manual-v2.pdf

manual-v3.pdf
```

---

# Cleanup Policy

Folder temporary dibersihkan otomatis.

```
24 Jam

↓

Delete
```

---

# Backup Strategy

Storage dibackup secara berkala.

```
Storage

↓

Archive

↓

Google Drive

↓

Recovery
```

---

# Restore

Jika file hilang.

```
Google Drive

↓

Restore

↓

Storage

↓

Verification
```

---

# Logging

Semua aktivitas file dicatat.

Collection.

```
logs
```

Contoh.

```
UPLOAD_FILE

DELETE_FILE

DOWNLOAD_FILE

RESTORE_FILE
```

---

# Performance Target

| Aktivitas | Target |
|------------|---------|
| Upload Foto | < 5 detik |
| Upload PDF | < 10 detik |
| Download | < 3 detik |
| Generate QR | < 2 detik |

---

# Future Development

Tahap berikutnya.

- Image Compression
- Thumbnail Generator
- OCR Dokumen
- AI Image Analysis
- Duplicate Detection
- CDN Optimization
- Malware Scanning
- Signed URL

---

# Best Practices

- Firestore hanya menyimpan metadata file.
- File disimpan pada Firebase Storage.
- Gunakan struktur folder yang konsisten.
- Hindari nama file dengan spasi.
- Validasi ukuran dan tipe file sebelum upload.
- Gunakan UUID atau kode aset untuk menghindari konflik nama.

---

# Long-Term Vision

Firebase Storage menjadi repositori terpusat untuk seluruh file digital Sarprasin 2.0. Dengan pemisahan antara metadata di Firestore dan berkas di Storage, sistem tetap ringan, aman, mudah diaudit, dan siap mendukung pertumbuhan data dalam skala besar, termasuk integrasi AI, otomasi, dan multi-sekolah.
