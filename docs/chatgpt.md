# Panduan AI dan Kolaborasi Pengembangan

Dokumen ini menjadi konteks kerja bersama bagi pengembang manusia dan seluruh asisten AI yang digunakan dalam pengembangan **Portal Terpadu SMAN 1 Sooko**. Dokumen ini berlaku lintas platform, termasuk ChatGPT, Claude, Gemini, GitHub Copilot, dan alat AI lain.

> **Prinsip utama:** AI adalah asisten pengembangan. Keputusan arsitektur, keamanan, data, dan rilis tetap harus ditinjau serta disetujui oleh pengelola proyek.

## 1. Tujuan

- Menjaga konsistensi konteks saat pekerjaan berpindah antar-AI atau antaranggota tim.
- Mencegah perubahan yang merusak aplikasi lain dalam monorepo.
- Menetapkan prosedur sebelum membaca, mengubah, menguji, dan mengirim kode.
- Menyimpan keputusan teknis agar tidak bergantung pada riwayat percakapan AI tertentu.

## 2. Gambaran proyek

Repositori utama: `rakajuliantoro17-art/Kelulusan`.

Repositori ini diarahkan menjadi satu portal/deployment yang mengintegrasikan tiga modul utama:

| Modul | Direktori kerja | Fungsi |
|---|---|---|
| Portal | root dan konfigurasi portal | Beranda, navigasi, autentikasi/akses lintas modul sesuai rancangan |
| Akademik | `src/akademik/` | Layanan akademik |
| Kesiswaan | `src/kesiswaan/` | Gerakan Disiplin Siswa dan layanan kesiswaan |
| Sarpras | `src/Sarpras/` (nama saat audit) | Manajemen sarana dan prasarana |

Struktur dan rute Sarpras masih dalam tahap audit integrasi. Jangan menganggap seluruh rute atau build Sarpras sudah siap produksi hanya karena file sumber telah berada di repositori.

Repositori sumber yang harus diperlakukan sebagai **referensi asli dan tidak diubah** selama integrasi:
- `rakajuliantoro17-art/Sarprasin`
- `rakajuliantoro17-art/smansasoo-academic-portal`
- Sumber Kesiswaan GDS yang telah disalin ke repositori ini.

## 3. Wajib dibaca sebelum bekerja

Sebelum mengusulkan atau melakukan perubahan, AI/pengembang harus membaca dokumen yang relevan:

1. `README.md` — ringkasan repositori dan cara kerja.
2. `docs/PORTAL-TERPADU-ARCHITECTURE.md` — arsitektur portal.
3. `docs/ROADMAP.md` — tahapan pengembangan.
4. `docs/API.md` — kontrak API.
5. `docs/CHANGELOG.md` — riwayat perubahan.
6. `docs/chatgpt.md` — aturan kolaborasi AI ini.
7. File konfigurasi dan kode modul yang akan disentuh.

Jika dokumen bertentangan dengan implementasi aktual, **verifikasi kode dan konfigurasi yang sedang aktif**, lalu usulkan pembaruan dokumentasi. Jangan menebak.

## 4. Aturan kerja lintas-AI

- Jangan mengasumsikan AI memiliki riwayat percakapan AI lain. Gunakan dokumen repositori sebagai sumber konteks bersama.
- Awali tugas dengan menyatakan pemahaman singkat tentang modul, file, dan hasil yang akan diubah.
- Periksa kondisi branch dan perubahan terbaru sebelum membuat commit.
- Baca file lengkap yang relevan beserta dependensi, pemanggil, rute, dan konfigurasi terkait.
- Jangan menulis ulang file besar atau mengganti konfigurasi global tanpa audit dampak.
- Pertahankan perilaku aplikasi yang sudah berjalan. Hindari refactor di luar ruang lingkup.
- Jangan memindahkan atau mengganti nama direktori modul sebelum seluruh referensi path, import, asset, route, service worker, dan konfigurasi deployment dipetakan.
- Jangan menghapus file, data, endpoint, atau konfigurasi hanya karena tampak tidak digunakan. Buktikan terlebih dahulu.
- Bila menemukan ketidaksesuaian, laporkan sebagai temuan dan pisahkan dari perubahan yang aman.
- Setelah perubahan, periksa diff dan jalankan pemeriksaan yang tersedia. Nyatakan secara jujur mana yang sudah diuji dan mana yang belum.
- Jangan menyatakan deployment berhasil tanpa bukti status deployment atau pengujian URL aktual.

## 5. Batas arsitektur dan integrasi

- Satu repositori/deployment utama menggunakan konfigurasi tingkat root.
- `vercel.json` root adalah konfigurasi deployment utama. Konfigurasi Vercel yang berada di dalam modul tidak otomatis menjadi konfigurasi deployment terpisah pada deployment root.
- API serverless aktif harus memiliki dispatcher/rute yang jelas di direktori `api/` root, atau menggunakan pola routing yang secara eksplisit didokumentasikan.
- Setiap modul harus memiliki namespace URL sendiri. Perubahan pada satu modul tidak boleh mengambil alih URL root atau aset modul lain.
- Gunakan path absolut yang sesuai namespace modul; audit semua `href`, `src`, `fetch()`, import dinamis, dan redirect.
- Service worker, manifest, cache, dan scope PWA harus dibatasi pada modul yang memilikinya agar tidak mengendalikan seluruh portal secara tidak sengaja.
- Jangan menggabungkan akun Google, spreadsheet, Firebase project, atau identitas layanan yang memang terpisah.
- Integrasi Kesiswaan menggunakan sumber Google Drive/Spreadsheet yang berbeda dari Sarpras dan Akademik. Kredensial dan aksesnya harus dikelola terpisah.
- Jangan menyalin konfigurasi rahasia atau kredensial ke dokumentasi maupun commit.

