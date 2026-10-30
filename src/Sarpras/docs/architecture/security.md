# Security Architecture
## Sarprasin 2.0

---

# Overview

Security Architecture menjelaskan strategi keamanan yang diterapkan pada Sarprasin 2.0 untuk melindungi data, pengguna, layanan, dan proses otomatis.

Pendekatan keamanan menggunakan prinsip:

- Zero Trust
- Least Privilege
- Defense in Depth
- Secure by Default
- Human-in-the-Loop

---

# Security Objectives

Tujuan utama:

- Melindungi data aset sekolah
- Mencegah akses tidak sah
- Mengamankan autentikasi pengguna
- Mengamankan komunikasi antar layanan
- Menjamin integritas data
- Menjamin ketersediaan sistem
- Mendukung audit aktivitas

---

# Security Layers

```
Internet
    │
    ▼
HTTPS / TLS
    │
    ▼
Vercel
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Firestore Rules
    │
    ▼
Storage Rules
    │
    ▼
Service Layer
    │
    ▼
Automation
    │
    ▼
AI Engine
    │
    ▼
Database
```

---

# Authentication

Sarprasin menggunakan Firebase Authentication.

Metode login:

- Email & Password
- Google Sign-In (Opsional)
- Anonymous (Development)

Semua autentikasi menggunakan Firebase ID Token.

---

# Authorization

Hak akses menggunakan Role Based Access Control (RBAC).

Role:

```
Admin
```

Akses penuh.

---

```
Executive
```

Membaca dashboard strategis dan laporan.

---

```
Operator
```

Mengelola data aset.

---

```
Viewer
```

Hanya melihat informasi yang diizinkan.

---

# Permission Matrix

| Fitur | Admin | Executive | Operator | Viewer |
|--------|:----:|:---------:|:--------:|:------:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Tambah Aset | ✅ | ❌ | ✅ | ❌ |
| Edit Aset | ✅ | ❌ | ✅ | ❌ |
| Hapus Aset | ✅ | ❌ | ❌ | ❌ |
| Master Data | ✅ | ❌ | ❌ | ❌ |
| Laporan | ✅ | ✅ | ✅ | ❌ |
| Pengguna | ✅ | ❌ | ❌ | ❌ |
| Backup | ✅ | ❌ | ❌ | ❌ |

---

# Firestore Security

Semua akses Firestore menggunakan Security Rules.

Prinsip:

- deny by default
- allow berdasarkan role
- validasi field
- validasi tipe data
- validasi kepemilikan data

---

# Storage Security

Firebase Storage digunakan untuk:

- Foto aset
- Dokumen
- Backup

Aturan:

- hanya pengguna login
- ukuran file dibatasi
- tipe file divalidasi
- nama file dinormalisasi

---

# API Security

Semua endpoint menggunakan HTTPS.

Setiap request harus:

- membawa ID Token
- lolos validasi role
- lolos validasi payload

---

# Webhook Security

Webhook menggunakan:

- HTTPS
- Bearer Token
- Secret Header
- Signature Verification
- Timestamp Validation

---

# AI Security

Integrasi AI harus:

- tidak menyimpan kredensial
- tidak mengubah data tanpa validasi
- menghasilkan rekomendasi, bukan keputusan otomatis
- mencatat seluruh hasil analisis

---

# Automation Security

Workflow n8n dijalankan menggunakan akun layanan (service account).

Workflow harus:

- memverifikasi token
- mencatat log
- melakukan retry terbatas
- menghindari eksekusi ganda

---

# Data Validation

Seluruh input divalidasi.

Contoh:

- field wajib
- panjang karakter
- tipe data
- nilai numerik
- tanggal
- enum
- referensi master data

---

# File Upload Security

Foto aset harus memenuhi syarat:

- format JPG, JPEG, PNG, atau WEBP
- ukuran maksimum sesuai konfigurasi
- nama file unik
- dipindai sebelum digunakan (jika layanan tersedia)

---

# Logging

Seluruh aktivitas penting dicatat.

Collection:

```
logAktivitas
```

Contoh:

- Login
- Logout
- Create Asset
- Update Asset
- Delete Asset
- Backup
- Restore
- Report
- Automation
- AI Recommendation

---

# Audit Trail

Setiap perubahan data menyimpan:

- user
- waktu
- aksi
- nilai sebelum
- nilai sesudah

---

# Session Security

Session menggunakan Firebase Authentication.

Fitur:

- Auto Refresh Token
- Session Expiration
- Logout Manual
- Logout Otomatis saat token tidak valid

---

# Environment Security

Rahasia aplikasi disimpan pada environment variables.

Contoh:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
VITE_N8N_WEBHOOK_URL
VITE_AI_ENDPOINT
```

Tidak ada kredensial yang disimpan di repository.

---

# Backup Security

Backup dilakukan otomatis.

```
Firestore

↓

Encrypted Backup

↓

Google Drive

↓

Verification
```

Backup hanya dapat diakses administrator.

---

# Disaster Recovery

Jika terjadi insiden:

```
Backup

↓

Restore

↓

Integrity Check

↓

Audit

↓

Production
```

Target:

- RTO < 30 menit
- RPO < 24 jam

---

# Monitoring

Monitoring dilakukan melalui:

- Firebase Console
- Vercel
- n8n Dashboard
- GitHub
- Log Aktivitas

---

# Incident Response

Tahapan penanganan insiden:

1. Deteksi
2. Isolasi
3. Analisis
4. Pemulihan
5. Dokumentasi
6. Evaluasi

---

# Security Best Practices

- HTTPS wajib
- Least Privilege
- MFA untuk Admin (opsional pada fase awal)
- Password kuat
- Validasi semua input
- Audit log aktif
- Backup rutin
- Pembaruan dependensi berkala

---

# Future Security Roadmap

Phase 2

- App Check
- Multi-Factor Authentication
- Cloud Armor (jika diperlukan)
- AI Anomaly Detection
- Secret Manager

Phase 3

- Single Sign-On (SSO)
- Multi Tenant Isolation
- Security Dashboard
- Automatic Threat Detection
- Device Trust

---

# Compliance

Prinsip yang diterapkan:

- Kerahasiaan (Confidentiality)
- Integritas (Integrity)
- Ketersediaan (Availability)
- Akuntabilitas (Accountability)
- Auditabilitas (Auditability)

---

# Long-Term Vision

Security Architecture dirancang agar Sarprasin 2.0 tetap aman seiring pertumbuhan sistem. Dengan kombinasi Firebase Authentication, Firestore Security Rules, Storage Rules, Role Based Access Control, audit log, dan otomasi yang terkendali, keamanan menjadi bagian dari desain sistem sejak awal, bukan fitur yang ditambahkan di akhir pengembangan.
