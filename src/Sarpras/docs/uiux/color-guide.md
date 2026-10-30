# Color Guide
## Sarprasin 2.0 Design System

---

# Overview

Dokumen ini menjelaskan standar warna yang digunakan pada seluruh antarmuka Sarprasin 2.0.

Tujuan utama panduan ini adalah menjaga konsistensi visual, meningkatkan keterbacaan, serta memberikan pengalaman pengguna yang modern dan profesional.

---

# Design Principles

Warna harus:

- Konsisten
- Mudah dibaca
- Memiliki kontras yang baik
- Mendukung aksesibilitas (WCAG)
- Mudah diterapkan pada seluruh modul

---

# Brand Colors

## Primary

Digunakan sebagai identitas utama aplikasi.

| Token | HEX |
|--------|------|
| Primary 900 | #0B1F4D |
| Primary 800 | #123A73 |
| Primary 700 | #1E5AA8 |
| Primary 600 | #2563EB |
| Primary 500 | #3B82F6 |
| Primary 400 | #60A5FA |
| Primary 300 | #93C5FD |
| Primary 200 | #BFDBFE |
| Primary 100 | #DBEAFE |
| Primary 50 | #EFF6FF |

---

## Secondary

Digunakan untuk elemen pendukung.

| Token | HEX |
|--------|------|
| Secondary 600 | #0F766E |
| Secondary 500 | #14B8A6 |
| Secondary 400 | #2DD4BF |
| Secondary 300 | #5EEAD4 |
| Secondary 100 | #CCFBF1 |

---

# Semantic Colors

## Success

| Token | HEX |
|--------|------|
| Success 600 | #15803D |
| Success 500 | #22C55E |
| Success 300 | #86EFAC |
| Success 100 | #DCFCE7 |

Digunakan untuk:

- Data berhasil disimpan
- Status aktif
- Proses selesai

---

## Warning

| Token | HEX |
|--------|------|
| Warning 600 | #CA8A04 |
| Warning 500 | #EAB308 |
| Warning 300 | #FDE047 |
| Warning 100 | #FEF9C3 |

Digunakan untuk:

- Pengingat
- Perlu perhatian
- Maintenance mendekat

---

## Danger

| Token | HEX |
|--------|------|
| Danger 600 | #B91C1C |
| Danger 500 | #EF4444 |
| Danger 300 | #FCA5A5 |
| Danger 100 | #FEE2E2 |

Digunakan untuk:

- Error
- Penghapusan
- Aset rusak berat

---

## Info

| Token | HEX |
|--------|------|
| Info 600 | #0369A1 |
| Info 500 | #0EA5E9 |
| Info 300 | #7DD3FC |
| Info 100 | #E0F2FE |

---

# Neutral Colors

| Token | HEX |
|--------|------|
| Gray 950 | #0F172A |
| Gray 900 | #1E293B |
| Gray 800 | #334155 |
| Gray 700 | #475569 |
| Gray 600 | #64748B |
| Gray 500 | #94A3B8 |
| Gray 400 | #CBD5E1 |
| Gray 300 | #E2E8F0 |
| Gray 200 | #F1F5F9 |
| Gray 100 | #F8FAFC |
| White | #FFFFFF |

---

# Background Colors

| Area | Warna |
|------|--------|
| App Background | #F8FAFC |
| Card | #FFFFFF |
| Sidebar | #0B1F4D |
| Navbar | #FFFFFF |
| Footer | #FFFFFF |

---

# Text Colors

| Elemen | Warna |
|---------|--------|
| Heading | #0F172A |
| Body | #334155 |
| Secondary | #64748B |
| Disabled | #94A3B8 |
| White Text | #FFFFFF |

---

# Status Colors

| Status | Warna |
|---------|--------|
| Active | Success 500 |
| Inactive | Gray 500 |
| Maintenance | Warning 500 |
| Damaged | Danger 500 |
| Archived | Gray 400 |

---

# Asset Condition Colors

| Kondisi | Warna |
|----------|--------|
| Sangat Baik | #16A34A |
| Baik | #22C55E |
| Cukup | #EAB308 |
| Rusak Ringan | #F97316 |
| Rusak Berat | #DC2626 |

---

# Chart Colors

Gunakan palet berikut secara berurutan.

1. #2563EB
2. #14B8A6
3. #22C55E
4. #EAB308
5. #F97316
6. #EF4444
7. #8B5CF6
8. #EC4899

---

# Button Colors

## Primary

Background

```
#2563EB
```

Hover

```
#1D4ED8
```

---

## Success

Background

```
#22C55E
```

---

## Warning

Background

```
#EAB308
```

---

## Danger

Background

```
#EF4444
```

---

# Border Colors

Default

```
#E2E8F0
```

Hover

```
#CBD5E1
```

Focus

```
#2563EB
```

---

# Shadow

Small

```
0 1px 2px rgba(0,0,0,.05)
```

Medium

```
0 4px 8px rgba(0,0,0,.08)
```

Large

```
0 10px 25px rgba(0,0,0,.12)
```

---

# Accessibility

- Rasio kontras minimal 4.5:1 untuk teks normal.
- Hindari penggunaan warna sebagai satu-satunya indikator status.
- Tambahkan ikon atau label untuk membedakan kondisi penting.
- Pastikan seluruh kombinasi warna tetap terbaca pada mode terang maupun gelap.

---

# Dark Mode

| Area | Warna |
|------|--------|
| Background | #0F172A |
| Card | #1E293B |
| Text | #F8FAFC |
| Border | #334155 |

---

# CSS Variables

```css
:root{
  --color-primary:#2563EB;
  --color-secondary:#14B8A6;
  --color-success:#22C55E;
  --color-warning:#EAB308;
  --color-danger:#EF4444;
  --color-info:#0EA5E9;

  --gray-900:#1E293B;
  --gray-700:#475569;
  --gray-500:#94A3B8;
  --gray-300:#E2E8F0;
  --gray-100:#F8FAFC;
  --white:#FFFFFF;
}
```

---

# Best Practices

- Gunakan warna primer untuk aksi utama.
- Gunakan warna status secara konsisten di seluruh modul.
- Hindari penggunaan lebih dari tiga warna utama dalam satu tampilan.
- Gunakan ruang putih (white space) untuk meningkatkan keterbacaan.
- Pastikan seluruh komponen mengikuti token warna yang telah ditentukan.

---

# Long-Term Vision

Color Guide menjadi bagian dari Design System Sarprasin 2.0 sehingga seluruh halaman web, dashboard, laporan, aplikasi mobile, dan modul AI memiliki identitas visual yang konsisten, profesional, dan mudah dikenali oleh pengguna.
