# Akademik — Integrasi pada Repository Kelulusan

Dokumen ini mencatat kontrak integrasi modul Akademik setelah dipindahkan ke repository pusat **Kelulusan**.

## Batas modul

- Semua kode dan aset khusus Akademik berada di `src/akademik/`; tidak ada direktori `akademik/` atau `data/` khusus Akademik di root.
- Berkas lama dari aplikasi Graduation Portal yang tidak lagi menjadi entrypoint aktif diarsipkan di `src/akademik/legacy-graduation/` dan tidak dipetakan sebagai route publik.
- Dashboard ringkasan integrasi berada di `src/akademik/dashboard/index.html` dan diakses melalui `/akademik/dashboard`.
- Direktori root `assets/`, `css/`, dan `js/` hanya menampung aset bersama PINTUKU. `api/akademik.js` tetap di root karena merupakan serverless dispatcher Vercel.

- Frontend, CSS, JavaScript, data statis, PWA, dan handler backend Akademik berada di `src/akademik/`.
- Vercel hanya menggunakan konfigurasi deployment di `/vercel.json` pada root repository.
- Serverless API Akademik masuk melalui satu dispatcher: `/api/akademik.js`.
- Modul sumber Akademik tidak boleh mengubah konfigurasi root Portal atau Kesiswaan tanpa audit dampak.

## URL frontend

- Portal Akademik: `/akademik/`
- Halaman fitur: `/akademik/pages/{nama-halaman}`
- Aset modul: `/akademik/assets/...`
- Data statis modul: `/akademik/data/...`

Path absolut untuk aset yang berasal dari modul Akademik harus tetap menggunakan prefiks `/akademik/`. Jangan mengarahkan aset modul ke `/assets/` atau `/data/` di root kecuali memang aset tersebut sengaja dibagikan oleh Portal utama.

## Kontrak API

Semua handler dieksekusi melalui `api/akademik.js`. URL namespaced adalah kontrak utama:

| Operasi | URL namespaced | Handler |
|---|---|---|
| Kenaikan kelas | `/api/akademik/kenaikan` | `src/akademik/api/kenaikan.js` |
| Kelulusan | `/api/akademik/kelulusan` | `src/akademik/api/kelulusan.js` |
| Nilai | `/api/akademik/nilai` | `src/akademik/api/nilai.js` |
| Daftar kelas | `/api/akademik/kelas-list` | `src/akademik/api/kelas-list.js` |
| Rekap kelas | `/api/akademik/kelas-summary` | `src/akademik/api/kelas-summary.js` |
| Statistik | `/api/akademik/stats` | `src/akademik/api/stats.js` |
| Autentikasi admin | `/api/akademik/admin-auth` | `src/akademik/api/admin-auth.js` |
| Pengumuman | `/api/akademik/announcements` | `src/akademik/api/announcements.js` |
| Catat absensi | `/api/akademik/absensi` | `src/akademik/api/absensi.js` |
| Rekap absensi | `/api/akademik/absensi-rekap` | `src/akademik/api/absensi-rekap.js` |
| Data siswa absensi | `/api/akademik/absensi-students` | `src/akademik/api/absensi-students.js` |

URL lama yang telah digunakan frontend (`/api/kenaikan`, `/api/nilai`, `/api/admin-auth`, dan seterusnya) tetap disediakan sebagai alias kompatibilitas. Alias tersebut harus diarahkan ke dispatcher yang sama, bukan membuat fungsi Vercel terpisah.

## Environment variable dan dependensi operasional

| Variabel | Fungsi |
|---|---|
| `GOOGLE_SHEET_ID_KENAIKAN` | Spreadsheet kenaikan kelas |
| `GOOGLE_SHEET_ID_KELULUSAN` | Spreadsheet kelulusan |
| `GOOGLE_SHEET_ID` | Spreadsheet nilai dan rekap kelas |
| `GOOGLE_SHEET_ID_<TAHUN>` | Spreadsheet nilai untuk tahun ajaran tertentu, opsional |
| `GOOGLE_SHEET_ID_ABSENSI` | Spreadsheet data dan log absensi |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account untuk menulis log absensi |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Private key service account |
| `ADMIN_USERNAME` | Username admin; override konfigurasi default |
| `ADMIN_PASSWORD` | Password admin; override konfigurasi default |
| `ADMIN_SESSION_SECRET` | Secret penandatanganan sesi; disarankan diisi |
| `UPSTASH_REDIS_REST_URL` | Penyimpanan statistik dan rate limit lintas instance |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash |

Jangan menaruh nilai rahasia di repository. Private key Google, password, token, dan ID spreadsheet operasional harus dikelola melalui Environment Variables Vercel.

## Validasi

Workflow GitHub Actions memeriksa struktur inti, validitas JSON, sintaks JavaScript, serta kesesuaian operasi API antara dispatcher dan rewrite Vercel. Pemeriksaan ini bukan pengganti smoke test produksi terhadap Google Sheets, kamera/QR, autentikasi, dan Environment Variables.

## Status pemeriksaan

- [x] Semua handler Akademik terdaftar pada dispatcher pusat.
- [x] URL API lama dipertahankan sebagai alias kompatibilitas.
- [x] Path aset absolut beranda Akademik diarahkan ke namespace modul.
- [x] CI diperluas untuk validasi sintaks dan kontrak rute.
- [ ] Smoke test browser pada deployment Vercel.
- [ ] Verifikasi koneksi spreadsheet dan Environment Variables produksi.
- [ ] Uji login admin, scan QR, pencatatan, dan rekap absensi.
