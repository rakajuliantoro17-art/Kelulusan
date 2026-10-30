# Tooltip Component

```
src/components/ui/tooltip/
```

## Deskripsi

Komponen **Tooltip** digunakan untuk menampilkan informasi tambahan secara ringkas ketika pengguna mengarahkan kursor (*hover*), memfokuskan elemen dengan keyboard, atau mengetuk elemen pada perangkat sentuh.

Pada **Sarprasin 2.0**, tooltip membantu menjelaskan fungsi ikon, tombol, badge, grafik, status aset, dan berbagai elemen antarmuka tanpa memenuhi ruang layar.

Komponen dirancang menggunakan gaya **Glassmorphism**, mendukung **Dark Mode**, **Responsive Design**, serta mengikuti standar **Accessibility (WCAG 2.1)**.

---

# Struktur Folder

```
tooltip/

├── README.md
├── tooltip.html
├── tooltip.js
├── tooltip.css
│
├── icon-tooltip.html
├── button-tooltip.html
├── badge-tooltip.html
├── table-tooltip.html
├── chart-tooltip.html
└── image-tooltip.html
```

---

# Jenis Tooltip

## Default Tooltip

```
🛈 Informasi tambahan
```

Digunakan untuk teks sederhana.

---

## Icon Tooltip

```
ⓘ

"Aset terakhir diperbarui 2 hari lalu"
```

---

## Button Tooltip

```
[ Edit ]

Mengubah data aset.
```

---

## Badge Tooltip

```
[ Maintenance ]

Sedang dalam proses perbaikan.
```

---

## Table Tooltip

Digunakan untuk teks yang dipotong (*ellipsis*).

---

## Chart Tooltip

Menampilkan nilai grafik saat hover.

---

## Image Tooltip

Menampilkan informasi tambahan pada gambar atau QR Code.

---

# HTML Structure

```html
<button
    class="tooltip-trigger"
    data-tooltip="Tambah aset baru">

    +

</button>
```

---

# API

## initTooltip()

```javascript
initTooltip();
```

---

## showTooltip()

```javascript
showTooltip(element);
```

---

## hideTooltip()

```javascript
hideTooltip();
```

---

## updateTooltip()

```javascript
updateTooltip(

    element,

    "Data berhasil diperbarui"

);
```

---

# Attribute

Tooltip membaca atribut:

```
data-tooltip="..."
```

Opsional:

```
data-tooltip-position="top"

data-tooltip-position="bottom"

data-tooltip-position="left"

data-tooltip-position="right"
```

---

# Position

Didukung:

- Top
- Bottom
- Left
- Right
- Auto (default)

---

# Accessibility

Tooltip mendukung:

- role="tooltip"
- aria-describedby
- Keyboard Focus
- Escape untuk menutup
- Screen Reader Friendly

---

# Responsive

Desktop

- Hover
- Focus

Tablet

- Tap
- Focus

Mobile

- Tap
- Long Press (opsional)

---

# Digunakan oleh

- Dashboard
- Sidebar
- Topbar
- Button
- Badge
- Table
- Card
- Chart
- QR Code
- User Avatar
- AI Analytics

---

# Integrasi

Tooltip dapat dipadukan dengan:

- Button
- Badge
- Card
- Chart
- Table
- Modal
- Dropdown
- Notification

---

# Best Practice

- Gunakan tooltip hanya untuk informasi tambahan, bukan informasi utama.
- Hindari isi tooltip yang terlalu panjang (idealnya maksimal 1–2 kalimat).
- Pastikan tooltip tetap dapat diakses melalui keyboard.
- Jangan menampilkan tooltip pada elemen yang dinonaktifkan tanpa pembungkus yang dapat menerima fokus.

---

# Theme

Komponen mendukung:

- Glass Theme
- Light Theme
- Dark Theme
- High Contrast

---

# Performance

- Menggunakan satu elemen tooltip global yang dipindahkan sesuai target.
- Event delegation untuk mengurangi jumlah listener.
- Posisi dihitung otomatis agar tidak keluar dari viewport.
- Animasi ringan menggunakan `opacity` dan `transform`.

---

# Version

```
Sarprasin 2.0
Component : Tooltip
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
