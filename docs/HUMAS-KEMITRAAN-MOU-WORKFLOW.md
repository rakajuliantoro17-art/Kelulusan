# PINTUKU HUMAS — Kemitraan & MoU

## Tujuan
Membangun satu alur transaksi kerja sama sekolah dari pencatatan mitra sampai arsip dokumen final.

## Ruang lingkup tahap pertama
- Master data mitra.
- Registrasi MoU, PKS, dan dokumen implementasi.
- Pengajuan dan verifikasi administrasi oleh staf HUMAS.
- Review substansi dan rekomendasi Wakasek HUMAS.
- Keputusan akhir Kepala Sekolah.
- Pengelolaan versi dokumen, tanda tangan fisik/TTE, registrasi, dan arsip.
- Riwayat aktivitas untuk audit.

## Matriks kewenangan
| Aktor | Kewenangan |
|---|---|
| Staf HUMAS | Membuat draft, mengelola data mitra, memeriksa kelengkapan, mengajukan, dan memperbarui tindak lanjut |
| Wakasek HUMAS | Memvalidasi substansi, meminta revisi, dan memberi rekomendasi; bukan keputusan final |
| Kepala Sekolah | Menyetujui, menolak, atau mengembalikan dokumen; menjadi pejabat keputusan akhir |
| Operator Sistem | Mengelola konfigurasi teknis dan akun; tidak menyetujui substansi |
| Pengguna eksternal | Mengajukan data/dokumen melalui kanal eksternal yang dibatasi; tidak dapat melihat data mitra lain |

## Status transaksi
`draft → submitted → verified → recommended → pending_principal_approval → approved → pending_signature → physically_signed / electronically_signed → registered → archived`

Jalur alternatif:
- `revision_required`: dikembalikan dengan catatan dan versi revisi baru.
- `rejected`: ditolak dengan alasan yang tercatat.
- `expired`: masa kerja sama berakhir; status ini tidak menghapus arsip.

Status bukan sekadar label UI. Setiap transisi harus divalidasi server-side berdasarkan peran, status sebelumnya, alasan, dan versi dokumen yang sedang ditinjau.

## Aturan kontrol
1. Rekomendasi Wakasek tidak boleh otomatis mengubah status menjadi `approved`.
2. Persetujuan tidak sama dengan tanda tangan.
3. Tanda tangan fisik: unggah hasil pindai setelah tanda tangan dilakukan pejabat berwenang; simpan dokumen final dan metadata pemeriksaan.
4. TTE: integrasi hanya setelah penyedia PSrE/TTE dan mekanisme verifikasinya disetujui. PIN, kata sandi, OTP, atau private credential pejabat tidak boleh disimpan di PINTUKU.
5. Setiap revisi menghasilkan versi dokumen baru; jangan menimpa berkas yang pernah menjadi dasar keputusan.
6. Timeline aktivitas harus menyimpan aktor, peran, waktu, status asal/tujuan, alasan, dan referensi versi dokumen.
7. Dokumen dan data kontak mitra memiliki akses terbatas; jangan membuka tabel HUMAS untuk akses browser langsung.
8. Keputusan final tetap dilakukan manusia yang berwenang. AI hanya boleh membantu ringkasan dan pemeriksaan kelengkapan.

## Struktur database awal
Migration `supabase/migrations/202611020001_humas_partnership_foundation.sql` membuat:
- `humas.partners`
- `humas.agreements`
- `humas.agreement_documents`
- `humas.agreement_approvals`
- `humas.agreement_workflow_events`

RLS diaktifkan tanpa policy untuk role browser `anon` dan `authenticated`. Dengan demikian, tabel tidak dapat diakses langsung oleh frontend sampai desain Auth/RBAC dan API server-side selesai. `service_role` hanya boleh digunakan di lingkungan server, tidak pernah di browser.

## Belum dilakukan
- Migration belum dijalankan pada project Supabase.
- Storage bucket belum dibuat.
- Auth, profil, RBAC, dan policy akses per peran belum dipasang.
- API transaksi belum diaktifkan.
- UI transaksi belum dihubungkan ke database.
- Penyedia TTE belum dipilih atau diaudit.
