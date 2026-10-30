# Sarprasin 2.0
### Smart Asset Management Ecosystem
**SMAN 1 Sooko Mojokerto**

---

## Tentang Proyek

Sarprasin (Sarana dan Prasarana Information System) merupakan sistem inventaris digital yang dikembangkan untuk mendukung pengelolaan aset sekolah secara modern, terintegrasi, dan berbasis data.

Versi 2.0 merupakan pengembangan total dari versi sebelumnya yang masih menggunakan Google Spreadsheet dan Google Apps Script sebagai sistem utama.

Pada versi ini, Firebase dijadikan sebagai **database utama**, sedangkan Google Spreadsheet hanya berfungsi sebagai **backup, audit, dan disaster recovery**.

---

# Tujuan

Sarprasin 2.0 dikembangkan untuk:

- Digitalisasi inventaris sekolah
- Monitoring aset secara real-time
- Mempermudah pendataan sarana prasarana
- Meningkatkan transparansi data aset
- Mempermudah proses audit inventaris
- Menyediakan dashboard eksekutif
- Menyediakan sistem pelaporan otomatis
- Menjadi fondasi Artificial Intelligence dalam pengelolaan aset sekolah

---

# Arsitektur Sistem

```
                     User Dashboard
                           │
                           ▼
                  Firebase Authentication
                           │
                           ▼
                    Cloud Firestore
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
 Storage              Cloud Functions      Analytics
      │                    │
      └──────────────┬─────┘
                     ▼
             Automation Layer (n8n)
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
 Backup       Notification     Reporting
                     │
                     ▼
           Google Spreadsheet
          (Backup & Recovery)
```

---

# Teknologi

## Frontend

- HTML5
- CSS3
- JavaScript ES6
- Vite

---

## Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Analytics
- Cloud Functions

---

## Automation

- n8n
- Google Apps Script
- Scheduler
- Webhook

---

## Deployment

- Vercel
- Firebase Hosting (opsional)

---

## Backup

- Google Spreadsheet
- Google Drive

---

## Artificial Intelligence (Roadmap)

- Recommendation Engine
- Predictive Maintenance
- Asset Lifetime Prediction
- Self Correction
- Smart Reporting
- Decision Support System

---

# Dashboard

Sarprasin memiliki empat dashboard utama.

## Public Dashboard

Menampilkan informasi umum mengenai kondisi sarana prasarana sekolah.

---

## User Dashboard

Digunakan oleh petugas sarana prasarana untuk:

- Input aset
- Edit aset
- Upload foto
- Generate QR
- Monitoring inventaris

---

## Executive Dashboard

Digunakan oleh pimpinan sekolah.

Berisi:

- KPI
- Grafik
- Statistik
- Monitoring kondisi aset
- Nilai aset
- Dashboard analitik

---

## Admin Dashboard

Digunakan untuk:

- Manajemen pengguna
- Hak akses
- Master Data
- Sinkronisasi
- Backup
- Restore
- Audit

---

# Struktur Database

Firebase menggunakan struktur:

```
users/

masterRuangan/

masterKondisi/

masterSumberDana/

aset/

logAktivitas/
```

Dokumentasi lengkap terdapat pada folder:

```
docs/database/
```

---

# Automation

Automation dijalankan menggunakan n8n.

Workflow meliputi:

- Backup
- Sinkronisasi
- Validasi
- Notifikasi
- Reporting
- AI Trigger

Dokumentasi:

```
docs/workflows/
```

---

# Google Apps Script

Google Apps Script tetap dipertahankan sebagai:

- Backup
- Restore
- Migration
- Validation
- Scheduler
- Reporting

Bukan lagi sebagai sistem utama.

---

# Roadmap

## Phase 1

Modernisasi Sistem

- Firebase
- Firestore
- Authentication
- Storage
- Dashboard
- Backup
- Migration
- Validation

---

## Phase 2

Automation

- n8n
- Workflow
- Notification
- Reporting
- Scheduler
- API

---

## Phase 3

Analytics

- Executive Dashboard
- KPI
- Asset Health
- Monitoring
- Executive Report

---

## Phase 4

Artificial Intelligence

- Recommendation Engine
- Predictive Maintenance
- Smart Budget
- Self Correction
- AI Validation

---

## Phase 5

Smart School Ecosystem

- Mobile Apps
- IoT
- RFID
- QR Smart Inventory
- AI Assistant
- Decision Support System

---

# Repository Structure

```
appscript/
docs/
public/
src/
rules/
scripts/
```

Dokumentasi lengkap tersedia pada:

```
docs/architecture/
```

---

# Pengembang

Sarprasin 2.0 dikembangkan sebagai proyek digitalisasi Sarana dan Prasarana SMAN 1 Sooko Mojokerto.

Project ini dirancang sebagai fondasi Smart School Ecosystem yang mengintegrasikan inventaris, analitik, otomasi, dan kecerdasan buatan dalam satu platform yang berkelanjutan.

---

# Lisensi

Internal Project

SMAN 1 Sooko Mojokerto

Copyright © 2026
