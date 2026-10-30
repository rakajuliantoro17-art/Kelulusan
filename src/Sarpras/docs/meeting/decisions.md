# Architecture Decisions
## Sarprasin 2.0

---

# Overview

Dokumen ini mencatat seluruh keputusan arsitektur dan teknis yang diambil selama pengembangan Sarprasin 2.0.

Setiap keputusan disertai dengan:

- Latar belakang
- Alternatif yang dipertimbangkan
- Keputusan akhir
- Alasan
- Dampak
- Status

Dokumen ini mengikuti konsep **Architecture Decision Record (ADR)**.

---

# Decision Status

| Status | Arti |
|---------|------|
| Proposed | Usulan |
| Accepted | Disetujui |
| Deprecated | Tidak digunakan lagi |
| Superseded | Digantikan |
| Rejected | Ditolak |

---

# ADR-001

## Firestore sebagai Database Utama

Status

```
Accepted
```

Tanggal

```
2026
```

### Background

Sarpras sebelumnya menggunakan Google Spreadsheet sebagai penyimpanan utama.

Pendekatan tersebut cukup sederhana tetapi mulai memiliki keterbatasan untuk:

- Skalabilitas
- Hak akses
- Query
- Audit
- Integrasi AI

### Alternatives

- MySQL
- PostgreSQL
- Supabase
- Firebase Firestore

### Decision

Menggunakan **Cloud Firestore** sebagai database utama.

### Reason

- Real-time
- Serverless
- Terintegrasi Firebase
- Mudah dikembangkan
- Mendukung aplikasi web dan mobile

### Consequences

Positif

- Skalabel
- Aman
- Mudah diintegrasikan

Negatif

- Perlu memahami NoSQL
- Perlu optimasi query

---

# ADR-002

## Spreadsheet hanya sebagai Backup

Status

```
Accepted
```

### Background

Spreadsheet sebelumnya menjadi pusat data.

### Decision

Spreadsheet hanya digunakan sebagai:

- Backup
- Arsip
- Import
- Export

Firestore menjadi Single Source of Truth.

### Reason

Menghindari inkonsistensi data.

---

# ADR-003

## Menggunakan Firebase Authentication

Status

```
Accepted
```

### Decision

Seluruh autentikasi menggunakan Firebase Authentication.

Role:

- Admin
- Executive
- Operator
- Viewer

### Reason

- Aman
- Terintegrasi
- Mudah dipelihara

---

# ADR-004

## Deployment menggunakan Vercel

Status

```
Accepted
```

### Alternatives

- VPS
- Netlify
- Firebase Hosting
- Vercel

### Decision

Frontend di-deploy menggunakan Vercel.

### Reason

- GitHub Integration
- Deploy cepat
- Gratis untuk tahap awal
- Mudah dikelola

---

# ADR-005

## Menggunakan n8n untuk Automation

Status

```
Accepted
```

### Background

Dibutuhkan workflow otomatis.

### Decision

Menggunakan n8n sebagai automation engine.

### Fungsi

- Backup
- Notifikasi
- Approval
- Workflow
- Sinkronisasi

### Reason

Low-code.

Open source.

Mudah diintegrasikan.

---

# ADR-006

## AI tidak mengubah data secara langsung

Status

```
Accepted
```

### Decision

AI hanya menghasilkan:

- Prediksi
- Rekomendasi
- Analisis

Semua perubahan tetap memerlukan persetujuan pengguna.

### Reason

Menghindari perubahan data tanpa verifikasi.

---

# ADR-007

## Service Layer sebagai satu-satunya akses data

Status

```
Accepted
```

### Decision

Dashboard tidak boleh mengakses Firestore secara langsung.

Seluruh akses melalui Service Layer.

### Reason

- Konsistensi
- Mudah diuji
- Reusable
- Aman

---

# ADR-008

## Menggunakan Clean Architecture

Status

```
Accepted
```

### Layer

Presentation

↓

Service

↓

Automation

↓

AI

↓

Data

### Reason

Mempermudah pengembangan jangka panjang.

---

# ADR-009

## Firestore Soft Delete

Status

```
Accepted
```

### Decision

Data tidak dihapus permanen.

Menggunakan field.

```
deleted

deletedAt

deletedBy
```

### Reason

Audit.

Recovery.

Riwayat.

---

# ADR-010

## AI sebagai Human-in-the-Loop

Status

```
Accepted
```

### Decision

Seluruh hasil AI berupa rekomendasi.

Operator tetap menjadi pengambil keputusan.

### Reason

Menjaga akurasi dan akuntabilitas.

---

# Pending Decisions

Keputusan yang masih menunggu pembahasan.

| ID | Topik | Status |
|----|--------|--------|
| ADR-011 | Mobile Framework | Proposed |
| ADR-012 | Offline Database | Proposed |
| ADR-013 | OCR Dokumen | Proposed |
| ADR-014 | Multi School | Proposed |
| ADR-015 | IoT Integration | Proposed |

---

# Change Process

Jika terdapat perubahan keputusan:

1. Buat ADR baru.
2. Jangan menghapus ADR lama.
3. Tandai status sebagai:
   - Deprecated
   - Superseded
4. Tambahkan referensi ke ADR pengganti.

---

# Long-Term Vision

Architecture Decision Record menjadi sumber referensi resmi seluruh keputusan teknis Sarprasin 2.0. Dengan dokumentasi keputusan yang konsisten, pengembangan dapat dilakukan secara berkelanjutan tanpa kehilangan konteks historis, sehingga setiap perubahan arsitektur tetap dapat ditelusuri, dievaluasi, dan dipertanggungjawabkan.
