# Cards Component

```
src/components/ui/cards/
```

## Deskripsi

Komponen **Cards** merupakan salah satu komponen inti pada **Sarprasin 2.0**. Card digunakan sebagai wadah (container) untuk menyajikan informasi, statistik, data aset, aktivitas, notifikasi, laporan, hingga hasil analisis AI secara konsisten.

Seluruh card pada aplikasi menggunakan desain **Glassmorphism + Material Design + Dashboard Modern** sehingga memiliki tampilan yang ringan, responsif, dan mudah dikembangkan.

---

# Struktur Folder

```
cards/

├── README.md
├── card.html
├── card.js
├── card.css
│
├── stat-card.html
├── info-card.html
├── asset-card.html
├── user-card.html
├── maintenance-card.html
├── report-card.html
├── executive-card.html
├── notification-card.html
├── chart-card.html
├── ai-card.html
└── empty-card.html
```

---

# Jenis Card

## Standard Card

Digunakan sebagai container umum.

```
┌─────────────────────────────┐
│ Judul                       │
│-----------------------------│
│ Isi                         │
└─────────────────────────────┘
```

---

## Statistic Card

Dashboard KPI

Contoh

- Total Aset
- Total Ruangan
- Total User
- Nilai Inventaris

---

## Asset Card

Informasi detail aset.

Contoh

- Foto
- Nama
- Kode Inventaris
- Kondisi
- Lokasi

---

## User Card

Profil pengguna.

---

## Maintenance Card

Status pemeliharaan.

---

## Executive Card

Ringkasan KPI untuk pimpinan.

---

## Notification Card

Notifikasi sistem.

---

## Report Card

Ringkasan laporan.

---

## AI Card

Insight dari AI Analytics.

---

## Empty Card

Ditampilkan ketika tidak ada data.

---

# Struktur Card

```
Card

├── Header
│
├── Body
│
├── Footer
│
└── Actions
```

---

# API

## createCard()

```javascript
createCard({

    title:"Total Aset"

});
```

---

## updateCard()

```javascript
updateCard(card,{
    title:"Inventaris"
});
```

---

## removeCard()

```javascript
removeCard(card);
```

---

# Ukuran

| Size | Lebar |
|------|--------|
| sm | 280 px |
| md | 360 px |
| lg | 480 px |
| xl | 100% |

---

# Style

- Filled
- Glass
- Outline
- Elevated
- Flat

---

# Accessibility

Card harus:

- Memiliki heading yang jelas.
- Menggunakan landmark HTML yang tepat.
- Memiliki kontras warna yang cukup.
- Mendukung mode gelap.
- Fokus terlihat bila interaktif.

---

# Responsive

Desktop

```
4 Card/Grid
```

Tablet

```
2 Card/Grid
```

Mobile

```
1 Card/Grid
```

---

# Digunakan oleh

Komponen card digunakan pada:

- Dashboard
- Executive Dashboard
- Inventaris
- Maintenance
- Approval
- Audit
- Laporan
- QR Scanner
- User Management
- Notification Center
- AI Analytics
- Profil Pengguna

---

# Integrasi

Card dapat diisi langsung dari Firestore.

Contoh:

```json
{
    "title":"Laptop Lenovo",
    "status":"Tersedia",
    "condition":"Baik"
}
```

---

# Best Practice

- Gunakan tinggi yang konsisten dalam satu grid.
- Maksimal satu aksi utama (Primary Action) pada setiap card.
- Tempatkan informasi penting di bagian atas.
- Hindari teks yang terlalu panjang.
- Gunakan badge untuk status dan kondisi.
- Gunakan skeleton loader saat data masih dimuat.

---

# Komponen Pendukung

Card dapat dipadukan dengan:

- Avatar
- Badge
- Button
- Chart
- Progress Bar
- Tooltip
- Dropdown
- Modal
- QR Code
- AI Insight

---

# Version

```
Sarprasin 2.0
Component : Cards
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
