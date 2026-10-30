/*
==========================================================
SARPRASIN v2.0 - Portal Eksekutif (khusus Waka Sarpras)
File : src/assets/js/pages/executive.js

KPI detail + persentase kondisi terkini. Ringkasan singkat untuk
beranda publik disimpan di publicSummary/latest (angka agregat saja).
==========================================================
*/

import { createWithId, getAll, COLLECTION } from "../../../services/firebase/index.js";
import { initPortalPage, setText, toRows, escapeHtml } from "../shared/admin-shell.js";
import {
    KONDISI, SUMBER_DANA, labelOf, normalizeKondisi, rupiah,
    loadRooms, loadAssets, loadBuildings, loadProcurements
} from "../shared/inventory-data.js";

let summary = null;

const KEY = { BAIK: "B", RUSAK_RINGAN: "RR", RUSAK_BERAT: "RB" };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const bucket = () => ({ total: 0, B: 0, RR: 0, RB: 0, nilai: 0 });

function add(b, a) {
    const qty = Number(a.jumlah) || 1;
    b.total += qty;
    b[KEY[normalizeKondisi(a.kodeKondisi || a.kondisi)]] += qty;
    b.nilai += (Number(a.nilai) || 0) * qty;
}

const pctCell = (b) => {
    const p = pct(b.B, b.total);
    const cls = !b.total ? "" : p >= 80 ? "ok" : p >= 60 ? "warn" : "bad";
    return `<span class="pct ${cls}">${b.total ? p + "%" : "-"}</span>`;
};

