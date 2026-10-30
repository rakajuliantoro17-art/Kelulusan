# Blueprint Arsip Inventaris & Visi Sistem Sekolah
## Sarprasin v2.0 — SMAN 1 Sooko Mojokerto
### Disusun dari sudut pandang Software Engineer & System Architect

---

## 0. Latar Belakang & Sikap Desain

Setelah menelusuri kode dan skema yang ada (`docs/database/firestore-schema.md`, `src/services/asset/*`), saya menemukan satu prinsip yang **belum dipegang teguh**: aset di-*mutate* langsung. Field seperti `kodeKondisi`, `kodeRuang`, `status` di-overwrite setiap kali update. Ini bekerja untuk aplikasi CRUD biasa, tapi **gagal sebagai arsip**.

Arsip yang disiplin punya satu hukum besi:

> **Data lama tidak pernah dihapus atau ditimpa. Ia hanya "ditutup" dan digantikan oleh data baru yang mereferensikannya.**

Ini prinsip *append-only* / *event-sourcing ringan* — bukan untuk seluruh sistem (terlalu berat untuk skala sekolah), tapi wajib untuk apa pun yang punya nilai hukum/audit: kondisi aset, lokasi aset, kepemilikan, dan penghapusan.

Semua yang saya rancang di bawah ini dibangun di atas prinsip itu, sekaligus mempertahankan skema yang sudah ada (`assets`, `rooms`, `categories`, dst) sebagai **lapisan "state saat ini"** — cepat dibaca dashboard — didukung oleh lapisan arsip di baliknya.

---

## 1. Arsitektur Dua Lapis: State + Archive

```
┌─────────────────────────────────────────────┐
│  LAPISAN STATE (cepat, untuk UI/dashboard)   │
│  assets/{id}  → kondisi & lokasi TERKINI     │
└───────────────────┬───────────────────────────┘
                    │ setiap perubahan memicu
                    ▼
┌─────────────────────────────────────────────┐
│  LAPISAN ARSIP (append-only, untuk audit)    │
│  assets/{id}/history/{eventId}               │
│  assets/{id}/movements/{moveId}              │
│  assets/{id}/documents/{docId}               │
└─────────────────────────────────────────────┘
```

Prinsip kerja: **tidak ada write ke `assets` tanpa write yang sesuai ke sub-collection arsip.** Ini di-enforce di `asset.service.js` (satu pintu masuk), bukan diserahkan ke tiap komponen UI.

---

## 2. Kodefikasi Aset — Standar Nasional, Bukan Buatan Sendiri

Kode aset sekarang (`LABKOM-2026-001`) sudah bagus untuk manusia, tapi tidak selaras dengan standar **Kartu Inventaris Barang (KIB)** yang dipakai instansi pemerintah/sekolah negeri (Permendagri No. 19/2016 & Permendikbud terkait BMN/BMD). Auditor dan tim akreditasi akan mencari format ini.

### Rekomendasi format kode ganda:
| Jenis Kode | Format | Fungsi |
|---|---|---|
| **Kode Internal** (sudah ada) | `LABKOM-2026-001` | Untuk operasional harian, QR |
| **Kode Registrasi BMD** (baru) | `KIB-A.03.06.02.001.2026` | Untuk pelaporan resmi, sesuai golongan-bidang-kelompok BMD |
| **Nomor Register Fisik** | Stiker fisik tercetak di aset, sama dengan Kode Internal | Titik temu dunia fisik ↔ digital |

Field baru di `assets`:
```json
{
  "kodeBarang": "LABKOM-2026-001",
  "kodeBMD": "03.06.02.001",
  "golonganBMD": "Peralatan dan Mesin",
  "bidangBMD": "Alat Kantor dan Rumah Tangga"
}
```
Ini membuat data langsung siap diekspor ke format laporan BMD standar tanpa mapping manual saat audit datang.

---

## 3. Siklus Hidup Aset (State Machine) — Inti dari "Disiplin"

