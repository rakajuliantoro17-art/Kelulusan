/*
==========================================================
SARPRASIN v2.0 - Pengadaan / pembelian barang baru
File : src/assets/js/pages/admin-pengadaan.js

Satu pencatatan pembelian = 1 dokumen `procurements` + 1 baris
`assets` di ruangan tujuan (kondisi Baik, nilai = harga satuan),
dari sumber dana apa pun (BOSP, BOSK, BPPOP, APBD, komite, hibah, ...).
==========================================================
*/

import { create, update, remove, COLLECTION } from "../../../services/firebase/index.js";
import { initAdminPage, setText, renderTable, escapeHtml } from "../shared/admin-shell.js";
import { openFormModal, confirmDialog } from "../shared/form-modal.js";
import {
    SUMBER_DANA, labelOf, loadRooms, loadAssets, loadProcurements, nextKodeBarang, rupiah
} from "../shared/inventory-data.js";
import { uploadPhoto } from "../shared/photo.js";

const state = { rows: [], rooms: [], assets: [], q: "" };

initAdminPage({
    key: "pengadaan",
    title: "Pengadaan",
    onReady: async () => {
        await refresh();
        document.getElementById("searchInput").addEventListener("input", (e) => {
            state.q = e.target.value.trim().toLowerCase();
            render();
        });
        document.getElementById("addBtn").addEventListener("click", () => openForm());
        document.getElementById("dataTable").addEventListener("click", onTableClick);
    }
});

async function refresh() {
    try {
        [state.rows, state.rooms, state.assets] =
            await Promise.all([loadProcurements(), loadRooms(), loadAssets()]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="9" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        return;
    }
    renderStats();
    render();
}

const total = (r) => (Number(r.jumlah) || 0) * (Number(r.hargaSatuan) || 0);
const roomName = (k) => state.rooms.find((r) => r.kodeRuang === k)?.namaRuang || k || "-";

function renderStats() {
    const bySource = new Map();
    state.rows.forEach((r) => bySource.set(r.kodeSumber, (bySource.get(r.kodeSumber) || 0) + total(r)));
    const all = [...bySource.values()].reduce((a, b) => a + b, 0);
    document.getElementById("fundStats").innerHTML =
        `<div class="dashboard-stat glass"><div class="stat-icon">🧾</div><span>Total Pengadaan</span><h2 style="font-size:1.3rem">${rupiah(all)}</h2></div>` +
        [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) =>
            `<div class="dashboard-stat glass"><div class="stat-icon">💰</div><span>${escapeHtml(labelOf(SUMBER_DANA, k))}</span><h2 style="font-size:1.3rem">${rupiah(v)}</h2></div>`
        ).join("");
}

function render() {
    const rows = state.rows.filter((r) => !state.q ||
        `${r.namaBarang} ${r.vendor} ${r.noNota} ${r.merk}`.toLowerCase().includes(state.q));

    renderTable("dataTable", rows, [
        { render: (r) => escapeHtml(r.tanggal || "-") },
        { render: (r) => escapeHtml(r.namaBarang) + (r.merk ? ` <small>(${escapeHtml(r.merk)})</small>` : "") },
        { render: (r) => escapeHtml(roomName(r.kodeRuang)) },
        { render: (r) => escapeHtml(r.jumlah) },
        { render: (r) => rupiah(r.hargaSatuan) },
        { render: (r) => rupiah(total(r)) },
        { render: (r) => escapeHtml(labelOf(SUMBER_DANA, r.kodeSumber)) },
        { render: (r) => escapeHtml([r.vendor, r.noNota].filter(Boolean).join(" / ") || "-") +
            (r.fotoNota ? ` <a href="${escapeHtml(r.fotoNota)}" target="_blank" rel="noopener">📎</a>` : "") },
        { render: (r) => `
            <button type="button" class="btn-mini" data-act="edit" data-id="${escapeHtml(r.id)}">Edit</button>
            <button type="button" class="btn-mini danger" data-act="del" data-id="${escapeHtml(r.id)}">Hapus</button>` }
    ]);
    setText("rowCount", `${rows.length} pencatatan`);
}

