/*
==========================================================
SARPRASIN v2.0 - Halaman Admin: Maintenance
File : src/assets/js/pages/admin-maintenance.js
==========================================================
*/

import { getAll, COLLECTION } from "../../../services/firebase/index.js";
import {
    initAdminPage, setText, toRows, renderTable, bindTableSearch, escapeHtml
} from "../shared/admin-shell.js";

const COLUMNS = [
    { render: (r) => escapeHtml(r.namaBarang || r.kodeBarang || r.id) },
    { render: (r) => escapeHtml(r.keterangan || r.deskripsi) },
    { render: (r) => escapeHtml(r.status) },
    { render: (r) => escapeHtml(r.tanggal) }
];

initAdminPage({
    key: "maintenance",
    title: "Maintenance",
    onReady: async () => {
        try {
            const rows = toRows(await getAll(COLLECTION.MAINTENANCE));
            renderTable("dataTable", rows, COLUMNS);
            setText("rowCount", rows.length + " data");
        } catch (error) {
            console.error("Gagal memuat data:", error);
            document.getElementById("dataTable").innerHTML =
                '<tr><td colspan="4" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        }
        bindTableSearch("searchInput", "dataTable");
    }
});
