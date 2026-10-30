# Dropdown Component

```
src/components/ui/dropdown/
```

## Deskripsi

Komponen **Dropdown** merupakan komponen antarmuka standar pada **Sarprasin 2.0** yang digunakan untuk memilih nilai, melakukan aksi, memfilter data, berpindah halaman, maupun menampilkan menu kontekstual.

Seluruh dropdown menggunakan desain yang konsisten dengan sistem **Glassmorphism + Modern Dashboard** serta mendukung aksesibilitas (ARIA), navigasi keyboard, pencarian, dan integrasi dengan Firestore.

---

# Struktur Folder

```
dropdown/

├── README.md
├── dropdown.html
├── dropdown.js
├── dropdown.css
│
├── action-dropdown.html
├── filter-dropdown.html
├── profile-dropdown.html
├── notification-dropdown.html
├── select-dropdown.html
├── searchable-dropdown.html
└── multi-select-dropdown.html
```

---

# Jenis Dropdown

## Standard Dropdown

Digunakan sebagai menu umum.

Contoh:

```
▼ Pilih
```

---

## Action Dropdown

Digunakan pada tabel dan card.

Contoh:

```
⋮

Detail
Edit
Hapus
QR Code
```

---

## Filter Dropdown

Digunakan untuk Dashboard.

Contoh:

- Semua
- Aktif
- Maintenance
- Rusak

---

## Profile Dropdown

Topbar pengguna.

Contoh:

- Profil
- Pengaturan
- Aktivitas
- Logout

---

## Notification Dropdown

Daftar notifikasi terbaru.

---

## Searchable Dropdown

Dropdown dengan fitur pencarian.

Cocok untuk:

- Daftar Ruangan
- Daftar User
- Daftar Barang
- Vendor
- Supplier

---

## Multi Select Dropdown

Memilih lebih dari satu item.

---

# API

## createDropdown()

```javascript
createDropdown({

    id:"room"

});
```

---

## openDropdown()

```javascript
openDropdown(dropdown);
```

---

## closeDropdown()

```javascript
closeDropdown(dropdown);
```

---

## toggleDropdown()

```javascript
toggleDropdown(dropdown);
```

---

## setDropdownItems()

```javascript
setDropdownItems(

    dropdown,

    items

);
```

---

## getSelected()

```javascript
getSelected(dropdown);
```

---

# Keyboard Support

| Tombol | Fungsi |
|---------|--------|
| Enter | Buka / Pilih |
| Space | Buka |
| Esc | Tutup |
| ↑ | Item sebelumnya |
| ↓ | Item berikutnya |
| Home | Item pertama |
| End | Item terakhir |
| Tab | Pindah fokus |

---

# Accessibility

Dropdown harus memiliki:

- `aria-expanded`
- `aria-haspopup`
- `role="listbox"`
- `role="option"`
- Navigasi keyboard penuh
- Fokus terlihat jelas (`:focus-visible`)

---

# Responsive

Desktop

```
Dropdown normal
```

Tablet

```
Lebar mengikuti container
```

Mobile

```
Full Width
```

---

# Digunakan oleh

Dropdown digunakan pada:

- Dashboard
- Inventaris
- Maintenance
- Laporan
- Approval
- Audit
- Pengadaan
- User Management
- Pengaturan
- Executive Dashboard
- Topbar
- Sidebar
- QR Scanner
- AI Analytics

---

# Integrasi Firestore

Contoh:

```json
[
    {
        "id":"lab-komputer",
        "label":"Lab Komputer"
    },
    {
        "id":"perpustakaan",
        "label":"Perpustakaan"
    }
]
```

---

# Best Practice

- Gunakan placeholder yang jelas.
- Tutup dropdown saat klik di luar komponen.
- Hindari daftar yang terlalu panjang tanpa fitur pencarian.
- Gunakan virtual scrolling bila item sangat banyak.
- Tampilkan indikator item aktif.
- Jangan gunakan dropdown untuk pilihan yang hanya berjumlah 2–3; pertimbangkan radio button atau segmented control.

---

# Style

Dropdown mendukung beberapa variasi:

- Glass
- Filled
- Outline
- Compact
- Searchable
- Multi Select
- Action Menu

---

# Komponen Pendukung

Dropdown dapat dipadukan dengan:

- Avatar
- Badge
- Button
- Card
- Tooltip
- Search Box
- Modal
- Table
- Pagination
- Filter Panel

---

# Version

```
Sarprasin 2.0
Component : Dropdown
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
