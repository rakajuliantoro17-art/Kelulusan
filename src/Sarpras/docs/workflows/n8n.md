# n8n Workflow
## Sarprasin 2.0

Version : 1.0.0

---

# Overview

Dokumen ini menjelaskan standar penggunaan n8n sebagai Automation Engine pada Sarprasin 2.0.

n8n digunakan untuk mengotomatisasi proses bisnis, sinkronisasi data, notifikasi, backup, integrasi layanan eksternal, serta orkestrasi workflow tanpa mengubah data secara langsung di luar mekanisme yang telah ditetapkan.

Firestore tetap menjadi sumber data utama (Single Source of Truth).

---

# Objectives

Implementasi n8n bertujuan untuk:

- Mengurangi pekerjaan manual.
- Mengotomatisasi proses operasional.
- Mengintegrasikan berbagai layanan.
- Mengirim notifikasi otomatis.
- Menjalankan workflow terjadwal.
- Mendukung AI Pipeline pada fase berikutnya.

---

# Design Principles

Workflow harus:

- Modular
- Reusable
- Idempotent
- Observable
- Secure
- Fault Tolerant

---

# Architecture

```
                 User

                  │

                  ▼

           Web Application

                  │

                  ▼

             Cloud Firestore

        ┌─────────┼─────────┐

        ▼         ▼         ▼

   Firebase    Cloud Storage

        │

        ▼

        n8n Automation

        │

 ┌──────┼───────────┬───────────┐

 ▼      ▼           ▼           ▼

Email Telegram Spreadsheet Google Drive

        │

        ▼

Administrator
```

---

# Workflow Categories

## Scheduled Workflow

Berjalan berdasarkan jadwal.

Contoh:

- Backup
- Sinkronisasi
- Laporan Harian
- Cleanup

---

## Event Driven Workflow

Dipicu oleh perubahan data.

Contoh:

- Asset Baru
- Maintenance Baru
- User Baru
- Status Berubah

---

## Manual Workflow

Dijalankan melalui dashboard.

Contoh:

- Backup Sekarang
- Generate Report
- Restore
- Import Data

---

# Workflow List

## WF-001

Nama

```
Daily Backup
```

Trigger

```
Scheduler
```

Output

- Spreadsheet Backup
- JSON Archive
- Notification

---

## WF-002

Nama

```
Weekly Report
```

Trigger

```
Cron
```

Output

- PDF
- Email

---

## WF-003

Nama

```
Maintenance Reminder
```

Trigger

```
Firestore Event
```

Output

- Notification
- Dashboard Alert

---

## WF-004

Nama

```
Spreadsheet Sync
```

Trigger

```
Firestore Update
```

Output

- Google Spreadsheet

---

## WF-005

Nama

```
Audit Log Export
```

Trigger

```
Daily
```

Output

- Archive

---

## WF-006

Nama

```
AI Dataset Builder
```

Trigger

```
Nightly
```

Output

- Dataset

---

# Trigger Types

Didukung:

- Cron
- Webhook
- Firestore Event
- HTTP Request
- Manual Trigger
- Scheduler

---

# Standard Workflow

```
Trigger

↓

Validation

↓

Business Logic

↓

Action

↓

Log

↓

Notification
```

---

# Retry Policy

Jika workflow gagal.

```
Retry 1

↓

Retry 2

↓

Retry 3

↓

Failed Queue

↓

Administrator Notification
```

---

# Logging

Setiap workflow mencatat:

- Workflow ID
- Nama Workflow
- Trigger
- Start Time
- Finish Time
- Duration
- Status
- Error Message
- Retry Count

---

# Monitoring

Dashboard Monitoring menampilkan:

- Running Workflow
- Queue
- Success Rate
- Failed Jobs
- Retry Jobs
- Average Duration

---

# Security

Workflow harus:

- Menggunakan Service Account bila diperlukan.
- Menyimpan secret pada environment variables atau credential manager.
- Tidak menyimpan password di dalam workflow.
- Menggunakan HTTPS untuk seluruh webhook.
- Menerapkan autentikasi pada endpoint publik.

---

# Error Handling

Apabila terjadi kegagalan.

```
Workflow

↓

Catch Error

↓

Log

↓

Retry

↓

Notification

↓

Administrator
```

---

# Notification Channels

Didukung:

- Dashboard
- Email
- Telegram
- WhatsApp (Opsional)
- Google Chat (Opsional)

---

# Naming Convention

Workflow

```
WF-001-DailyBackup

WF-002-SpreadsheetSync

WF-003-MaintenanceReminder
```

Node

```
Validate Asset

Generate Report

Send Email

Update Spreadsheet

Create Log
```

---

# Folder Structure

```
automation/

backup/

notification/

maintenance/

report/

spreadsheet/

ai/

integration/
```

---

# Performance Targets

| Parameter | Target |
|------------|---------|
| Workflow Start | < 5 detik |
| Retry | Maks. 3 kali |
| Notification | < 30 detik |
| Daily Backup | < 10 menit |

---

# Phase Roadmap

## Phase 1

- Backup
- Spreadsheet Sync
- Report Automation

---

## Phase 2

- Notification
- Maintenance Workflow
- Approval Workflow
- QR Workflow

---

## Phase 3

- AI Dataset Builder
- Recommendation Trigger
- Predictive Maintenance Workflow

---

## Phase 4

- IoT Workflow
- Multi School Workflow
- Executive BI Workflow

---

# Related Documents

- architecture/automation-architecture.md
- workflows/backup.md
- workflows/migration.md
- workflows/restore.md
- api/webhook-api.md

---

# Long-Term Vision

n8n menjadi pusat orkestrasi otomatisasi Sarprasin 2.0 yang menghubungkan Firestore, Firebase Storage, Google Workspace, Google Apps Script, layanan notifikasi, dan modul AI. Dengan workflow yang modular, terdokumentasi, dan mudah dipantau, seluruh proses operasional dapat berjalan lebih efisien tanpa mengurangi keamanan, akuntabilitas, maupun kendali pengguna.
