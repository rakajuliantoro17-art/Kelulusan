# Predictive Maintenance
## Sarprasin 2.0

---

# Overview

Predictive Maintenance merupakan modul Artificial Intelligence yang bertugas memperkirakan kondisi aset di masa mendatang berdasarkan histori penggunaan, usia aset, nilai aset, lokasi, kondisi saat ini, dan riwayat perawatan.

Tujuan utama modul ini adalah mengubah pola pemeliharaan dari **Reactive Maintenance** menjadi **Predictive Maintenance**, sehingga kerusakan dapat dicegah sebelum terjadi.

---

# Objectives

Predictive Maintenance dikembangkan untuk:

- Mengurangi kerusakan mendadak.
- Memperpanjang umur aset.
- Mengoptimalkan biaya pemeliharaan.
- Menentukan prioritas servis.
- Mendukung penyusunan RKAS dan RAB.
- Memberikan rekomendasi tindakan sebelum aset mengalami kerusakan berat.

---

# Maintenance Strategy

Sarprasin mendukung empat jenis strategi pemeliharaan.

## 1. Reactive Maintenance

Perbaikan dilakukan setelah aset rusak.

Contoh:

```
LCD Proyektor mati

↓

Baru dilakukan servis.
```

---

## 2. Preventive Maintenance

Perawatan dilakukan berdasarkan jadwal.

Contoh:

```
Servis AC setiap 6 bulan.
```

---

## 3. Condition Based Maintenance

Perawatan dilakukan berdasarkan kondisi aset.

Contoh:

```
Status

Perlu Perbaikan

↓

Jadwalkan pemeriksaan.
```

---

## 4. Predictive Maintenance

AI memperkirakan kemungkinan kerusakan sebelum terjadi.

Contoh:

```
Komputer Lab 2

Usia : 8 Tahun

Histori Servis : 5 kali

↓

Prediksi:

Risiko kerusakan tinggi dalam 4 bulan.
```

---

# Data Sources

Model menggunakan data dari:

## Firestore

Collection:

```
aset
```

Field:

- kodeBarang
- namaBarang
- tahun
- kodeRuang
- kodeKondisi
- nilai
- createdAt
- updatedAt

---

Collection:

```
logAktivitas
```

Field:

- aktivitas
- tanggal
- user
- kodeBarang

---

Collection:

```
maintenance
```

*(Direncanakan pada Phase 2)*

Field:

- tanggalServis
- jenisServis
- biaya
- teknisi
- hasilServis

---

# Feature Engineering

Beberapa fitur utama yang digunakan.

## Asset Age

```
Usia = Tahun Sekarang - Tahun Pengadaan
```

---

## Condition Score

| Kondisi | Nilai |
|----------|-------|
| Baik | 100 |
| Perlu Perbaikan | 70 |
| Rusak Berat | 30 |

---

## Maintenance Frequency

Jumlah perawatan yang pernah dilakukan.

---

## Repair Frequency

Jumlah kerusakan.

---

## Downtime

Jumlah hari aset tidak dapat digunakan.

---

## Asset Value

Nilai ekonomis aset.

---

## Room Usage

Intensitas penggunaan ruangan.

---

## User Reports

Jumlah laporan kerusakan dari pengguna.

---

# Prediction Flow

```
Firestore

↓

Feature Engineering

↓

Machine Learning Model

↓

Risk Score

↓

Maintenance Recommendation

↓

Dashboard Executive
```

---

# Risk Score

AI menghasilkan skor risiko.

| Score | Risiko |
|--------|---------|
| 0 - 25 | Sangat Rendah |
| 26 - 50 | Rendah |
| 51 - 75 | Sedang |
| 76 - 90 | Tinggi |
| 91 - 100 | Sangat Tinggi |

---

# Recommendation Engine

Berdasarkan Risk Score.

## Risiko Rendah

- Monitoring rutin.

---

## Risiko Sedang

- Pemeriksaan teknisi.

---

## Risiko Tinggi

- Jadwalkan servis.

---

## Risiko Sangat Tinggi

- Prioritaskan penggantian aset.

---

# Example

Input

```
Nama Barang

Komputer Laboratorium

Tahun

2017

Status

Baik

Riwayat Servis

4 kali

Penggunaan

Setiap hari
```

Output

```
Risk Score

82

Prediksi

Rusak dalam 6–9 bulan.

Rekomendasi

Lakukan pemeriksaan hardware dan siapkan anggaran penggantian.
```

---

# Machine Learning Candidates

Tahap awal.

- Random Forest
- XGBoost
- Decision Tree

Tahap lanjut.

- LSTM
- Time Series Forecasting
- Survival Analysis

---

# Dashboard Integration

Executive Dashboard akan menampilkan:

- Asset Health Score
- Top 10 Risiko Tertinggi
- Jadwal Servis
- Estimasi Umur Aset
- Prediksi Penggantian
- Biaya Pemeliharaan

---

# Notification

Jika Risk Score melebihi batas tertentu.

Contoh:

```
Risk Score > 80

↓

Trigger n8n

↓

Email

↓

WhatsApp

↓

Dashboard Notification
```

---

# Future IoT Integration

Apabila sekolah menggunakan sensor IoT.

Contoh data tambahan:

- Suhu perangkat
- Tegangan listrik
- Konsumsi daya
- Jam operasional
- Kelembaban ruangan

Data tersebut dapat meningkatkan akurasi prediksi.

---

# Success Metrics

Implementasi dianggap berhasil apabila:

- Penurunan jumlah kerusakan mendadak.
- Penurunan biaya perbaikan darurat.
- Peningkatan umur pakai aset.
- Peningkatan ketepatan jadwal servis.
- Efisiensi penggunaan anggaran pemeliharaan.

---

# Long-Term Vision

Predictive Maintenance menjadi fondasi **Smart Asset Lifecycle Management**, yaitu sistem yang mampu memantau kondisi aset secara berkelanjutan, memperkirakan kebutuhan pemeliharaan, serta memberikan rekomendasi berbasis data untuk mendukung pengambilan keputusan di lingkungan sekolah.
