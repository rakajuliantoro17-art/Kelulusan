# Phase 2 Roadmap
## Operational Platform
### Sarprasin 2.0

---

# Overview

Phase 2 merupakan tahap implementasi fitur operasional Sarprasin 2.0.

Pada fase ini, fondasi yang telah dibangun pada Phase 1 digunakan untuk menghadirkan aplikasi yang siap dipakai dalam pengelolaan sarana dan prasarana sekolah.

Fokus utama adalah membangun dashboard operasional, modul inventaris, pelaporan, otomasi, serta pengalaman pengguna yang baik.

---

# Phase Information

Nama

```
Operational Platform
```

Versi Target

```
v0.5.0-beta
```

Status

```
Planned
```

Estimasi Durasi

```
8–10 Minggu
```

---

# Objectives

Phase 2 bertujuan untuk:

- Menyelesaikan seluruh dashboard.
- Menyediakan modul inventaris lengkap.
- Mengimplementasikan workflow operasional.
- Mengintegrasikan otomatisasi (Automation).
- Menyediakan laporan yang siap digunakan.
- Menyiapkan sistem untuk pilot project.

---

# Deliverables

Pada akhir Phase 2 tersedia:

✅ Dashboard Admin

✅ Dashboard Executive

✅ Dashboard Operator

✅ Dashboard Public

✅ Asset Management

✅ Master Data Management

✅ QR Code Asset

✅ Upload Foto

✅ Maintenance Management

✅ Notification Center

✅ Reporting Module

✅ Automation Workflow

✅ Backup Otomatis

✅ Monitoring Dashboard

---

# Work Breakdown Structure

## 1. Authentication UI

Status

```
Planned
```

Task

- Login
- Logout
- Forgot Password
- Session Management
- Profile

---

## 2. Dashboard

Status

```
Planned
```

Modules

- Dashboard Admin
- Dashboard Executive
- Dashboard Operator
- Dashboard Public

---

## 3. Asset Management

Status

```
Planned
```

Modules

- CRUD Asset
- Asset Detail
- Asset History
- Asset Search
- Asset Filter
- Asset Status

---

## 4. Master Data

Status

```
Planned
```

Modules

- Categories
- Rooms
- Conditions
- Funding Sources
- Vendors (Persiapan)

---

## 5. QR Ecosystem

Status

```
Planned
```

Modules

- QR Generator
- QR Scanner
- Asset Label
- Detail via QR

---

## 6. Maintenance

Status

```
Planned
```

Modules

- Maintenance Schedule
- Maintenance History
- Maintenance Report
- Vendor Record
- Cost Tracking

---

## 7. Report Module

Status

```
Planned
```

Output

- PDF
- Excel
- Dashboard Analytics

---

## 8. Automation

Status

```
Planned
```

Modules

- n8n Integration
- Scheduled Backup
- Spreadsheet Sync
- Notification Workflow
- Approval Workflow
- Webhook Processing

---

## 9. Notification

Status

```
Planned
```

Modules

- In-App Notification
- Email Notification
- WhatsApp Integration (Opsional)
- Telegram Integration (Opsional)

---

## 10. Monitoring

Status

```
Planned
```

Modules

- Activity Log
- Backup Status
- Automation Status
- Error Monitoring
- Health Dashboard

---

# Milestones

## Milestone 1

Authentication UI selesai.

---

## Milestone 2

Dashboard selesai.

---

## Milestone 3

Asset Management selesai.

---

## Milestone 4

Reporting selesai.

---

## Milestone 5

Automation aktif.

---

## Milestone 6

Pilot Project di sekolah.

---

# Acceptance Criteria

Phase 2 dianggap selesai apabila:

- Login berjalan stabil.
- Dashboard dapat digunakan oleh seluruh role.
- CRUD aset berfungsi.
- Upload foto berhasil.
- QR Code dapat dibuat dan dipindai.
- Maintenance dapat dicatat.
- Laporan dapat dihasilkan.
- Backup otomatis berjalan.
- Workflow automation aktif.
- Pilot project berhasil dilaksanakan.

---

# Risks

| Risiko | Mitigasi |
|----------|----------|
| Performa dashboard menurun | Optimasi query Firestore |
| Workflow gagal | Retry dan monitoring n8n |
| Data tidak sinkron | Validasi sinkronisasi |
| Pengguna kesulitan menggunakan sistem | Panduan penggunaan dan pelatihan |

---

# Dependencies

- Firebase
- Firestore
- Storage
- Vercel
- GitHub
- n8n
- Google Workspace

---

# Out of Scope

Belum termasuk:

- Machine Learning Production
- Predictive Maintenance AI
- Recommendation Engine
- Self Correction
- Mobile Native
- Offline First
- Multi School
- IoT Integration

---

# Success Metrics

| Indikator | Target |
|------------|---------|
| Login | 100% berhasil |
| Dashboard | < 2 detik |
| CRUD Asset | Stabil |
| Upload Foto | Berhasil |
| Backup | Otomatis |
| Report | PDF & Excel |
| Automation | Berjalan tanpa error kritis |

---

# Exit Criteria

Phase 2 selesai apabila:

- Seluruh dashboard operasional aktif.
- Modul inventaris digunakan dalam operasional harian.
- Workflow otomatis berjalan stabil.
- Pengguna berhasil melakukan uji coba (pilot).
- Dokumentasi pengguna tersedia.

---

# Transition to Phase 3

Setelah Phase 2 selesai, fokus pengembangan beralih ke:

- Recommendation Engine
- Predictive Maintenance
- Self Correction
- Asset Health Score
- Executive Analytics
- Smart Decision Support

---

# Long-Term Vision

Phase 2 menjadikan Sarprasin 2.0 sebagai platform operasional yang siap digunakan dalam pengelolaan sarana dan prasarana sekolah. Pada tahap ini seluruh proses utama telah terdigitalisasi, didukung otomatisasi dasar, dan siap menjadi fondasi bagi implementasi kecerdasan buatan pada fase berikutnya.
