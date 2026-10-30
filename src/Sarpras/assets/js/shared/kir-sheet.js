/*
==========================================================
SARPRASIN v2.0
TEMPLATE KARTU INVENTARIS RUANGAN (KIR)
File : src/assets/js/shared/kir-sheet.js

Mengikuti format KIR di spreadsheet sekolah ("Asset SMAN 1 Sooko"):
kop, identitas (provinsi s.d. ruangan/kelas, no. kode lokasi),
tabel 7 kolom (No, Nama Barang, Merk/Model, Tahun Pembelian,
No. Kode Barang, Jumlah Barang, Keterangan), lalu tanda tangan
Pengurus Barang, Wakasek Sarpras dan Kepala Sekolah.

Dipakai portal Admin (/admin/kir) dan portal Pengguna (/user),
untuk ruangan maupun kelas.
==========================================================
*/

import { escapeHtml } from "./admin-shell.js";
import { SEKOLAH, KONDISI, labelOf, normalizeKondisi } from "./inventory-data.js";

const dots = "..............................";
const val = (v) => escapeHtml(v || dots);

function signBlock(title, name, nip, extra = "") {
    return `
        <div>
            <p>${title}</p>
            <div class="kir-sign-space"></div>
            <p><strong><u>${val(name)}</u></strong>${extra ? `<br>${escapeHtml(extra)}` : ""}<br>NIP. ${val(nip)}</p>
        </div>`;
}

export function kirHtml(room, assets, signers = {}) {

    const items = assets
        .filter((a) => a.kodeRuang === room.kodeRuang)
        .sort((a, b) => String(a.kodeBarang || "").localeCompare(String(b.kodeBarang || ""), "id", { numeric: true }));

    const body = items.map((a, i) => {
        const kondisi = labelOf(KONDISI, normalizeKondisi(a.kodeKondisi || a.kondisi))
            .replace(" (Rusak Ringan)", "");
        const note = a.keterangan ? ` — ${a.keterangan}` : "";
        return `
            <tr>
                <td class="c">${i + 1}</td>
                <td>${escapeHtml(a.namaBarang)}</td>
                <td>${escapeHtml(a.merk || "")}</td>
                <td class="c">${escapeHtml(a.tahun || "")}</td>
                <td>${escapeHtml(a.kodeBarangResmi || a.kodeBarang || "")}</td>
                <td class="c">${escapeHtml(a.jumlah ?? 1)}</td>
                <td>${escapeHtml(kondisi + note)}</td>
            </tr>`;
    }).join("") || `<tr><td colspan="7" class="c">Belum ada barang tercatat di ruangan ini.</td></tr>`;

    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    return `
        <div class="kir-head">
            <img src="/logo/icon.png" alt="" class="kir-logo">
            <div class="kir-head-text">
                <div>${SEKOLAH.instansi1}</div>
                <div>${SEKOLAH.instansi2}</div>
                <strong>${SEKOLAH.nama}</strong>
                <div class="kir-addr">${SEKOLAH.alamat}</div>
                <div class="kir-addr">${SEKOLAH.kontak}</div>
            </div>
        </div>

        <h2 class="kir-title"><u>KARTU INVENTARIS RUANGAN</u></h2>

        <table class="kir-meta">
            <tr><td>PROVINSI</td><td>: ${SEKOLAH.provinsi}</td></tr>
            <tr><td>KABUPATEN</td><td>: ${SEKOLAH.kabupaten}</td></tr>
            <tr><td>SKPD</td><td>: ${SEKOLAH.skpd}</td></tr>
            <tr><td>UNIT KERJA</td><td>: ${SEKOLAH.unitKerja}</td></tr>
            <tr><td>RUANGAN/KELAS</td><td>: ${escapeHtml(String(room.namaRuang).toUpperCase())}</td></tr>
            <tr><td></td><td class="r">NO. KODE LOKASI : ${SEKOLAH.kodeLokasi}</td></tr>
        </table>

        <table class="kir-table">
            <thead>
                <tr>
                    <th>No</th><th>Nama Barang</th><th>Merk/Model</th><th>Tahun Pembelian</th>
                    <th>No. Kode Barang</th><th>Jumlah Barang</th><th>Keterangan</th>
                </tr>
                <tr class="kir-numrow"><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>10</th></tr>
            </thead>
            <tbody>${body}</tbody>
        </table>

        <div class="kir-sign">
            <div class="kir-sign-slot"></div>
            <div class="kir-sign-slot"><p>${SEKOLAH.kota}, ${tanggal}</p></div>
        </div>
        <div class="kir-sign">
            ${signBlock("Pengurus Barang", signers.pengurusNama, signers.pengurusNip)}
            ${signBlock("Wakasek SARPRAS", signers.wakaNama, signers.wakaNip)}
        </div>
        <div class="kir-sign kir-sign-center">
            <div>
                <p>Mengetahui<br>Kepala SMA Negeri 1 Sooko</p>
                <div class="kir-sign-space"></div>
                <p><strong><u>${val(signers.kepsekNama)}</u></strong><br>${escapeHtml(signers.kepsekPangkat || "")}<br>NIP. ${val(signers.kepsekNip)}</p>
            </div>
        </div>`;
}
