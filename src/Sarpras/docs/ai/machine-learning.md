# Machine Learning
## Sarprasin 2.0

---

# Overview

Machine Learning (ML) pada Sarprasin dikembangkan untuk membantu proses pengelolaan aset sekolah melalui analisis data historis, prediksi, klasifikasi, dan rekomendasi.

Machine Learning tidak menggantikan keputusan pengguna, melainkan menjadi sistem pendukung (Decision Support System) yang memberikan rekomendasi berdasarkan pola data.

---

# Objectives

Implementasi Machine Learning bertujuan untuk:

- meningkatkan kualitas data inventaris
- memprediksi kondisi aset
- mendeteksi data yang tidak valid
- mengurangi duplikasi data
- membantu perencanaan anggaran
- memberikan rekomendasi pengadaan
- meningkatkan efisiensi pengelolaan aset

---

# Machine Learning Architecture

```
User

↓

Dashboard

↓

Firestore

↓

Automation Layer

↓

Feature Engineering

↓

Machine Learning Engine

↓

Prediction

↓

Recommendation

↓

Executive Dashboard
```

---

# Machine Learning Pipeline

## Step 1

Data Collection

Sumber data:

- Firestore
- Log Aktivitas
- Spreadsheet Backup
- Foto Aset
- Histori Perbaikan
- Histori Pengadaan
- Histori Pemindahan
- Master Data

---

## Step 2

Data Validation

Membersihkan data.

Contoh:

- data kosong
- format salah
- kode barang ganda
- tahun tidak valid
- nilai negatif

---

## Step 3

Data Cleaning

Normalisasi data.

Contoh:

```
LCD Epson
```

↓

```
LCD Projector Epson
```

↓

```
Projector Epson
```

---

## Step 4

Feature Engineering

Contoh fitur:

- umur aset
- nilai aset
- lokasi
- kondisi
- sumber dana
- frekuensi perbaikan
- frekuensi penggunaan
- jumlah perpindahan
- histori kerusakan

---

## Step 5

Training Dataset

Dataset dibagi menjadi:

Training

70%

Validation

15%

Testing

15%

---

## Step 6

Model Training

Model dilatih menggunakan dataset historis.

---

## Step 7

Prediction

Model menghasilkan prediksi.

---

## Step 8

Recommendation

Hasil prediksi diterjemahkan menjadi rekomendasi.

---

# Dataset

Dataset utama berasal dari Firestore.

## Collection

```
aset
```

Field:

- namaBarang
- kodeBarang
- kodeRuang
- kodeKondisi
- kodeSumber
- tahun
- nilai
- createdAt
- updatedAt

---

## Collection

```
logAktivitas
```

Field:

- aktivitas
- user
- tanggal
- kodeBarang

---

## Collection

```
masterRuangan
```

---

## Collection

```
masterKondisi
```

---

## Collection

```
masterSumberDana
```

---

# Feature List

Machine Learning akan menggunakan beberapa feature utama.

## Asset Age

```
Tahun Sekarang - Tahun Pengadaan
```

---

## Asset Value

Nilai aset.

---

## Condition Score

Baik

↓

100

Perlu Perbaikan

↓

70

Rusak Berat

↓

30

---

## Repair Frequency

Jumlah perbaikan.

---

## Movement Frequency

Jumlah perpindahan aset.

---

## Usage Score

Frekuensi penggunaan.

---

## Asset Category

Kategori barang.

---

# Machine Learning Modules

## 1. Duplicate Detection

Tujuan

Mendeteksi data yang sama.

Contoh

```
Laptop ASUS
```

dan

```
Laptop Asus
```

↓

Duplikat.

---

## 2. Smart Classification

Mengelompokkan aset otomatis.

Contoh

Printer

↓

Elektronik

---

## 3. Asset Health Prediction

Memprediksi kondisi aset.

Output

- Baik
- Perlu Perbaikan
- Rusak Berat

---

## 4. Predictive Maintenance

Memprediksi kapan aset membutuhkan perawatan.

Contoh

```
Proyektor

↓

Servis dalam 5 bulan.
```

---

## 5. Procurement Recommendation

Memberikan rekomendasi pembelian.

Prioritas berdasarkan:

- usia
- kondisi
- penggunaan
- biaya

---

## 6. Budget Recommendation

Menghitung prioritas anggaran.

---

## 7. Room Optimization

Menganalisis distribusi aset.

Contoh

Lab Komputer 1

↓

Kelebihan Printer

↓

Kurangi satu unit.

---

## 8. Self Correction

Memperbaiki data otomatis.

Contoh

```
Kondis = baik
```

↓

```
Kondisi = Baik
```

---

# Model Candidates

Tahap awal menggunakan model sederhana.

## Classification

- Decision Tree
- Random Forest
- XGBoost

---

## Prediction

- Linear Regression
- Random Forest Regressor

---

## Clustering

- K-Means

---

## Recommendation

- Similarity Search
- Cosine Similarity

---

## Text Processing

- Sentence Embedding
- Vector Search

---

# Evaluation Metrics

Model dievaluasi menggunakan:

Classification

- Accuracy
- Precision
- Recall
- F1 Score

Regression

- MAE
- RMSE

Recommendation

- Precision@K
- Recall@K

---

# Retraining Strategy

Model diperbarui secara berkala.

Tahap awal:

Setiap 3 bulan.

Tahap lanjut:

Otomatis jika jumlah data bertambah signifikan.

---

# Storage

Model dapat disimpan menggunakan:

- Firebase Storage
- Google Cloud Storage
- HuggingFace
- Local Server

---

# Future Integration

Machine Learning dapat diintegrasikan dengan:

- TensorFlow
- PyTorch
- Scikit-Learn
- Vertex AI
- Google Gemini
- OpenAI
- Ollama

---

# Success Criteria

Machine Learning dianggap berhasil apabila mampu:

- meningkatkan akurasi data inventaris
- mengurangi duplikasi data
- memberikan prediksi yang dapat dipertanggungjawabkan
- membantu penyusunan anggaran
- meningkatkan efisiensi pengelolaan aset
- mempercepat proses inventarisasi

---

# Long-Term Vision

Machine Learning merupakan fondasi menuju **Autonomous Asset Intelligence**, yaitu sistem inventaris yang mampu belajar dari data historis, mengenali pola penggunaan aset, memprediksi kebutuhan pemeliharaan, dan memberikan rekomendasi strategis kepada pengelola sekolah secara berkelanjutan.
