# Dashboard Layout
## Sarprasin 2.0 Design System

---

# Overview

Dokumen ini menjelaskan standar tata letak dashboard Sarprasin 2.0.

Seluruh dashboard menggunakan struktur yang sama agar pengguna memperoleh pengalaman yang konsisten pada setiap modul.

Dashboard dirancang untuk:

- Desktop
- Laptop
- Tablet
- Mobile

---

# Design Goals

Dashboard harus:

- Cepat dipahami
- Konsisten
- Mudah dinavigasi
- Responsive
- Modular
- Scalable

---

# Layout Structure

```
+------------------------------------------------------------+
| Top Navigation Bar                                         |
+------------+-----------------------------------------------+
|            |                                               |
|            |                                               |
| Sidebar    |              Main Content                     |
|            |                                               |
|            |                                               |
|            |                                               |
+------------+-----------------------------------------------+
| Footer                                             v0.1.0  |
+------------------------------------------------------------+
```

---

# Main Regions

## Top Navigation

Berisi:

- Logo
- Search
- Notification
- Theme Switch
- User Profile
- Logout

Tinggi

```
72px
```

---

## Sidebar

Lebar

```
280px
```

Collapsed

```
80px
```

Isi menu:

- Dashboard
- Assets
- Maintenance
- Reports
- Master Data
- Users
- Automation
- AI
- Settings

Sidebar dapat di-collapse untuk memberikan ruang lebih luas pada area konten.

---

## Main Content

Area utama untuk seluruh halaman.

Padding

```
24px
```

Lebar maksimum

```
1440px
```

---

## Footer

Berisi:

- Nama aplikasi
- Versi
- Tahun
- Copyright

---

# Dashboard Home

Urutan komponen pada halaman utama.

```
Header

↓

Quick Actions

↓

KPI Cards

↓

Charts

↓

Recent Activities

↓

Maintenance Alerts

↓

AI Insights

↓

Footer
```

---

# KPI Section

Menampilkan indikator utama.

Contoh.

```
+-----------+-----------+-----------+-----------+

 Total Asset

 Maintenance

 Damaged

 Budget

+-----------+-----------+-----------+-----------+
```

---

# Quick Action

Berisi tombol cepat.

- Tambah Asset
- Scan QR
- Upload
- Generate Report
- Backup
- Sinkronisasi

---

# Dashboard Widgets

Widget standar.

- Total Assets
- Asset Condition
- Asset Distribution
- Maintenance Schedule
- Activity Timeline
- Notifications
- Backup Status
- AI Recommendation

---

# Chart Area

Gunakan maksimal dua grafik besar per baris.

Contoh.

```
+----------------------+----------------------+

 Asset Trend

 Budget Trend

+----------------------+----------------------+

 Condition Pie

 Maintenance

+----------------------+----------------------+
```

---

# Recent Activity

Menampilkan aktivitas terbaru.

Contoh.

```
09:10

Asset ditambahkan

09:25

Maintenance selesai

10:15

Backup berhasil
```

---

# Notification Panel

Menampilkan:

- Maintenance jatuh tempo
- Aset rusak
- Sinkronisasi gagal
- AI Recommendation

---

# Asset Page Layout

```
Breadcrumb

↓

Filter

↓

Search

↓

Action Buttons

↓

Data Table

↓

Pagination
```

---

# Asset Detail Layout

```
Photo

↓

General Information

↓

QR Code

↓

History

↓

Maintenance

↓

Documents

↓

Logs
```

---

# Report Layout

```
Report Filter

↓

Summary

↓

Charts

↓

Table

↓

Export
```

---

# Executive Dashboard

Fokus pada:

- KPI
- Budget
- Asset Health
- Risk
- Trend
- Recommendation

Tanpa menampilkan detail teknis.

---

# Operator Dashboard

Fokus pada:

- Input Data
- Scan QR
- Maintenance
- Upload Foto
- Validasi Data

---

# Public Dashboard

Menampilkan informasi yang dapat diakses publik.

Contoh:

- Statistik umum
- Profil sekolah
- Jumlah aset
- Ringkasan fasilitas

Tidak menampilkan data sensitif.

---

# Responsive Layout

## Desktop

≥1200px

- Sidebar tetap
- Grid 12 kolom

---

## Tablet

768–1199px

- Sidebar dapat disembunyikan
- Grid 8 kolom

---

## Mobile

<768px

- Bottom Navigation
- Grid 4 kolom
- Sidebar menjadi Drawer

---

# Grid System

Desktop

```
12 Columns
```

Tablet

```
8 Columns
```

Mobile

```
4 Columns
```

---

# Empty State

Contoh.

```
Belum ada data aset.
Silakan tambahkan aset baru.
```

---

# Loading State

Gunakan:

- Skeleton Card
- Skeleton Table
- Progress Indicator

---

# Error State

Halaman harus memiliki tampilan khusus untuk:

- 404
- 500
- Permission Denied
- Offline

---

# Accessibility

Dashboard harus:

- Mendukung keyboard navigation.
- Memiliki focus indicator.
- Mendukung screen reader.
- Memenuhi kontras warna WCAG.

---

# Performance

Target:

| Komponen | Target |
|-----------|---------|
| Dashboard Load | < 2 detik |
| Navigation | < 300 ms |
| Search | < 500 ms |
| Filter | < 300 ms |

---

# Folder Structure

```
src/

pages/

dashboard/

admin/

executive/

operator/

public/

components/

layout/

widgets/

charts/

cards/

tables/
```

---

# Best Practices

- Gunakan tata letak yang konsisten pada seluruh dashboard.
- Tampilkan informasi terpenting di bagian atas.
- Hindari lebih dari empat KPI utama dalam satu baris.
- Kelompokkan widget berdasarkan fungsi.
- Gunakan ruang putih agar informasi mudah dibaca.
- Pastikan semua halaman tetap nyaman digunakan pada layar kecil.

---

# Future Dashboard

Tahap berikutnya dashboard akan mendukung:

- AI Insights
- Smart Recommendation
- Predictive Maintenance
- Executive BI
- IoT Monitoring
- Multi School
- Digital Twin
- Real-Time Collaboration

---

# Long-Term Vision

Dashboard Sarprasin 2.0 menjadi pusat kendali operasional sarana dan prasarana sekolah. Dengan tata letak yang modular, responsif, dan konsisten, seluruh pengguna—mulai dari operator hingga pimpinan—dapat mengakses informasi yang relevan sesuai perannya, sekaligus siap menerima pengembangan fitur AI, otomasi, dan integrasi lintas platform di masa depan.
