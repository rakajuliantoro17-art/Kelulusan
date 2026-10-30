# Dashboard API
## Sarprasin 2.0

---

# Overview

Dashboard API merupakan layanan yang menyediakan data agregasi, statistik, analitik, dan indikator kinerja untuk seluruh dashboard pada Sarprasin 2.0.

Dashboard API tidak melakukan perubahan data inventaris secara langsung. Seluruh data dihasilkan dari Cloud Firestore dan diproses menjadi informasi yang mudah dipahami.

---

# Dashboard Architecture

```
Firestore

↓

Asset Service

↓

Dashboard Service

↓

Dashboard API

↓

Admin Dashboard
Executive Dashboard
User Dashboard
Public Dashboard

↓

AI Analytics
```

---

# Dashboard Types

Sarprasin memiliki empat jenis dashboard.

| Dashboard | Pengguna |
|------------|----------|
| Public | Publik |
| User | Operator Sarpras |
| Executive | Kepala Sekolah / Wakasek |
| Admin | Administrator |

---

# Data Sources

Dashboard mengambil data dari collection berikut.

```
users
```

```
aset
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

# Dashboard KPI

Dashboard menghasilkan beberapa indikator utama.

- Total Aset
- Total Nilai Aset
- Kondisi Baik
- Perlu Perbaikan
- Rusak Berat
- Jumlah Ruangan
- Jumlah Pengguna
- Asset Health Score
- Maintenance Score
- Data Quality Score

---

# Public Dashboard

Menampilkan informasi umum.

Data yang ditampilkan:

- Total Aset
- Persentase Kondisi
- Indeks Kelayakan Sarpras
- Grafik Ringkas
- Update Terakhir

Tidak menampilkan informasi sensitif.

---

# User Dashboard

Menampilkan informasi operasional.

Data:

- Daftar aset
- Input terbaru
- QR Scanner
- Foto aset
- Riwayat input
- Aktivitas pengguna
- Notifikasi

---

# Executive Dashboard

Menampilkan informasi strategis.

Data:

- KPI
- Total Nilai Aset
- Asset Health Score
- Grafik Kondisi
- Grafik Ruangan
- Top Risiko
- AI Recommendation
- Predictive Maintenance
- Budget Summary
- Maintenance Forecast

---

# Admin Dashboard

Menampilkan seluruh data sistem.

Data:

- User Management
- Master Data
- Asset Monitoring
- Firestore Statistics
- Storage Usage
- Backup Status
- Automation Status
- AI Status
- Log Aktivitas

---

# API Operations

Dashboard API menyediakan operasi berikut.

| Operasi | Status |
|----------|--------|
| Load KPI | ✅ |
| Load Charts | ✅ |
| Load Statistics | ✅ |
| Load Summary | ✅ |
| Load AI Recommendation | Phase 2 |
| Load Predictive Maintenance | Phase 2 |
| Load Notification | Phase 2 |

---

# KPI Response

Contoh.

```json
{
  "totalAsset": 842,
  "totalValue": 5243000000,
  "baik": 701,
  "perluPerbaikan": 102,
  "rusakBerat": 39
}
```

---

# Chart Response

Contoh.

```json
{
  "labels": [
    "Baik",
    "Perlu Perbaikan",
    "Rusak Berat"
  ],
  "values": [
    701,
    102,
    39
  ]
}
```

---

# Room Summary

Contoh.

```json
[
  {
    "kodeRuang": "LABKOM01",
    "jumlah": 54,
    "nilai": 468000000
  },
  {
    "kodeRuang": "LABBIO01",
    "jumlah": 118,
    "nilai": 275000000
  }
]
```

---

# Asset Summary

Data yang disediakan.

- jumlah aset
- total nilai
- rata-rata umur aset
- rata-rata Asset Health Score
- persentase kondisi

---

# Dashboard Refresh

Dashboard mendukung dua mode.

Manual Refresh

```
User

↓

Refresh
```

---

Automatic Refresh

```
Firestore

↓

Realtime Listener

↓

Dashboard Update
```

---

# Cache Strategy

Dashboard menggunakan cache lokal untuk meningkatkan performa.

Prioritas.

```
Memory Cache

↓

Session Cache

↓

Firestore
```

Cache akan diperbarui ketika terdapat perubahan data.

---

# Performance Target

Target waktu respon.

| Operasi | Maksimum |
|----------|----------|
| KPI | < 300 ms |
| Dashboard Awal | < 2 detik |
| Grafik | < 500 ms |
| Refresh | < 1 detik |

---

# Security

Public Dashboard

- hanya data publik

---

User Dashboard

- login wajib

---

Executive Dashboard

- login wajib
- role executive atau admin

---

Admin Dashboard

- role admin

---

# Logging

Setiap akses dashboard dapat dicatat.

Contoh aktivitas.

```
OPEN_PUBLIC_DASHBOARD

OPEN_USER_DASHBOARD

OPEN_EXECUTIVE_DASHBOARD

OPEN_ADMIN_DASHBOARD
```

---

# Integration

Dashboard API digunakan oleh.

- Asset Service
- Report Service
- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Analytics Engine
- n8n Workflow

---

# Future Dashboard

Pada fase berikutnya dashboard akan mendukung.

- Live Dashboard
- Dark Mode
- Mobile Dashboard
- Offline Dashboard
- AI Dashboard
- Executive TV Mode
- Smart Notification
- Voice Assistant
- Interactive Maps
- GIS Asset Visualization

---

# Version

Current Version

```
v2.0
```

Status

```
Development
```
