/*
==========================================================
SARPRASIN v2.0 - Ruangan (daftar + tambah/edit/hapus)
File : src/assets/js/pages/admin-ruangan.js
==========================================================
*/

import {
    createWithId, update, remove, COLLECTION
} from "../../../services/firebase/index.js";
import {
    initAdminPage, setText, renderTable, escapeHtml
} from "../shared/admin-shell.js";
import { openFormModal, confirmDialog } from "../shared/form-modal.js";
import { JENIS_RUANG, labelOf, loadRooms, loadAssets, loadBuildings } from "../shared/inventory-data.js";

const state = { rooms: [], assets: [], buildings: [], q: "" };

initAdminPage({
    key: "ruangan",
    title: "Ruangan",
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
        [state.rooms, state.assets, state.buildings] = await Promise.all([loadRooms(), loadAssets(), loadBuildings()]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="7" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        return;
    }
    render();
}

function countItems(kode) {
    return state.assets
        .filter((a) => a.kodeRuang === kode)
        .reduce((sum, a) => sum + (Number(a.jumlah) || 1), 0);
}

function render() {

    const rows = state.rooms.filter((r) => !state.q ||
        `${r.kodeRuang} ${r.namaRuang} ${r.penanggungJawab}`.toLowerCase().includes(state.q));

    renderTable("dataTable", rows, [
        { render: (r) => escapeHtml(r.kodeRuang) },
        { render: (r) => escapeHtml(r.namaRuang) },
        { render: (r) => escapeHtml(labelOf(JENIS_RUANG, r.jenis)) },
        { render: (r) => escapeHtml(state.buildings.find((b) => b.kodeBangunan === r.kodeBangunan)?.namaBangunan || r.gedungLantai || "-") },
        { render: (r) => escapeHtml(r.penanggungJawab || "-") },
        { render: (r) => countItems(r.kodeRuang) },
        { render: (r) => `
            <a class="btn-mini" href="/admin/asset?ruang=${encodeURIComponent(r.kodeRuang)}">Barang</a>
            <a class="btn-mini" href="/admin/kir?ruang=${encodeURIComponent(r.kodeRuang)}">🖨️ KIR</a>
            <button type="button" class="btn-mini" data-act="edit" data-id="${escapeHtml(r.id)}">Edit</button>
            <button type="button" class="btn-mini danger" data-act="del" data-id="${escapeHtml(r.id)}">Hapus</button>` }
    ]);

    setText("rowCount", `${rows.length} ruangan`);
}

function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const room = state.rooms.find((r) => r.id === btn.dataset.id);
    if (!room) return;

    if (btn.dataset.act === "edit") openForm(room);
    if (btn.dataset.act === "del") removeRoom(room);
}

async function removeRoom(room) {

    const n = state.assets.filter((a) => a.kodeRuang === room.kodeRuang).length;
    if (n > 0) {
        alert(`Ruangan "${room.namaRuang}" masih punya ${n} data barang. Pindahkan atau hapus barangnya dulu.`);
        return;
    }
    if (!confirmDialog(`Hapus ruangan "${room.namaRuang}"?`)) return;

    try {
        await remove(COLLECTION.ROOMS, room.id);
        await refresh();
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus: " + error.message);
    }
}

function openForm(room = null) {

    const editing = Boolean(room);

    openFormModal({
        title: editing ? "Edit Ruangan" : "Tambah Ruangan",
        values: room || { jenis: "KELAS" },
        fields: [
            { name: "kodeRuang", label: "Kode Ruang", required: true, disabled: editing,
              placeholder: "mis. XI-1 atau LAB-KOM" },
            { name: "namaRuang", label: "Nama Ruang", required: true, placeholder: "mis. Kelas XI-1" },
            { name: "jenis", label: "Jenis Ruang", type: "select", required: true, options: JENIS_RUANG },
            { name: "kodeBangunan", label: "Bangunan", type: "select",
              options: state.buildings.map((b) => ({ value: b.kodeBangunan, label: b.namaBangunan })) },
            { name: "gedungLantai", label: "Lantai / Letak", placeholder: "mis. Lt. 1 sayap timur" },
            { name: "luas", label: "Luas (m²)", type: "number", min: 0, step: "0.1" },
            { name: "kapasitas", label: "Kapasitas (orang)", type: "number", min: 0, step: 1 },
            { name: "penanggungJawab", label: "Penanggung Jawab", full: true,
              placeholder: "mis. nama wali kelas / kepala lab" }
        ],
        onSubmit: async (data) => {

            data.updatedAt = new Date().toISOString();

            if (editing) {
                delete data.kodeRuang;
                await update(COLLECTION.ROOMS, room.id, data);
            } else {
                const kode = data.kodeRuang.toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
                if (!kode) throw new Error("Kode ruang hanya boleh huruf, angka, - dan _.");
                if (state.rooms.some((r) => r.kodeRuang === kode)) {
                    throw new Error(`Kode ruang "${kode}" sudah dipakai.`);
                }
                data.kodeRuang = kode;
                data.createdAt = data.updatedAt;
                await createWithId(COLLECTION.ROOMS, kode, data);
            }

            await refresh();
        }
    });
}
