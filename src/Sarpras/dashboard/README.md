# Dashboard Service

Dashboard Service merupakan lapisan business logic yang bertugas
menghasilkan seluruh informasi Dashboard SARPRASIN.

Service ini TIDAK langsung dipanggil Firebase dari UI.

Semua halaman Dashboard mengambil data melalui service ini.

## Modul

- Dashboard Ringkasan
- Statistik Aset
- Statistik Ruangan
- Statistik Maintenance
- Grafik
- Aktivitas Terbaru
- Executive KPI
- Cache Dashboard

## Flow

Firestore

↓

Repository

↓

Dashboard Service

↓

Dashboard Store

↓

Dashboard UI
