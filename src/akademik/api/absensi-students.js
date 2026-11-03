/*
==========================================================
SMANSASOO Academic Portal
API Route: /api/absensi-students
Version : 1.0.0
==========================================================
Dipakai oleh pages/absensi-admin.html untuk membuat QR code
per siswa. Membaca sheet "STUDENTS" di spreadsheet khusus
absensi (GOOGLE_SHEET_ID_ABSENSI), skema kolom (baris 1 =
header):

  A: NIS
  B: Nama
  C: Kelas

Hanya baca publik lewat gviz (sama seperti modul Nilai),
TIDAK butuh Service Account.
==========================================================
*/

const { verifyAdmin } = require("./admin-auth");
const { ambilSiswa, kodeUntuk } = require("./_lib/siswa-sync");

module.exports = async (req, res) => {

    res.setHeader("Cache-Control", "no-store");

    // Dipakai untuk cetak kartu QR -- data NIS lengkap, jadi dibatasi
    // untuk sesi admin saja. Nonaktif otomatis kalau ADMIN_USERNAME/
    // ADMIN_PASSWORD belum diatur di Vercel.
    const auth = verifyAdmin(req);

    if (auth.configured && !auth.ok) {
        res.status(401).json({ success: false, configured: true, message: "Sesi admin tidak valid, silakan login ulang.", data: [] });
        return;
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID_ABSENSI;

    if (!spreadsheetId) {
        res.status(200).json({
            success: false,
            configured: false,
            message: "GOOGLE_SHEET_ID_ABSENSI belum diatur di Environment Variable Vercel.",
            data: []
        });
        return;
    }

    try {

        const { list, sumber } = await ambilSiswa(spreadsheetId);

        const students = list
            .filter((x) => x.nis && x.nama)
            .map((x) => ({ nis: x.nis, nama: x.nama, kelas: x.kelas, foto: x.foto || "", kode: kodeUntuk(x.nis) }));

        res.status(200).json({
            success: true,
            configured: true,
            message: `Berhasil memuat ${students.length} siswa (sumber: ${sumber === "kesiswaan" ? "Data Siswa Kesiswaan" : "sheet STUDENTS absensi"}).`,
            data: students
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            configured: true,
            message: err.message || "Terjadi kesalahan pada server.",
            data: []
        });

    }

};
