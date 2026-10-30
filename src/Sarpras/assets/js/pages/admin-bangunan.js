/*
==========================================================
SARPRASIN v2.0 - Bangunan (gedung + isinya)
File : src/assets/js/pages/admin-bangunan.js
Ruangan dihubungkan ke bangunan lewat rooms.kodeBangunan.
==========================================================
*/

import { createWithId, update, remove, COLLECTION } from "../../../services/firebase/index.js";
import { initAdminPage, setText, renderTable, escapeHtml } from "../shared/admin-shell.js";
import { openFormModal, confirmDialog } from "../shared/form-modal.js";
import {
    JENIS_BANGUNAN, KONDISI, SUMBER_DANA, labelOf, normalizeKondisi,
    loadBuildings, loadRooms, loadAssets
} from "../shared/inventory-data.js";

const state = { buildings: [], rooms: [], assets: [], q: "" };

initAdminPage({
    key: "bangunan",
    title: "Bangunan",
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
        [state.buildings, state.rooms, state.assets] =
            await Promise.all([loadBuildings(), loadRooms(), loadAssets()]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="9" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        return;
    }
    render();
}

const roomsOf = (b) => state.rooms.filter((r) => r.kodeBangunan === b.kodeBangunan);

function itemCount(b) {
    const codes = new Set(roomsOf(b).map((r) => r.kodeRuang));
    return state.assets
        .filter((a) => codes.has(a.kodeRuang))
        .reduce((s, a) => s + (Number(a.jumlah) || 1), 0);
}

function render() {
    const rows = state.buildings.filter((b) => !state.q ||
        `${b.kodeBangunan} ${b.namaBangunan}`.toLowerCase().includes(state.q));

    renderTable("dataTable", rows, [
        { render: (b) => escapeHtml(b.kodeBangunan) },
        { render: (b) => escapeHtml(b.namaBangunan) },
        { render: (b) => escapeHtml(labelOf(JENIS_BANGUNAN, b.jenis)) },
        { render: (b) => escapeHtml(b.jumlahLantai ?? "-") },
        { render: (b) => escapeHtml(b.luas ?? "-") },
        { render: (b) => escapeHtml(b.kodeKondisi ? labelOf(KONDISI, normalizeKondisi(b.kodeKondisi)) : "-") },
        { render: (b) => {
            const linked = roomsOf(b).length;
            const listed = String(b.daftarRuang || "").split("\n").filter(Boolean).length;
            return linked + (listed ? ` <small title="Daftar ruang di KIB">(KIB: ${listed})</small>` : ""); } },
        { render: (b) => itemCount(b) },
        { render: (b) => `
            <a class="btn-mini" href="/admin/ruangan">Ruang</a>
            <button type="button" class="btn-mini" data-act="edit" data-id="${escapeHtml(b.id)}">Edit</button>
            <button type="button" class="btn-mini danger" data-act="del" data-id="${escapeHtml(b.id)}">Hapus</button>` }
    ]);
    setText("rowCount", `${rows.length} bangunan`);
}

function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const b = state.buildings.find((x) => x.id === btn.dataset.id);
    if (!b) return;
    if (btn.dataset.act === "edit") openForm(b);
    if (btn.dataset.act === "del") removeBuilding(b);
}

async function removeBuilding(b) {
    const n = roomsOf(b).length;
    if (n > 0) {
        alert(`Bangunan "${b.namaBangunan}" masih memuat ${n} ruangan. Pindahkan ruangannya dulu (menu Ruangan).`);
        return;
    }
    if (!confirmDialog(`Hapus bangunan "${b.namaBangunan}"?`)) return;
    try {
        await remove(COLLECTION.BUILDINGS, b.id);
        await refresh();
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus: " + error.message);
    }
}

function openForm(b = null) {
    const editing = Boolean(b);
    openFormModal({
        title: editing ? "Edit Bangunan" : "Tambah Bangunan",
        values: b || { jenis: "GEDUNG_KELAS" },
        fields: [
            { name: "kodeBangunan", label: "Kode Bangunan", required: true, disabled: editing, placeholder: "mis. GD-A" },
            { name: "namaBangunan", label: "Nama Bangunan", required: true, placeholder: "mis. Gedung A" },
            { name: "jenis", label: "Jenis", type: "select", required: true, options: JENIS_BANGUNAN },
            { name: "kodeKondisi", label: "Kondisi", type: "select", options: KONDISI },
            { name: "jumlahLantai", label: "Jumlah Lantai", type: "number", min: 1, step: 1 },
            { name: "luas", label: "Luas (m²)", type: "number", min: 0, step: "0.1" },
            { name: "tahunBangun", label: "Tahun Dibangun", type: "number", min: 1900, step: 1 },
            { name: "kodeSumber", label: "Sumber Dana", type: "select", options: SUMBER_DANA },
            { name: "nilai", label: "Nilai Perolehan (Rp)", type: "number", min: 0, step: 1 },
            { name: "daftarRuang", label: "Isi bangunan: daftar ruang (satu per baris)", type: "textarea", full: true },
            { name: "keterangan", label: "Keterangan", type: "textarea", full: true }
        ],
        onSubmit: async (data) => {
            data.updatedAt = new Date().toISOString();
            if (editing) {
                delete data.kodeBangunan;
                await update(COLLECTION.BUILDINGS, b.id, data);
            } else {
                const kode = data.kodeBangunan.toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
                if (!kode) throw new Error("Kode hanya boleh huruf, angka, - dan _.");
                if (state.buildings.some((x) => x.kodeBangunan === kode)) {
                    throw new Error(`Kode bangunan "${kode}" sudah dipakai.`);
                }
                data.kodeBangunan = kode;
                data.createdAt = data.updatedAt;
                await createWithId(COLLECTION.BUILDINGS, kode, data);
            }
            await refresh();
        }
    });
}
