# Stage 1K — Integrasi Navigasi Portal PINTUKU dan GDS

Tanggal: 30 Oktober 2026  
Repository: `rakajuliantoro17-art/Kelulusan`  
Branch: `main`

## 1. Keputusan arsitektur

PINTUKU tetap menjadi portal induk. GDS/Kesiswaan tetap menjadi modul mandiri dengan shell, navigasi operasional, CSS, JavaScript, autentikasi, dan backend sendiri.

Tahap ini tidak memasang ulang header PINTUKU di setiap halaman GDS. Pendekatan tersebut berpotensi menimpa layout dan identitas shell GDS. Integrasi dilakukan melalui pintu masuk modul dan tautan kembali yang ringan.

## 2. Jalur masuk dari PINTUKU

Landing PINTUKU `index.html` sudah memiliki kartu Kesiswaan dengan tautan:
```html
<a class="module-link" href="/kesiswaan/">Buka modul</a>
```

Navigasi portal induk di `js/portal-shell.js` juga memiliki entri Kesiswaan menuju `/kesiswaan/`. Tidak diperlukan perubahan pada kedua file tersebut.

## 3. Jalur kembali dari GDS

File: `src/kesiswaan/js/shell.js`

Registry `FOOTER_EXTRA_LINKS` ditambah satu tautan:
```js
{ label: "Kembali ke PINTUKU", href: "/" }
```

Tautan dirender oleh footer shell GDS. Pemeriksaan halaman menunjukkan mount `shellFooter` tersedia pada halaman operasional yang diperiksa, termasuk Admin, Eksekutif, Wali Kelas, dan QR. Tautan ini tidak mengubah menu kerja berbasis role maupun status autentikasi.

## 4. Navigasi internal dan isolasi modul

- Sidebar GDS tetap memakai route `/kesiswaan/...`.
- Brand/logo GDS tetap mengarah ke dashboard GDS.
- Link kembali ke PINTUKU ditempatkan di footer, bukan mengganti brand atau menu role.
- Shell PINTUKU tidak diinjeksikan ke DOM GDS.
- Tidak ada perubahan CSS, tema, autentikasi, session storage, role guard, API, Spreadsheet, atau data.
- Modul Akademik dan Sarpras tidak disentuh.

## 5. File yang berubah

1. `src/kesiswaan/js/shell.js` — menambah tautan footer “Kembali ke PINTUKU”.

Perubahan dikirim ke branch `main` dan source diperiksa kembali setelah commit.

## 6. Batas validasi

Audit ini memverifikasi source dan jalur navigasi yang didefinisikan. Belum dilakukan browser smoke test atau pemeriksaan deployment Vercel. Perlu diuji setelah deployment:
1. Buka PINTUKU dan klik Buka modul Kesiswaan.
2. Navigasikan halaman GDS melalui sidebar.
3. Periksa footer pada halaman publik dan halaman yang membutuhkan login.
4. Klik Kembali ke PINTUKU dan pastikan kembali ke `/`.
5. Pastikan sesi GDS tetap berjalan saat berpindah antarhalaman internal GDS.

Keberhasilan source commit tidak otomatis berarti deployment atau runtime sudah tervalidasi.
