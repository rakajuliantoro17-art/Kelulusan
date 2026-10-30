# Firestore Schema
## Sarprasin 2.0

---

# Overview

Dokumen ini menjelaskan struktur database Cloud Firestore yang digunakan pada Sarprasin 2.0.

Cloud Firestore merupakan sumber data utama (Single Source of Truth) untuk seluruh modul aplikasi.

Seluruh dashboard, AI, workflow n8n, laporan, dan sinkronisasi Spreadsheet mengambil data dari struktur ini.

---

# Database Architecture

```
Cloud Firestore

├── users
├── assets
├── rooms
├── categories
├── conditions
├── fundingSources
├── maintenance
├── reports
├── notifications
├── logs
├── settings
├── webhookLogs
└── ai
```

---

# Collection Overview

| Collection | Fungsi |
|------------|---------|
| users | Data pengguna |
| assets | Data aset |
| rooms | Master ruangan |
| categories | Master kategori |
| conditions | Master kondisi |
| fundingSources | Master sumber dana |
| maintenance | Riwayat perawatan |
| reports | Metadata laporan |
| notifications | Notifikasi |
| logs | Audit log |
| settings | Konfigurasi sistem |
| webhookLogs | Riwayat webhook |
| ai | Hasil analisis AI |

---

# users

Document ID

```
UID Firebase
```

Example

```json
{
  "uid":"abc123",
  "nama":"Raka",
  "email":"admin@sarprasin.id",
  "role":"admin",
  "active":true,
  "photoURL":"",
  "createdAt":"Timestamp",
  "updatedAt":"Timestamp",
  "lastLogin":"Timestamp"
}
```

---

# assets

Document ID

```
Auto ID
```

Example

```json
{
  "kodeBarang":"LABKOM-2026-001",
  "namaBarang":"Komputer Lenovo",

  "kodeKategori":"KOMPUTER",

  "kodeRuang":"LABKOM01",

  "kodeKondisi":"BAIK",

  "kodeSumberDana":"BOSP",

  "tahunPengadaan":2026,

  "nilaiPerolehan":12000000,

  "foto":[
      "storage/assets/abc.jpg"
  ],

  "barcode":"LABKOM-2026-001",

  "status":"ACTIVE",

  "createdBy":"uid",

  "updatedBy":"uid",

  "createdAt":"Timestamp",

  "updatedAt":"Timestamp"
}
```

---

# rooms

Example

```json
{
  "kodeRuang":"LABKOM01",

  "namaRuang":"Lab Komputer 1",

  "gedung":"Gedung A",

  "lantai":2,

  "penanggungJawab":"uid",

  "aktif":true
}
```

---

# categories

Example

```json
{
  "kodeKategori":"KOMPUTER",

  "namaKategori":"Komputer",

  "umurEkonomis":5,

  "aktif":true
}
```

---

# conditions

Example

```json
{
  "kodeKondisi":"BAIK",

  "namaKondisi":"Baik",

  "score":100
}
```

---

# fundingSources

Example

```json
{
  "kode":"BOSP",

  "nama":"BOSP",

  "aktif":true
}
```

---

# maintenance

Example

```json
{
  "assetId":"xxxx",

  "jenis":"Preventive",

  "tanggal":"Timestamp",

  "biaya":500000,

  "vendor":"PT ABC",

  "hasil":"Selesai",

  "catatan":"Pembersihan rutin",

  "createdBy":"uid"
}
```

---

# reports

Example

```json
{
  "jenis":"Asset Report",

  "format":"PDF",

  "url":"storage/reports/report.pdf",

  "generatedBy":"uid",

  "generatedAt":"Timestamp"
}
```

---

# notifications

Example

```json
{
  "title":"Maintenance",

  "message":"Perawatan aset jatuh tempo.",

  "type":"warning",

  "targetRole":"operator",

  "read":false,

  "createdAt":"Timestamp"
}
```

---

# logs

Audit trail.

Example

```json
{
  "action":"CREATE_ASSET",

  "collection":"assets",

  "documentId":"xxxxx",

  "user":"uid",

  "timestamp":"Timestamp",

  "ipAddress":"",

  "device":"",

  "changes":{}
}
```

---

# webhookLogs

Example

```json
{
  "event":"asset.created",

  "status":"SUCCESS",

  "endpoint":"https://...",

  "responseCode":200,

  "retry":0,

  "createdAt":"Timestamp"
}
```

---

# settings

Example

```json
{
  "schoolName":"SMAN 1 Sooko",

  "logo":"",

  "theme":"dark",

  "maintenanceMode":false
}
```

---

# ai

Phase 2.

Example

```json
{
  "assetId":"xxxx",

  "healthScore":91,

  "prediction":"Maintenance 3 bulan",

  "recommendation":"Ganti Power Supply",

  "confidence":0.93,

  "generatedAt":"Timestamp"
}
```

---

# Collection Relationship

```
users
      │
      │ createdBy
      ▼

assets
      │
      ├───────────┐
      ▼           ▼

rooms      categories

      │           │
      └──────┬────┘
             ▼

conditions

             │
             ▼

maintenance

             │
             ▼

reports
```

---

# Recommended Indexes

Composite Index.

```
kodeRuang + kodeKondisi

kodeKategori + tahunPengadaan

status + createdAt

createdBy + createdAt

kodeSumberDana + tahunPengadaan
```

---

# Naming Convention

Collection

```
camelCase
```

Document Field

```
camelCase
```

Document ID

```
Auto ID
```

Reference Field

```
xxxId
```

Master Code

```
kodeKategori

kodeRuang

kodeKondisi

kodeSumberDana
```

---

# Soft Delete

Aset tidak langsung dihapus.

Gunakan field.

```json
{
    "deleted":false,

    "deletedAt":null,

    "deletedBy":null
}
```

---

# Audit Fields

Seluruh collection utama memiliki.

```
createdAt

updatedAt

createdBy

updatedBy
```

---

# Future Collections

Phase berikutnya.

```
procurement

vendors

assetTransfer

assetMutation

inspection

inventorySession

budget

rkas

rab

iot

machineLearning

knowledgeBase
```

---

# Database Principles

Database mengikuti prinsip:

- Single Source of Truth
- Immutable Audit Trail
- Soft Delete
- Master Data Reference
- Event Driven
- AI Ready
- Offline Ready

---

# Long-Term Vision

Cloud Firestore menjadi pusat data Sarprasin 2.0. Seluruh modul aplikasi, dashboard, AI, workflow n8n, laporan, dan integrasi eksternal menggunakan schema yang sama sehingga data tetap konsisten, mudah diaudit, dan siap berkembang menjadi platform manajemen aset pendidikan berskala besar.
