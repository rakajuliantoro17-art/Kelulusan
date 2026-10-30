# Forms Component

```
src/components/ui/forms/
```

## Deskripsi

Komponen **Forms** merupakan kumpulan elemen formulir standar yang digunakan di seluruh aplikasi **Sarprasin 2.0**. Seluruh input dibuat konsisten sehingga proses CRUD, pencarian, autentikasi, pengaturan sistem, maintenance, hingga AI Analytics memiliki tampilan dan perilaku yang sama.

Semua komponen mendukung desain **Glassmorphism**, **Dark Mode**, **Responsive Layout**, **Accessibility (WCAG)**, dan **Validasi Real-time**.

---

# Struktur Folder

```
forms/

├── README.md
├── form.html
├── form.js
├── form.css
│
├── input.html
├── textarea.html
├── select.html
├── checkbox.html
├── radio.html
├── switch.html
├── datepicker.html
├── upload.html
├── search.html
├── login-form.html
├── asset-form.html
├── maintenance-form.html
├── report-form.html
├── user-form.html
├── settings-form.html
└── qr-form.html
```

---

# Jenis Form

## Standard Form

Digunakan untuk seluruh halaman CRUD.

---

## Login Form

Autentikasi pengguna.

Field:

- Email
- Password

---

## Asset Form

Digunakan untuk inventaris.

Contoh field:

- Nama Barang
- Kode Inventaris
- Kategori
- Lokasi
- Kondisi
- Tahun Perolehan
- Nilai
- Foto

---

## Maintenance Form

Field:

- Tanggal
- Teknisi
- Jenis Maintenance
- Biaya
- Catatan

---

## User Form

Field:

- Nama
- Email
- Role
- Status

---

## Report Form

Digunakan untuk filter laporan.

---

## Settings Form

Konfigurasi aplikasi.

---

## QR Form

Generate QR Asset.

---

# Komponen Input

- Text
- Email
- Password
- Number
- Currency
- Search
- Date
- Time
- Select
- Textarea
- Checkbox
- Radio
- Toggle Switch
- Upload File
- Upload Image
- Hidden
- Color Picker

---

# Validasi

Didukung:

- Required
- Min Length
- Max Length
- Pattern
- Email
- Number
- Date
- Custom Validator

Contoh:

```javascript
validateField(input);
```

---

# API

## createForm()

```javascript
createForm({

    id:"assetForm"

});
```

---

## validateForm()

```javascript
validateForm(form);
```

---

## getFormData()

```javascript
const data = getFormData(form);
```

---

## setFormData()

```javascript
setFormData(

    form,

    data

);
```

---

## resetForm()

```javascript
resetForm(form);
```

---

# State

Form mendukung beberapa state:

- Default
- Focus
- Success
- Error
- Disabled
- Readonly
- Loading

---

# Accessibility

Setiap field harus memiliki:

- `<label>`
- `for`
- `id`
- `aria-invalid`
- `aria-describedby`
- `autocomplete`
- Focus indicator

---

# Responsive

Desktop

```
2–4 kolom
```

Tablet

```
2 kolom
```

Mobile

```
1 kolom
```

---

# Integrasi Firestore

Contoh:

```json
{
    "assetName":"Laptop Lenovo",
    "location":"Lab Komputer",
    "condition":"Baik"
}
```

---

# Digunakan oleh

Komponen form digunakan pada:

- Login
- Dashboard
- Inventaris
- Maintenance
- Pengadaan
- Audit
- Approval
- User Management
- QR Generator
- AI Analytics
- Pengaturan
- Executive Dashboard

---

# Best Practice

- Gunakan label yang jelas.
- Kelompokkan field berdasarkan fungsi.
- Tampilkan validasi secara langsung setelah input.
- Jangan hanya mengandalkan warna untuk menunjukkan error.
- Gunakan placeholder sebagai contoh, bukan pengganti label.
- Nonaktifkan tombol submit selama proses penyimpanan berlangsung.
- Tampilkan indikator loading pada proses yang memerlukan waktu.

---

# Komponen Pendukung

Forms dapat dikombinasikan dengan:

- Button
- Dropdown
- Modal
- Card
- Badge
- Alert
- Toast
- Tooltip
- Upload
- Date Picker
- QR Scanner

---

# Style Guide

Tema yang didukung:

- Glass
- Filled
- Outline
- Minimal
- Compact

Ukuran:

- Small
- Medium
- Large

---

# Version

```
Sarprasin 2.0
Component : Forms
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
