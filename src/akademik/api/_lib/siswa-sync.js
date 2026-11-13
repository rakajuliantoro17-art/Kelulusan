/*
==========================================================
Sinkronisasi data siswa Akademik <-> Kesiswaan
==========================================================
Sumber utama daftar siswa (NIS, nama, kelas, foto) = Data_Siswa di
spreadsheet Kesiswaan, yaitu sumber yang sama dengan kartu QR Kesiswaan.
Kode QR memakai format Kesiswaan "SSK1.<NIS>.<tanda tangan>" yang ditandatangani
dengan ADMIN_SESSION_SECRET, jadi satu kartu bisa dipakai di kedua portal.

Cadangan: kalau Kesiswaan belum terhubung / gagal dibaca, daftar diambil dari
tab STUDENTS di spreadsheet absensi Akademik (tanpa foto).
Hasil dicache singkat (60 dtk) agar scan beruntun tidak memanggil Sheets terus.
==========================================================
*/
const { fetchSheetRows, cleanNIS } = require("./gsheet");

const TTL_MS = 60 * 1000;
let cache = { at: 0, sumber: "", list: null };

async function dariKesiswaan() {
    const sheets = require("../../../kesiswaan/api/_lib/sheets");
    if (sheets.mode() === "demo") return null;
    const K = require("../../../kesiswaan/api/_lib/kesiswaan");
    const list = await K.loadSiswa();
    const bersih = list
        .filter((s) => s.nis && !/^TANPA-NIS/.test(s.nis))
        .map((s) => ({ nis: s.nis, nama: s.nama, kelas: s.kelas || "", foto: s.foto || "", nisn: s.nisn || "" }));
    return bersih.length ? bersih : null;
}

async function dariSheetAbsensi(spreadsheetId) {
    if (!spreadsheetId) return [];
    const rows = await fetchSheetRows("STUDENTS", spreadsheetId);
    const out = [];
    for (let i = 1; i < rows.length; i++) {
        const nis = cleanNIS(rows[i][0]);
        const nama = String(rows[i][1] || "").trim();
        if (!nis || !nama) continue;
        out.push({ nis, nama, kelas: String(rows[i][2] || "").trim(), foto: "" });
    }
    return out;
}

/** -> { list: [{nis,nama,kelas,foto}], sumber: "kesiswaan" | "absensi" } */
async function ambilSiswa(spreadsheetIdAbsensi) {
    if (cache.list && Date.now() - cache.at < TTL_MS) return { list: cache.list, sumber: cache.sumber };
    let list = null, sumber = "kesiswaan";
    try { list = await dariKesiswaan(); } catch (e) { console.warn("siswa-sync: Kesiswaan gagal dibaca:", e && e.message); }
    if (!list) { sumber = "absensi"; list = await dariSheetAbsensi(spreadsheetIdAbsensi); }
    cache = { at: Date.now(), sumber, list };
    return { list, sumber };
}

/** Kode QR Kesiswaan (SSK1...) -> NIS, atau null jika tanda tangan salah. */
function uraiKode(kode) {
    return require("../../../kesiswaan/api/_lib/h/qr").urai(kode);
}
function kodeUntuk(nis) {
    return require("../../../kesiswaan/api/_lib/h/qr").kodeUntuk(nis);
}

module.exports = { ambilSiswa, uraiKode, kodeUntuk };
