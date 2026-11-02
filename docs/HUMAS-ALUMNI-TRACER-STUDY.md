# PINTUKU HUMAS — Tracer Study Alumni

Tanggal: 2 November 2026

## Tujuan
Membangun direktori alumni SMAN 1 Sooko yang dapat diperbarui secara berkala, mendukung tracer study lulusan, dan menjadi basis komunikasi yang bertanggung jawab untuk reuni akbar, kegiatan sekolah, donasi almamater, serta jejaring karier.

## Data yang dicatat
- Profil dasar: nama, tahun lulus, kelas terakhir, WhatsApp/telepon, email, kota, dan provinsi.
- Tracer study: status setelah lulus (kuliah, bekerja, wirausaha, mencari kerja, lainnya), perguruan tinggi, program studi, perusahaan/instansi, jabatan, nama usaha, bidang industri, dan tahun survei.
- Preferensi kanal komunikasi: WhatsApp, email, telepon, atau belum ditentukan.
- Persetujuan terpisah: informasi sekolah, undangan kegiatan/reuni, informasi donasi, dan jejaring karier/mentoring.
- Riwayat komunikasi: tujuan, kanal, hasil tindak lanjut, waktu, dan ringkasan.

## Prinsip komunikasi dan privasi
1. Memiliki nomor WhatsApp atau email tidak berarti alumni menyetujui semua jenis komunikasi.
2. Persetujuan donasi terpisah dari persetujuan undangan reuni dan informasi sekolah.
3. Pencatatan komunikasi ditolak oleh database jika persetujuan untuk tujuan tersebut belum diberikan.
4. Persetujuan yang berubah mencatat waktu pembaruan dan sumber persetujuan.
5. Kontak pribadi hanya tersedia melalui layanan internal HUMAS; tidak ada akses langsung dari browser ke tabel database.
6. Riwayat komunikasi bersifat append-only.
7. Tidak ada pengiriman WhatsApp/email massal pada tahap ini. Modul hanya mengelola data, filter penerima yang telah menyetujui, dan pencatatan tindak lanjut.

## Ruang kerja
- Dashboard jumlah alumni aktif, alumni yang menyetujui komunikasi donasi, alumni yang menyetujui undangan kegiatan, dan data tracer yang telah diperbarui.
- Direktori dengan pencarian, filter angkatan, status setelah lulus, dan persetujuan.
- Tambah dan perbarui profil alumni.
- Detail profil, status pendidikan/pekerjaan, preferensi kanal, dan persetujuan.
- Catatan komunikasi untuk undangan reuni, kegiatan, donasi, informasi sekolah, dan jejaring karier.
- Pagination 25 data, batas maksimal 100 pada API, pencarian debounce 350 ms, tanpa polling.

## Database dan API
Migration source: \`supabase/migrations/202611020009_humas_alumni_tracer_study.sql\`.
Tabel: \`humas.alumni_profiles\`, \`humas.alumni_contact_logs\`.
RPC: \`alumni_profile_create\`, \`alumni_profile_update\`, \`alumni_contact_log_create\`, \`alumni_summary\`.
API:
- \`GET /api/humas?op=alumni-workspace\`
- \`GET /api/humas?op=alumni\`
- \`GET /api/humas?op=alumni-detail&id=...\`
- \`POST/PATCH /api/humas?op=alumni\`
- \`POST /api/humas?op=alumni-contact\`

Semua data privat menggunakan \`Cache-Control: no-store\`. Penulisan memakai RPC transaksional dan kredensial Supabase hanya berada di server.

## Batas tahap awal
- Belum ada formulir publik alumni, impor massal CSV, pengiriman pesan otomatis, kampanye donasi, portal login alumni, maupun integrasi WhatsApp Business.
- Belum ada verifikasi identitas alumni otomatis. Data awal perlu divalidasi oleh HUMAS sebelum digunakan.
- Hak akses mengikuti pola akses internal HUMAS saat ini; penyempurnaan matriks role ditunda.
- Migration belum diterapkan ke Supabase Production dan akun pengguna belum disiapkan.