function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const r = state.rows.find((x) => x.id === btn.dataset.id);
    if (!r) return;
    if (btn.dataset.act === "edit") openForm(r);
    if (btn.dataset.act === "del") removeRow(r);
}

async function removeRow(r) {
    if (!confirmDialog(`Hapus catatan pengadaan "${r.namaBarang}"?\n\nBarang di inventaris ruangan TIDAK ikut terhapus; hapus lewat menu Asset bila perlu.`)) return;
    try {
        await remove(COLLECTION.PROCUREMENTS, r.id);
        await refresh();
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus: " + error.message);
    }
}

function openForm(r = null) {

    if (!state.rooms.length) {
        alert("Belum ada ruangan. Tambahkan ruangan dulu di menu Ruangan.");
        location.href = "/admin/ruangan";
        return;
    }

    const editing = Boolean(r);
    const today = new Date().toISOString().slice(0, 10);

    const base = [
        { name: "tanggal", label: "Tanggal Pembelian", type: "date", required: true },
        { name: "kodeSumber", label: "Sumber Dana", type: "select", required: true, options: SUMBER_DANA },
        { name: "vendor", label: "Vendor / Toko" },
        { name: "noNota", label: "No. Nota / Kuitansi" },
        { name: "keterangan", label: "Keterangan", type: "textarea", full: true }
    ];

    const itemFields = [
        { name: "namaBarang", label: "Nama Barang", required: true, full: true },
        { name: "merk", label: "Merk / Model" },
        { name: "kodeRuang", label: "Ditempatkan di Ruangan", type: "select", required: true,
          options: state.rooms.map((x) => ({ value: x.kodeRuang, label: x.namaRuang })) },
        { name: "jumlah", label: "Jumlah", type: "number", required: true, min: 1, step: 1 },
        { name: "hargaSatuan", label: "Harga Satuan (Rp)", type: "number", required: true, min: 0, step: 1 }
    ];

    openFormModal({
        title: editing ? "Edit Pencatatan (data nota)" : "Catat Pembelian Barang Baru",
        values: r || { tanggal: today, jumlah: 1 },
        fields: editing
            ? base.concat([{ name: "foto", label: "Foto Nota (opsional)", type: "file", full: true }])
            : itemFields.concat(base, [{ name: "foto", label: "Foto Nota (opsional, maks. 5 MB)", type: "file", full: true }]),
        onSubmit: async (data) => {

            const { foto, ...fields } = data;
            const now = new Date().toISOString();
            let fotoNota = editing ? (r.fotoNota || "") : "";
            if (foto) fotoNota = await uploadPhoto(foto);

            if (editing) {
                // hanya data nota; barang sudah ada di inventaris (ubah lewat menu Asset)
                await update(COLLECTION.PROCUREMENTS, r.id, { ...fields, fotoNota, updatedAt: now });
                await refresh();
                return;
            }

            if (!fields.jumlah || fields.jumlah < 1) throw new Error("Jumlah minimal 1.");

            const tahun = Number(String(fields.tanggal).slice(0, 4)) || new Date().getFullYear();
            const kodeBarang = nextKodeBarang(state.assets, fields.kodeRuang);

            const proc = await create(COLLECTION.PROCUREMENTS, {
                ...fields, fotoNota, kodeBarang, tahun, createdAt: now, updatedAt: now
            });

            await create(COLLECTION.ASSETS, {
                namaBarang: fields.namaBarang,
                merk: fields.merk || "",
                kodeBarang,
                kodeRuang: fields.kodeRuang,
                jumlah: fields.jumlah,
                kodeKondisi: "BAIK",
                kodeSumber: fields.kodeSumber,
                tahun,
                nilai: fields.hargaSatuan,
                fotoUrl: "",
                keterangan: [fields.vendor, fields.noNota].filter(Boolean).join(" / "),
                procurementId: proc.id,
                createdAt: now,
                updatedAt: now
            });

            await refresh();
        }
    });
}
