/*
==========================================================
SARPRASIN v2.0 - Asset (daftar + tambah/edit/hapus)
File : src/assets/js/pages/admin-asset.js
==========================================================
*/

import {
    initAdminPage, setText, renderTable, escapeHtml
} from "../shared/admin-shell.js";
import { openFormModal, confirmDialog } from "../shared/form-modal.js";
import {
    KONDISI, SUMBER_DANA, labelOf, normalizeKondisi, loadRooms, loadAssets
} from "../shared/inventory-data.js";
import { uploadPhoto } from "../shared/photo.js";
import {
    createAsset, updateAsset, deleteAsset
} from "../../../services/core/asset.service.js";

const state = { rows: [], rooms: [], q: "", room: "" };

initAdminPage({
    key: "asset",
    title: "Asset",
    onReady: async () => {

        state.room = new URLSearchParams(location.search).get("ruang") || "";

        await refresh();

        document.getElementById("searchInput").addEventListener("input", (e) => {
            state.q = e.target.value.trim().toLowerCase();
            render();
        });

        document.getElementById("roomFilter").addEventListener("change", (e) => {
            state.room = e.target.value;
            render();
        });

        document.getElementById("addBtn").addEventListener("click", () => openForm());

        document.getElementById("dataTable").addEventListener("click", onTableClick);
    }
});

async function refresh() {
    try {
        [state.rooms, state.rows] = await Promise.all([loadRooms(), loadAssets()]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="10" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        return;
    }

    const select = document.getElementById("roomFilter");
    select.innerHTML = '<option value="">Semua ruangan</option>' +
        state.rooms.map((r) =>
            `<option value="${escapeHtml(r.kodeRuang)}"${r.kodeRuang === state.room ? " selected" : ""}>${escapeHtml(r.namaRuang)}</option>`
        ).join("");

    render();
}

function roomName(kode) {
    return state.rooms.find((r) => r.kodeRuang === kode)?.namaRuang || kode || "-";
}

function render() {

    const rows = state.rows
        .filter((r) => !state.room || r.kodeRuang === state.room)
        .filter((r) => !state.q ||
            `${r.namaBarang} ${r.kodeBarang} ${r.merk}`.toLowerCase().includes(state.q))
        .sort((a, b) => String(a.kodeBarang || "").localeCompare(String(b.kodeBarang || ""), "id", { numeric: true }));

    renderTable("dataTable", rows, [
        { render: (r) => escapeHtml(r.kodeBarang || "-") },
        { render: (r) => escapeHtml(r.namaBarang) },
        { render: (r) => escapeHtml(r.merk || "-") },
        { render: (r) => escapeHtml(roomName(r.kodeRuang)) },
        { render: (r) => escapeHtml(r.jumlah ?? 1) },
        { render: (r) => escapeHtml(labelOf(KONDISI, normalizeKondisi(r.kodeKondisi || r.kondisi))) },
        { render: (r) => escapeHtml(r.tahun) },
        { render: (r) => r.nilai != null && r.nilai !== "" ? "Rp " + Number(r.nilai).toLocaleString("id-ID") : "-" },
        { render: (r) => (r.fotoUrl || r.foto)
            ? `<a href="${escapeHtml(r.fotoUrl || r.foto)}" target="_blank" rel="noopener">📷</a>` : "-" },
        { render: (r) => `
            <button type="button" class="btn-mini" data-act="edit" data-id="${escapeHtml(r.id)}">Edit</button>
            <button type="button" class="btn-mini danger" data-act="del" data-id="${escapeHtml(r.id)}">Hapus</button>` }
    ]);

    setText("rowCount", `${rows.length} dari ${state.rows.length} data`);

    const kir = document.getElementById("kirBtn");
    kir.href = state.room ? `/admin/kir?ruang=${encodeURIComponent(state.room)}` : "/admin/kir";
}

function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const row = state.rows.find((r) => r.id === btn.dataset.id);
    if (!row) return;

    if (btn.dataset.act === "edit") openForm(row);
    if (btn.dataset.act === "del") removeRow(row);
}

async function removeRow(row) {
    if (!confirmDialog(`Hapus "${row.namaBarang}" (${row.kodeBarang || row.id})? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
        await deleteAsset(row.id);
        await refresh();
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus: " + error.message);
    }
}

function nextKode(kodeRuang) {
    const prefix = `${kodeRuang}-`;
    const max = state.rows
        .map((r) => String(r.kodeBarang || ""))
        .filter((k) => k.startsWith(prefix))
        .map((k) => parseInt(k.slice(prefix.length), 10))
        .filter((n) => !Number.isNaN(n))
        .reduce((a, b) => Math.max(a, b), 0);
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function openForm(row = null) {

    if (!state.rooms.length) {
        alert("Belum ada data ruangan. Tambahkan ruangan dulu di menu Ruangan.");
        location.href = "/admin/ruangan";
        return;
    }

    const editing = Boolean(row);

    openFormModal({
        title: editing ? "Edit Asset" : "Tambah Asset",
        values: editing
            ? { ...row, foto: row.fotoUrl, kodeKondisi: normalizeKondisi(row.kodeKondisi || row.kondisi) }
            : { kodeRuang: state.room, jumlah: 1, kodeKondisi: "BAIK", tahun: new Date().getFullYear() },
        fields: [
            { name: "namaBarang", label: "Nama Barang", required: true, full: true, placeholder: "mis. Meja Siswa" },
            { name: "merk", label: "Merk / Model", placeholder: "mis. Chitose" },
            { name: "kodeBarang", label: "Kode Barang (internal)", placeholder: "kosongkan = otomatis" },
            { name: "kodeBarangResmi", label: "Kode Barang Resmi (KIB/KIR)", placeholder: "mis. 1.3.2.05.02.04.004" },
            { name: "kodeRuang", label: "Ruangan", type: "select", required: true,
              options: state.rooms.map((r) => ({ value: r.kodeRuang, label: r.namaRuang })) },
            { name: "jumlah", label: "Jumlah", type: "number", required: true, min: 1, step: 1 },
            { name: "kodeKondisi", label: "Kondisi", type: "select", required: true, options: KONDISI },
            { name: "kodeSumber", label: "Sumber Dana", type: "select", required: true, options: SUMBER_DANA },
            { name: "tahun", label: "Tahun Pengadaan", type: "number", required: true, min: 1900, step: 1 },
            { name: "nilai", label: "Nilai Perolehan (Rp)", type: "number", min: 0, step: 1 },
            { name: "foto", label: "Foto Barang (opsional, maks. 5 MB)", type: "file", full: true },
            { name: "keterangan", label: "Keterangan", type: "textarea", full: true }
        ],
        onSubmit: async (data) => {

            const { foto, ...fields } = data;

            let fotoUrl = editing ? (row.fotoUrl || "") : "";
            if (foto) fotoUrl = await uploadPhoto(foto);

            const payload = {
                ...fields,
                fotoUrl,
                kodeBarang: data.kodeBarang || (editing ? row.kodeBarang : "") || nextKode(data.kodeRuang),
                jumlah: data.jumlah || 1,
                nilai: data.nilai ?? 0,
                updatedAt: new Date().toISOString()
            };

            let result;
            if (editing) {
                result = await updateAsset(row.id, payload);
            } else {
                payload.createdAt = payload.updatedAt;
                result = await createAsset(payload);
            }

            if (result?.valid === false) {
                throw new Error(result.errors.join(" "));
            }

            await refresh();
        }
    });
}
