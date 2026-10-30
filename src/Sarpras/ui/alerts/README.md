# Alerts Component

```
src/components/ui/alerts/
```

## Deskripsi

Komponen **Alerts** digunakan untuk menampilkan pesan penting kepada pengguna di seluruh aplikasi **Sarprasin 2.0**.

Alerts berbeda dengan:

| Komponen | Fungsi |
|----------|--------|
| Alert | Informasi penting di dalam halaman |
| Toast | Notifikasi singkat yang hilang otomatis |
| Modal | Memerlukan interaksi pengguna |
| Notification Center | Daftar seluruh notifikasi |

Alerts digunakan ketika pengguna perlu mengetahui kondisi sistem, hasil proses, atau peringatan tanpa mengganggu alur kerja.

---

# Struktur Folder

```
alerts/

├── README.md
├── alert.html
├── alert.css
├── alert.js
└── icons/
```

---

# Jenis Alert

## Success

Digunakan ketika proses berhasil.

Contoh:

- Data berhasil disimpan
- Sinkronisasi selesai
- Backup berhasil

```html
<div class="alert alert-success">

    Data berhasil disimpan.

</div>
```

---

## Info

Informasi umum.

Contoh:

- Versi aplikasi
- Informasi maintenance
- Jadwal inventaris

```html
<div class="alert alert-info">

    Sinkronisasi terakhir 5 menit yang lalu.

</div>
```

---

## Warning

Peringatan.

Contoh:

- Stok hampir habis
- Jadwal maintenance mendekati
- Penyimpanan hampir penuh

```html
<div class="alert alert-warning">

    Kapasitas penyimpanan hampir penuh.

</div>
```

---

## Error

Kesalahan.

Contoh:

- Firestore gagal
- Upload gagal
- Login gagal

```html
<div class="alert alert-danger">

    Gagal menyimpan data.

</div>
```

---

# API

## showAlert()

```javascript
showAlert({

    type:"success",

    title:"Berhasil",

    message:"Data berhasil disimpan."

});
```

---

## hideAlert()

```javascript
hideAlert();
```

---

## updateAlert()

```javascript
updateAlert({

    title:"Maintenance",

    message:"Server akan diperbarui malam ini."

});
```

---

# Properties

| Property | Tipe | Keterangan |
|----------|------|------------|
| type | String | success, info, warning, danger |
| title | String | Judul alert |
| message | String | Isi alert |
| dismissible | Boolean | Bisa ditutup |
| timeout | Number | Auto close (ms) |

---

# Integrasi Firebase

Alert dapat digunakan setelah:

- Firebase Authentication
- Firestore
- Storage
- Cloud Functions
- Sync Spreadsheet

Contoh:

```javascript
try{

    await addDoc(...);

    showAlert({

        type:"success",

        title:"Berhasil",

        message:"Aset berhasil ditambahkan."

    });

}catch(e){

    showAlert({

        type:"danger",

        title:"Error",

        message:e.message

    });

}
```

---

# Standar Warna

| Jenis | Warna |
|--------|--------|
| Success | Hijau |
| Info | Biru |
| Warning | Kuning |
| Danger | Merah |

Semua warna mengikuti variabel pada:

```
src/assets/css/base/variables.css
```

---

# Accessibility

Komponen harus mendukung:

- `role="alert"`
- `aria-live="assertive"`
- Navigasi keyboard
- Kontras warna yang memadai
- Ikon tidak menjadi satu-satunya penanda status

---

# Responsive

Alerts harus tampil optimal pada:

- Desktop
- Laptop
- Tablet
- Mobile

Pada layar kecil, alert menggunakan lebar penuh (`width: 100%`) dengan tinggi mengikuti isi.

---

# Best Practice

- Gunakan bahasa yang jelas dan singkat.
- Hindari menampilkan detail teknis kepada pengguna umum.
- Tampilkan detail error teknis hanya pada log atau mode administrator.
- Gunakan alert untuk informasi yang tetap terlihat hingga pengguna menutupnya.
- Gunakan toast untuk notifikasi singkat yang tidak memerlukan perhatian terus-menerus.

---

# Digunakan Oleh

Komponen ini digunakan pada hampir seluruh modul Sarprasin 2.0, antara lain:

- Dashboard
- Inventaris Aset
- Maintenance
- Pengadaan
- Laporan
- QR Code
- Pengguna
- Executive Dashboard
- AI Analytics
- Pengaturan Sistem

---

# Version

```
Sarprasin 2.0
Component : Alerts
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
