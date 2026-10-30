# Authentication API
## Sarprasin 2.0

---

# Overview

Authentication API merupakan sistem autentikasi utama Sarprasin 2.0 yang mengelola identitas pengguna, sesi login, hak akses, dan keamanan aplikasi.

Sarprasin menggunakan Firebase Authentication sebagai Identity Provider (IdP), sedangkan data profil pengguna disimpan di Cloud Firestore.

---

# Authentication Architecture

```
User

↓

Firebase Authentication

↓

ID Token

↓

Cloud Firestore

↓

Role Verification

↓

Permission Engine

↓

Application
```

---

# Authentication Provider

Phase 1

- Email & Password

---

Phase 2

- Google Sign In
- Microsoft Account
- SSO Sekolah
- QR Login

---

# User Collection

```
users

    {uid}

        username

        namaPengguna

        email

        level

        status

        createdAt

        updatedAt

        lastLogin
```

---

# User Model

```json
{
  "uid": "XyAbC123",
  "username": "raka",
  "namaPengguna": "Raka Aditya Juliantoro",
  "email": "user@school.sch.id",
  "level": "admin",
  "status": "aktif",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "lastLogin": "Timestamp"
}
```

---

# Login Flow

```
User

↓

Input Email & Password

↓

Firebase Authentication

↓

Success

↓

Load User Profile

↓

Role Validation

↓

Create Session

↓

Redirect Dashboard
```

---

# Logout Flow

```
Logout

↓

Firebase Sign Out

↓

Destroy Session

↓

Redirect Login
```

---

# Session Management

Informasi sesi yang disimpan.

- uid
- email
- username
- namaPengguna
- level
- loginTime

Session akan diperbarui setiap login.

---

# Role Based Access Control

Sarprasin menggunakan RBAC.

---

## Admin

Hak akses:

- Full Access
- CRUD Asset
- CRUD Master Data
- CRUD User
- Reports
- AI Dashboard
- Automation
- Backup
- Restore
- Configuration

---

## Executive

Hak akses:

- Dashboard
- Monitoring
- Reports
- Analytics
- Recommendation
- Predictive Maintenance

Tidak dapat mengubah master data.

---

## User

Hak akses:

- Input Asset
- Edit Asset
- Upload Foto
- QR Scan
- Melihat aset miliknya

---

## Public

Hak akses:

- Dashboard Publik
- Statistik Ringkas

Tidak memiliki akses ke data detail aset.

---

# Permission Matrix

| Feature | Admin | Executive | User | Public |
|----------|:-----:|:---------:|:----:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Input Asset | ✅ | ❌ | ✅ | ❌ |
| Edit Asset | ✅ | ❌ | ✅* | ❌ |
| Delete Asset | ✅ | ❌ | ❌ | ❌ |
| Upload Foto | ✅ | ❌ | ✅ | ❌ |
| Master Data | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| AI Dashboard | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

\*User hanya dapat mengubah aset yang menjadi tanggung jawabnya sesuai aturan aplikasi.

---

# Token

Firebase menghasilkan:

```
ID Token
```

Token digunakan untuk:

- autentikasi
- validasi request
- verifikasi role
- komunikasi dengan Cloud Functions (fase berikutnya)

---

# Token Refresh

Firebase melakukan refresh token secara otomatis.

Aplikasi harus memantau perubahan status autentikasi menggunakan listener Firebase Auth.

---

# Firestore Verification

Setelah login berhasil.

```
Firebase Auth

↓

UID

↓

Firestore

↓

users/{uid}

↓

Validasi Status

↓

Validasi Role

↓

Dashboard
```

---

# User Status

Status pengguna.

```
aktif
```

Pengguna dapat login.

---

```
nonaktif
```

Login ditolak.

---

```
suspended
```

Akses diblokir sementara.

---

# Login Audit

Setiap login dicatat.

Collection

```
logAktivitas
```

Field

- tanggal
- user
- aktivitas
- ipAddress (opsional)
- userAgent (opsional)

Contoh aktivitas:

```
LOGIN
LOGOUT
FAILED_LOGIN
TOKEN_REFRESH
```

---

# Security Rules

Semua request harus memenuhi:

- pengguna telah login
- status = aktif
- role sesuai
- token valid

---

# Failed Login

Jika autentikasi gagal.

```
Email

↓

Password Salah

↓

Firebase Error

↓

Pesan Error

↓

Log Aktivitas
```

---

# Password Policy

Minimal:

- 8 karakter
- huruf besar
- huruf kecil
- angka

Rekomendasi:

- simbol khusus

---

# Future Authentication

Fase berikutnya akan mendukung:

- Multi Factor Authentication (MFA)
- Passkey (WebAuthn)
- Login menggunakan QR Code
- Single Sign-On (SSO)
- Login menggunakan akun belajar.id

---

# Integration

Authentication digunakan oleh:

- Dashboard User
- Dashboard Executive
- Dashboard Admin
- Firestore
- Firebase Storage
- n8n Automation
- AI Engine

---

# API Version

Current Version

```
v2.0
```

Status

```
Development
```
