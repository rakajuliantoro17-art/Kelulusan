# PINTUKU HUMAS — Sprint 5: Alumni & Tracer Study Analytics

## Tujuan

Sprint 5 melengkapi fondasi CRM Alumni dengan analitik agregat hasil lulusan, cakupan pemutakhiran tracer, perbandingan angkatan, dan pemeriksaan kualitas data. Sprint ini tidak mengulang direktori alumni, formulir publik, antrean verifikasi, consent, atau riwayat komunikasi yang sudah tersedia.

## Implementasi

### Database
- Migration `202611030003_humas_alumni_analytics.sql` menambahkan RPC `humas.alumni_analytics(integer, integer)`.
- Migration `202611030004_humas_alumni_analytics_filter_fix.sql` memperbaiki denominator cakupan agar filter tahun tracer tidak mengubah total populasi angkatan.
- RPC mengembalikan agregat saja: ringkasan status, kohort angkatan, tahun pembaruan, perguruan tinggi, industri, provinsi, dan kualitas data.
- Fungsi tidak mengembalikan nama, email, WhatsApp, atau data kontak.
- Eksekusi dicabut dari `public`, `anon`, dan `authenticated`; hanya `service_role` yang dapat memanggilnya. API PINTUKU melakukan autentikasi dan pemeriksaan role HUMAS sebelum memanggil RPC.

### API
- Endpoint internal `GET /api/humas?op=alumni-analytics`.
- Filter opsional `graduation_year` dan `survey_year`, masing-masing harus berupa tahun empat digit yang valid.
- Membutuhkan role baca HUMAS yang sama dengan direktori alumni.

### Workspace
- KPI profil dalam filter, tracer terisi, cakupan tracer, dan status belum dilaporkan.
- Visual ringkas status lulusan, cakupan per angkatan, perguruan tinggi/lembaga, industri, provinsi, dan periode pembaruan.
- Filter angkatan dan tahun tracer.
- Pemeriksaan kualitas: profil tanpa kontak, tanpa domisili, dan status yang belum dilaporkan.
- Tampilan mengikuti glass UI PINTUKU dan responsif untuk layar kecil.

## Definisi metrik

- **Total profil**: profil alumni aktif dalam filter angkatan.
- **Tracer terisi**: profil aktif yang memiliki `survey_year`; jika filter tahun tracer digunakan, hanya profil dengan tahun tersebut yang dihitung sebagai terisi.
- **Cakupan tracer**: tracer terisi dibagi total profil aktif dalam kohort, dikali 100%.
- **Status lulusan**: status terkini yang tersimpan pada profil.
- **Periode pembaruan**: tahun tracer terakhir pada profil.

## Batas interpretasi

Data yang tersedia saat ini adalah satu snapshot terkini per profil. Karena itu, statistik tahun tracer mengelompokkan pembaruan terakhir dan **belum merupakan riwayat longitudinal** yang menyimpan beberapa jawaban survei dari alumni yang sama. Riwayat longitudinal dan kampanye survei multi-periode memerlukan model respons survei terpisah pada pengembangan berikutnya.

## Status database saat implementasi

- Migration 018 dan 019 diterapkan pada Supabase production project.
- RPC diuji untuk keseluruhan data dan filter tahun tracer.
- Saat verifikasi, direktori memiliki 0 profil aktif, 0 pengajuan publik, dan 0 catatan komunikasi. Dashboard akan menampilkan kondisi kosong sampai data alumni mulai masuk.
- Pemeriksaan privilege memastikan `anon` tidak dapat mengeksekusi RPC dan `service_role` dapat.

## Validasi dan catatan rilis

Validasi database dilakukan langsung terhadap RPC dan privilege. Validasi Node test, build Vercel, serta smoke test workspace dengan sesi HUMAS harus dilihat dari hasil CI/deployment; tidak dinyatakan lulus sebelum hasil tersebut tersedia.

## File utama

- `src/server/api/humas.js`
- `src/pintuku/dashboard/humas-alumni.html`
- `src/pintuku/assets/js/humas-alumni.js`
- `src/pintuku/assets/css/humas-alumni.css`
- `supabase/migrations/202611030003_humas_alumni_analytics.sql`
- `supabase/migrations/202611030004_humas_alumni_analytics_filter_fix.sql`
- `tests/humas-permit-transactions.test.js`
- `tests/humas-migrations-static.test.js`