Aset sekolah tidak boleh punya status bebas seperti `"ACTIVE"` yang tidak jelas transisinya. Saya usulkan *state machine* eksplisit yang **dipaksakan di kode**, bukan konvensi:

```
DIRENCANAKAN → DIADAKAN → DITERIMA → DIREGISTRASI → DIGUNAKAN
      │                                                  │
      │              ┌───────────────┬───────────────────┤
      │              ▼               ▼                   ▼
      │         DIPINDAHKAN     DIPELIHARA          RUSAK RINGAN
      │              │               │                   │
      │              └───────┬───────┴───────────┬───────┘
      │                      ▼                    ▼
      │                DIGUNAKAN            RUSAK BERAT
      │                                            │
      │                                            ▼
      │                                   DIUSULKAN HAPUS
      │                                            │
      │                                            ▼
      └──────────────────────────────────────DIHAPUS (arsip permanen)
```

**Aturan keras (business rule, ditulis di `asset.validator.js`):**
- Transisi ilegal ditolak di level service, bukan cuma UI (mis. `DIHAPUS → DIGUNAKAN` mustahil).
- Transisi ke `RUSAK BERAT` dan `DIUSULKAN HAPUS` **wajib melampirkan foto + catatan**, tidak boleh kosong.
- `DIHAPUS` wajib punya **Berita Acara Penghapusan** (dokumen ter-upload) — tanpa ini, tombol hapus non-aktif.
- Setiap transisi otomatis menulis satu event ke `assets/{id}/history`.

---

## 4. Skema Data Diperluas — "Semua Aset Terdata, Bisa Dibaca untuk Blueprint"

### 4.1 `assets/{id}` — state terkini (diperluas dari skema sekarang)
```json
{
  "kodeBarang": "LABKOM-2026-001",
  "kodeBMD": "03.06.02.001",
  "namaBarang": "Komputer Lenovo ThinkCentre",
  "spesifikasi": "Intel i5, RAM 8GB, SSD 256GB",
  "merk": "Lenovo",
  "nomorSeri": "SN-XXXX",

  "kodeKategori": "KOMPUTER",
  "kodeRuang": "LABKOM01",
  "kodeKondisi": "BAIK",
  "kodeSumberDana": "BOSP",
  "statusSiklus": "DIGUNAKAN",

  "tahunPengadaan": 2026,
  "nilaiPerolehan": 12000000,
  "umurEkonomis": 5,
  "nilaiSusutTahunIni": 2400000,
  "nilaiBukuSaatIni": 9600000,

  "dokumenPengadaan": ["storage/docs/invoice-001.pdf"],
  "foto": ["storage/assets/abc.jpg"],
  "qrPayload": "https://sarprasin.vercel.app/asset/LABKOM-2026-001",

  "penanggungJawab": "uid_guru_tik",
  "createdBy": "uid",
  "updatedBy": "uid",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "historyCount": 14
}
```

### 4.2 `assets/{id}/history/{eventId}` — **arsip abadi, tidak bisa diedit/dihapus**
```json
{
  "eventType": "KONDISI_BERUBAH",
  "dari": "BAIK",
  "ke": "RUSAK_RINGAN",
  "catatan": "Layar flicker, kemungkinan kabel VGA",
  "foto": ["storage/history/xxxx.jpg"],
  "actor": "uid_operator",
  "actorRole": "operator",
  "timestamp": "Timestamp",
  "geoAudit": { "lat": null, "lng": null }
}
```
Firestore Security Rule kunci: **`allow update, delete: if false;`** pada koleksi ini. Sekali tercatat, permanen. Ini yang membuat data "bisa dibaca untuk blueprint" — siapa pun yang audit 3 tahun lagi bisa merekonstruksi seluruh riwayat aset dari nol.

