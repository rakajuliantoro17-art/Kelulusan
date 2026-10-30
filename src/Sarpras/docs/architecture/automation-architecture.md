# Automation Architecture
## Sarprasin 2.0

---

# Overview

Automation Architecture menjelaskan bagaimana seluruh proses otomatis dalam Sarprasin 2.0 saling terhubung menggunakan Event-Driven Architecture.

Seluruh perubahan data pada Firestore dapat menghasilkan event yang diproses oleh n8n, Artificial Intelligence, dan berbagai layanan eksternal tanpa mengubah logika utama aplikasi.

Automation tidak menggantikan proses bisnis, tetapi mempercepat pekerjaan administratif dan meningkatkan konsistensi data.

---

# Objectives

Automation dirancang untuk:

- mengurangi pekerjaan manual
- mempercepat sinkronisasi data
- menjaga konsistensi database
- menghasilkan notifikasi otomatis
- menghubungkan AI dengan sistem utama
- mendukung integrasi layanan eksternal
- meningkatkan skalabilitas aplikasi

---

# High Level Architecture

```
User

↓

Web Application

↓

Firebase Authentication

↓

Cloud Firestore

↓

Firestore Trigger

↓

Automation Layer (n8n)

↓

AI Engine

↓

Notification Engine

↓

Report Engine

↓

Google Workspace

↓

Dashboard
```

---

# Automation Layer

Automation Layer menggunakan n8n sebagai workflow engine.

Tanggung jawab utama:

- Event Processing
- Notification
- Backup
- Restore
- Synchronization
- AI Trigger
- Report Generation
- Scheduled Jobs

---

# Event Flow

```
User

↓

Create Asset

↓

Firestore

↓

asset.created

↓

n8n Workflow

↓

Automation Tasks
```

---

# Main Events

## Asset Events

```
asset.created

asset.updated

asset.deleted
```

---

## User Events

```
user.login

user.logout

user.created

user.updated
```

---

## Report Events

```
report.generated
```

---

## Maintenance Events

```
maintenance.created

maintenance.completed

maintenance.overdue
```

---

## AI Events

```
ai.prediction.completed

ai.recommendation.created

selfcorrection.completed
```

---

# Automation Categories

---

## Backup Automation

```
Firestore

↓

Export

↓

Spreadsheet

↓

Google Drive

↓

Notification
```

---

## Notification Automation

```
Event

↓

Email

↓

WhatsApp

↓

Telegram

↓

Dashboard Notification
```

---

## AI Automation

```
Asset Updated

↓

Recommendation Engine

↓

Predictive Maintenance

↓

Firestore Update
```

---

## Reporting Automation

```
Scheduler

↓

Generate Report

↓

PDF

↓

Email Executive
```

---

## Synchronization

```
Firestore

↓

Spreadsheet

↓

Archive

↓

Backup
```

---

# Scheduled Automation

Workflow yang dijalankan berdasarkan jadwal.

Contoh:

Daily

- Backup Database
- Data Quality Scan
- AI Prediction

Weekly

- Executive Report
- Maintenance Summary

Monthly

- Asset Health Report
- Budget Recommendation
- Inventory Audit

---

# AI Integration

Automation dapat memicu:

- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Analytics Engine

Contoh:

```
Asset Updated

↓

AI Analysis

↓

Recommendation

↓

Dashboard Executive
```

---

# Notification Engine

Notification yang didukung.

- Email
- WhatsApp
- Telegram
- Discord
- Microsoft Teams
- Slack

---

# Google Workspace Integration

Workflow.

```
Firestore

↓

n8n

↓

Google Sheets

↓

Google Docs

↓

Google Drive

↓

Google Calendar
```

---

# Security

Automation hanya dapat dijalankan oleh:

- Admin
- System Account
- Scheduled Workflow

Workflow harus:

- memverifikasi token
- memvalidasi payload
- mencatat log
- melakukan retry apabila gagal

---

# Logging

Seluruh workflow dicatat.

Collection

```
logAktivitas
```

Contoh aktivitas.

```
AUTOMATION_STARTED

AUTOMATION_COMPLETED

AUTOMATION_FAILED

BACKUP_COMPLETED

REPORT_GENERATED

EMAIL_SENT

WHATSAPP_SENT
```

---

# Retry Strategy

```
Workflow Failed

↓

Retry

↓

5 detik

↓

30 detik

↓

2 menit

↓

10 menit

↓

Failed Queue
```

---

# Monitoring

Dashboard Automation menampilkan:

- Total Workflow
- Workflow Berhasil
- Workflow Gagal
- Retry Queue
- Average Execution Time
- Last Execution
- Active Workflow

---

# Performance Target

| Workflow | Target |
|-----------|--------|
| Notification | < 5 detik |
| Backup | < 5 menit |
| AI Trigger | < 10 detik |
| Report | < 30 detik |
| Sync Spreadsheet | < 15 detik |

---

# Disaster Recovery

Jika workflow gagal.

```
Retry

↓

Queue

↓

Manual Approval

↓

Resume Workflow
```

---

# Future Development

Automation akan mendukung:

- IoT Trigger
- MQTT
- Vertex AI
- OpenAI
- Ollama
- HuggingFace
- Mobile Push Notification
- Auto Procurement
- Smart Maintenance Scheduler

---

# Long-Term Vision

Automation Architecture menjadi fondasi operasional Sarprasin 2.0 dengan menghubungkan Firestore, n8n, Artificial Intelligence, Dashboard, dan layanan eksternal ke dalam satu ekosistem yang modular, terukur, dan mudah dikembangkan.

Seluruh proses administratif yang berulang dapat diotomatisasi, sementara keputusan strategis tetap berada di tangan pengguna sesuai dengan prinsip Human-in-the-Loop.
