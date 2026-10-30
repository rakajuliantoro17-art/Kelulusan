# Firebase Architecture
## Sarprasin 2.0

---

# Overview

Firebase merupakan platform backend utama pada Sarprasin 2.0 yang menyediakan autentikasi, database, penyimpanan file, analitik, dan layanan serverless.

Seluruh modul aplikasi menggunakan Firebase sebagai pusat penyimpanan data sehingga setiap perubahan dapat diproses secara real-time, diaudit, dan diintegrasikan dengan layanan otomatis seperti n8n maupun Artificial Intelligence.

---

# Objectives

Firebase digunakan untuk:

- Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions
- Analytics
- Security Rules
- Realtime Synchronization

---

# Architecture Overview

```
                    User

                      │

                      ▼

              Vercel Frontend

                      │

                      ▼

         Firebase Authentication

                      │

                      ▼

              Cloud Firestore

          ┌───────────┼────────────┐

          ▼           ▼            ▼

     Storage     Cloud Functions   Analytics

          │           │            │

          └──────┬────┴────────────┘

                 ▼

        n8n Automation Layer

                 │

                 ▼

              AI Engine
```

---

# Firebase Services

Sarprasin menggunakan layanan berikut.

| Service | Fungsi |
|-----------|---------|
| Authentication | Login |
| Firestore | Database |
| Storage | Foto & Dokumen |
| Cloud Functions | Backend Logic |
| Analytics | Statistik |
| Hosting | Opsional |
| App Check | Validasi aplikasi |

---

# Authentication

Metode login.

- Email & Password
- Google Login (Opsional)
- Anonymous (Development)

Role pengguna.

```
Admin

Executive

Operator

Viewer
```

---

# Firestore Collections

Collection utama.

```
users
```

---

```
aset
```

---

```
masterRuangan
```

---

```
masterKategori
```

---

```
masterKondisi
```

---

```
masterSumberDana
```

---

```
maintenance
```

---

```
reports
```

---

```
logAktivitas
```

---

```
notifications
```

---

```
webhookLogs
```

---

```
settings
```

---

# Asset Document

Contoh.

```json
{
  "kodeBarang":"LABKOM-2026-001",
  "namaBarang":"Komputer Lenovo",
  "kodeRuang":"LABKOM01",
  "kodeKategori":"KOMPUTER",
  "kodeKondisi":"BAIK",
  "tahun":2026,
  "nilai":12000000,
  "createdAt":"Timestamp",
  "updatedAt":"Timestamp"
}
```

---

# User Document

```json
{
  "uid":"abc123",
  "nama":"Operator",
  "email":"operator@sarprasin.id",
  "role":"operator",
  "active":true
}
```

---

# Storage Structure

```
storage/

assets/

reports/

backup/

avatars/

documents/

maintenance/

temp/
```

---

# Firestore Structure

```
users/

aset/

masterRuangan/

masterKategori/

masterKondisi/

masterSumberDana/

maintenance/

reports/

notifications/

settings/

logs/
```

---

# Realtime Flow

```
User

↓

Firestore

↓

Realtime Listener

↓

Dashboard Update
```

---

# Cloud Functions

Cloud Functions digunakan untuk.

- Validasi data
- Generate log
- Trigger webhook
- Hitung KPI
- Generate notifikasi
- Trigger AI
- Sinkronisasi Spreadsheet

---

# Analytics

Analytics mencatat.

- Login
- Dashboard
- Asset Input
- QR Scan
- Report Download
- Search
- Export

---

# Security Rules

Semua akses mengikuti Role Based Access Control.

| Role | Hak Akses |
|--------|-----------|
| Admin | Full Access |
| Executive | Read + Report |
| Operator | CRUD Asset |
| Viewer | Read Only |

---

# Offline Support

Firestore menyediakan:

- Offline Cache
- Synchronization
- Conflict Resolution

---

# Backup Strategy

```
Firestore

↓

Export

↓

Google Drive

↓

Spreadsheet Archive
```

Backup dijalankan otomatis melalui workflow n8n.

---

# Synchronization

Sinkronisasi data.

```
Firestore

↓

Spreadsheet

↓

Dashboard

↓

Public API
```

Spreadsheet digunakan sebagai media arsip dan interoperabilitas, sedangkan Firestore menjadi sumber data utama.

---

# Monitoring

Monitoring dilakukan melalui:

- Firebase Console
- Performance Monitoring
- Crash Reporting
- Firestore Usage
- Storage Usage

---

# Logging

Semua aktivitas disimpan pada collection.

```
logAktivitas
```

Contoh.

```
LOGIN

CREATE_ASSET

UPDATE_ASSET

DELETE_ASSET

GENERATE_REPORT

BACKUP

RESTORE
```

---

# Performance Target

| Komponen | Target |
|-----------|---------|
| Login | < 1 detik |
| Query Firestore | < 500 ms |
| Upload Foto | < 5 detik |
| Dashboard Refresh | < 1 detik |
| Report | < 5 detik |

---

# Scalability

### Phase 1

- 1 sekolah
- ±10.000 dokumen

---

### Phase 2

- AI
- Automation
- Multi Dashboard

---

### Phase 3

- Multi Sekolah
- 100.000+ dokumen

---

### Phase 4

- Kabupaten/Kota
- Multi Tenant
- Dinas Pendidikan

---

# Integration

Firebase terhubung dengan:

- Vercel Frontend
- GitHub CI/CD
- Google Apps Script
- Google Spreadsheet
- n8n
- AI Engine
- Webhook API
- Report Engine

---

# Disaster Recovery

Jika terjadi kegagalan.

```
Firestore Backup

↓

Google Drive

↓

Restore

↓

Verification

↓

Production
```

---

# Future Development

Tahapan berikutnya.

- Cloud Messaging
- App Check
- Vertex AI
- Firebase AI Logic
- Vector Search
- Semantic Search
- AI Document Analysis
- Edge Functions

---

# Long-Term Vision

Firebase menjadi pusat data Sarprasin 2.0 yang menyediakan layanan backend modern berbasis serverless. Dengan Firestore sebagai sumber data utama dan integrasi ke Spreadsheet, n8n, Artificial Intelligence, serta Dashboard, sistem mampu berkembang dari inventaris sekolah menjadi platform manajemen aset pendidikan yang aman, real-time, dan mudah diskalakan.
