# Self Correction
## Sarprasin 2.0

---

# Overview

Self Correction merupakan modul Artificial Intelligence yang bertugas mendeteksi, menganalisis, dan memberikan rekomendasi perbaikan terhadap data inventaris secara otomatis.

Modul ini bertujuan menjaga kualitas data agar tetap konsisten, akurat, dan dapat dipercaya tanpa menghilangkan kendali pengguna terhadap perubahan penting.

Self Correction tidak mengganti data secara sepihak. Untuk perubahan yang berdampak pada inventaris, sistem selalu meminta persetujuan pengguna sesuai hak akses.

---

# Objectives

Self Correction dikembangkan untuk:

- meningkatkan kualitas data inventaris
- mengurangi kesalahan input
- mendeteksi data ganda
- menjaga konsistensi master data
- membantu proses audit
- mengurangi pekerjaan administratif
- meningkatkan akurasi laporan

---

# Self Correction Architecture

```
User Input

↓

Validation Engine

↓

Rule Engine

↓

Machine Learning

↓

Self Correction Engine

↓

Recommendation

↓

Approval (User/Admin)

↓

Firestore

↓

Log Aktivitas
```

---

# Correction Levels

Sarprasin menggunakan empat tingkat koreksi.

---

## Level 1
### Automatic Formatting

Perbaikan format sederhana dilakukan otomatis.

Contoh:

Input

```
lcd projector
```

↓

Disimpan sebagai

```
LCD Projector
```

---

Input

```
   komputer lab
```

↓

Disimpan sebagai

```
Komputer Lab
```

---

## Level 2
### Rule-Based Correction

Menggunakan aturan yang telah ditentukan.

Contoh:

```
Status

baik
```

↓

```
Baik
```

---

```
Rusak berat
```

↓

```
Rusak Berat
```

---

## Level 3
### AI Recommendation

AI memberikan rekomendasi koreksi.

Contoh:

```
Nama Barang

LCD Epson X12
```

↓

AI

"Mungkin yang dimaksud adalah:

LCD Projector Epson X12"

Pengguna memilih:

- Setujui
- Tolak

---

## Level 4
### Human Approval

Perubahan yang memengaruhi data penting memerlukan persetujuan.

Contoh:

- penghapusan aset
- perubahan kode barang
- perpindahan ruangan
- perubahan nilai aset
- perubahan tahun pengadaan

---

# Validation Scope

Self Correction melakukan pemeriksaan terhadap:

- Nama Barang
- Kode Barang
- Lokasi
- Kondisi
- Tahun
- Nilai
- Sumber Dana
- Foto
- Metadata

---

# Duplicate Detection

AI mendeteksi data yang memiliki kemiripan tinggi.

Contoh

```
Laptop Asus

Laptop ASUS

Laptop asus
```

↓

Kemungkinan aset yang sama.

↓

Sistem memberikan rekomendasi penggabungan data.

---

# Data Consistency

Contoh

```
masterRuangan

Lab Komputer 1
```

Input

```
Lab Komputer I
```

↓

Rekomendasi

```
Lab Komputer 1
```

---

# Missing Data Detection

Contoh

```
Nama Barang

Komputer

↓

Nilai

Kosong
```

↓

AI memberikan notifikasi bahwa data belum lengkap.

---

# Anomaly Detection

Contoh

```
Kursi

Nilai

Rp25.000.000
```

↓

AI mendeteksi kemungkinan kesalahan input.

↓

Rekomendasi pemeriksaan.

---

# Photo Validation

Pada fase lanjutan, AI melakukan analisis terhadap foto aset.

Contoh

```
Nama Barang

Printer

↓

Foto

Komputer
```

↓

AI memberi peringatan bahwa foto kemungkinan tidak sesuai.

---

# Asset Lifecycle Validation

Contoh

```
Tahun Pengadaan

2015

Status

Baik

Histori Servis

0

```

↓

AI memberikan catatan bahwa kondisi tersebut tidak lazim dan menyarankan inspeksi ulang.

---

# Confidence Score

Setiap rekomendasi memiliki tingkat keyakinan.

| Confidence | Tindakan |
|------------|----------|
| 95–100% | Koreksi otomatis (format ringan) |
| 80–94% | Rekomendasi kepada pengguna |
| 60–79% | Perlu verifikasi |
| <60% | Tidak dilakukan koreksi |

---

# Approval Workflow

```
Data Baru

↓

Validation

↓

AI Analysis

↓

Correction Recommendation

↓

Approval

↓

Update Firestore

↓

Log Aktivitas
```

---

# Integration

Self Correction memanfaatkan:

- Validation Engine
- Recommendation Engine
- Machine Learning
- Firestore
- n8n
- Dashboard Executive

---

# Audit Trail

Seluruh koreksi dicatat.

Log meliputi:

- waktu
- pengguna
- data lama
- data baru
- alasan koreksi
- confidence score
- status persetujuan

---

# Dashboard Integration

Executive Dashboard dapat menampilkan:

- jumlah koreksi otomatis
- rekomendasi yang menunggu persetujuan
- data duplikat
- kualitas data
- tren kesalahan input
- tingkat keberhasilan koreksi

---

# Future Development

Tahap lanjutan mencakup:

- Computer Vision untuk validasi foto
- OCR untuk membaca label aset
- NLP untuk memahami nama barang
- Semantic Search untuk mendeteksi kemiripan data
- Continuous Learning dari histori koreksi yang telah disetujui

---

# Security

Self Correction tidak boleh:

- menghapus data permanen secara otomatis
- mengubah kode barang tanpa persetujuan
- mengubah nilai aset tanpa otorisasi
- memindahkan aset tanpa persetujuan pengguna berwenang

Seluruh tindakan mengikuti Role-Based Access Control (RBAC).

---

# Success Metrics

Implementasi dianggap berhasil apabila mampu:

- mengurangi data duplikat
- meningkatkan konsistensi master data
- meningkatkan kelengkapan data
- mempercepat proses audit
- mengurangi kesalahan input manual
- meningkatkan kualitas laporan inventaris

---

# Long-Term Vision

Self Correction menjadi **Data Quality Intelligence Layer** pada Sarprasin, yaitu lapisan yang secara berkelanjutan memantau kualitas data inventaris, mendeteksi anomali, memberikan rekomendasi perbaikan yang dapat dijelaskan (Explainable AI), serta menjaga integritas data sebagai fondasi bagi analitik, otomasi, dan pengambilan keputusan berbasis AI.
