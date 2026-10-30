/*
==========================================================
SARPRASIN v2.0 - Impor data barang dari Excel / CSV
File : src/assets/js/pages/admin-impor.js

Alur: pilih file -> pembersih otomatis (shared/import-clean.js)
-> tinjau & koreksi di tabel -> simpan ke Firestore.
Tidak ada yang tersimpan sebelum tombol "Impor" ditekan.
==========================================================
*/

import { create, createWithId, COLLECTION } from "../../../services/firebase/index.js";
import { initAdminPage, setText, escapeHtml } from "../shared/admin-shell.js";
import { KONDISI, SUMBER_DANA, loadRooms, loadAssets, nextKodeBarang } from "../shared/inventory-data.js";
import { cleanImport, parseCsv, revalidate, summarize, norm } from "../shared/import-clean.js";

const state = { rooms: [], assets: [], rows: [], onlyProblems: false };

initAdminPage({
    key: "impor",
    title: "Impor Data",
    onReady: async () => {
        try {
            [state.rooms, state.assets] = await Promise.all([loadRooms(), loadAssets()]);
        } catch (error) {
            console.error(error);
            setText("fileMsg", "Gagal memuat data ruangan/barang (cek Firestore Rules).");
            return;
        }
        document.getElementById("fileInput").addEventListener("change", onFile);
        document.getElementById("onlyProblems").addEventListener("change", (e) => { state.onlyProblems = e.target.checked; render(); });
        document.getElementById("dataTable").addEventListener("input", onEdit);
        document.getElementById("dataTable").addEventListener("change", onEdit);
        document.getElementById("commitBtn").addEventListener("click", commit);
        document.getElementById("reportBtn").addEventListener("click", downloadReport);
    }
});

/* ---------- baca file ---------- */

async function readSheets(file) {
    if (/\.csv$/i.test(file.name) || file.type === "text/csv") {
        return [{ name: file.name.replace(/\.csv$/i, ""), rows: parseCsv(await file.text()) }];
    }
    if (!/\.xlsx$/i.test(file.name)) throw new Error("Format harus .xlsx atau .csv (file .xls lama: simpan ulang sebagai .xlsx).");
    const { default: readXlsxFile, readSheetNames } = await import("read-excel-file");
    const names = await readSheetNames(file);
    const sheets = [];
    for (const name of names) sheets.push({ name, rows: await readXlsxFile(file, { sheet: name }) });
    return sheets;
}

async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setText("fileMsg", "Membaca dan merapikan data...");
    document.getElementById("reviewPanel").hidden = true;

    try {
        if (file.size > 8 * 1024 * 1024) throw new Error("File terlalu besar (maks. 8 MB).");
        const sheets = await readSheets(file);
        const result = cleanImport(sheets, { rooms: state.rooms, assets: state.assets });

        if (!result.rows.length) {
            throw new Error("Tidak ada baris barang yang dikenali. Pastikan ada judul kolom seperti 'Nama Barang', 'Jumlah', 'Kondisi' (lihat file contoh).");
        }
        state.rows = result.rows;
        const skipped = result.skipped.length ? ` Sheet dilewati (tanpa tabel barang): ${result.skipped.join(", ")}.` : "";
        setText("fileMsg", `${result.rows.length} baris terbaca dari ${sheets.length} sheet.${skipped}`);
        document.getElementById("reviewPanel").hidden = false;
        render();
    } catch (error) {
        console.error(error);
        setText("fileMsg", "Gagal membaca file: " + error.message);
    }
}

/* ---------- tampilan ---------- */

const LEVEL_ICON = { error: "⛔", warn: "⚠️", info: "ℹ️" };

