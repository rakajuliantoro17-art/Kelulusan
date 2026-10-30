# Loaders Component

```
src/components/ui/loaders/
```

## Deskripsi

Komponen **Loaders** digunakan untuk memberikan umpan balik visual kepada pengguna ketika aplikasi sedang memuat data, melakukan sinkronisasi, menyimpan perubahan, mengunggah file, atau menjalankan proses AI.

Seluruh loader pada **Sarprasin 2.0** menggunakan desain yang ringan, konsisten, dan mendukung tema **Glassmorphism**, **Dark Mode**, serta **Responsive Design**.

Komponen ini dirancang agar tidak hanya menampilkan animasi, tetapi juga memberikan informasi status proses kepada pengguna.

---

# Struktur Folder

```
loaders/

├── README.md
├── loader.html
├── loader.js
├── loader.css
│
├── spinner-loader.html
├── dots-loader.html
├── pulse-loader.html
├── skeleton-loader.html
├── progress-loader.html
├── page-loader.html
├── overlay-loader.html
├── table-loader.html
├── chart-loader.html
└── upload-loader.html
```

---

# Jenis Loader

## Spinner Loader

Digunakan untuk proses singkat.

Contoh:

```
⟳ Memuat...
```

---

## Dots Loader

Animasi titik.

```
•
••
•••
```

---

## Pulse Loader

Efek denyut.

Digunakan pada Card.

---

## Skeleton Loader

Placeholder sebelum data muncul.

Contoh:

```
████████████

████████

███████
```

---

## Progress Loader

Untuk upload, download, import, export.

```
████████░░░░░░░

65%
```

---

## Overlay Loader

Menutupi seluruh halaman saat proses penting berlangsung.

Contoh:

```
Sedang Menyimpan...
```

---

## Table Loader

Placeholder tabel.

---

## Chart Loader

Placeholder grafik.

---

## Upload Loader

Digunakan saat upload foto atau dokumen.

---

# API

## showLoader()

```javascript
showLoader();
```

---

## hideLoader()

```javascript
hideLoader();
```

---

## setLoaderMessage()

```javascript
setLoaderMessage(

    "Memuat data..."

);
```

---

## setLoaderProgress()

```javascript
setLoaderProgress(45);
```

---

## createSkeleton()

```javascript
createSkeleton({

    rows:5

});
```

---

# State

Loader mendukung beberapa status:

- Loading
- Processing
- Uploading
- Downloading
- Saving
- Syncing
- Success
- Error

---

# Accessibility

Seluruh loader harus mendukung:

- `role="status"`
- `aria-live="polite"`
- `aria-busy="true"`
- Teks status yang dapat dibaca screen reader
- Tidak hanya mengandalkan animasi sebagai indikator proses

---

# Responsive

Desktop

```
Center Overlay
```

Tablet

```
Center
```

Mobile

```
Full Width
```

---

# Digunakan oleh

Komponen loader digunakan pada:

- Login
- Dashboard
- Inventaris
- Maintenance
- Laporan
- Approval
- Audit
- Pengadaan
- User Management
- Executive Dashboard
- AI Analytics
- Upload File
- Import Excel
- Export PDF
- Sinkronisasi Firestore

---

# Best Practice

- Tampilkan loader hanya jika proses diperkirakan lebih dari ±300 ms.
- Sertakan pesan proses yang jelas, misalnya "Menyimpan data..." atau "Mengunggah foto...".
- Gunakan Skeleton Loader untuk daftar, tabel, dan kartu agar mengurangi efek perpindahan tata letak (*layout shift*).
- Nonaktifkan tombol aksi selama proses berlangsung.
- Tutup loader segera setelah proses selesai atau gagal.

---

# Integrasi

Loader dapat dipadukan dengan:

- Form
- Button
- Table
- Card
- Modal
- Upload
- Chart
- Toast
- Notification
- Firestore
- AI Analytics

---

# Theme

Didukung oleh:

- Glass Theme
- Light Theme
- Dark Theme
- High Contrast Mode

---

# Performance

- CSS Animation menggunakan `transform` dan `opacity` untuk performa yang lebih baik.
- Tidak memblokir rendering halaman jika tidak diperlukan.
- Mendukung *lazy rendering* untuk skeleton pada tabel dan dashboard besar.

---

# Version

```
Sarprasin 2.0
Component : Loaders
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