function fill(id, rows, cols, empty = "Belum ada data.") {
    document.getElementById(id).innerHTML = rows.length
        ? rows.map((r) => `<tr>${cols.map((c) => `<td>${c(r)}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="${cols.length}" class="page-empty">${empty}</td></tr>`;
}

initPortalPage({
    portal: "executive",
    key: "dashboard",
    title: "Ringkasan Eksekutif",
    onReady: async () => {

        setText("asOf", new Date().toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        }));

        let rooms, assets, buildings, procs, maint;
        try {
            [rooms, assets, buildings, procs, maint] = await Promise.all([
                loadRooms(), loadAssets(), loadBuildings(), loadProcurements(),
                getAll(COLLECTION.MAINTENANCE).then(toRows)
            ]);
        } catch (error) {
            console.error(error);
            document.getElementById("roomTable").innerHTML =
                '<tr><td colspan="7" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
            return;
        }

        const all = bucket();
        const perRoom = new Map(rooms.map((r) => [r.kodeRuang, { room: r, ...bucket() }]));
        const perFund = new Map();
        const perYear = new Map();
        const roomToBuilding = new Map(rooms.map((r) => [r.kodeRuang, r.kodeBangunan]));
        const perBuilding = new Map(buildings.map((b) => [b.kodeBangunan, { b, ...bucket() }]));
        let unverified = 0;
        const prio = [];

        assets.forEach((a) => {
            add(all, a);
            const room = perRoom.get(a.kodeRuang);
            if (room) add(room, a);
            const bd = perBuilding.get(roomToBuilding.get(a.kodeRuang));
            if (bd) add(bd, a);

            const f = a.kodeSumber || "LAINNYA";
            if (!perFund.has(f)) perFund.set(f, bucket());
            add(perFund.get(f), a);

            const y = a.tahun || "-";
            if (!perYear.has(y)) perYear.set(y, bucket());
            add(perYear.get(y), a);

            if (a.perluVerifikasi) unverified += 1;
            if (normalizeKondisi(a.kodeKondisi || a.kondisi) !== "BAIK") prio.push(a);
        });

        const thisYear = String(new Date().getFullYear());
        const buyYear = procs.filter((p) => String(p.tanggal || "").startsWith(thisYear));
        const buyValue = buyYear.reduce((s, p) => s + (Number(p.jumlah) || 0) * (Number(p.hargaSatuan) || 0), 0);
        const openReports = maint.filter((m) => !m.status || m.status === "BARU").length;

        /* ---- KPI ---- */
        setText("kpiBarang", all.total.toLocaleString("id-ID"));
        setText("kpiBangunan", buildings.length);
        setText("kpiRuang", rooms.length);
        setText("kpiNilai", rupiah(all.nilai));
        setText("kpiBaik", pct(all.B, all.total) + "%");
        setText("kpiRR", pct(all.RR, all.total) + "%");
        setText("kpiRB", pct(all.RB, all.total) + "%");
        setText("kpiBaikN", `${all.B.toLocaleString("id-ID")} unit`);
        setText("kpiRRN", `${all.RR.toLocaleString("id-ID")} unit`);
        setText("kpiRBN", `${all.RB.toLocaleString("id-ID")} unit`);
        setText("kpiBeli", rupiah(buyValue));
        setText("kpiBeliN", `${buyYear.length} pembelian (${thisYear})`);
        setText("kpiLapor", openReports);
        setText("kpiVerif", unverified);

        document.getElementById("condBar").innerHTML = all.total
            ? [["B", "ok", "Baik"], ["RR", "warn", "Perlu Perbaikan"], ["RB", "bad", "Rusak Berat"]]
                .map(([k, c, label]) => all[k]
                    ? `<div class="seg ${c}" style="width:${(all[k] / all.total) * 100}%" title="${label}: ${all[k]}">${pct(all[k], all.total)}% ${label}</div>`
                    : "").join("")
            : '<div class="page-empty">Belum ada data barang.</div>';

        /* ---- tabel ---- */
        fill("roomTable", [...perRoom.values()].sort((a, b) =>
            a.room.namaRuang.localeCompare(b.room.namaRuang, "id", { numeric: true })), [
            (r) => escapeHtml(r.room.namaRuang),
            (r) => escapeHtml(r.room.penanggungJawab || "-"),
            (r) => r.total, (r) => r.B, (r) => r.RR, (r) => r.RB, pctCell
        ], "Belum ada ruangan.");

        fill("buildingTable", [...perBuilding.values()], [
            (r) => escapeHtml(r.b.namaBangunan),
            (r) => escapeHtml(r.b.kodeKondisi ? labelOf(KONDISI, normalizeKondisi(r.b.kodeKondisi)) : "-"),
            (r) => rooms.filter((x) => x.kodeBangunan === r.b.kodeBangunan).length,
            (r) => r.total, pctCell
        ], "Belum ada data bangunan.");

        fill("fundTable", [...perFund.entries()].sort((a, b) => b[1].nilai - a[1].nilai), [
            ([k]) => escapeHtml(labelOf(SUMBER_DANA, k)),
            ([, v]) => v.total, ([, v]) => rupiah(v.nilai), ([, v]) => pctCell(v)
        ]);

        fill("yearTable", [...perYear.entries()].sort((a, b) => String(b[0]).localeCompare(String(a[0]))), [
            ([k]) => escapeHtml(k), ([, v]) => v.total, ([, v]) => rupiah(v.nilai), ([, v]) => pctCell(v)
        ]);

        const roomName = (k) => perRoom.get(k)?.room.namaRuang || k || "-";
        prio.sort((a, b) => (normalizeKondisi(a.kodeKondisi) === "RUSAK_BERAT" ? 0 : 1) -
                            (normalizeKondisi(b.kodeKondisi) === "RUSAK_BERAT" ? 0 : 1));
        setText("prioCount", `${prio.length} jenis barang`);
        fill("prioTable", prio.slice(0, 50), [
            (a) => escapeHtml(a.namaBarang), (a) => escapeHtml(roomName(a.kodeRuang)),
            (a) => escapeHtml(a.jumlah ?? 1),
            (a) => escapeHtml(labelOf(KONDISI, normalizeKondisi(a.kodeKondisi || a.kondisi))),
            (a) => escapeHtml(a.tahun || "-")
        ], "Semua barang dalam kondisi baik.");

        /* ---- ringkasan publik (KPI ringkas, angka agregat saja) ---- */
        summary = {
            totalBarang: all.total,
            totalRuang: rooms.length,
            totalBangunan: buildings.length,
            baik: all.B,
            rusakRingan: all.RR,
            rusakBerat: all.RB,
            persenBaik: pct(all.B, all.total),
            updatedAt: new Date().toISOString()
        };

        document.getElementById("publishBtn").addEventListener("click", publish);
        publish(true);   // otomatis menyegarkan beranda publik saat Waka membuka portal
    }
});

async function publish(auto = false) {
    const msg = document.getElementById("publishMsg");
    if (!summary) return;
    try {
        await createWithId("publicSummary", "latest", { ...summary, updatedAt: new Date().toISOString() });
        msg.textContent = (auto === true ? "Beranda publik otomatis disegarkan: " : "Ringkasan publik diperbarui: ")
            + new Date().toLocaleString("id-ID");
    } catch (error) {
        console.error(error);
        msg.textContent = "Gagal memperbarui ringkasan publik: " + error.message;
    }
}