function roomSelect(row, i) {
    const opts = state.rooms.map((r) =>
        `<option value="${escapeHtml(r.kodeRuang)}"${row.roomCode === r.kodeRuang ? " selected" : ""}>${escapeHtml(r.namaRuang)}</option>`).join("");
    const nw = `<option value="__new"${row.roomCode ? "" : " selected"}>+ Ruang baru: ${escapeHtml(row.ruanganRaw || "?")}</option>`;
    return `<select data-i="${i}" data-f="roomCode">${nw}${opts}</select>`;
}

function render() {
    const s = summarize(state.rows);
    document.getElementById("impStats").innerHTML = [
        ["📄", "Baris terbaca", s.total], ["✅", "Siap", s.ok], ["⚠️", "Perlu dicek", s.warn],
        ["⛔", "Tidak bisa diimpor", s.error], ["🏫", "Ruang baru", s.newRooms], ["☑️", "Akan diimpor", s.selected]
    ].map(([ic, l, v]) =>
        `<div class="dashboard-stat glass"><div class="stat-icon">${ic}</div><span>${l}</span><h2>${v}</h2></div>`).join("");

    const rows = state.rows.map((r, i) => ({ r, i })).filter(({ r }) => !state.onlyProblems || r.status !== "ok" || r.duplicate);

    document.getElementById("dataTable").innerHTML = rows.map(({ r, i }) => `
        <tr class="imp-${r.status}">
            <td><input type="checkbox" data-i="${i}" data-f="include"${r.include ? " checked" : ""}${r.status === "error" ? " disabled" : ""}></td>
            <td><small>${escapeHtml(r.sheet)} #${r.rowNo}</small></td>
            <td>${roomSelect(r, i)}</td>
            <td><input type="text" value="${escapeHtml(r.namaBarang)}" data-i="${i}" data-f="namaBarang"></td>
            <td>${escapeHtml(r.merk)}</td>
            <td>${escapeHtml(r.tahun ?? "")}</td>
            <td><small>${escapeHtml(r.kodeBarangResmi)}</small></td>
            <td><input type="number" min="1" step="1" value="${r.jumlah ?? ""}" data-i="${i}" data-f="jumlah" style="width:70px"></td>
            <td><select data-i="${i}" data-f="kodeKondisi">${KONDISI.map((k) =>
                `<option value="${k.value}"${r.kodeKondisi === k.value ? " selected" : ""}>${k.short}</option>`).join("")}</select></td>
            <td>${escapeHtml(r.kodeSumber)}</td>
            <td>${r.nilai ? "Rp " + Number(r.nilai).toLocaleString("id-ID") : ""}</td>
            <td class="imp-notes">${r.notes.map((n) => `<div>${LEVEL_ICON[n.level]} ${escapeHtml(n.text)}</div>`).join("")}${r.catatan ? `<div>📝 ${escapeHtml(r.catatan)}</div>` : ""}</td>
        </tr>`).join("") || '<tr><td colspan="12" class="page-empty">Tidak ada baris yang perlu dicek.</td></tr>';
}

function onEdit(e) {
    const el = e.target;
    const i = Number(el.dataset.i);
    const field = el.dataset.f;
    if (Number.isNaN(i) || !field) return;
    const row = state.rows[i];

    if (field === "include") row.include = el.checked;
    else if (field === "roomCode") row.roomCode = el.value === "__new" ? null : el.value;
    else if (field === "jumlah") row.jumlah = el.value === "" ? null : Number(el.value);
    else row[field] = el.value;

    if (field !== "include" && e.type === "change") {
        revalidate(row);
        render();
    } else if (field === "jumlah" || field === "namaBarang") {
        // pembaruan ringan saat mengetik: hanya angka ringkasan
        const s = summarize(state.rows);
        setText("commitMsg", `${s.selected} baris akan diimpor.`);
    }
    if (field === "include") render();
}

/* ---------- laporan ---------- */

