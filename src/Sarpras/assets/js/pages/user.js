/*
==========================================================
SARPRASIN v2.0 - Portal Pengguna (operator, guru, wali kelas, viewer)
File : src/assets/js/pages/user.js

Hak (dijaga juga oleh firestore.rules):
- hanya ruangan yang ditugaskan admin (users/{uid}.ruangan)
- tambah barang dasar (tanpa nilai / sumber dana) -> perluVerifikasi
- ubah kondisi / keterangan / foto barang
- lapor kerusakan
- tidak bisa menghapus
==========================================================
*/

import { create, update, getWhere, COLLECTION } from "../../../services/firebase/index.js";
import {
    initPortalPage, setText, toRows, renderTable, escapeHtml, formatTimestamp
} from "../shared/admin-shell.js";
import { openFormModal } from "../shared/form-modal.js";
import {
    KONDISI, labelOf, normalizeKondisi, loadRooms, loadAssetsForRooms, nextKodeBarang, loadSigners
} from "../shared/inventory-data.js";
import { kirHtml } from "../shared/kir-sheet.js";
import { uploadPhoto } from "../shared/photo.js";

const state = { signers: {}, uid: null, name: "", myCodes: [], rooms: [], assets: [], reports: [], room: "" };

initPortalPage({
    portal: "user",
    key: "dashboard",
    title: "Inventaris Ruangan",
    onReady: async ({ uid, name, profile }) => {

        state.uid = uid;
        state.name = name;
        state.myCodes = Array.isArray(profile.ruangan) ? profile.ruangan : [];

        if (!state.myCodes.length) {
            document.getElementById("dataTable").innerHTML =
                '<tr><td colspan="8" class="page-empty">Belum ada ruangan yang ditugaskan ke akun Anda. Hubungi admin sarpras.</td></tr>';
            ["addBtn", "reportBtn", "printBtn"].forEach((id) => { document.getElementById(id).disabled = true; });
            return;
        }

        try {
            const allRooms = await loadRooms();
            state.signers = await loadSigners();
            state.rooms = allRooms.filter((r) => state.myCodes.includes(r.kodeRuang));
        } catch (error) {
            console.error(error);
            document.getElementById("dataTable").innerHTML =
                '<tr><td colspan="8" class="page-empty">Gagal memuat data ruangan.</td></tr>';
            return;
        }

        const select = document.getElementById("roomSelect");
        select.innerHTML = state.rooms.map((r) =>
            `<option value="${escapeHtml(r.kodeRuang)}">${escapeHtml(r.namaRuang)}</option>`
        ).join("");
        state.room = select.value;

        select.addEventListener("change", () => { state.room = select.value; render(); });
        document.getElementById("addBtn").addEventListener("click", openAddForm);
        document.getElementById("reportBtn").addEventListener("click", () => openReportForm());
        document.getElementById("printBtn").addEventListener("click", () => window.print());
        document.getElementById("dataTable").addEventListener("click", onTableClick);

        await refresh();
    }
});

async function refresh() {
    try {
        [state.assets, state.reports] = await Promise.all([
            loadAssetsForRooms(state.myCodes),
            getWhere(COLLECTION.MAINTENANCE, "diinputOleh", "==", state.uid).then(toRows)
        ]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="8" class="page-empty">Gagal memuat data barang (hubungi admin).</td></tr>';
        return;
    }
    render();
}

function roomAssets() {
    return state.assets
        .filter((a) => a.kodeRuang === state.room)
        .sort((a, b) => String(a.kodeBarang || "").localeCompare(String(b.kodeBarang || ""), "id", { numeric: true }));
}

function render() {

    const rows = roomAssets();

    renderTable("dataTable", rows, [
        { render: (r) => escapeHtml(r.kodeBarang || "-") },
        { render: (r) => escapeHtml(r.namaBarang) },
        { render: (r) => escapeHtml(r.merk || "-") },
        { render: (r) => escapeHtml(r.jumlah ?? 1) },
        { render: (r) => escapeHtml(labelOf(KONDISI, normalizeKondisi(r.kodeKondisi || r.kondisi))) },
        { render: (r) => (r.fotoUrl || r.foto)
            ? `<a href="${escapeHtml(r.fotoUrl || r.foto)}" target="_blank" rel="noopener">📷</a>` : "-" },
        { render: (r) => r.perluVerifikasi ? "Menunggu verifikasi" : "Terverifikasi" },
        { render: (r) => `<button type="button" class="btn-mini" data-act="kondisi" data-id="${escapeHtml(r.id)}">Ubah Kondisi</button>
                          <button type="button" class="btn-mini danger" data-act="lapor" data-id="${escapeHtml(r.id)}">Lapor</button>` }
    ]);

    setText("rowCount", `${rows.length} jenis barang di ruangan ini`);

    const room = state.rooms.find((r) => r.kodeRuang === state.room);
    document.getElementById("kirSheet").innerHTML = room ? kirHtml(room, state.assets, state.signers) : "";

    document.getElementById("reportTable").innerHTML = state.reports.length
        ? state.reports
            .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
            .map((r) => `
                <tr>
                    <td>${escapeHtml(r.tanggal || formatTimestamp(r.createdAt))}</td>
                    <td>${escapeHtml(r.namaBarang)}</td>
                    <td>${escapeHtml(r.keterangan)}</td>
                    <td>${escapeHtml(r.status)}</td>
                </tr>`).join("")
        : '<tr><td colspan="4" class="page-empty">Belum ada laporan.</td></tr>';
}

function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const row = state.assets.find((a) => a.id === btn.dataset.id);
    if (!row) return;
    if (btn.dataset.act === "kondisi") openConditionForm(row);
    if (btn.dataset.act === "lapor") openReportForm(row);
}

