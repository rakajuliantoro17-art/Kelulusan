# HUMAS — Tracer Study Alumni dan Formulir Publik

## Tujuan
Formulir yang dapat dibagikan sekolah melalui WhatsApp, media sosial, dan kanal komunikasi sekolah. Alumni memperbarui data sendiri; pengajuan masuk ke antrean verifikasi HUMAS sebelum menjadi profil aktif.

## URL
- Formulir publik: \`/alumni/tracer\`
- Workspace internal: \`/humas/alumni\`
- Endpoint server: \`POST /api/humas-alumni-public\`

## Data
Nama, tahun lulus, kelas terakhir, minimal satu kontak aktif, domisili, status setelah lulus, pendidikan/pekerjaan/usaha, preferensi kontak, dan persetujuan komunikasi per tujuan. Tidak meminta NIK, tanggal lahir, atau dokumen identitas.

## Persetujuan
- Persetujuan pengolahan data untuk pendataan alumni dan tracer study wajib.
- Persetujuan informasi sekolah, undangan kegiatan/reuni, donasi, dan jejaring karier terpisah dan opsional.
- Persetujuan donasi default tidak aktif. Nomor kontak tidak berarti setuju dihubungi untuk donasi.
- Waktu dan sumber persetujuan dicatat.

## Verifikasi HUMAS
1. Pengajuan publik disimpan dengan status \`pending\`, tidak langsung masuk ke direktori aktif.
2. Staf HUMAS meninjau antrean di workspace.
3. Staf memeriksa identitas angkatan dan kontak sebelum menyetujui atau menolak.
4. Saat disetujui, profil alumni dibuat dan pilihan persetujuan disalin.
5. Kecocokan tahun lulus dan nomor telepon/email akan menandai kemungkinan duplikasi. Staf memeriksa manual; sistem tidak membuat profil duplikat otomatis.

## Perlindungan teknis
- Browser hanya mengirim ke Vercel Serverless API; tidak ada akses langsung ke database.
- Kunci Supabase hanya berada di server.
- Rate limit: 5 pengajuan per IP hash per 1 jam. IP tidak disimpan mentah; server menghitung HMAC-SHA256 menggunakan secret environment.
- Honeypot, validasi server, batas body 12 KB, same-origin check jika Origin tersedia, dan respons tanpa cache.
- Tabel berada di schema HUMAS, RLS aktif, tanpa grant browser.
- Endpoint publik hanya membuat pengajuan; peninjauan membutuhkan akun internal Staf HUMAS.
- Belum ada OTP, CAPTCHA pihak ketiga, upload dokumen, atau pengiriman pesan otomatis.

## Aktivasi
Migration source: \`supabase/migrations/202611020010_humas_alumni_public_intake.sql\`.
Environment variable server tambahan: \`ALUMNI_INTAKE_RATE_SECRET\`, minimal 32 karakter acak. Jangan masukkan ke frontend atau chat.
Migration 010 dan konfigurasi environment belum diterapkan ke Supabase Production/Vercel. Formulir akan menampilkan status belum aktif sampai keduanya dikonfigurasi.

## Pengujian
Pengujian API publik, validasi consent, rate limit, review staf, deteksi duplikasi, privilege, dan integrasi PostgreSQL 17 ditambahkan pada CI.