function downloadReport() {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["Sheet", "Baris", "Status", "Ruangan", "Nama Barang", "Catatan hasil"].map(q).join(",")];
    state.rows.filter((r) => r.status !== "ok" || r.duplicate).forEach((r) =>
        lines.push([r.sheet, r.rowNo, r.status, r.ruanganRaw, r.namaBarang,
            r.notes.map((n) => n.text).join(" | ")].map(q).join(",")));
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "laporan-masalah-impor.csv";
    a.click();
    URL.revokeObjectURL(a.href);
}

/* ---------- simpan ---------- */

function slugRoom(name) {
    return String(name).toUpperCase().replace(/&/g, " DAN ").replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "RUANG";
}

async function commit() {
    const chosen = state.rows.filter((r) => r.include && r.status !== "error");
    const msg = document.getElementById("commitMsg");
    if (!chosen.length) { msg.textContent = "Belum ada baris yang dipilih."; return; }

    const newRoomNames = [...new Set(chosen.filter((r) => !r.roomCode).map((r) => r.ruanganRaw))];
    if (!window.confirm(`Impor ${chosen.length} baris barang` +
        (newRoomNames.length ? ` dan buat ${newRoomNames.length} ruangan baru (${newRoomNames.slice(0, 4).join(", ")}${newRoomNames.length > 4 ? ", ..." : ""})` : "") + "?")) return;

    const btn = document.getElementById("commitBtn");
    btn.disabled = true;
    const now = new Date().toISOString();
    let done = 0;

    try {
        /* 1. ruangan baru (satu per nama) */
        const created = new Map();
        const usedCodes = new Set(state.rooms.map((r) => r.kodeRuang));
        for (const name of newRoomNames) {
            let code = slugRoom(name);
            let n = 2;
            while (usedCodes.has(code)) code = `${slugRoom(name)}-${n++}`;
            usedCodes.add(code);
            msg.textContent = `Membuat ruangan ${name}...`;
            await createWithId(COLLECTION.ROOMS, code, {
                kodeRuang: code, namaRuang: name, jenis: /kelas/i.test(name) ? "KELAS" : /lab/i.test(name) ? "LAB" : "LAINNYA",
                sumber: "impor", createdAt: now, updatedAt: now
            });
            created.set(norm(name), code);
        }

        /* 2. barang */
        const all = [...state.assets];
        for (const r of chosen) {
            const kodeRuang = r.roomCode || created.get(norm(r.ruanganRaw));
            const doc = {
                namaBarang: r.namaBarang.trim(),
                merk: r.merk || "",
                kodeBarang: nextKodeBarang(all, kodeRuang),
                kodeBarangResmi: r.kodeBarangResmi || "",
                kodeRuang,
                jumlah: Number(r.jumlah),
                kodeKondisi: r.kodeKondisi,
                keterangan: r.catatan || "",
                fotoUrl: "",
                nilai: r.nilai || 0,
                sumber: "impor",
                perluVerifikasi: r.status === "warn",
                createdAt: now,
                updatedAt: now
            };
            if (r.tahun) doc.tahun = r.tahun;
            if (r.kodeSumber) doc.kodeSumber = r.kodeSumber;

            await create(COLLECTION.ASSETS, doc);
            all.push(doc);
            done++;
            if (done % 10 === 0) msg.textContent = `Menyimpan barang ${done}/${chosen.length}...`;
        }

        msg.textContent = `Selesai: ${done} barang diimpor${newRoomNames.length ? `, ${newRoomNames.length} ruangan baru dibuat` : ""}. ` +
            "Barang bertanda ⚠️ memakai status 'perlu verifikasi' dan terlihat di portal eksekutif.";
        state.rows = state.rows.filter((r) => !chosen.includes(r));
        [state.rooms, state.assets] = await Promise.all([loadRooms(), loadAssets()]);
        render();
    } catch (error) {
        console.error(error);
        msg.textContent = `Berhenti di tengah jalan: ${error.message}. ${done} barang sudah tersimpan; jangan unggah ulang tanpa memeriksa (baris serupa akan ditandai duplikat).`;
    } finally {
        btn.disabled = false;
    }
}