/* ---------- tambah barang ---------- */

function openAddForm() {

    if (!state.room) { alert("Pilih ruangan dulu."); return; }

    openFormModal({
        title: "Tambah Barang",
        values: { jumlah: 1, kodeKondisi: "BAIK" },
        fields: [
            { name: "namaBarang", label: "Nama Barang", required: true, full: true, placeholder: "mis. Meja Siswa" },
            { name: "merk", label: "Merk / Model" },
            { name: "jumlah", label: "Jumlah", type: "number", required: true, min: 1, step: 1 },
            { name: "kodeKondisi", label: "Kondisi", type: "select", required: true, options: KONDISI },
            { name: "tahun", label: "Tahun (jika tahu)", type: "number", min: 1900, step: 1 },
            { name: "foto", label: "Foto (opsional)", type: "file", full: true },
            { name: "keterangan", label: "Keterangan", type: "textarea", full: true }
        ],
        onSubmit: async (data) => {

            const now = new Date().toISOString();
            const jumlah = Math.max(1, Math.round(data.jumlah || 1));

            // hanya kolom yang diizinkan Firestore Rules untuk role pengguna
            const payload = {
                namaBarang: data.namaBarang,
                merk: data.merk || "",
                kodeBarang: nextKodeBarang(state.assets, state.room),
                kodeRuang: state.room,
                jumlah,
                kodeKondisi: data.kodeKondisi,
                keterangan: data.keterangan || "",
                fotoUrl: data.foto ? await uploadPhoto(data.foto) : "",
                createdAt: now,
                updatedAt: now,
                diinputOleh: state.uid,
                perluVerifikasi: true
            };
            if (data.tahun) payload.tahun = Math.round(data.tahun);

            await create(COLLECTION.ASSETS, payload);
            await refresh();
        }
    });
}

/* ---------- ubah kondisi ---------- */

function openConditionForm(row) {

    openFormModal({
        title: `Ubah Kondisi - ${row.namaBarang}`,
        values: {
            kodeKondisi: normalizeKondisi(row.kodeKondisi || row.kondisi),
            keterangan: row.keterangan || "",
            foto: row.fotoUrl || ""
        },
        fields: [
            { name: "kodeKondisi", label: "Kondisi", type: "select", required: true, options: KONDISI, full: true },
            { name: "keterangan", label: "Keterangan", type: "textarea", full: true },
            { name: "foto", label: "Foto baru (opsional)", type: "file", full: true }
        ],
        onSubmit: async (data) => {

            const payload = {
                kodeKondisi: data.kodeKondisi,
                keterangan: data.keterangan || "",
                updatedAt: new Date().toISOString(),
                diubahOleh: state.uid
            };
            if (data.foto) payload.fotoUrl = await uploadPhoto(data.foto);

            await update(COLLECTION.ASSETS, row.id, payload);
            await refresh();
        }
    });
}

/* ---------- lapor kerusakan ---------- */

function openReportForm(row = null) {

    if (!state.room) { alert("Pilih ruangan dulu."); return; }

    const items = row ? [row] : roomAssets();
    if (!items.length) { alert("Belum ada barang di ruangan ini untuk dilaporkan."); return; }

    openFormModal({
        title: "Lapor Kerusakan",
        values: { assetId: row?.id || "" },
        fields: [
            { name: "assetId", label: "Barang yang rusak", type: "select", required: true, full: true,
              options: items.map((a) => ({ value: a.id, label: `${a.namaBarang} (${a.kodeBarang || "-"})` })) },
            { name: "keterangan", label: "Apa yang rusak / terjadi?", type: "textarea", required: true, full: true },
            { name: "foto", label: "Foto kerusakan (opsional)", type: "file", full: true }
        ],
        onSubmit: async (data) => {

            const asset = state.assets.find((a) => a.id === data.assetId);
            if (!asset) throw new Error("Pilih barang yang dilaporkan.");

            const now = new Date();

            await create(COLLECTION.MAINTENANCE, {
                kodeRuang: asset.kodeRuang,
                assetId: asset.id,
                namaBarang: asset.namaBarang,
                keterangan: data.keterangan,
                fotoUrl: data.foto ? await uploadPhoto(data.foto) : "",
                status: "BARU",
                tanggal: now.toISOString().slice(0, 10),
                createdAt: now.toISOString(),
                diinputOleh: state.uid,
                pelapor: state.name
            });

            await refresh();
        }
    });
}
