/*
==========================================================
SARPRASIN v2.0 - Dashboard Admin
File : src/assets/js/pages/admin.js
==========================================================
*/

import { getAll, COLLECTION } from "../../../services/firebase/index.js";
import {
    initAdminPage, setText, toRows, escapeHtml, formatTimestamp
} from "../shared/admin-shell.js";

initAdminPage({
    key: "dashboard",
    title: "Dashboard",
    onReady: async () => {

        setText("dashboardDate", new Date().toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        }));

        setText("totalReport", 4);
        setText("systemStatus", navigator.onLine ? "Online" : "Offline");

        await Promise.all([
            count("totalAsset", COLLECTION.ASSETS),
            count("totalRoom", COLLECTION.ROOMS),
            count("totalMaintenance", COLLECTION.MAINTENANCE),
            renderActivity()
        ]);
    }
});

async function count(id, collectionName) {
    try {
        setText(id, (await getAll(collectionName)).size);
    } catch (error) {
        console.warn("Gagal hitung", collectionName, error.message);
        setText(id, "-");
    }
}

async function renderActivity() {

    const tbody = document.getElementById("activityTable");

    try {
        const logs = toRows(await getAll(COLLECTION.LOGS))
            .sort((a, b) => toMs(b.timestamp) - toMs(a.timestamp))
            .slice(0, 10);

        tbody.innerHTML = logs.length
            ? logs.map((l) => `
                <tr>
                    <td>${escapeHtml(l.email)}</td>
                    <td>${escapeHtml(l.action)}${l.description ? " - " + escapeHtml(l.description) : ""}</td>
                    <td>${formatTimestamp(l.timestamp)}</td>
                </tr>`).join("")
            : '<tr><td colspan="3" class="page-empty">Belum ada aktivitas tercatat.</td></tr>';

    } catch (error) {
        console.error("Gagal ambil log aktivitas:", error);
        tbody.innerHTML = '<tr><td colspan="3" class="page-empty">Gagal memuat aktivitas.</td></tr>';
    }
}

function toMs(ts) {
    if (!ts) return 0;
    return ts.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
}
