# Deployment Architecture
## Sarprasin 2.0

---

# Overview

Deployment Architecture menjelaskan bagaimana Sarprasin 2.0 dijalankan pada lingkungan cloud menggunakan layanan serverless, sehingga aplikasi mudah dipelihara, aman, dan dapat dikembangkan secara bertahap.

Arsitektur ini dirancang agar seluruh komponen dapat diperbarui secara independen tanpa menghentikan layanan utama.

---

# Deployment Goals

Deployment dirancang untuk:

- High Availability
- Low Maintenance
- Automatic Scaling
- Easy Rollback
- Continuous Deployment
- Modular Architecture
- Secure Infrastructure

---

# High Level Architecture

```
                Internet
                     │
                     ▼
          Vercel Edge Network
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   Public Dashboard          Login System
        │                         │
        └────────────┬────────────┘
                     ▼
             Firebase Authentication
                     │
                     ▼
              Cloud Firestore
             Firebase Storage
                     │
                     ▼
             Cloud Functions
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        n8n      AI Engine   Scheduler
          │          │          │
          └──────────┴──────────┘
                     ▼
            Notification Service
```

---

# Infrastructure

## Frontend

Platform

```
Vercel
```

Berfungsi untuk:

- Hosting aplikasi
- CDN
- HTTPS
- Edge Network
- Deployment otomatis dari GitHub

---

## Backend

Menggunakan Firebase.

Layanan:

- Authentication
- Firestore
- Storage
- Cloud Functions

---

## Automation

Workflow Engine

```
n8n
```

Fungsi:

- Workflow
- Scheduler
- Notification
- Backup
- Synchronization

---

## Artificial Intelligence

AI Layer mendukung:

- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Analytics Engine

---

# Repository

```
GitHub

↓

Main Branch

↓

Vercel Deployment
```

Deployment dilakukan otomatis setiap perubahan pada branch utama.

---

# Branch Strategy

```
main

Production
```

---

```
develop

Testing
```

---

```
feature/*

Pengembangan fitur
```

---

```
hotfix/*

Perbaikan produksi
```

---

# Environment

## Development

```
Local

Firebase Emulator

Vite

Git
```

---

## Staging

```
Vercel Preview

Firebase Test Project
```

---

## Production

```
Vercel Production

Firebase Production
```

---

# Environment Variables

Contoh variabel.

```
VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_APP_ID

VITE_FIREBASE_MESSAGING_SENDER_ID

VITE_FIREBASE_MEASUREMENT_ID

VITE_N8N_WEBHOOK_URL

VITE_AI_ENDPOINT
```

Semua variabel sensitif dikelola melalui Vercel Environment Variables dan tidak disimpan di repository.

---

# Deployment Workflow

```
Developer

↓

Git Commit

↓

GitHub

↓

GitHub Push

↓

Vercel Build

↓

Deploy

↓

Production
```

---

# Database Deployment

Cloud Firestore digunakan sebagai database utama.

Collection utama:

- users
- aset
- masterRuangan
- masterKondisi
- masterSumberDana
- logAktivitas
- maintenance
- webhookLogs

---

# Storage Deployment

Firebase Storage digunakan untuk:

- Foto aset
- Dokumen laporan
- Backup file
- Lampiran pendukung

---

# Backup Strategy

Backup harian.

```
Firestore

↓

Export

↓

Google Drive

↓

Archive
```

Workflow dijalankan melalui n8n.

---

# Monitoring

Monitoring dilakukan pada:

- Vercel
- Firebase Console
- n8n Dashboard
- GitHub Actions
- Application Log

---

# Logging

Seluruh aktivitas penting dicatat.

- Login
- Asset Created
- Asset Updated
- Backup
- Restore
- Deployment
- Automation
- AI Prediction

---

# Security

Deployment menggunakan:

- HTTPS
- Firebase Authentication
- Firestore Security Rules
- Storage Rules
- Environment Variables
- Role Based Access Control

---

# Scalability

Sistem dirancang agar mampu berkembang tanpa perubahan arsitektur utama.

Tahapan:

### Phase 1

- 1 Sekolah
- < 20 Pengguna aktif

---

### Phase 2

- Multi Dashboard
- AI
- n8n
- 100 Pengguna aktif

---

### Phase 3

- Multi Sekolah
- Multi Tenant
- 1.000+ Pengguna

---

### Phase 4

- Kabupaten/Kota
- Dinas Pendidikan
- Cloud Native Platform

---

# Disaster Recovery

Jika terjadi kegagalan.

```
GitHub Repository

↓

Redeploy Vercel

↓

Restore Firestore

↓

Restore Storage

↓

Restart Workflow n8n
```

Target:

- Recovery Time Objective (RTO): < 30 menit
- Recovery Point Objective (RPO): < 24 jam

---

# CI/CD Pipeline

```
GitHub

↓

Pull Request

↓

Review

↓

Merge

↓

Vercel Build

↓

Deploy

↓

Health Check

↓

Production
```

---

# Performance Target

| Komponen | Target |
|-----------|---------|
| First Load | < 2 detik |
| Dashboard | < 1 detik |
| Firestore Query | < 500 ms |
| Asset Upload | < 5 detik |
| AI Recommendation | < 10 detik |
| Backup | < 5 menit |

---

# Long-Term Vision

Deployment Sarprasin menggunakan pendekatan Cloud-Native dan Serverless sehingga aplikasi dapat berkembang dari sistem inventaris sekolah menjadi platform manajemen aset pendidikan yang mendukung Artificial Intelligence, Automation, dan integrasi lintas sekolah tanpa perubahan besar pada infrastruktur utama.
