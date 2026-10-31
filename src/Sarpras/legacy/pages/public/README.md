# Public Pages

```
src/pages/public/
```

## Deskripsi

Folder **Public Pages** berisi seluruh halaman yang dapat diakses tanpa proses autentikasi pada aplikasi **Sarprasin 2.0**.

Halaman dalam folder ini digunakan untuk:

- Landing Page
- Login
- Reset Password
- Informasi Sistem
- Kebijakan Privasi
- Bantuan
- Halaman Error
- Status Server
- Validasi QR Aset (Read Only)

Semua halaman publik menggunakan **Design System Sarprasin 2.0** sehingga memiliki tampilan yang konsisten dengan halaman setelah login.

---

# Struktur Folder

```
public/

├── README.md
│
├── landing.html
├── login.html
├── forgot-password.html
├── reset-password.html
├── verify-email.html
│
├── maintenance.html
├── offline.html
├── unauthorized.html
├── not-found.html
│
├── privacy-policy.html
├── terms-of-service.html
├── help.html
├── faq.html
├── contact.html
│
├── about.html
├── version.html
├── release-notes.html
├── changelog.html
│
├── status.html
├── announcement.html
├── asset-check.html
└── qrcode.html
```

---

# Daftar Halaman

## landing.html

Landing page utama sebelum pengguna melakukan login.

Fitur:

- Hero Banner
- Ringkasan Sarprasin
- Statistik Sistem
- Tombol Login
- Footer

---

## login.html

Halaman autentikasi pengguna.

Digunakan oleh:

- Admin
- Operator
- Kepala Sekolah
- Waka Sarpras
- Teknisi
- Auditor

---

## forgot-password.html

Permintaan reset password.

---

## reset-password.html

Membuat password baru menggunakan token.

---

## verify-email.html

Verifikasi email pengguna.

---

## maintenance.html

Ditampilkan ketika sistem sedang dalam maintenance.

---

## offline.html

Halaman ketika aplikasi tidak memiliki koneksi internet.

Digunakan oleh PWA.

---

## unauthorized.html

Halaman 401 / 403.

Pengguna tidak memiliki hak akses.

---

## not-found.html

Halaman 404.

---

## privacy-policy.html

Kebijakan privasi Sarprasin.

---

## terms-of-service.html

Syarat dan ketentuan penggunaan.

---

## help.html

Pusat bantuan.

---

## faq.html

Frequently Asked Questions.

---

## contact.html

Kontak Administrator Sistem.

---

## about.html

Informasi mengenai aplikasi Sarprasin.

---

## version.html

Informasi versi aplikasi.

---

## release-notes.html

Catatan rilis.

---

## changelog.html

Riwayat perubahan aplikasi.

---

## status.html

Status layanan aplikasi.

Contoh:

- Database
- Firestore
- Storage
- Server
- Sinkronisasi

---

## announcement.html

Pengumuman dari administrator.

---

## asset-check.html

Validasi QR Code aset secara publik.

Hanya menampilkan informasi dasar:

- Nama Aset
- Kode Inventaris
- Lokasi
- Status
- Foto

Tanpa hak edit.

---

## qrcode.html

Halaman hasil scan QR Code.

---

# Layout

Semua halaman menggunakan komponen berikut:

```
App Container

Topbar

Glass Card

Button

Input

Toast

Notification

Loader

Footer
```

---

# Komponen yang Digunakan

```
components/layout/

components/forms/

components/cards/

components/buttons/

components/loaders/

components/alerts/
```

---

# Routing

```
/

Landing

/login

Login

/help

Help

/status

Status

/about

About

/contact

Contact

/privacy-policy

Privacy Policy

/terms-of-service

Terms

/offline

Offline

/maintenance

Maintenance

/asset-check

Asset Validation
```

---

# Accessibility

Seluruh halaman mendukung:

- Semantic HTML5
- Keyboard Navigation
- Screen Reader
- ARIA Landmark
- High Contrast
- Responsive Layout

---

# Responsive

Desktop

```
>=1200px
```

Tablet

```
768–1199px
```

Mobile

```
<=767px
```

---

# Theme

Seluruh halaman mendukung:

- Glass Theme
- Light Theme
- Dark Theme
- High Contrast

---

# Browser Support

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Chromium Android

---

# Coding Standard

- HTML5
- CSS3
- Vanilla JavaScript (ES Module)
- Modular Architecture
- Mobile First
- Accessibility First

---

# Keamanan

Halaman publik **tidak boleh**:

- Mengakses data sensitif.
- Menampilkan informasi pengguna yang sedang login.
- Mengizinkan perubahan data inventaris.
- Mengekspos konfigurasi Firebase atau kredensial aplikasi.

Semua akses ke data harus melalui aturan keamanan dan API yang sesuai.

---

# Version

```
Sarprasin 2.0
Public Pages
Version : 2.0.0
License : MIT
Author  : SMAN 1 Sooko Mojokerto
```
