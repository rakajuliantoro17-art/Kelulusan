# Tabs Component

```
src/components/ui/tabs/
```

## Deskripsi

Komponen **Tabs** merupakan sistem navigasi horizontal yang digunakan untuk menampilkan beberapa kelompok konten dalam satu halaman tanpa perlu berpindah halaman.

Pada **Sarprasin 2.0**, Tabs digunakan pada halaman:

- Dashboard
- Detail Aset
- Maintenance
- Executive Dashboard
- Profil Pengguna
- Laporan
- Pengaturan
- AI Analytics

Komponen dirancang menggunakan **Glassmorphism UI**, mendukung **Dark Mode**, **Responsive**, serta memenuhi standar **Accessibility (WCAG)**.

---

# Struktur Folder

```
tabs/

├── README.md
├── tabs.html
├── tabs.js
├── tabs.css
│
├── underline-tabs.html
├── pill-tabs.html
├── icon-tabs.html
├── vertical-tabs.html
├── card-tabs.html
└── mobile-tabs.html
```

---

# Jenis Tabs

## Underline Tabs

```
Dashboard | Inventaris | Laporan
-----------              --------
```

Digunakan pada halaman utama.

---

## Pill Tabs

```
[Dashboard] [Maintenance] [Report]
```

Cocok untuk filter dan navigasi cepat.

---

## Icon Tabs

```
🏠 Dashboard

📦 Inventaris

📊 Report
```

---

## Vertical Tabs

```
Dashboard

Inventaris

Maintenance

Laporan
```

Digunakan pada halaman Settings.

---

## Card Tabs

Setiap tab berbentuk Card.

---

## Mobile Tabs

Mendukung swipe dan scroll horizontal.

---

# API

## initTabs()

```javascript
initTabs();
```

---

## activateTab()

```javascript
activateTab("dashboard");
```

---

## nextTab()

```javascript
nextTab();
```

---

## previousTab()

```javascript
previousTab();
```

---

## getActiveTab()

```javascript
const id = getActiveTab();
```

---

# HTML Structure

```html
<div class="tabs">

    <button
        class="tab active">

        Dashboard

    </button>

    <button
        class="tab">

        Inventaris

    </button>

</div>

<div class="tab-content">

    ...

</div>
```

---

# State

Setiap tab memiliki state:

- Active
- Hover
- Focus
- Disabled
- Loading

---

# Accessibility

Setiap Tabs mendukung:

- role="tablist"
- role="tab"
- role="tabpanel"
- aria-selected
- aria-controls
- aria-labelledby
- Keyboard Navigation
- Arrow Navigation
- Home / End Key

---

# Responsive

Desktop

```
Horizontal
```

Tablet

```
Horizontal Scroll
```

Mobile

```
Swipeable Tabs
```

---

# Digunakan oleh

- Dashboard
- Asset Detail
- Maintenance
- Audit
- Approval
- User
- AI Analytics
- Executive Dashboard
- Report
- Settings

---

# Integrasi

Tabs dapat digunakan bersama:

- Cards
- Table
- Charts
- Forms
- Loader
- Modal
- Notification
- AI Dashboard

---

# Best Practice

- Maksimal 7 tab dalam satu baris.
- Gunakan nama tab yang singkat dan jelas.
- Selalu tampilkan indikator tab aktif.
- Pertahankan konten tab di DOM bila memungkinkan agar status form tidak hilang saat berpindah tab.
- Gunakan lazy loading hanya untuk konten yang berat seperti grafik atau laporan besar.

---

# Theme

Komponen mendukung:

- Glass
- Light
- Dark
- High Contrast

---

# Performance

- Menggunakan event delegation untuk klik.
- Mendukung lazy rendering pada panel.
- Mendukung animasi ringan berbasis CSS (`transform` dan `opacity`).
- Kompatibel dengan sistem SPA Sarprasin 2.0.

---

# Version

```
Sarprasin 2.0
Component : Tabs
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
