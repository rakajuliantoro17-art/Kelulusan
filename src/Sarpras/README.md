# Sarprasin v2.0

## Smart School Asset Management System

Sarprasin adalah platform manajemen aset sekolah berbasis web yang dikembangkan untuk mendukung digitalisasi Sarana dan Prasarana di SMAN 1 Sooko Mojokerto.

## Tujuan

- Digitalisasi inventaris aset sekolah
- Monitoring kondisi aset secara real-time
- Transparansi data inventaris
- Audit aset berbasis QR Code
- Dashboard Executive
- Dashboard Publik
- Sinkronisasi otomatis ke Google Spreadsheet

---

## Teknologi

### Frontend
- HTML5
- CSS3
- JavaScript ES6

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

### Integrasi
- Google Apps Script
- Google Spreadsheet

### Deployment
- Vercel

---

## Struktur Sistem

Public Dashboard

↓

Authentication

↓

Role Based Access

↓

Admin

Executive

User

↓

Firestore

↓

Spreadsheet Sync

---

## Role

### Admin

- CRUD Master Data
- CRUD Inventaris
- Manajemen User
- Sinkronisasi
- Backup

### Executive

- Dashboard Monitoring
- Statistik
- Grafik
- Laporan

### User

- Input Inventaris
- Audit
- Scan QR
- Update Kondisi

### Public

- Dashboard Transparansi
- Statistik Aset
- Indeks Kelayakan

---

## Struktur Database

Firestore

users

master

aset

histori

logAktivitas

dashboardCache

settings

---

## Status

Version : 2.0

Status : Development

Developer :

SMAN 1 Sooko Mojokerto
