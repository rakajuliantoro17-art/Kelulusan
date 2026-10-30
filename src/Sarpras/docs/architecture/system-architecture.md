# System Architecture
## Sarprasin 2.0

---

# Overview

System Architecture merupakan dokumen utama yang menjelaskan bagaimana seluruh komponen Sarprasin 2.0 saling berinteraksi.

Sarprasin 2.0 dirancang sebagai platform manajemen sarana dan prasarana berbasis cloud dengan dukungan otomatisasi, analitik, dan kecerdasan buatan. Sistem dibangun menggunakan arsitektur modular agar mudah dipelihara, dikembangkan, dan diintegrasikan dengan layanan lain.

---

# Vision

Membangun platform manajemen sarana dan prasarana pendidikan yang:

- Modern
- Real-Time
- Cloud Native
- AI Ready
- Automation Ready
- Multi Dashboard
- Scalable
- Secure

---

# Design Principles

Pengembangan sistem mengikuti prinsip berikut:

- Modular Architecture
- Separation of Concerns
- Single Responsibility
- Event-Driven Architecture
- API First
- Serverless
- Human-in-the-Loop
- Secure by Design

---

# High-Level Architecture

```
                          User
                           │
                           ▼
                  Presentation Layer
                           │
        ┌──────────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼
     Public      User     Executive    Admin
                           │
                           ▼
                    Service Layer
                           │
   ┌──────────┬──────────┬──────────┬──────────┐
   ▼          ▼          ▼          ▼          ▼
 Asset     Report     Dashboard    Auth     Master
 Service   Service     Service    Service   Service
                           │
                           ▼
                 Automation Layer
                           │
         ┌──────────┬──────────┬──────────┐
         ▼          ▼          ▼
       n8n      Scheduler   Webhook API
                           │
                           ▼
                 Intelligence Layer
                           │
      ┌──────────┬──────────┬──────────┐
      ▼          ▼          ▼
 Recommendation  Predictive  Self
    Engine      Maintenance Correction
                           │
                           ▼
                      Data Layer
                           │
    ┌──────────┬────────────┬────────────┐
    ▼          ▼            ▼
Firestore   Storage   Spreadsheet Backup
```

---

# Architecture Layers

## Presentation Layer

Bertanggung jawab terhadap antarmuka pengguna.

Dashboard:

- Public
- User
- Executive
- Admin

Fungsi:

- Menampilkan data
- Input pengguna
- Visualisasi
- Dashboard

---

## Service Layer

Lapisan logika bisnis.

Service:

- Asset Service
- Dashboard Service
- Report Service
- User Service
- Master Service
- Authentication Service
- Log Service

Semua akses data harus melalui layer ini.

---

## Automation Layer

Menjalankan proses otomatis.

Komponen:

- n8n
- Scheduler
- Webhook
- Backup
- Restore
- Synchronization

Automation dipicu oleh event dari Firestore maupun scheduler.

---

## Intelligence Layer

Lapisan kecerdasan sistem.

Modul:

- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Analytics Engine
- Data Quality Engine *(Roadmap)*

Seluruh rekomendasi AI memerlukan validasi pengguna sebelum diterapkan.

---

## Data Layer

Lapisan penyimpanan data.

Komponen:

- Cloud Firestore
- Firebase Storage
- Google Spreadsheet (Arsip & Backup)
- Google Drive (Cadangan Dokumen)

Cloud Firestore menjadi sumber data utama.

---

# Core Modules

Sarprasin terdiri dari modul:

- Authentication
- User Management
- Asset Management
- Master Data
- Dashboard
- Reporting
- Automation
- AI
- Backup
- Logging
- Notification

---

# Data Flow

```
User

↓

Dashboard

↓

Service Layer

↓

Firestore

↓

Event

↓

Automation

↓

AI

↓

Notification

↓

Dashboard Refresh
```

---

# Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES Modules)
- Vite

---

## Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions

---

## Automation

- n8n

---

## AI

- Recommendation Engine
- Predictive Maintenance
- Self Correction

---

## DevOps

- GitHub
- Vercel
- Firebase CLI

---

# Integration

Sarprasin mendukung integrasi dengan:

- Firebase
- Google Workspace
- Spreadsheet
- Google Drive
- n8n
- AI Service
- Email
- WhatsApp
- Telegram
- Webhook API

---

# Security

Keamanan menggunakan:

- Firebase Authentication
- Firestore Security Rules
- Storage Rules
- Role Based Access Control
- HTTPS
- Audit Log

---

# Scalability Roadmap

## Phase 1

- Inventaris Digital
- Dashboard
- Firebase
- Vercel

---

## Phase 2

- Automation
- AI
- Recommendation Engine
- Predictive Maintenance

---

## Phase 3

- Mobile Application
- Offline Support
- QR Ecosystem
- Asset Lifecycle

---

## Phase 4

- Multi School
- Multi Tenant
- District Dashboard
- Government Integration

---

# Performance Targets

| Komponen | Target |
|----------|---------|
| Login | < 1 detik |
| Dashboard | < 2 detik |
| Query Firestore | < 500 ms |
| Upload Foto | < 5 detik |
| Report PDF | < 5 detik |
| AI Analysis | < 10 detik |

---

# Monitoring

Sistem dipantau melalui:

- Firebase Console
- Vercel Dashboard
- n8n Dashboard
- GitHub
- Log Aktivitas

---

# Disaster Recovery

```
GitHub

↓

Vercel Redeploy

↓

Firestore Restore

↓

Storage Restore

↓

Workflow Recovery

↓

Production
```

Target:

- RTO < 30 menit
- RPO < 24 jam

---

# Documentation References

Dokumen pendukung:

```
docs/architecture/firebase-architecture.md
docs/architecture/deployment.md
docs/architecture/security.md
docs/architecture/automation-architecture.md
docs/architecture/folder-structure.md

docs/api/asset-api.md
docs/api/dashboard-api.md
docs/api/report-api.md
docs/api/webhook-api.md
docs/api/authentication.md

docs/ai/ai-roadmap.md
docs/ai/machine-learning.md
docs/ai/recommendation-engine.md
docs/ai/predictive-maintenance.md
docs/ai/self-correction.md
```

---

# Long-Term Vision

Sarprasin 2.0 dikembangkan sebagai platform manajemen sarana dan prasarana pendidikan berbasis cloud yang menggabungkan inventaris, otomasi, analitik, dan kecerdasan buatan dalam satu ekosistem. Arsitektur modular memungkinkan sistem berkembang dari implementasi di satu sekolah hingga mendukung banyak sekolah, tanpa mengubah fondasi arsitektur yang telah dibangun.