## 6. Keamanan dan data

Dilarang memasukkan ke Git:
- Private key, service-account JSON, token OAuth, refresh token, API secret, password, cookie, dan kredensial administrator.
- Data pribadi siswa/guru, data disiplin, dokumen sensitif, atau ekspor database produksi.
- File `.env` berisi nilai rahasia.

Ketentuan:
- Gunakan environment variables pada penyedia deployment atau secret manager.
- Validasi otorisasi pada sisi server; menyembunyikan tombol di frontend bukan kontrol akses.
- Terapkan prinsip least privilege untuk akun layanan dan integrasi Google.
- Jangan menonaktifkan validasi, autentikasi, CORS, CSP, atau aturan keamanan hanya untuk mengatasi error sementara.
- Bila menemukan dugaan kredensial bocor, hentikan penggunaan, laporkan, dan sarankan rotasi. Jangan menyalin nilainya ke chat atau dokumentasi.
- Gunakan data dummy/sintetis saat pengujian dan dokumentasi.

## 7. Standar perubahan kode

Setiap perubahan idealnya mengikuti urutan:

1. **Inspect** — periksa branch, status, file, dependensi, dan konfigurasi terkait.
2. **Plan** — jelaskan file yang akan diubah dan risiko lintas-modul.
3. **Implement** — lakukan perubahan sekecil mungkin.
4. **Verify** — periksa syntax, build, lint, API, rute, dan perilaku terkait sesuai kemampuan lingkungan.
5. **Review** — tinjau diff, path, secret, dan potensi regresi.
6. **Document** — perbarui dokumentasi/CHANGELOG jika ada perubahan arsitektur, API, environment, atau perilaku.
7. **Commit** — gunakan pesan commit deskriptif; jangan melakukan force push tanpa persetujuan eksplisit.

Jika pengujian tidak dapat dilakukan, tulis dengan jelas: **Belum diuji** beserta alasan dan langkah verifikasi yang perlu dilakukan.

## 8. Format laporan dari AI

Setiap AI yang menyelesaikan tugas teknis harus menyampaikan:

- **Ringkasan:** apa yang berubah.
- **File:** daftar file yang dibuat/diubah/dihapus.
- **Alasan teknis:** mengapa pendekatan tersebut dipilih.
- **Dampak:** modul, API, route, data, atau konfigurasi yang terdampak.
- **Pengujian:** perintah dan hasil aktual; bedakan lulus, gagal, dan belum diuji.
- **Risiko/pekerjaan lanjutan:** hal yang belum diselesaikan.
- **Commit:** hash dan pesan commit jika perubahan sudah dikomit.

Jangan mengklaim pekerjaan yang tidak benar-benar dilakukan.

## 9. Aturan Git dan kolaborasi tim

- Gunakan branch kerja untuk perubahan yang berisiko atau lintas-modul.
- Sinkronkan branch sebelum mulai dan sebelum commit.
- Jangan menimpa perubahan anggota tim yang belum ditinjau.
- Hindari beberapa AI mengedit file yang sama secara bersamaan.
- Satu perubahan logis sebaiknya satu commit.
- Jangan commit file hasil build, cache, log, credential, atau file sementara kecuali memang diperlukan dan didokumentasikan.
- Gunakan Pull Request untuk perubahan besar atau perubahan yang memengaruhi beberapa modul.
- Pertahankan repositori sumber sebagai arsip/referensi; perubahan integrasi dilakukan pada repositori utama.

## 10. Catatan status integrasi

Status di bawah adalah catatan saat dokumen ini disusun dan harus diperbarui setelah audit/implementasi:

- Portal, Akademik, dan Kesiswaan telah memiliki struktur di repositori utama.
- Sarpras telah disalin ke `src/Sarpras/`; audit route, asset path, konfigurasi Vite, fungsi backend, dan kelengkapan entry page masih diperlukan.
- Root `vercel.json` merupakan konfigurasi deployment utama dan masih perlu diaudit untuk namespace Sarpras.
- Keberhasilan build, smoke test, dan deployment terpadu belum boleh diasumsikan sebelum benar-benar dijalankan.
- Integrasi Google Kesiswaan harus tetap menggunakan kredensial dan akses layanan tersendiri.

## 11. Cara memberi tugas kepada AI

Berikan instruksi dengan format ringkas berikut:

```text
Baca README.md dan dokumen arsitektur serta docs/chatgpt.md terlebih dahulu.

Tujuan:
[hasil yang ingin dicapai]

Ruang lingkup:
[modul dan file yang boleh disentuh]

Batasan:
[file/fitur yang tidak boleh diubah, kompatibilitas yang harus dijaga]

Kriteria selesai:
[hasil dan pengujian yang harus terpenuhi]

Sebelum mengubah file:
- audit implementasi aktual dan dependensinya;
- jelaskan rencana dan risiko;
- jangan mengubah file di luar ruang lingkup tanpa persetujuan.
Setelah selesai, laporkan file, diff, pengujian, risiko, dan commit.
```

## 12. Pemeliharaan dokumen

Dokumen ini adalah panduan kerja yang hidup. Perbarui bila terjadi perubahan:
- struktur direktori atau namespace;
- arsitektur deployment/API;
- integrasi Firebase, Google, atau layanan eksternal;
- kebijakan keamanan;
- alur kerja Git dan pengujian.

Perubahan pada panduan ini harus mencerminkan keputusan proyek yang telah disepakati, bukan asumsi AI.