### 4.3 `assets/{id}/movements/{moveId}` — jejak perpindahan ruang
```json
{
  "dariRuang": "LABKOM01",
  "keRuang": "GUDANG01",
  "alasan": "Perbaikan eksternal",
  "disetujuiOleh": "uid_waka_sarpras",
  "actor": "uid",
  "timestamp": "Timestamp"
}
```

### 4.4 Koleksi baru: `auditOpname` — stok opname periodik (wajib untuk sekolah negeri)
```json
{
  "periode": "2026-Semester-1",
  "kodeRuang": "LABKOM01",
  "pelaksana": "uid_operator",
  "hasilPerHitungan": [
    { "kodeBarang": "LABKOM-2026-001", "tercatat": true, "ditemukan": true, "kondisiSaatOpname": "BAIK" }
  ],
  "totalTercatat": 40,
  "totalDitemukan": 39,
  "selisih": 1,
  "statusSelisih": "PERLU_INVESTIGASI",
  "disetujuiOleh": null,
  "createdAt": "Timestamp"
}
```
Ini modul yang **belum ada di roadmap manapun** tapi paling penting secara praktik: audit fisik tahunan/semesteran yang dibandingkan otomatis dengan data digital, dan menghasilkan daftar selisih yang harus diklarifikasi — bukan cuma dashboard kondisi yang statis.

### 4.5 Koleksi baru: `writeOffRequests` — pengajuan penghapusan (maker-checker)
Aset sekolah negeri **tidak boleh dihapus sepihak oleh operator**. Perlu alur persetujuan berjenjang:
```json
{
  "assetId": "xxxx",
  "diajukanOleh": "uid_operator",
  "alasan": "Rusak berat, tidak ekonomis diperbaiki",
  "estimasiNilaiSisa": 0,
  "lampiran": ["storage/writeoff/berita-acara.pdf"],
  "status": "MENUNGGU_WAKA",
  "approvalChain": [
    { "role": "waka_sarpras", "status": "PENDING", "uid": null, "timestamp": null },
    { "role": "kepala_sekolah", "status": "PENDING", "uid": null, "timestamp": null }
  ]
}
```

---

## 5. Disiplin Peran (Maker–Checker)

Struktur role yang ada (`admin`, `waka_sarpras`, `staff`, `operator`, dst) sudah bagus tapi belum dipisahkan fungsinya secara tegas. Prinsip disiplin arsip:

| Aksi | Boleh Diajukan Oleh | Wajib Disetujui Oleh |
|---|---|---|
| Registrasi aset baru | Operator | — (langsung aktif, tapi tercatat `createdBy`) |
| Perubahan kondisi ke buruk | Operator | Tidak perlu approval, tapi wajib foto |
| Perpindahan ruang | Operator/Guru | Waka Sarpras |
| Penghapusan aset | Operator | Waka Sarpras **+** Kepala Sekolah |
| Koreksi data pengadaan (nilai, tahun) | Admin | Waka Sarpras |

Tidak ada satu orang pun yang bisa "menghapus jejak" sendirian — inilah yang memisahkan sistem arsip yang kredibel dari sekadar database inventaris.

---

## 6. Blueprint Cetak/Ekspor — Aset Harus Bisa "Dibaca" di Luar Aplikasi

Data digital tidak berguna untuk audit kalau tidak bisa dicetak dalam format yang dikenali. Modul ekspor yang perlu dibangun di atas `functions/exportPdf.js` yang sudah ada:

1. **Kartu Inventaris Barang (KIB) per aset** — PDF satu halaman: foto, kode, spesifikasi, riwayat kondisi ringkas, QR code.
2. **Daftar Inventaris Ruangan (DIR)** — per ruang, dicetak dan ditempel fisik di ruangan (transparansi ke siapa pun yang masuk ruangan).
3. **Buku Induk Inventaris** — seluruh aset per tahun ajaran, format yang sama dengan yang dipakai sekolah negeri untuk laporan ke Dinas Pendidikan.
4. **Laporan Selisih Opname** — otomatis dari `auditOpname`, siap diserahkan ke Kepala Sekolah.

