/*
==========================================================
SARPRASIN v2.0 - Kartu Inventaris Ruangan (KIR)
File : src/assets/js/pages/admin-kir.js

Pratinjau + cetak KIR per ruangan/kelas (A4 portrait), format mengikuti
spreadsheet sekolah. Penandatangan disimpan di Firestore (master/kir)
oleh admin; role lain hanya mencetak.
==========================================================
*/

import { createWithId, COLLECTION } from "../../../services/firebase/index.js";
import { initAdminPage, escapeHtml } from "../shared/admin-shell.js";
import { loadRooms, loadAssets, loadSigners, SIGNER_FIELDS } from "../shared/inventory-data.js";
import { kirHtml } from "../shared/kir-sheet.js";

const state = { rooms: [], assets: [], signers: {} };

initAdminPage({
    key: "kir",
    activeKey: "ruangan",
    title: "KIR",
    onReady: async ({ role }) => {

        try {
            [state.rooms, state.assets, state.signers] =
                await Promise.all([loadRooms(), loadAssets(), loadSigners()]);
        } catch (error) {
            console.error(error);
            document.getElementById("kirSheet").innerHTML =
                '<p class="page-empty">Gagal memuat data (cek Firestore Rules).</p>';
            return;
        }

        const select = document.getElementById("roomSelect");
        select.innerHTML = '<option value="">- pilih ruangan / kelas -</option>' +
            state.rooms.map((r) =>
                `<option value="${escapeHtml(r.kodeRuang)}">${escapeHtml(r.namaRuang)}</option>`
            ).join("");

        const initial = new URLSearchParams(location.search).get("ruang") || "";
        if (initial && state.rooms.some((r) => r.kodeRuang === initial)) select.value = initial;

        SIGNER_FIELDS.forEach((f) => {
            const el = document.getElementById(f);
            el.value = state.signers[f] || "";
            el.addEventListener("input", render);
        });

        const saveBtn = document.getElementById("saveSignersBtn");
        saveBtn.hidden = role !== "admin";
        saveBtn.addEventListener("click", saveSigners);

        select.addEventListener("change", render);
        document.getElementById("printBtn").addEventListener("click", () => {
            if (!select.value) { alert("Pilih ruangan dulu."); return; }
            window.print();
        });

        render();
    }
});

function currentSigners() {
    return Object.fromEntries(SIGNER_FIELDS.map((f) => [f, document.getElementById(f).value.trim()]));
}

async function saveSigners() {
    const msg = document.getElementById("signerMsg");
    try {
        await createWithId(COLLECTION.MASTER, "kir", { ...currentSigners(), updatedAt: new Date().toISOString() });
        msg.textContent = "Penandatangan tersimpan untuk semua pengguna.";
    } catch (error) {
        console.error(error);
        msg.textContent = "Gagal menyimpan: " + error.message;
    }
}

function render() {

    const sheet = document.getElementById("kirSheet");
    const kode = document.getElementById("roomSelect").value;
    const room = state.rooms.find((r) => r.kodeRuang === kode);

    if (!room) {
        sheet.innerHTML = '<p class="page-empty">Pilih ruangan untuk menampilkan kartu inventaris.</p>';
        return;
    }

    sheet.innerHTML = kirHtml(room, state.assets, currentSigners());
}
