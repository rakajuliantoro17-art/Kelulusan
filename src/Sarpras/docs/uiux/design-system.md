# Design System
## Sarprasin 2.0

Version : 1.0.0

---

# Overview

Design System Sarprasin 2.0 merupakan standar visual, komponen, pola interaksi, dan prinsip desain yang digunakan pada seluruh aplikasi.

Tujuan utama design system adalah memastikan seluruh halaman memiliki tampilan yang konsisten, mudah digunakan, mudah dipelihara, dan siap dikembangkan untuk kebutuhan jangka panjang.

Design System berlaku untuk:

- Public Portal
- User Dashboard
- Operator Dashboard
- Admin Dashboard
- Executive Dashboard
- Mobile Application
- Progressive Web App
- AI Dashboard

---

# Design Philosophy

Sarprasin dibangun berdasarkan prinsip:

## Consistency

Seluruh halaman memiliki gaya visual yang sama.

---

## Simplicity

Antarmuka mudah dipahami oleh seluruh pengguna.

---

## Accessibility

Seluruh pengguna dapat menggunakan aplikasi tanpa hambatan.

Mengikuti standar WCAG.

---

## Scalability

Komponen dapat digunakan kembali pada seluruh modul.

---

## Performance

UI harus ringan dan cepat.

---

## Modular

Seluruh komponen dapat dipisahkan menjadi module independen.

---

# Design Principles

Seluruh desain harus memenuhi prinsip berikut.

✔ Consistent

✔ Responsive

✔ Accessible

✔ Reusable

✔ Maintainable

✔ Lightweight

✔ Modern

---

# Design Language

Gaya visual:

Modern

Minimalis

Professional

Flat Design

Soft Shadow

Rounded Corner

Clean Layout

Glassmorphism (opsional pada landing page dan halaman tertentu)

---

# Design Tokens

Seluruh warna dan ukuran menggunakan token.

Contoh.

```
Primary

Secondary

Success

Warning

Danger

Info

Gray

White
```

Token lainnya.

```
Spacing

Typography

Border Radius

Shadow

Animation

Transition

Opacity

Z-Index
```

---

# Typography

Heading

```
H1

H2

H3

H4

H5

H6
```

Body

```
Body Large

Body

Small

Caption

Label
```

Gunakan maksimal dua keluarga font pada seluruh aplikasi.

---

# Color System

Mengacu pada:

```
color-guide.md
```

---

# Icon System

Gunakan satu pustaka ikon secara konsisten.

Rekomendasi:

- Lucide
- Heroicons
- Material Symbols

Hindari mencampur beberapa gaya ikon dalam satu antarmuka.

---

# Grid System

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

---

# Spacing

Gunakan skala:

```
4

8

12

16

24

32

48

64
```

Seluruh margin dan padding mengikuti skala tersebut.

---

# Radius

Small

```
4px
```

Medium

```
8px
```

Large

```
16px
```

Extra Large

```
24px
```

---

# Shadow

Small

Medium

Large

Gunakan seminimal mungkin.

---

# Motion

Animasi digunakan untuk:

- Navigation
- Modal
- Notification
- Loading
- Drawer

Durasi standar.

```
150ms

200ms

300ms
```

---

# Component Architecture

```
Atoms

↓

Molecules

↓

Organisms

↓

Templates

↓

Pages
```

---

# Atoms

Contoh.

- Button
- Input
- Label
- Badge
- Avatar
- Icon

---

# Molecules

Contoh.

- Search Box
- Login Form
- Asset Card
- Filter Panel

---

# Organisms

Contoh.

- Sidebar
- Navbar
- Data Table
- Dashboard Widget
- Report Viewer

---

# Templates

Contoh.

- Dashboard Layout
- Login Layout
- Report Layout
- Public Layout

---

# Pages

Contoh.

- Dashboard
- Assets
- Reports
- Users
- Settings

---

# UI Components

Mengacu pada:

```
components.md
```

---

# Dashboard Layout

Mengacu pada:

```
dashboard-layout.md
```

---

# Theme

Mendukung:

- Light Mode
- Dark Mode

Semua komponen wajib kompatibel dengan kedua mode.

---

# Responsive Breakpoints

Mobile

```
0–767px
```

Tablet

```
768–1199px
```

Desktop

```
≥1200px
```

---

# Accessibility

Seluruh komponen harus:

- Mendukung keyboard navigation.
- Memiliki focus indicator.
- Memiliki ARIA label bila diperlukan.
- Memenuhi rasio kontras minimal WCAG AA.
- Tidak hanya mengandalkan warna untuk menyampaikan status.

---

# Performance Guidelines

Target.

| Komponen | Target |
|-----------|---------|
| Initial Load | < 2 detik |
| Route Change | < 300 ms |
| Search | < 500 ms |
| Animation | 60 FPS |

---

# Folder Structure

```
src/

styles/

components/

layout/

pages/

assets/

hooks/

utils/

services/
```

---

# Naming Convention

Komponen.

```
AppButton

AppCard

AppTable

AppModal

AppInput

AppBadge
```

Hooks.

```
useAuth

useAsset

useDashboard
```

Services.

```
asset.service

user.service

report.service
```

---

# Documentation

Dokumen pendukung.

```
color-guide.md

components.md

dashboard-layout.md
```

---

# Best Practices

- Gunakan design tokens, bukan nilai tetap.
- Hindari duplikasi komponen.
- Pisahkan logika bisnis dari komponen UI.
- Bangun halaman menggunakan komponen reusable.
- Lakukan pengujian tampilan pada desktop, tablet, dan mobile.
- Pertahankan konsistensi visual di seluruh modul.

---

# Governance

Perubahan pada Design System harus:

1. Diusulkan melalui pull request.
2. Ditinjau oleh tim pengembang.
3. Diuji pada minimal satu modul.
4. Didokumentasikan pada changelog.
5. Disetujui sebelum digunakan secara luas.

---

# Roadmap

## Phase 1

- Design Tokens
- Basic Components
- Dashboard Layout
- Light Theme

---

## Phase 2

- Advanced Components
- Animation
- Charts
- Report Viewer

---

## Phase 3

- AI Components
- Executive Dashboard
- Smart Widgets

---

## Phase 4

- Mobile Design System
- PWA Components
- Multi School Theme
- IoT Dashboard

---

# Long-Term Vision

Design System Sarprasin 2.0 menjadi fondasi visual dan teknis bagi seluruh aplikasi dalam ekosistem Sarprasin. Dengan pendekatan berbasis komponen, design tokens, dan prinsip Atomic Design, sistem mampu berkembang secara konsisten dari aplikasi web sederhana hingga platform enterprise yang mendukung AI, otomasi, aplikasi mobile, dan integrasi lintas layanan tanpa kehilangan identitas visual maupun kualitas pengalaman pengguna.
