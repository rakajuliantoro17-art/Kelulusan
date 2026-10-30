# Recommendation Engine
## Sarprasin 2.0

---

# Overview

Recommendation Engine merupakan modul Artificial Intelligence yang bertugas menghasilkan rekomendasi strategis berdasarkan data inventaris, histori aktivitas, kondisi aset, penggunaan ruangan, anggaran, dan hasil analisis Machine Learning.

Modul ini menjadi pusat pengambilan keputusan (Decision Support System) dalam ekosistem Sarprasin.

Recommendation Engine tidak menggantikan keputusan manusia, melainkan menyediakan rekomendasi yang dapat dipertanggungjawabkan berdasarkan data.

---

# Objectives

Recommendation Engine dikembangkan untuk:

- Membantu prioritas pengadaan aset.
- Memberikan rekomendasi pemeliharaan.
- Mengoptimalkan distribusi aset.
- Mengurangi pemborosan anggaran.
- Menentukan aset yang perlu diganti.
- Mendukung penyusunan RKAS.
- Mendukung penyusunan RAB.
- Memberikan rekomendasi kepada pimpinan sekolah.

---

# Recommendation Architecture

```
Firestore

↓

Machine Learning

↓

Predictive Maintenance

↓

Analytics Engine

↓

Recommendation Engine

↓

Dashboard Executive

↓

Decision Maker
```

---

# Recommendation Categories

Sarprasin menghasilkan beberapa jenis rekomendasi.

---

## Asset Recommendation

Contoh:

```
Komputer Lab 1

↓

Usia

9 Tahun

↓

Risk Score

92

↓

Rekomendasi

Prioritaskan penggantian.
```

---

## Maintenance Recommendation

Contoh:

```
AC Ruang Guru

↓

Servis terakhir

8 bulan lalu

↓

Rekomendasi

Lakukan pembersihan dan pemeriksaan refrigeran.
```

---

## Procurement Recommendation

AI menyusun daftar prioritas pengadaan.

Contoh:

```
1. Komputer

2. LCD Proyektor

3. UPS

4. Access Point

5. Printer
```

Prioritas dihitung berdasarkan:

- umur aset
- kondisi
- jumlah pengguna
- frekuensi kerusakan
- nilai aset
- urgensi

---

## Budget Recommendation

AI membantu pembagian anggaran.

Contoh:

```
Anggaran

Rp300.000.000

↓

Rekomendasi

45%

Komputer

25%

Jaringan

20%

Furniture

10%

Cadangan
```

---

## Room Optimization

AI mengevaluasi distribusi aset.

Contoh:

```
Lab Komputer 1

↓

Printer

4 Unit

↓

Lab Komputer 2

Printer

1 Unit

↓

Rekomendasi

Pindahkan 1 printer.
```

---

## Inventory Optimization

Contoh:

```
Gudang

↓

25 Kursi

↓

Tidak digunakan

↓

Rekomendasi

Distribusikan ke ruang kelas.
```

---

## Lifecycle Recommendation

AI memperkirakan siklus hidup aset.

Contoh:

```
Proyektor Epson

↓

Usia

8 Tahun

↓

Sisa Umur

2 Tahun

↓

Mulai siapkan anggaran penggantian.
```

---

# Recommendation Inputs

Engine memanfaatkan data dari:

## Firestore

Collection:

```
aset
```

---

Collection:

```
masterRuangan
```

---

Collection:

```
masterKondisi
```

---

Collection:

```
logAktivitas
```

---

Collection:

```
maintenance
```

(Phase 2)

---

# Recommendation Factors

Beberapa faktor yang digunakan.

| Faktor | Bobot Awal |
|----------|-----------:|
| Kondisi Aset | 30% |
| Umur Aset | 20% |
| Frekuensi Perbaikan | 15% |
| Intensitas Penggunaan | 15% |
| Nilai Aset | 10% |
| Jumlah Pengguna | 5% |
| Lokasi | 5% |

Bobot dapat berubah sesuai hasil evaluasi model Machine Learning.

---

# Recommendation Score

AI menghasilkan skor rekomendasi.

```
0 - 20

Tidak perlu tindakan.
```

---

```
21 - 40

Monitoring.
```

---

```
41 - 60

Pemeriksaan.
```

---

```
61 - 80

Servis.
```

---

```
81 - 100

Prioritas Penggantian.
```

---

# Recommendation Workflow

```
Input Data

↓

Validation

↓

Machine Learning

↓

Risk Analysis

↓

Recommendation Engine

↓

Executive Dashboard

↓

Approval

↓

Automation (n8n)

↓

Log Aktivitas
```

---

# Dashboard Integration

Executive Dashboard menampilkan:

- Top 10 Rekomendasi Pengadaan
- Top 10 Prioritas Servis
- Top 10 Risiko Tertinggi
- Asset Health Score
- Prioritas Anggaran
- Distribusi Aset
- Efisiensi Inventaris

---

# Automation Integration

Jika rekomendasi telah disetujui.

```
Approval

↓

n8n

↓

Generate Dokumen

↓

Email

↓

WhatsApp

↓

Google Spreadsheet

↓

Arsip
```

---

# Future AI Integration

Recommendation Engine dapat memanfaatkan:

- TensorFlow
- Scikit-Learn
- Vertex AI
- Google Gemini
- OpenAI
- Ollama
- HuggingFace

---

# Explainable AI

Setiap rekomendasi harus dapat dijelaskan.

Contoh:

```
Mengapa komputer ini direkomendasikan untuk diganti?

↓

Usia:
9 Tahun

Kondisi:
Perlu Perbaikan

Histori Servis:
6 kali

Risk Score:
91

Asset Health Score:
34

Sisa Umur:
1 Tahun
```

Dengan demikian pengguna dapat memahami alasan di balik setiap rekomendasi.

---

# Success Metrics

Recommendation Engine dianggap berhasil apabila mampu:

- meningkatkan kualitas pengambilan keputusan
- mengurangi biaya pemeliharaan
- meningkatkan efisiensi distribusi aset
- meningkatkan umur pakai aset
- membantu penyusunan RKAS
- membantu penyusunan RAB
- meningkatkan transparansi pengelolaan sarana dan prasarana

---

# Long-Term Vision

Recommendation Engine menjadi pusat **AI Decision Support System** dalam Sarprasin, yang menggabungkan analitik, Machine Learning, dan otomasi untuk menghasilkan rekomendasi strategis yang transparan, dapat dijelaskan (Explainable AI), dan mendukung pengelolaan aset sekolah secara berkelanjutan.

Dalam jangka panjang, modul ini tidak hanya memberikan rekomendasi untuk tingkat sekolah, tetapi juga dapat dikembangkan untuk mendukung pengelolaan aset pada tingkat yayasan, dinas pendidikan, atau jaringan sekolah dengan tetap mempertahankan prinsip keamanan data dan kendali keputusan oleh pengguna.
