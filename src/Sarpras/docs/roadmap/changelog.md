# Changelog
## Sarprasin 2.0

Semua perubahan penting pada proyek ini akan didokumentasikan pada file ini.

Dokumen mengikuti prinsip:

- Keep a Changelog
- Semantic Versioning (SemVer)

Format perubahan:

- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

---

# Versioning

Format versi:

```
MAJOR.MINOR.PATCH
```

Contoh:

```
0.0.1-alpha
0.1.0
1.0.0
1.1.0
2.0.0
```

---

# Unreleased

## Added

- Persiapan dokumentasi Phase 1.
- Penyempurnaan struktur repository.
- Perencanaan AI.
- Perencanaan Automation.
- Penyempurnaan Firestore Schema.

---

# v0.0.1-alpha
## 2026-07

### Added

#### Project

- Inisialisasi repository Sarprasin 2.0.
- Struktur folder modular.
- Konfigurasi Vite.
- Konfigurasi Firebase.
- Konfigurasi Vercel.
- Konfigurasi GitHub.

---

#### Firebase

- Firebase Authentication.
- Firestore.
- Firebase Storage.
- Analytics.
- Service Wrapper.

---

#### Service Layer

- Asset Service.
- Dashboard Service.
- Report Service.
- User Service.
- Master Service.
- Log Service.

---

#### Authentication

- Auth Service.
- Permission Service.
- Guard Service.
- Session Service.
- Profile Service.
- Token Service.

---

#### Synchronization

- Spreadsheet Sync.
- Migration Service.
- Backup Service.

---

#### Google Apps Script

- Backup.gs
- Restore.gs
- Migration.gs
- Sync.gs
- Scheduler.gs
- Validation.gs
- Report.gs
- Logger.gs

---

#### Documentation

Ditambahkan dokumentasi:

- README
- Architecture
- Security
- Deployment
- Firebase
- Folder Structure
- Automation
- Firestore Schema
- Storage Schema
- Validation Rules
- Migration Plan
- Spreadsheet Backup
- API
- AI
- Meeting
- Roadmap

---

#### AI

Dokumen awal:

- AI Roadmap.
- Machine Learning.
- Recommendation Engine.
- Predictive Maintenance.
- Self Correction.

---

#### Automation

Perencanaan integrasi:

- n8n
- Webhook
- Scheduler

---

### Changed

- Google Spreadsheet tidak lagi menjadi database utama.
- Cloud Firestore ditetapkan sebagai Single Source of Truth.
- Struktur proyek diubah menjadi modular.
- Seluruh akses data diarahkan melalui Service Layer.

---

### Deprecated

- Penyimpanan data utama pada Spreadsheet.
- Akses Firestore langsung dari UI.

---

### Removed

- Tidak ada.

---

### Fixed

- Penyelarasan struktur folder.
- Penyempurnaan dokumentasi deployment.
- Konsistensi penamaan service.
- Konsistensi struktur Firestore.

---

### Security

- Menambahkan Firebase Authentication.
- Menambahkan Firestore Security Rules.
- Menambahkan Storage Rules.
- Menambahkan Role Based Access Control.
- Menambahkan Audit Log Architecture.

---

# Planned

## v0.1.0

Target:

- Login.
- Dashboard.
- CRUD Asset.
- Firestore Integration.
- Upload Foto.
- QR Code.
- Report.

---

## v0.2.0

Target:

- n8n.
- Backup Otomatis.
- Notification.
- Approval Workflow.
- Webhook.

---

## v0.3.0

Target:

- Recommendation Engine.
- Predictive Maintenance.
- Self Correction.
- AI Dashboard.

---

## v0.5.0

Target:

- Mobile App.
- Progressive Web App.
- Offline Mode.

---

## v1.0.0

Target:

Rilis stabil pertama.

Fitur:

- Asset Management
- Dashboard
- Reporting
- Authentication
- Automation
- Backup
- Firestore
- Storage
- Security
- Documentation

---

# Release Policy

## PATCH

Perbaikan bug.

Contoh:

```
1.0.1
```

---

## MINOR

Penambahan fitur baru yang kompatibel.

Contoh:

```
1.1.0
```

---

## MAJOR

Perubahan besar yang tidak kompatibel.

Contoh:

```
2.0.0
```

---

# Contributors

Pengembangan Sarprasin 2.0 dilakukan secara bertahap dengan dokumentasi perubahan yang konsisten agar seluruh proses pengembangan dapat ditelusuri dan dievaluasi pada setiap rilis.

---

# Long-Term Vision

Changelog menjadi catatan resmi evolusi Sarprasin 2.0. Dengan dokumentasi perubahan yang mengikuti standar industri, setiap versi dapat dipahami dengan mudah oleh pengembang, administrator, maupun pemangku kepentingan, sehingga proses pemeliharaan dan pengembangan jangka panjang menjadi lebih terstruktur dan transparan.
