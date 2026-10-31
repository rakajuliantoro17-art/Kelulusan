# Build publikasi (Vercel)

`build.js` merakit direktori output `dist/` (di-ignore git) dari dua sumber:

| Sumber | Tujuan | Catatan |
|---|---|---|
| `public/**` | `dist/**` | Disalin apa adanya (aset publik, URL `/assets/...`). |
| `src/**` | `dist/src/**` | Disaring: hanya berkas web (html, css, js, json, gambar, font, media). |

Rewrite di `vercel.json` (mis. `/akademik/` → `/src/akademik/index.html`) bekerja karena jalur `/src/...` ada kembali di output.

**Tidak ikut dipublikasikan:** folder `api/`, `_lib/`, `server/`, `scripts/`, `appscript/`, `docs/`, `tools/`, seluruh `src/Sarpras` (masih tahap audit, perlu build Vite sendiri), serta berkas non-web (`.md`, `.gs`, `.rules`, `.xlsx`, `package.json`, `vercel.json`).

**Fungsi serverless** tetap lewat `api/akademik.js` dan `api/kesiswaan.js` di root. Vercel hanya mendaftarkan fungsi dari `/api` root, jadi berkas itu sengaja tipis dan hanya me-require `src/server/api/*`.

Menjalankan lokal: `node src/tools/build.js`. Skrip keluar dengan kode 1 bila titik masuk wajib hilang atau kode server bocor ke `dist/`.
