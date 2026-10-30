# UI Components
## Sarprasin 2.0 Design System

---

# Overview

Dokumen ini menjelaskan seluruh komponen antarmuka (UI Components) yang digunakan pada Sarprasin 2.0.

Seluruh halaman aplikasi wajib menggunakan komponen yang terdokumentasi pada file ini untuk menjaga konsistensi tampilan, pengalaman pengguna, dan kemudahan pemeliharaan.

---

# Design Principles

Komponen harus memenuhi prinsip berikut:

- Konsisten
- Reusable
- Responsive
- Accessible
- Modular
- Mudah dikembangkan

---

# Component Categories

```
Layout

Navigation

Input

Data Display

Feedback

Charts

Dialogs

Cards

Utilities
```

---

# Layout Components

## App Layout

```
+-----------------------------------------+
| Navbar                                  |
+----------+------------------------------+
| Sidebar  | Main Content                 |
|          |                              |
|          |                              |
|          |                              |
+----------+------------------------------+
| Footer                                  |
+-----------------------------------------+
```

---

## Container

Digunakan untuk seluruh halaman.

Max Width

```
1440px
```

Padding

```
24px
```

---

## Grid

Gunakan Grid 12 Column.

```
Desktop

12

Tablet

8

Mobile

4
```

---

# Navigation Components

## Navbar

Berisi:

- Logo
- Search
- Notification
- User Menu

---

## Sidebar

Menu utama.

- Dashboard
- Assets
- Maintenance
- Reports
- Users
- Settings

---

## Breadcrumb

Contoh.

```
Dashboard

>

Assets

>

Detail
```

---

## Tabs

Digunakan untuk berpindah antar modul.

---

# Button Components

## Primary Button

Untuk aksi utama.

Contoh.

```
Tambah Asset
```

---

## Secondary Button

Untuk aksi pendukung.

---

## Success Button

Untuk simpan.

---

## Warning Button

Untuk edit.

---

## Danger Button

Untuk hapus.

---

## Icon Button

Hanya ikon.

---

## Floating Action Button

Mobile.

---

# Form Components

## Text Field

Digunakan untuk teks.

---

## Text Area

Deskripsi.

---

## Number Input

Nilai.

---

## Currency Input

Harga.

---

## Date Picker

Tanggal.

---

## Time Picker

Jam.

---

## Select

Dropdown.

---

## Multi Select

Pilihan ganda.

---

## Checkbox

---

## Radio

---

## Switch

Aktif / Nonaktif.

---

## File Upload

Mendukung:

- Drag & Drop
- Browse

---

## Image Upload

Preview otomatis.

---

# Data Components

## Table

Mendukung.

- Sort
- Filter
- Search
- Pagination
- Export

---

## Data Card

Menampilkan ringkasan.

---

## Statistic Card

Contoh.

```
Total Asset

1250
```

---

## Timeline

Riwayat.

---

## Activity Feed

Aktivitas pengguna.

---

## Badge

Status.

---

## Chip

Kategori.

---

## Avatar

User.

---

# Asset Components

## Asset Card

Menampilkan.

- Foto
- Nama
- QR
- Kondisi
- Lokasi

---

## Asset Detail

Menampilkan seluruh informasi aset.

---

## Asset History

Riwayat.

---

## QR Card

Menampilkan QR Code.

---

# Dashboard Components

## KPI Card

Menampilkan KPI.

---

## Summary Card

Ringkasan.

---

## Quick Action

Shortcut.

---

## Recent Activity

---

## Maintenance Widget

---

## Notification Widget

---

# Chart Components

Gunakan Chart.js atau ECharts.

Jenis.

- Bar
- Line
- Pie
- Doughnut
- Area
- Radar

---

# Feedback Components

## Toast

Success.

Warning.

Error.

---

## Alert

Informasi penting.

---

## Banner

Pengumuman.

---

## Progress Bar

---

## Loading Spinner

---

## Skeleton Loading

---

# Dialog Components

## Confirmation Dialog

---

## Delete Dialog

---

## Image Preview

---

## PDF Preview

---

## Full Screen Dialog

---

# Report Components

## Report Filter

---

## Report Viewer

---

## PDF Viewer

---

## Export Dialog

---

# Automation Components

## Workflow Status

---

## Backup Status

---

## Sync Status

---

## Scheduler Card

---

# AI Components

## Recommendation Card

---

## Prediction Card

---

## Asset Health Score

---

## AI Insight

---

## Confidence Score

---

# Executive Components

## Executive KPI

---

## Budget Summary

---

## Trend Analysis

---

## Risk Card

---

# Mobile Components

## Bottom Navigation

---

## QR Scanner

---

## Camera Upload

---

## Pull To Refresh

---

# Empty States

Contoh.

```
Belum ada data.
```

---

# Error States

404

500

Permission Denied

Offline

---

# Loading States

- Initial Loading
- Table Loading
- Card Loading
- Dashboard Loading

---

# Accessibility

Semua komponen harus:

- Mendukung keyboard navigation.
- Memiliki focus state.
- Mendukung screen reader.
- Memiliki kontras warna sesuai WCAG.

---

# Responsive Rules

Desktop

≥1200px

Tablet

768–1199px

Mobile

<768px

---

# Naming Convention

Gunakan format:

```
AppButton

AppCard

AppTable

AppDialog

AppBadge

AppAvatar

AppSidebar

AppNavbar
```

---

# Folder Structure

```
src/

components/

layout/

navigation/

buttons/

forms/

tables/

cards/

charts/

dialogs/

feedback/

dashboard/

assets/

reports/

automation/

ai/

mobile/
```

---

# Best Practices

- Hindari duplikasi komponen.
- Semua komponen bersifat reusable.
- Gunakan design tokens untuk warna, spacing, dan tipografi.
- Pisahkan logika bisnis dari komponen UI.
- Dokumentasikan setiap komponen beserta contoh penggunaannya.

---

# Long-Term Vision

UI Components menjadi fondasi Design System Sarprasin 2.0. Dengan komponen yang modular, konsisten, dan mudah digunakan kembali, pengembangan fitur baru dapat dilakukan lebih cepat tanpa mengorbankan kualitas antarmuka maupun pengalaman pengguna.
