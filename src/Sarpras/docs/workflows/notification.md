# Notification Workflow
## Sarprasin 2.0

Version : 1.0.0

---

# Overview

Dokumen ini menjelaskan mekanisme pengiriman notifikasi pada Sarprasin 2.0.

Notification Workflow memastikan setiap peristiwa penting dalam sistem dapat disampaikan kepada pengguna yang tepat melalui kanal komunikasi yang sesuai.

Seluruh notifikasi mengikuti prinsip Event-Driven Architecture dengan Firestore sebagai sumber data utama.

---

# Objectives

Notification Workflow bertujuan untuk:

- Memberikan informasi secara real-time.
- Mengurangi keterlambatan respons.
- Mengingatkan aktivitas penting.
- Mendukung otomatisasi proses bisnis.
- Menyediakan histori notifikasi.

---

# Notification Principles

Setiap notifikasi harus:

- Tepat sasaran
- Tepat waktu
- Tidak duplikat
- Dapat ditelusuri
- Memiliki tingkat prioritas

---

# Architecture

```
User Action

↓

Cloud Firestore

↓

Event Listener

↓

Notification Service

↓

n8n Workflow

↓

Channel Dispatcher

↓

Dashboard
Email
Telegram
WhatsApp
Google Chat
```

---

# Notification Categories

## Information

Digunakan untuk informasi umum.

Contoh:

- Asset berhasil ditambahkan.
- Backup selesai.
- Sinkronisasi berhasil.

---

## Success

Memberitahukan proses berhasil.

Contoh:

- Data berhasil disimpan.
- Maintenance selesai.

---

## Warning

Memerlukan perhatian pengguna.

Contoh:

- Jadwal maintenance mendekat.
- Masa garansi hampir habis.
- Backup tertunda.

---

## Critical

Memerlukan tindakan segera.

Contoh:

- Backup gagal.
- Sinkronisasi gagal.
- Storage hampir penuh.
- Asset hilang.
- Login mencurigakan.

---

# Priority Level

| Level | Deskripsi |
|--------|-----------|
| Low | Informasi umum |
| Medium | Perlu perhatian |
| High | Penting |
| Critical | Harus segera ditindaklanjuti |

---

# Notification Channels

## Dashboard

Real-time notification.

---

## Email

Untuk laporan dan aktivitas penting.

---

## Telegram

Untuk administrator.

---

## WhatsApp (Opsional)

Untuk pemberitahuan operasional.

---

## Google Chat (Opsional)

Untuk tim internal.

---

# Event Sources

Notifikasi dapat dipicu oleh:

- Asset Created
- Asset Updated
- Asset Deleted
- Maintenance Created
- Maintenance Completed
- User Registered
- Login Failed
- Backup Completed
- Backup Failed
- Sync Completed
- Sync Failed
- Migration Completed
- Migration Failed
- AI Recommendation Generated

---

# Standard Workflow

```
Event

↓

Validation

↓

Recipient Resolution

↓

Template Selection

↓

Channel Selection

↓

Send Notification

↓

Log

↓

Status Update
```

---

# Recipient Rules

Administrator menerima:

- Error
- Backup
- Sinkronisasi
- Migration

---

Operator menerima:

- Maintenance
- Asset Assignment
- Reminder

---

Executive menerima:

- KPI
- Executive Report
- Budget Alert
- Risk Alert

---

Public User menerima:

- Informasi publik yang diizinkan.

---

# Notification Template

Template terdiri dari:

- Title
- Message
- Priority
- Timestamp
- Sender
- Action URL

Contoh:

```
Title

Backup Berhasil

Message

Backup harian berhasil diselesaikan.

Priority

Information

Action

Lihat Detail
```

---

# Retry Policy

Jika pengiriman gagal.

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

# Delivery Status

Status:

- Pending
- Sending
- Delivered
- Read
- Failed
- Cancelled

---

# Notification History

Setiap notifikasi mencatat:

- Notification ID
- Event ID
- Recipient
- Channel
- Priority
- Sent Time
- Delivery Status
- Read Time

---

# Notification Center

Dashboard menyediakan pusat notifikasi dengan fitur:

- Filter
- Search
- Read / Unread
- Mark All as Read
- Archive

---

# Security

- Hanya pengguna yang berhak menerima notifikasi tertentu.
- Informasi sensitif tidak dikirim melalui kanal publik.
- Seluruh pengiriman dicatat pada audit log.
- Endpoint webhook menggunakan autentikasi.

---

# Monitoring

Dashboard Monitoring menampilkan:

- Total Notification
- Delivery Rate
- Failed Delivery
- Retry Queue
- Average Delivery Time

---

# Performance Targets

| Parameter | Target |
|------------|---------|
| Dashboard Notification | < 2 detik |
| Email Delivery | < 60 detik |
| Telegram Delivery | < 30 detik |
| Retry | Maksimum 3 kali |

---

# Phase Roadmap

## Phase 1

- Dashboard Notification
- Email Notification
- Backup Notification

---

## Phase 2

- Telegram Integration
- Maintenance Reminder
- Asset Reminder

---

## Phase 3

- AI Recommendation Notification
- Executive Alert
- Smart Reminder

---

## Phase 4

- Multi School Notification
- IoT Alert
- Predictive Maintenance Alert

---

# Related Documents

- workflows/n8n.md
- workflows/backup.md
- workflows/migration.md
- api/webhook-api.md
- architecture/automation-architecture.md

---

# Long-Term Vision

Notification Workflow menjadi sistem komunikasi terpusat Sarprasin 2.0 yang menghubungkan seluruh modul aplikasi, layanan otomasi, dan kanal komunikasi. Dengan pendekatan event-driven, notifikasi dapat dikirim secara cepat, tepat sasaran, dan terdokumentasi, sehingga mendukung operasional sekolah yang lebih responsif dan efisien.
