# Buttons Component

```
src/components/ui/buttons/
```

## Deskripsi

Komponen **Buttons** merupakan komponen aksi utama pada **Sarprasin 2.0**. Seluruh tombol di aplikasi harus menggunakan sistem ini agar tampilan, perilaku, aksesibilitas, dan pengalaman pengguna tetap konsisten.

Button digunakan untuk menjalankan aksi seperti:

- Menyimpan data
- Mengubah data
- Menghapus data
- Login
- Logout
- Export
- Import
- Refresh
- Sinkronisasi
- Upload
- Download
- Cetak
- Navigasi
- Membuka Modal
- Menjalankan AI Assistant

---

# Struktur Folder

```
buttons/

├── README.md
├── button.html
├── button-group.html
├── floating-button.html
├── icon-button.html
├── loading-button.html
├── split-button.html
├── button.css
├── button.js
└── icons/
```

---

# Jenis Button

| Tipe | Kegunaan |
|-------|----------|
| Primary | Aksi utama halaman |
| Secondary | Aksi pendukung |
| Outline | Aksi alternatif |
| Ghost | Toolbar |
| Text | Link Action |
| Success | Simpan |
| Warning | Maintenance |
| Danger | Hapus |
| Info | Informasi |
| Dark | Dark Mode |

---

# Ukuran

| Size | Tinggi |
|------|---------|
| xs | 28 px |
| sm | 34 px |
| md | 42 px |
| lg | 48 px |
| xl | 56 px |

---

# Bentuk

- Rounded
- Pill
- Square
- Circle

---

# Variasi Button

## Standard Button

```html
<button class="btn btn-primary">

    Simpan

</button>
```

---

## Icon Button

```html
<button class="btn btn-icon">

    💾

</button>
```

---

## Icon + Text

```html
<button class="btn btn-success">

    💾 Simpan

</button>
```

---

## Loading Button

```html
<button class="btn btn-primary loading">

    Menyimpan...

</button>
```

---

## Disabled Button

```html
<button disabled>

    Simpan

</button>
```

---

## Floating Action Button (FAB)

Digunakan pada mobile maupun dashboard.

Contoh:

```
+
```

---

## Split Button

Digunakan pada Export.

```
Export ▼
```

---

# Status

- Normal
- Hover
- Active
- Focus
- Disabled
- Loading

---

# API

## createButton()

```javascript
createButton({

    text:"Simpan",

    type:"primary"

});
```

---

## enableButton()

```javascript
enableButton(button);
```

---

## disableButton()

```javascript
disableButton(button);
```

---

## loadingButton()

```javascript
loadingButton(button,true);
```

---

# Accessibility

Button harus:

- Mendukung navigasi keyboard
- Memiliki `aria-label` jika hanya berupa ikon
- Fokus terlihat jelas (`:focus-visible`)
- Tidak hanya mengandalkan warna untuk menunjukkan status

---

# Responsive

Pada perangkat mobile:

- Tinggi minimum 44 px
- Area sentuh minimal 44×44 px
- Tombol dapat memenuhi lebar container bila diperlukan

---

# Integrasi

Button digunakan oleh hampir seluruh modul:

- Dashboard
- Inventaris
- Maintenance
- Pengadaan
- Laporan
- Approval
- Audit
- QR Scanner
- AI Analytics
- User Management
- Pengaturan
- Executive Dashboard

---

# Mapping Ikon

| Aksi | Ikon |
|------|------|
| Tambah | ➕ |
| Simpan | 💾 |
| Edit | ✏️ |
| Hapus | 🗑 |
| Refresh | 🔄 |
| Upload | ⬆ |
| Download | ⬇ |
| Export | 📤 |
| Import | 📥 |
| Print | 🖨 |
| Search | 🔍 |
| Filter | ⚙ |
| QR Code | 📱 |
| AI | 🤖 |
| Logout | 🚪 |

---

# Best Practice

- Gunakan hanya **satu Primary Button** pada setiap section.
- Tombol **Danger** hanya untuk aksi destruktif.
- Tampilkan indikator loading untuk proses asynchronous.
- Jangan gunakan ikon tanpa tooltip atau `aria-label`.
- Gunakan urutan aksi yang konsisten, misalnya **Simpan** di kiri dan **Batal** di kanan.
- Nonaktifkan tombol saat proses sedang berlangsung untuk mencegah klik ganda.

---

# Standar Penempatan

| Lokasi | Rekomendasi |
|---------|-------------|
| Form | Kanan bawah |
| Modal | Footer |
| Toolbar | Atas kanan |
| Dashboard | Header / Toolbar |
| Mobile | FAB atau Full Width |

---

# Version

```
Sarprasin 2.0
Component : Buttons
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
