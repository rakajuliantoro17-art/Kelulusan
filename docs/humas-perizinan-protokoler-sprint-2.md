# PINTUKU HUMAS — Perizinan & Protokoler Sprint 2

## Status implementasi

Sprint 2A–2C tersedia di branch `main` dan migrasi database 011–015 sudah diterapkan pada Supabase project PINTUKU.

- Register perizinan: internal, eksternal, dan penggunaan fasilitas.
- Draft, pengajuan, verifikasi, rekomendasi, persetujuan/penolakan, revisi, pembatalan, penyelesaian, dan arsip.
- Dokumen privat dengan signed upload/download URL; batas unggah 25 MB.
- Agenda protokoler memiliki lifecycle terpisah dan dapat ditautkan ke permohonan izin.
- Daftar tamu, status kehadiran, checklist tugas, dan riwayat kegiatan.
- Pengajuan publik untuk permohonan eksternal dan fasilitas.
- Pelacakan publik menggunakan kode permohonan + token acak; database hanya menyimpan SHA-256 token.
- Inbox notifikasi HUMAS dan email outbox dengan retry/backoff.

## Environment variables

Konfigurasikan di Vercel Project Settings → Environment Variables. Jangan pernah menyimpan nilai rahasia di repository atau frontend.

| Variable | Kegunaan |
| --- | --- |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key untuk Auth/Storage |
| `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` | Kredensial server-only |
| `TURNSTILE_SITE_KEY` | Site key Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Secret key Cloudflare Turnstile |
| `HUMAS_PUBLIC_RATE_SECRET` | Secret HMAC minimal 32 karakter untuk hashing IP/email limiter |
| `HUMAS_PUBLIC_HOSTNAME` | Hostname resmi untuk validasi hostname Turnstile, mis. domain produksi |
| `RESEND_API_KEY` | API key Resend untuk pengiriman email transaksional |
| `HUMAS_FROM_EMAIL` | Alamat pengirim pada domain yang sudah diverifikasi di Resend |
| `CRON_SECRET` atau `HUMAS_NOTIFICATION_CRON_SECRET` | Token Bearer untuk job pengiriman email terjadwal |

Public form sengaja fail-closed: endpoint konfigurasi hanya mengaktifkan form jika Turnstile site key, secret key, dan HMAC rate secret tersedia. Tanpa konfigurasi tersebut, pengajuan publik tetap nonaktif; jangan menghapus CAPTCHA untuk mengatasi kendala konfigurasi.

## Endpoint dan route

- Internal workspace: `/humas/perizinan`
- Formulir publik: `/humas/perizinan/ajukan`
- Pelacakan publik: `/humas/perizinan/lacak`
- Cron dispatcher: `/api/humas-notifications` (setiap 5 menit sesuai konfigurasi Vercel)

Pastikan paket Vercel mendukung frekuensi cron yang digunakan. Cron mengirim email outbox melalui Resend; inbox internal tetap tercatat di Supabase.

## Kontrol keamanan

- Tabel HUMAS tidak memberikan privilege langsung kepada `anon` atau `authenticated`; seluruh akses data melalui API server dan service role.
- RLS aktif pada tabel operasional.
- Token pelacakan tidak pernah disimpan dalam bentuk asli atau dikirim lewat email.
- Token pelacakan hanya ditampilkan pada halaman konfirmasi setelah pengajuan.
- Limit pengajuan: maksimal 5 per IP per jam dan 2 per email per 24 jam.
- Limit pelacakan: maksimal 30 percobaan per IP per 15 menit.
- Rate-limit key disimpan sebagai HMAC digest, bukan IP/email mentah.
- Dokumen berada di private bucket dan diakses menggunakan signed URL berumur pendek.
- Keputusan tetap dilakukan petugas HUMAS sesuai pemetaan role dan separation of duties.

## Pemeriksaan setelah konfigurasi

1. Isi environment variables pada Vercel untuk Production dan Preview sesuai kebutuhan.
2. Pastikan domain pengirim Resend telah diverifikasi (SPF/DKIM).
3. Pastikan domain produksi terdaftar pada Cloudflare Turnstile.
4. Deploy ulang dan buka `/humas/perizinan/ajukan`; widget Turnstile harus tampil dan tombol kirim aktif setelah verifikasi.
5. Uji pengajuan dengan alamat email uji yang dikuasai sekolah.
6. Simpan kode + token, lalu uji halaman pelacakan dan pembatalan.
7. Uji login petugas HUMAS, inbox notifikasi, upload/download dokumen, transisi persetujuan, agenda, tamu, dan checklist.
8. Periksa log Vercel dan status cron; pastikan outbox bergerak dari `pending` ke `sent`.

## Batas verifikasi saat ini

Migrasi database telah diterapkan dan objek utama telah diverifikasi lewat query Supabase. GitHub Actions pada commit `22670ddcdf484602e9b389578e784bd6a08263b3` telah berhasil menjalankan Project Check dan HUMAS PostgreSQL Integration. Pipeline memvalidasi sintaks JavaScript, membangun static output, menjalankan source tests, menerapkan migrasi 001–015 pada PostgreSQL lokal terisolasi, menjalankan transactional workflow tests, serta memeriksa RLS dan privilege. Status deployment Vercel untuk commit tersebut masih `failure`; URL produksi belum boleh dianggap sudah memuat perubahan ini. Kegagalan deployment perlu ditangani terpisah dari CI yang sudah hijau.
