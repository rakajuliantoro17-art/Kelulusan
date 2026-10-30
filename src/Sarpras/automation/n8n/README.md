# n8n Integration

## Sarprasin 2.0

Version : 2.0.0

---

# Overview

Folder ini berisi seluruh konfigurasi, dokumentasi, registry, dan workflow yang digunakan untuk menghubungkan **Sarprasin 2.0** dengan **n8n Cloud**.

n8n berfungsi sebagai **Automation Engine** yang menangani seluruh proses otomatis tanpa membebani frontend maupun backend utama.

Sarprasin hanya mengirim event atau webhook, sedangkan seluruh proses bisnis dijalankan oleh workflow di n8n.

---

# Architecture

```text
User
 │
 ▼
Frontend (Vercel)
 │
 ▼
workflow.service.js
 │
 ▼
webhook.service.js
 │
 ▼
n8n Cloud
 │
 ├── Firebase
 ├── Google Drive
 ├── Google Sheets
 ├── Gmail
 ├── Telegram
 ├── Discord
 ├── WhatsApp
 ├── AI Gateway
 └── External API
```

---

# Folder Structure

```text
n8n/

README.md

webhooks.js

workflows.js

backup.workflow.js

report.workflow.js

sync.workflow.js

validation.workflow.js

maintenance.workflow.js

ai.workflow.js

workflows/

    backup.json

    report.json

    maintenance.json

    sync.json

    ai.json
```

---

# Folder Description

## webhooks.js

Menyimpan seluruh URL webhook n8n.

Contoh:

* Backup
* Report
* AI
* Notification
* Maintenance

---

## workflows.js

Single Source of Truth untuk seluruh nama workflow.

Tidak ada nama workflow yang ditulis langsung di service lain.

---

## *.workflow.js

Berisi registry atau mapping workflow berdasarkan domain.

Contoh:

* backup.workflow.js
* report.workflow.js
* sync.workflow.js
* validation.workflow.js

File ini tidak menjalankan workflow.

File ini hanya menentukan workflow mana yang dipanggil.

---

## workflows/

Berisi hasil export workflow dari n8n.

Workflow dapat di-import kembali ke n8n Cloud.

---

# Main Workflow

## Backup

Melakukan backup otomatis:

* Firestore
* Storage
* Google Drive
* Log
* Report

---

## Report

Menghasilkan:

* PDF
* Excel
* CSV
* Email Report
* Dashboard Summary

---

## Sync

Sinkronisasi data antara:

* Firestore
* Google Sheets
* Storage
* Dashboard

---

## Validation

Validasi data sebelum:

* Import
* Backup
* Approval
* AI Processing

---

## Maintenance

Workflow maintenance aset:

* Jadwal
* Reminder
* Approval
* Riwayat

---

## AI

Workflow AI:

* AI Summary
* AI Recommendation
* AI Prediction
* AI Vision
* AI Assistant

---

# Supported Automation

Saat ini Sarprasin dirancang untuk mendukung automasi berikut:

* Backup Database
* Restore
* Daily Report
* Weekly Report
* Monthly Report
* Asset Reminder
* Maintenance Reminder
* Email Notification
* Telegram Notification
* WhatsApp Notification
* Dashboard Refresh
* Spreadsheet Import
* Spreadsheet Export
* QR Generator
* AI Workflow

---

# Development Rules

## 1.

Jangan menuliskan URL webhook secara langsung di dalam source code.

Gunakan:

```
webhooks.js
```

---

## 2.

Jangan menuliskan nama workflow secara langsung.

Gunakan:

```
workflows.js
```

---

## 3.

Semua workflow baru harus memiliki dokumentasi.

---

## 4.

Workflow harus bersifat modular.

Satu workflow menangani satu proses bisnis.

---

## 5.

Workflow harus idempotent.

Jika workflow dijalankan dua kali, data tidak boleh rusak.

---

## 6.

Gunakan webhook sebagai pintu masuk utama.

Frontend tidak boleh berkomunikasi langsung dengan layanan pihak ketiga.

---

# Security

Seluruh webhook harus:

* menggunakan HTTPS
* menggunakan Authentication jika diperlukan
* melakukan validasi payload
* melakukan logging
* melakukan error handling

Jangan menyimpan API Key di repository.

Gunakan Environment Variable.

---

# Versioning

Workflow menggunakan semantic versioning.

Contoh:

```
v1.0.0
v2.0.0
v2.1.0
```

Perubahan besar harus menghasilkan versi workflow baru.

---

# Future Roadmap

## Phase 2

* Backup
* Restore
* Report
* Notification
* Maintenance

---

## Phase 3

* Approval Workflow
* Procurement Workflow
* Inventory Audit
* QR Automation

---

## Phase 4

* Multi School
* Vendor Integration
* Digital Signature
* Budget Workflow

---

## Phase 5

* AI Workflow
* OCR
* Vision
* Embedding
* Knowledge Base

---

## Phase 6

* AI Agent
* Predictive Maintenance
* Smart Inventory
* IoT Integration
* Executive Assistant

---

# Technology Stack

* n8n Cloud
* Firebase
* Firestore
* Google Drive
* Google Sheets
* Gmail
* Telegram Bot
* Discord Webhook
* REST API
* OpenAI
* Google Gemini
* Ollama (Opsional)

---

# Philosophy

Sarprasin menggunakan pendekatan **Automation First**.

Aplikasi hanya menangani antarmuka pengguna dan logika bisnis utama.

Seluruh proses otomatis, integrasi layanan eksternal, distribusi laporan, backup, notifikasi, dan orkestrasi AI dijalankan melalui n8n Cloud agar sistem tetap modular, mudah dipelihara, dan siap berkembang menjadi platform manajemen sarana dan prasarana sekolah berskala enterprise.

