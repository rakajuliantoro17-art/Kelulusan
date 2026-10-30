# Validation Rules
## Sarprasin 2.0

---

# Overview

Dokumen ini menjelaskan standar validasi data pada Sarprasin 2.0.

Seluruh data yang masuk ke sistem harus melalui proses validasi sebelum disimpan ke Cloud Firestore.

Validation diterapkan pada:

- Dashboard
- API
- Firebase
- n8n
- Google Apps Script
- Import Spreadsheet
- AI Engine

---

# Validation Principles

Sarprasin menggunakan prinsip:

- Validate Early
- Validate Everywhere
- Fail Fast
- Consistent Rules
- Secure by Default

---

# Validation Layers

```
User Input

↓

Frontend Validation

↓

Service Validation

↓

Authentication

↓

Authorization

↓

Firestore Rules

↓

Database
```

---

# General Rules

Semua data harus:

- memiliki tipe data yang benar
- memiliki field wajib
- tidak mengandung karakter berbahaya
- memenuhi panjang minimum
- memenuhi panjang maksimum
- memenuhi referensi master
- lolos validasi bisnis

---

# Required Fields

| Field | Wajib |
|---------|:----:|
| kodeBarang | ✅ |
| namaBarang | ✅ |
| kodeKategori | ✅ |
| kodeRuang | ✅ |
| kodeKondisi | ✅ |
| tahunPengadaan | ✅ |
| nilaiPerolehan | ✅ |

---

# String Validation

Aturan.

```
Trim Space

↓

Remove Double Space

↓

Normalize
```

Panjang.

| Field | Min | Max |
|---------|----:|----:|
| namaBarang | 3 | 150 |
| kodeBarang | 3 | 50 |
| namaRuangan | 3 | 100 |
| namaKategori | 3 | 100 |

---

# Numeric Validation

Contoh.

```
tahunPengadaan

1900 <= tahun <= currentYear
```

```
nilaiPerolehan

>= 0
```

---

# Date Validation

Tanggal tidak boleh:

- format tidak valid
- lebih kecil dari 1900
- melebihi batas yang ditentukan oleh aturan bisnis

---

# Enum Validation

Status aset.

```
ACTIVE

MAINTENANCE

DAMAGED

DISPOSED
```

Role pengguna.

```
admin

executive

operator

viewer
```

---

# Boolean Validation

Field.

```
active

deleted
```

Harus bernilai:

```
true

false
```

---

# Master Data Validation

Semua referensi harus tersedia.

Contoh.

```
kodeKategori

↓

categories
```

```
kodeRuang

↓

rooms
```

```
kodeKondisi

↓

conditions
```

```
kodeSumberDana

↓

fundingSources
```

---

# Duplicate Validation

Tidak boleh ada.

```
kodeBarang
```

yang sama.

---

# File Validation

Format.

- JPG
- JPEG
- PNG
- WEBP
- PDF

Ukuran.

| File | Maksimum |
|-------|----------:|
| Image | 10 MB |
| PDF | 20 MB |

---

# Import Validation

Spreadsheet harus memenuhi:

- Header sesuai template
- Tidak ada kolom wajib kosong
- Tidak ada kode duplikat
- Tidak ada referensi master yang hilang
- Format tanggal valid

---

# AI Validation

Hasil AI harus:

- memiliki confidence score
- tidak mengubah data langsung
- menghasilkan rekomendasi
- dicatat pada log

---

# Automation Validation

Workflow n8n harus memverifikasi:

- Payload
- Authentication
- Required Field
- Timestamp
- Signature (Webhook)

---

# Business Rules

## Asset

kodeBarang harus unik.

---

namaBarang tidak boleh kosong.

---

tahunPengadaan tidak boleh lebih besar dari tahun berjalan.

---

nilaiPerolehan tidak boleh negatif.

---

status harus termasuk enum yang diizinkan.

---

# User Rules

Email harus unik.

Role harus valid.

Status aktif wajib berupa boolean.

---

# Report Rules

Format.

PDF

XLSX

CSV

---

# Error Response

Contoh.

```json
{
  "success": false,
  "errors": [
    {
      "field": "kodeBarang",
      "message": "Kode barang sudah digunakan."
    }
  ]
}
```

---

# Validation Flow

```
Input

↓

Frontend

↓

Service

↓

Firestore Rules

↓

Save
```

---

# Logging

Semua kegagalan validasi dicatat.

Collection.

```
logs
```

Contoh.

```
VALIDATION_FAILED

IMPORT_FAILED

UPLOAD_FAILED

SECURITY_DENIED
```

---

# Performance Target

| Aktivitas | Target |
|-----------|---------|
| Form Validation | < 100 ms |
| Import Validation | < 5 detik |
| Firestore Validation | < 300 ms |

---

# Future Validation

Tahap berikutnya.

- Duplicate Detection AI
- OCR Validation
- Image Validation
- Predictive Validation
- Data Quality Engine
- Auto Correction Suggestion

---

# Best Practices

- Validasi dilakukan di frontend untuk pengalaman pengguna.
- Validasi utama tetap dilakukan di Service Layer.
- Firestore Rules menjadi lapisan keamanan terakhir.
- Jangan mempercayai data dari klien.
- Semua referensi harus mengarah ke master data.
- Gunakan audit log untuk setiap kegagalan validasi.

---

# Long-Term Vision

Validation Rules menjadi standar kualitas data Sarprasin 2.0. Dengan aturan yang konsisten di seluruh lapisan aplikasi, sistem mampu menjaga integritas data, meminimalkan kesalahan input, serta mendukung pengembangan AI, otomasi, dan integrasi lintas platform tanpa mengorbankan kualitas informasi.
