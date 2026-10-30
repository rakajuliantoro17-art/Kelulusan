# Sinkron Akun dengan Google Spreadsheet

Gratis (Apps Script), tanpa Blaze. Password **tidak pernah** ditulis ke sheet.

## Alur
- **📤 Kirim ke Sheet**: daftar akun terkini aplikasi → sheet `Daftar Akun` (ditimpa tiap kali).
- **🔄 Tarik dari Sheet**: isi sheet `Akun` (Nama, Email, Role, Password opsional, Ruangan) → pratinjau → buat akun. Baris yang berhasil otomatis dihapus dari `Akun` dan dicatat (tanpa password) di sheet `Riwayat Impor`.

## Pasang (sekali, ± 10 menit)
1. Buka spreadsheet. Ganti nama tab data impor menjadi **Akun** (huruf persis).
2. Ekstensi → **Apps Script**. Hapus isi default, tempel seluruh `docs/apps-script/sinkron-akun.gs`, Simpan.
3. Project Settings (ikon roda gigi) → **Script properties** → tambah:
   - `FIREBASE_API_KEY` = nilai `VITE_FIREBASE_API_KEY`
   - `FIREBASE_PROJECT_ID` = nilai `VITE_FIREBASE_PROJECT_ID`
4. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy, setujui izin (Spreadsheet + akses eksternal), salin URL berakhiran `/exec`.
5. Vercel → Environment Variables → `VITE_SHEETS_URL` = URL tadi → **Redeploy**.
6. Login admin → User Management → klik **Kirim ke Sheet** untuk mencoba.

Setiap mengubah kode skrip: Deploy → Manage deployments → edit → New version (URL tetap).

## Keamanan
- "Anyone" hanya berarti URL bisa dipanggil; tanpa ID token Firebase milik admin aktif, skrip menolak semua aksi.
- Jangan membagikan spreadsheet ke banyak orang: sheet `Akun` bisa berisi password awal sebelum diimpor.
- Jika akun Workspace sekolah memblokir akses "Anyone", pakai akun Google pribadi untuk spreadsheet + skrip.
