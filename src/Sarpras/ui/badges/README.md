# Badges Component

```
src/components/ui/badges/
```

## Deskripsi

Komponen **Badges** digunakan untuk menampilkan label kecil yang memberikan informasi singkat mengenai status, kategori, prioritas, role pengguna, kondisi aset, maupun indikator lainnya di seluruh aplikasi **Sarprasin 2.0**.

Badge harus bersifat ringan, mudah dikenali, konsisten, dan dapat digunakan bersama tabel, card, form, maupun dashboard.

---

# Struktur Folder

```
badges/

├── README.md
├── badge.html
├── badge.css
├── badge.js
├── badge-group.html
└── icons/
```

---

# Jenis Badge

## Primary

Digunakan untuk label utama.

Contoh:

```
Admin
```

---

## Secondary

Digunakan untuk informasi tambahan.

Contoh:

```
Inventaris
```

---

## Success

Menunjukkan kondisi berhasil atau baik.

Contoh:

```
Aktif
Tersedia
Selesai
```

---

## Warning

Digunakan untuk kondisi yang perlu diperhatikan.

Contoh:

```
Maintenance
Menunggu
Segera
```

---

## Danger

Digunakan untuk kondisi kritis.

Contoh:

```
Rusak
Expired
Ditolak
```

---

## Info

Informasi umum.

Contoh:

```
Draft
Sinkronisasi
Baru
```

---

# Badge Role

| Role | Badge |
|------|--------|
| Admin | Merah |
| Executive | Ungu |
| User | Biru |
| Guest | Abu |

---

# Badge Status Aset

| Status | Warna |
|---------|--------|
| Tersedia | Hijau |
| Dipinjam | Biru |
| Maintenance | Kuning |
| Rusak | Merah |
| Dihapus | Abu |

---

# Badge Prioritas

| Prioritas | Warna |
|-----------|--------|
| Low | Abu |
| Normal | Biru |
| High | Jingga |
| Critical | Merah |

---

# Badge Approval

| Status | Warna |
|---------|--------|
| Draft | Abu |
| Pending | Kuning |
| Approved | Hijau |
| Rejected | Merah |

---

# API

## createBadge()

```javascript
createBadge({

    text:"Aktif",

    type:"success"

});
```

---

## updateBadge()

```javascript
updateBadge({

    text:"Maintenance",

    type:"warning"

});
```

---

## removeBadge()

```javascript
removeBadge();
```

---

# Ukuran

| Size | Tinggi |
|------|---------|
| sm | 20px |
| md | 26px |
| lg | 32px |

---

# Bentuk

- Rounded
- Pill
- Square

Contoh:

```
[ Aktif ]

( Admin )

▢ Draft
```

---

# Accessibility

Badge harus:

- Memiliki kontras warna yang baik.
- Tidak hanya mengandalkan warna untuk menyampaikan informasi.
- Dapat dibaca oleh screen reader bila memuat status penting.
- Mendukung mode gelap.

---

# Responsive

Badge harus menyesuaikan ukuran font dan padding pada layar kecil tanpa mengubah makna informasi.

---

# Integrasi Data

Badge dapat dibuat berdasarkan field Firestore.

Contoh:

```json
{
    "status":"maintenance",
    "priority":"high",
    "role":"admin"
}
```

---

# Digunakan Oleh

Komponen badge digunakan pada:

- Dashboard
- Asset Card
- User Card
- Maintenance
- Approval
- Audit
- Executive Dashboard
- Report
- Notification
- QR Scanner
- AI Analytics

---

# Best Practice

- Gunakan teks singkat (1–3 kata).
- Hindari badge terlalu panjang.
- Gunakan ikon hanya jika memperjelas informasi.
- Konsisten menggunakan warna berdasarkan jenis status.
- Jangan menggunakan badge sebagai pengganti tombol aksi.

---

# Version

```
Sarprasin 2.0
Component : Badges
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
