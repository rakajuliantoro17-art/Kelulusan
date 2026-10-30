# Avatar Component

```
src/components/ui/avatar/
```

## Deskripsi

Komponen **Avatar** digunakan untuk menampilkan identitas visual pengguna pada seluruh aplikasi **Sarprasin 2.0**.

Avatar digunakan pada:

- Topbar
- Sidebar
- User Card
- Profile Page
- Activity Log
- Chat AI (Future)
- Notification
- Approval
- Audit Trail

Komponen ini mendukung foto profil, inisial nama, ikon bawaan, serta status pengguna secara realtime.

---

# Struktur Folder

```
avatar/

├── README.md
├── avatar.html
├── avatar.css
├── avatar.js
├── avatar-group.html
└── assets/
```

---

# Fitur

- Foto profil pengguna
- Fallback ke inisial nama
- Fallback ke ikon default
- Badge status online/offline
- Badge role pengguna
- Responsive
- Lazy loading image
- Dark Mode Support
- Glassmorphism Ready

---

# Jenis Avatar

## Small

Digunakan pada tabel dan log aktivitas.

Ukuran

```
32 x 32 px
```

---

## Medium

Digunakan pada topbar.

Ukuran

```
48 x 48 px
```

---

## Large

Digunakan pada halaman profil.

Ukuran

```
80 x 80 px
```

---

## Extra Large

Digunakan pada halaman akun.

Ukuran

```
120 x 120 px
```

---

# Status

Avatar dapat memiliki status.

| Status | Badge |
|---------|-------|
| online | Hijau |
| offline | Abu |
| busy | Merah |
| away | Kuning |

---

# Role Badge

| Role | Warna |
|------|--------|
| admin | Merah |
| executive | Ungu |
| user | Biru |
| guest | Abu |

---

# Struktur Data

```json
{
  "uid": "UID123",
  "name": "Raka Aditya Juliantoro",
  "photoURL": "/uploads/users/raka.jpg",
  "email": "user@example.com",
  "role": "admin",
  "status": "online"
}
```

---

# API

## createAvatar()

```javascript
createAvatar({

    name:"Raka Aditya",

    photoURL:"/uploads/users/raka.jpg"

});
```

---

## updateAvatar()

```javascript
updateAvatar({

    status:"online"

});
```

---

## removeAvatar()

```javascript
removeAvatar();
```

---

# Fallback

Urutan prioritas:

```
Foto Profil

↓

Inisial Nama

↓

Icon Default
```

Contoh:

```
RA
```

---

# Accessibility

Avatar harus memiliki:

- alt yang sesuai
- aria-label bila dapat diklik
- fokus keyboard jika menjadi tombol
- kontras badge yang memadai

---

# Responsive

| Device | Size |
|---------|------|
| Desktop | XL / L / M |
| Tablet | M |
| Mobile | S / M |

---

# Integrasi Firebase

Avatar mengambil data dari:

```
users/{uid}
```

Field yang digunakan:

```
displayName

photoURL

role

status
```

Apabila `photoURL` kosong maka sistem otomatis menggunakan inisial nama.

---

# Digunakan Oleh

- Dashboard
- Sidebar
- Topbar
- User Management
- Approval
- Maintenance
- Audit
- Notification
- Executive Dashboard
- AI Assistant

---

# Best Practice

- Gunakan foto persegi (1:1).
- Aktifkan `loading="lazy"` untuk gambar.
- Jangan menampilkan gambar rusak; gunakan fallback otomatis.
- Tampilkan badge status hanya jika relevan.
- Hindari ukuran avatar yang tidak konsisten di halaman yang sama.

---

# Version

```
Sarprasin 2.0
Component : Avatar
Version   : 2.0.0
License   : MIT
Author    : SMAN 1 Sooko Mojokerto
```