---

## 7. Visi Jangka Panjang: Dari "Sarpras" ke "Sistem Operasi Sekolah"

Roadmap yang sudah ada (Phase 1–4) fokus pada sarpras. Sebagai visioner sistem, saya melihat arsitektur data yang dibangun sekarang (khususnya `rooms`, `users`, `logs`, kodefikasi) **bisa jadi tulang punggung untuk seluruh sekolah**, bukan cuma aset fisik:

```
                    ┌─────────────────────────┐
                    │   SARPRASIN CORE         │
                    │  (Identity, Rooms, Logs, │
                    │   Approval Engine, QR)   │
                    └────────────┬─────────────┘
                                 │
        ┌────────────┬──────────┼──────────┬────────────┐
        ▼            ▼          ▼          ▼            ▼
   Aset Fisik   Perpustakaan  Lab & Alat  Kendaraan &  Aset Digital
   (sudah ada)   (buku, e-book) Praktikum   Bangunan    (lisensi software,
                                (kimia,       (STNK,      akun, domain)
                                 biologi)     sertifikat
                                              tanah)
```

**Kenapa ini masuk akal secara teknis, bukan cuma ambisi:**
- `rooms`, `categories`, `conditions` sudah generik — bisa dipakai ulang untuk buku, alat lab, kendaraan tanpa desain ulang.
- `logs` (audit trail) dan `auditOpname` yang saya usulkan di atas **berlaku sama** untuk semua jenis aset — cukup ganti `collection` reference-nya.
- QR + `assets/{id}/history` sudah jadi pola universal: tempel di buku perpustakaan sama validnya dengan tempel di komputer lab.

**Roadmap realistis (bukan wishlist):**
- **Phase 1 (sekarang):** selesaikan Dashboard + Asset Module + Report, **tambahkan `history`, `movements`, `auditOpname`, `writeOffRequests`** sebelum Phase 1 ditutup — karena kalau fondasi arsip ini masuk belakangan, migrasi data lama akan menyakitkan.
- **Phase 2:** perluas kategori aset dari sekadar "sarpras" ke modul terpisah tapi berbagi core yang sama — mulai dari yang paling murah secara effort: Lab (karena datanya mirip aset biasa), lalu Perpustakaan.
- **Phase 3 (AI, sesuai roadmap):** prediksi maintenance **plus** prediksi kebutuhan pengadaan berdasarkan pola penyusutan lintas kategori aset, bukan cuma sarpras.
- **Phase 4:** GIS untuk peta aset tanah/bangunan — ini titik di mana "arsip aset" benar-benar menjadi **peta digital sekolah**, bukan cuma daftar.

---

## 8. Prioritas Tindakan Segera (Rekomendasi Engineer)

Kalau saya jadi lead engineer proyek ini, urutan kerja 2 minggu ke depan:

1. Tambahkan sub-collection `history` + Security Rule *append-only*, dan wajibkan `asset.service.js` menulis event setiap kali `updateCondition`/`moveRoom`/`writeOff` dipanggil.
2. Implementasikan state machine transisi di `asset.validator.js` — tolak transisi ilegal di level kode, bukan cuma di UI.
3. Bangun `writeOffRequests` dengan approval chain sederhana (2 level cukup untuk mulai).
4. Selesaikan modul `auditOpname` — dampaknya besar untuk kredibilitas sistem saat sekolah diaudit, dan levelnya masih realistis untuk dikerjakan di Phase 1.
5. Baru setelah 4 poin di atas solid, lanjut ke Dashboard UI — karena dashboard yang bagus di atas data yang tidak disiplin cuma mempercantik masalah.

---

*Dokumen ini adalah working blueprint — silakan direvisi bersama tim (Waka Sarpras, Kepala Sekolah) sebelum menjadi acuan resmi pengembangan Phase 1 lanjutan.*
