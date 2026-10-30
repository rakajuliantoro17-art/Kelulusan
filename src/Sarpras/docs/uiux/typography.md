# Typography
## Sarprasin 2.0 Design System

Version : 1.0.0

---

# Overview

Dokumen ini menjelaskan standar tipografi yang digunakan pada seluruh antarmuka Sarprasin 2.0.

Tujuan utama adalah menciptakan tampilan yang:

- Konsisten
- Mudah dibaca
- Profesional
- Responsif
- Ramah aksesibilitas

Seluruh halaman wajib mengikuti standar tipografi ini.

---

# Design Principles

Tipografi harus:

- Memiliki hierarki yang jelas.
- Mudah dibaca pada berbagai ukuran layar.
- Konsisten di seluruh aplikasi.
- Mendukung bahasa Indonesia dan karakter Unicode.

---

# Font Family

## Primary Font

```
Inter
```

Digunakan untuk:

- Dashboard
- Form
- Table
- Menu
- Button
- Dialog
- Report

Fallback

```
Inter,
Segoe UI,
Roboto,
Helvetica,
Arial,
sans-serif
```

---

## Monospace Font

```
JetBrains Mono
```

Digunakan untuk:

- Asset Code
- QR Identifier
- Log
- Console
- Token
- API Key
- Version

Fallback

```
JetBrains Mono,
Consolas,
Courier New,
monospace
```

---

# Font Weight

| Weight | Nilai | Penggunaan |
|---------|-------|------------|
| Light | 300 | Sangat jarang digunakan |
| Regular | 400 | Isi teks |
| Medium | 500 | Label dan tombol |
| SemiBold | 600 | Judul kecil |
| Bold | 700 | Judul utama |

---

# Font Scale

## H1

```
40px

700

48px Line Height
```

---

## H2

```
32px

700

40px
```

---

## H3

```
28px

600

36px
```

---

## H4

```
24px

600

32px
```

---

## H5

```
20px

600

28px
```

---

## H6

```
18px

600

26px
```

---

# Body

## Body Large

```
18px

400

30px
```

---

## Body

```
16px

400

28px
```

---

## Small

```
14px

400

22px
```

---

## Caption

```
12px

400

18px
```

---

## Overline

```
11px

500

Uppercase

Letter Spacing 1px
```

---

# Label

Digunakan pada:

- Form
- Input
- Table Header

```
14px

500
```

---

# Button Typography

```
14px

600
```

Gunakan Title Case.

Contoh:

```
Tambah Aset
```

---

# Table Typography

Header

```
14px

600
```

Isi

```
14px

400
```

---

# Navigation

Sidebar

```
15px

500
```

Topbar

```
14px

500
```

---

# Card Typography

Title

```
20px

600
```

Subtitle

```
14px

400
```

Content

```
16px

400
```

---

# Dashboard KPI

Label

```
14px

500
```

Value

```
36px

700
```

Description

```
13px

400
```

---

# Report Typography

Title

```
28px

700
```

Subtitle

```
18px

500
```

Table

```
12px

400
```

Footer

```
10px

400
```

---

# AI Components

Recommendation Title

```
18px

600
```

Confidence Score

```
16px

700
```

Insight

```
15px

400
```

---

# Asset Card

Asset Name

```
18px

600
```

Category

```
14px

400
```

Location

```
14px

400
```

Status

```
13px

500
```

---

# Number Formatting

Gunakan tabular numbers bila tersedia untuk:

- Nomor aset
- Nilai anggaran
- Statistik
- Dashboard KPI
- Persentase

---

# Text Alignment

Gunakan:

- Left untuk teks umum.
- Center untuk ikon dan badge.
- Right untuk angka dan nilai mata uang.

---

# Line Length

Ideal

```
50–75 karakter per baris
```

Untuk meningkatkan keterbacaan pada paragraf panjang.

---

# Letter Spacing

Body

```
Normal
```

Heading

```
-0.02em
```

Overline

```
0.08em
```

---

# Text Colors

Mengacu pada:

```
color-guide.md
```

Standar:

| Jenis | Warna |
|--------|--------|
| Heading | Gray 900 |
| Body | Gray 700 |
| Secondary | Gray 600 |
| Caption | Gray 500 |
| Disabled | Gray 400 |
| Inverse | White |

---

# Responsive Typography

## Desktop

Menggunakan ukuran penuh.

---

## Tablet

Turunkan ukuran heading sekitar 10%.

---

## Mobile

Turunkan ukuran heading sekitar 15–20% dan pertahankan body minimal 16px untuk kenyamanan membaca.

---

# Accessibility

- Gunakan ukuran teks minimal 16px untuk isi utama.
- Hindari paragraf yang terlalu panjang.
- Pastikan kontras teks memenuhi standar WCAG AA.
- Jangan gunakan huruf kapital penuh untuk paragraf panjang.

---

# CSS Variables

```css
:root{
  --font-family-base: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-family-mono: "JetBrains Mono", Consolas, "Courier New", monospace;

  --font-size-h1:40px;
  --font-size-h2:32px;
  --font-size-h3:28px;
  --font-size-h4:24px;
  --font-size-h5:20px;
  --font-size-h6:18px;

  --font-size-body:16px;
  --font-size-small:14px;
  --font-size-caption:12px;

  --font-weight-regular:400;
  --font-weight-medium:500;
  --font-weight-semibold:600;
  --font-weight-bold:700;
}
```

---

# Best Practices

- Gunakan maksimal dua keluarga font.
- Hindari penggunaan terlalu banyak variasi ukuran teks.
- Gunakan hierarki heading secara berurutan (H1 → H6).
- Pertahankan konsistensi ukuran pada seluruh modul.
- Gunakan monospace hanya untuk data teknis.

---

# Related Documents

- design-system.md
- color-guide.md
- components.md
- dashboard-layout.md

---

# Long-Term Vision

Typography menjadi bagian penting dari Design System Sarprasin 2.0 dengan menyediakan standar hierarki teks yang konsisten, mudah dibaca, dan siap diterapkan pada aplikasi web, mobile, dashboard AI, laporan, maupun pengembangan fitur di masa mendatang.
