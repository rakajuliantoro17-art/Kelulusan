# Folder Structure
## Sarprasin 2.0

---

# Overview

Dokumen ini menjelaskan struktur folder resmi Sarprasin 2.0.

Tujuan utama struktur ini adalah:

- Modular
- Mudah dipelihara
- Mudah dikembangkan
- Mendukung AI
- Mendukung Automation
- Siap Multi Dashboard
- Siap Multi Platform

---

# Root Structure

```
sarprasin-2.0/

├── admin/
├── appscript/
├── docs/
├── executive/
├── login/
├── public/
├── rules/
├── scripts/
├── src/
├── user/
├── package.json
├── firebase.json
├── vercel.json
├── .firebaserc
├── .gitignore
└── README.md
```

---

# Folder Description

## admin/

Dashboard Administrator.

Berisi:

- Asset Management
- User Management
- Master Data
- Maintenance
- Report
- Automation
- AI Monitoring

---

## executive/

Dashboard Kepala Sekolah dan Wakasek.

Berisi:

- KPI
- Executive Report
- Analytics
- Asset Health
- AI Recommendation

---

## user/

Dashboard Operator Sarpras.

Berisi:

- CRUD Asset
- QR Scanner
- Inventory
- Maintenance
- Upload Foto

---

## public/

Dashboard Publik.

Berisi:

- Statistik Inventaris
- Transparansi
- Grafik
- Indeks Sarpras

---

## login/

Halaman autentikasi.

Berisi:

- Login
- Register
- Reset Password

---

## src/

Source code utama.

---

# src Structure

```
src/

assets/

components/

config/

layouts/

pages/

router/

services/

store/

styles/

utils/
```

---

## src/assets/

Berisi:

- Logo
- Icon
- Image
- Font
- Audio

---

## src/components/

Reusable UI Component.

Contoh:

- Button
- Modal
- Table
- Card
- Sidebar
- Navbar
- Charts

---

## src/config/

Konfigurasi aplikasi.

Contoh:

- firebase
- role
- routes
- constants

---

## src/layouts/

Template layout.

- Admin
- Executive
- User
- Public

---

## src/pages/

Seluruh halaman.

Contoh:

- Dashboard
- Asset
- Report
- Login

---

## src/router/

Routing aplikasi.

---

## src/services/

Business Logic.

Folder ini merupakan inti aplikasi.

---

# Services Structure

```
services/

auth/

core/

firebase/

sync/
```

---

## auth/

Autentikasi.

- Auth Service
- Guard
- Permission
- Session
- Token

---

## core/

Business Logic.

- Asset
- Dashboard
- Report
- Master
- User
- Log

---

## firebase/

Firebase Wrapper.

- Config
- Firestore
- Storage
- Analytics
- Auth

---

## sync/

Sinkronisasi.

- Spreadsheet
- Migration
- Backup

---

## src/store/

State Management.

Menyimpan state aplikasi.

---

## src/styles/

CSS global.

---

## src/utils/

Utility.

Contoh:

- Formatter
- Validator
- Helper
- Generator
- QR

---

# docs/

Seluruh dokumentasi proyek.

---

## docs/api/

Dokumentasi API.

- Asset API
- Dashboard API
- Report API
- Webhook API
- Authentication

---

## docs/architecture/

Dokumentasi arsitektur.

- Deployment
- Firebase
- Automation
- Folder Structure

---

## docs/ai/

Dokumentasi AI.

- AI Roadmap
- Recommendation Engine
- Predictive Maintenance
- Self Correction

---

## appscript/

Google Apps Script.

Digunakan untuk:

- Backup
- Restore
- Migration
- Spreadsheet Sync
- Scheduler
- Validation

Apps Script berfungsi sebagai sistem pendukung dan interoperabilitas dengan Google Workspace.

---

## rules/

Konfigurasi keamanan Firebase.

```
firestore.rules

storage.rules

firestore.indexes.json
```

---

## scripts/

Script otomatis.

Contoh:

- Seeder
- Migration
- Build Helper
- Cleanup
- Import Data

---

# Architecture Layers

```
Presentation Layer

↓

Service Layer

↓

Automation Layer

↓

AI Layer

↓

Data Layer
```

---

# Dashboard Structure

```
Admin

Executive

User

Public
```

Semua dashboard menggunakan Service Layer yang sama sehingga tidak terjadi duplikasi logika bisnis.

---

# Development Rules

Setiap fitur baru harus mengikuti struktur folder resmi.

Business Logic tidak boleh ditulis langsung pada halaman (page).

Semua akses database dilakukan melalui Service Layer.

Komponen UI harus bersifat reusable.

---

# Naming Convention

Folder:

```
kebab-case
```

Contoh:

```
report-service
```

---

File:

```
camelCase
```

Contoh:

```
asset.service.js
```

---

Class:

```
PascalCase
```

---

Constant:

```
UPPER_SNAKE_CASE
```

---

# Future Expansion

Struktur ini telah disiapkan untuk:

- Mobile App
- Progressive Web App
- Desktop App
- Multi Tenant
- Multi School
- IoT Integration
- AI Engine
- Data Warehouse

---

# Long-Term Vision

Struktur folder Sarprasin 2.0 dirancang dengan pendekatan modular dan domain-driven sehingga setiap bagian aplikasi memiliki tanggung jawab yang jelas. Dengan pemisahan antara Presentation Layer, Service Layer, Automation Layer, Intelligence Layer, dan Data Layer, proyek dapat berkembang secara bertahap tanpa memerlukan perubahan besar pada struktur dasar repositori.
