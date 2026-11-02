# PINTUKU HUMAS — Proposal & Sponsorship

Tanggal: 2 November 2026

## Tujuan
Ruang kerja untuk mencatat proposal kegiatan sekolah, target dukungan, calon sponsor, komitmen, dan realisasi bantuan. Modul memanfaatkan direktori mitra yang sudah tersedia pada Kemitraan & MoU.

## Fitur
- Membuat proposal sebagai draft dan mengubah draft/revisi.
- Mengelola kategori pendidikan, kegiatan siswa, olahraga, sarana prasarana, sosial/masyarakat, acara sekolah, dan lainnya.
- Mencatat ringkasan, tujuan, sasaran, target dana, unit pengusul, koordinator, tenggat, dan jadwal kegiatan.
- Menjalankan status: draft, diajukan, ditelaah, perlu revisi, disetujui, ditolak, penggalangan dukungan, dukungan terpenuhi, berjalan, selesai, dibatalkan, dan diarsipkan.
- Mencatat calon sponsor dan dukungan berupa uang, barang, jasa, fasilitas, atau bentuk lain.
- Menghubungkan sponsor dengan direktori mitra.
- Mencatat estimasi komitmen dan nilai realisasi.
- Ringkasan total proposal, proses, komitmen, dan realisasi.
- Timeline perubahan dan tindak lanjut sponsor.

## Alur sederhana
1. Staf HUMAS membuat proposal draft.
2. Proposal diajukan dan status diperbarui saat ditelaah.
3. Setelah disetujui, tim mencatat calon sponsor dan tindak lanjut.
4. Komitmen dan realisasi bantuan diperbarui saat ada kepastian atau penerimaan.
5. Proposal diselesaikan dan diarsipkan.

Perubahan status mengikuti transisi yang dibatasi di database. Status tidak dapat dipilih sembarangan. Upload bukti proposal, kwitansi, foto bantuan, dan dokumen sponsor belum termasuk pada tahap ini.

## Data dan API
- `GET /api/humas?op=proposal-workspace`: satu permintaan untuk summary dan halaman pertama proposal.
- `GET /api/humas?op=proposals`: daftar dengan pagination, filter, dan pencarian.
- `POST/PATCH /api/humas?op=proposals`: membuat dan memperbarui draft atau status.
- `GET /api/humas?op=proposal-detail&id=...`: detail, dukungan, dan timeline (dukungan dibatasi 100; event dibatasi 50).
- `POST/PATCH /api/humas?op=proposal-supports`: mencatat sponsor dan realisasi.

Semua permintaan memakai gateway serverless HUMAS. Kunci Supabase tetap di server. Data privat menggunakan `Cache-Control: no-store`. Tidak ada polling otomatis. Pencarian menggunakan debounce 350 ms.

## Database
Migration source: `supabase/migrations/202611020008_humas_proposals_sponsorship.sql`.
Tabel: `humas.proposals`, `humas.proposal_supports`, `humas.proposal_events`.
Penulisan dilakukan melalui RPC transaksional. Timeline audit append-only. RLS aktif; browser roles tidak diberi akses langsung. Migration belum diterapkan pada Supabase Production.

## Batas implementasi
- Belum ada upload/penyimpanan dokumen atau bukti dukungan.
- Belum ada notifikasi email/WhatsApp.
- Belum ada integrasi tanda tangan atau transaksi keuangan.
- Hak akses masih mengikuti pola internal HUMAS yang sudah ada; matriks role yang lebih rinci ditunda sesuai prioritas proyek.
- Belum diuji pada Supabase Production atau Vercel runtime.


## Hasil validasi sumber

- PostgreSQL 17 ephemeral: migration 001–008 berhasil diterapkan.
- Integrasi proposal: create, update draft, lifecycle status, sponsor, komitmen, realisasi, summary, dan rollback berhasil.
- Security test: RLS, larangan akses langsung browser, privilege service_role, dan audit append-only berhasil.
- Node.js tests: **30 PASS, 0 FAIL**.
- Build statis PINTUKU: **PASS**; halaman, CSS, JavaScript, dan rewrite Vercel terdaftar.
- Belum ada migrasi ke Supabase Production, akun pengguna, atau deployment manual yang dilakukan.

CI: [HUMAS PostgreSQL Integration](https://github.com/rakajuliantoro17-art/Kelulusan/actions/runs/41388297159) · [Project Check](https://github.com/rakajuliantoro17-art/Kelulusan/actions/runs/41388335846).

Status: **source dan integrasi PostgreSQL CI lulus; aktivasi Production belum dilakukan.**


Modul HUMAS berikutnya: [Tracer Study Alumni](HUMAS-ALUMNI-TRACER-STUDY.md) untuk direktori lulusan, pemutakhiran tracer, persetujuan komunikasi, dan riwayat tindak lanjut.
