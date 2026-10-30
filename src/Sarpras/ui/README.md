# UI Components

```
src/components/ui/
```

## Deskripsi

Folder **UI Components** berisi seluruh komponen antarmuka (*User Interface*) yang dapat digunakan kembali (*reusable*) di seluruh aplikasi **Sarprasin 2.0**.

Seluruh komponen dirancang dengan prinsip:

- Modular
- Reusable
- Responsive
- Accessible (WCAG)
- Glassmorphism Design
- Dark Mode Ready
- Mobile First
- ES Module Friendly

Folder ini menjadi fondasi Design System sehingga setiap halaman memiliki tampilan, perilaku, dan pengalaman pengguna yang konsisten.

---

# Struktur Folder

```
ui/

├── README.md
│
├── alerts/
├── avatar/
├── badges/
├── buttons/
├── cards/
├── dropdown/
├── forms/
├── loaders/
├── tabs/
├── tooltip/
│
├── modal/
├── pagination/
├── progress/
├── search/
├── sidebar/
├── statistics/
├── tables/
├── timeline/
├── accordion/
├── breadcrumb/
├── calendar/
├── chart/
├── chips/
├── datepicker/
├── empty-state/
├── floating-action-button/
├── list/
├── menu/
├── navigation/
├── popover/
├── qr/
├── rating/
├── skeleton/
├── slider/
├── snackbar/
├── stepper/
├── switch/
├── tag/
├── toast/
└── treeview/
```

> Beberapa folder merupakan **roadmap komponen** yang dapat ditambahkan secara bertahap seiring perkembangan Sarprasin 2.0.

---

# Komponen yang Telah Diimplementasikan

## Alerts

Menampilkan informasi penting kepada pengguna.

Contoh:

- Success
- Warning
- Error
- Info
- Toast
- Notification

---

## Avatar

Menampilkan foto pengguna atau inisial.

Digunakan pada:

- Profil
- Topbar
- Komentar
- Activity Log

---

## Badges

Label kecil untuk menunjukkan status.

Contoh:

- Aktif
- Maintenance
- Rusak
- Admin
- Guru

---

## Buttons

Komponen tombol standar.

Variasi:

- Primary
- Secondary
- Danger
- Outline
- Icon
- Loading
- Floating

---

## Cards

Kontainer informasi.

Digunakan pada:

- Dashboard
- Statistik
- Executive Dashboard
- Ringkasan Inventaris

---

## Dropdown

Menu pilihan dan aksi.

Mendukung:

- Single Select
- Multi Select
- Search
- Async Data

---

## Forms

Komponen formulir.

Meliputi:

- Input
- Textarea
- Select
- Checkbox
- File Upload

---

## Loaders

Indikator proses.

Variasi:

- Spinner
- Progress
- Skeleton
- Overlay
- Upload
- Table Loader

---

## Tabs

Navigasi antar panel.

Mendukung:

- Keyboard Navigation
- Swipe
- Lazy Loading
- ARIA

---

## Tooltip

Informasi tambahan saat hover, fokus, atau sentuhan.

---

# Prinsip Design

Semua komponen memiliki karakteristik berikut:

- Konsisten pada seluruh modul aplikasi.
- Mendukung tema terang, gelap, dan kontras tinggi.
- Menggunakan kelas CSS yang mudah dipelihara.
- Tidak bergantung pada framework UI eksternal.
- Dapat digunakan ulang tanpa perubahan struktur HTML.

---

# Integrasi dengan Aplikasi

Komponen UI digunakan oleh seluruh modul Sarprasin 2.0, antara lain:

- Dashboard
- Executive Dashboard
- Inventaris Aset
- Maintenance
- Audit
- Approval
- Pengadaan
- User Management
- AI Analytics
- Laporan
- QR Code
- Pengaturan
- Autentikasi

---

# Struktur Komponen

Setiap komponen mengikuti pola berikut:

```
component/

├── README.md
├── component.html
├── component.js
└── component.css
```

Beberapa komponen memiliki variasi tambahan sesuai kebutuhan, misalnya:

```
buttons/

button.html
loading-button.html
icon-button.html
button.js
button.css
README.md
```

---

# Standar Penamaan

## File

Gunakan format:

```
kebab-case
```

Contoh:

```
loading-button.html
status-badge.html
glass-card.html
```

---

## CSS Class

Gunakan awalan sesuai komponen.

Contoh:

```
.btn-primary

.card

.badge-success

.tooltip

.loader
```

---

## JavaScript

Gunakan ES Module.

Contoh:

```javascript
import { initTabs } from "./tabs/tabs.js";
import { showLoader } from "./loaders/loader.js";
import { showToast } from "./alerts/alert.js";
```

---

# Accessibility

Seluruh komponen wajib mendukung:

- Semantic HTML
- Keyboard Navigation
- Focus Indicator
- Screen Reader
- ARIA Attributes
- Kontras warna yang memadai
- Pengurangan animasi melalui `prefers-reduced-motion` bila memungkinkan

---

# Performance

Komponen dioptimalkan untuk:

- Lazy Rendering
- Event Delegation
- CSS Animation berbasis `transform` dan `opacity`
- Minimal DOM Manipulation
- Reusable Template
- Tree Shaking melalui ES Module
- Bebas dependensi library UI pihak ketiga

---

# Theme Support

Komponen kompatibel dengan:

- Glass Theme
- Light Theme
- Dark Theme
- High Contrast Theme

---

# Browser Support

Mendukung browser modern:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Browser Android berbasis Chromium

---

# Coding Standard

- HTML5 Semantic
- CSS3 Modern
- Vanilla JavaScript (ES2022+)
- Modular Architecture
- Clean Code
- Reusable Components
- Accessibility First
- Mobile First

---

# Lisensi

```
MIT License

Copyright (c) 2026
SMAN 1 Sooko Mojokerto
```

---

# Version

```
Sarprasin 2.0
UI Component Library
Version : 2.0.0
Status  : Production Ready
```
