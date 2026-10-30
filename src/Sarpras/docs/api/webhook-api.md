# Webhook API
## Sarprasin 2.0

---

# Overview

Webhook API merupakan layanan integrasi yang memungkinkan Sarprasin berkomunikasi secara otomatis dengan sistem eksternal menggunakan mekanisme Event-Driven Architecture.

Webhook digunakan untuk mengirimkan notifikasi, memicu workflow n8n, sinkronisasi data, integrasi Artificial Intelligence, dan layanan pihak ketiga.

---

# Architecture

```
User

↓

Application

↓

Firestore

↓

Event

↓

Webhook API

↓

n8n

↓

Automation

↓

Email
WhatsApp
Telegram
Google Workspace
AI Engine
```

---

# Supported Events

Sarprasin menghasilkan berbagai jenis event.

| Event | Status |
|---------|--------|
| Asset Created | ✅ |
| Asset Updated | ✅ |
| Asset Deleted | ✅ |
| User Login | ✅ |
| User Logout | ✅ |
| Backup Completed | ✅ |
| Restore Completed | ✅ |
| Report Generated | ✅ |
| Recommendation Created | Phase 2 |
| Predictive Maintenance | Phase 2 |
| Self Correction | Phase 2 |

---

# Event Structure

Setiap event menggunakan format JSON.

```json
{
  "event": "asset.created",
  "timestamp": "2026-07-15T10:15:00Z",
  "user": "admin",
  "data": {}
}
```

---

# Asset Created

Contoh payload.

```json
{
  "event": "asset.created",
  "data": {
    "kodeBarang": "KOMP-2026-001",
    "namaBarang": "Komputer Lenovo",
    "kodeRuang": "LABKOM01"
  }
}
```

---

# Asset Updated

```json
{
  "event": "asset.updated",
  "data": {
    "kodeBarang": "KOMP-2026-001",
    "updatedFields": [
      "kodeKondisi",
      "nilai"
    ]
  }
}
```

---

# Asset Deleted

```json
{
  "event": "asset.deleted",
  "data": {
    "kodeBarang": "KOMP-2026-001"
  }
}
```

---

# User Login

```json
{
  "event": "user.login",
  "data": {
    "uid": "abc123",
    "username": "raka"
  }
}
```

---

# Report Generated

```json
{
  "event": "report.generated",
  "data": {
    "reportType": "Asset Report",
    "format": "PDF"
  }
}
```

---

# Webhook Flow

```
Firestore

↓

Trigger

↓

Webhook API

↓

n8n Workflow

↓

Automation
```

---

# Retry Policy

Jika webhook gagal dikirim.

```
Attempt 1

↓

5 detik

↓

Attempt 2

↓

30 detik

↓

Attempt 3

↓

2 menit

↓

Attempt 4

↓

10 menit

↓

Failed Log
```

---

# Authentication

Webhook mendukung:

- Bearer Token
- API Key
- Secret Header

Contoh Header.

```
Authorization

Bearer xxxxxxxxx
```

---

# Signature Verification

Webhook dapat menggunakan HMAC Signature.

Header.

```
X-Sarprasin-Signature
```

Tujuannya memastikan payload benar-benar berasal dari Sarprasin.

---

# Response

Webhook dianggap berhasil apabila menerima.

```
HTTP 200
```

atau

```
HTTP 202
```

---

# Error Response

Contoh.

```json
{
  "success": false,
  "message": "Webhook delivery failed."
}
```

---

# Webhook Log

Seluruh pengiriman webhook dicatat.

Collection

```
webhookLogs
```

Field.

- event
- target
- status
- responseCode
- duration
- retryCount
- createdAt

---

# n8n Integration

Webhook menjadi pintu masuk utama workflow n8n.

Contoh.

```
Asset Created

↓

Webhook

↓

n8n

↓

Upload Backup Spreadsheet

↓

Send Email

↓

WhatsApp

↓

Update Dashboard
```

---

# AI Integration

Webhook juga digunakan untuk memanggil AI.

```
Asset Updated

↓

Webhook

↓

Recommendation Engine

↓

Predictive Maintenance

↓

Update Firestore
```

---

# Notification Integration

Workflow yang didukung.

- Email
- WhatsApp
- Telegram
- Discord
- Microsoft Teams
- Slack

---

# Google Workspace Integration

Webhook dapat digunakan untuk.

- Google Sheets
- Google Drive
- Google Docs
- Google Calendar

---

# Future Integration

Tahap berikutnya.

- Google Vertex AI
- OpenAI API
- Ollama
- HuggingFace
- MQTT
- IoT Devices
- ERP Sekolah

---

# Security

Webhook wajib:

- menggunakan HTTPS
- memverifikasi signature
- memvalidasi payload
- mencatat seluruh aktivitas
- membatasi rate request

---

# Performance Target

| Target | Nilai |
|---------|------:|
| Response Time | < 300 ms |
| Retry Success | > 99% |
| Delivery Success | > 99.9% |

---

# Event Naming Convention

Semua event menggunakan format:

```
entity.action
```

Contoh:

```
asset.created
asset.updated
asset.deleted

user.login
user.logout

report.generated

backup.completed

restore.completed

recommendation.created

maintenance.scheduled
```

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
