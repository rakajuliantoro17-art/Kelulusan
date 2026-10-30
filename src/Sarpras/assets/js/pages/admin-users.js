/*
==========================================================
SARPRASIN v2.0 - Manajemen Akun (khusus admin)
File : src/assets/js/pages/admin-users.js

Admin membuat akun login + profil (role, ruangan), mengubah
role/status, mengirim email atur-ulang password, dan mengimpor
banyak akun dari spreadsheet.

Dua mode (VITE_USE_FUNCTIONS):
 - default (kosong)  : GRATIS, paket Spark. Akun dibuat lewat instance
                       Firebase kedua di browser. Tidak bisa mengganti
                       password orang lain / menghapus akun login.
 - "true"            : lewat Cloud Functions (paket Blaze), fitur penuh.

Tombol "Daftarkan UID yang sudah ada" tetap tersedia untuk akun
yang dulu dibuat manual di Firebase Console.
==========================================================
*/

import {
    createWithId, update, remove, getAll, callFunction, resetPassword, createAuthAccount, COLLECTION
} from "../../../services/firebase/index.js";
import {
    initAdminPage, setText, toRows, renderTable, escapeHtml
} from "../shared/admin-shell.js";
import { openFormModal, confirmDialog } from "../shared/form-modal.js";
import { loadRooms } from "../shared/inventory-data.js";
import { ROLE_LABEL, roleLabel } from "../../../config/portals.js";
import { parseAccounts, randomPassword } from "../shared/account-import.js";
import { callSheet, sheetsEnabled } from "../../../services/sheets/sheets.service.js";

const USE_FUNCTIONS = import.meta.env.VITE_USE_FUNCTIONS === "true";

const state = { users: [], rooms: [], q: "", roleFilter: "", me: null };

// Role yang memakai penugasan ruangan (sama dengan firestore.rules)
const ROOM_ROLES = ["operator", "guru", "wali_kelas", "viewer"];

const ROLE_OPTIONS = Object.keys(ROLE_LABEL).map((r) => ({ value: r, label: ROLE_LABEL[r] }));

initAdminPage({
    key: "users",
    title: "User Management",
    onReady: async ({ uid }) => {
        state.me = uid;
        await refresh();

        fillRoleFilter();

        document.getElementById("searchInput").addEventListener("input", (e) => {
            state.q = e.target.value.trim().toLowerCase();
            render();
        });
        document.getElementById("roleFilter").addEventListener("change", (e) => {
            state.roleFilter = e.target.value;
            render();
        });
        document.getElementById("addBtn").addEventListener("click", () => openCreateForm());
        document.getElementById("linkBtn").addEventListener("click", () => openLinkForm());
        document.getElementById("importBtn").addEventListener("click", () => openImportModal());
        document.getElementById("exportBtn").addEventListener("click", exportUsers);
        document.getElementById("sheetPushBtn").addEventListener("click", pushToSheet);
        document.getElementById("sheetPullBtn").addEventListener("click", pullFromSheet);

        document.getElementById("dataTable").addEventListener("click", onTableClick);
    }
});

/* ======================================================
   DATA
====================================================== */

async function refresh() {
    try {
        [state.users, state.rooms] = await Promise.all([
            getAll(COLLECTION.USERS).then(toRows),
            loadRooms()
        ]);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        document.getElementById("dataTable").innerHTML =
            '<tr><td colspan="6" class="page-empty">Gagal memuat data (cek Firestore Rules).</td></tr>';
        return;
    }
    render();
}

function fillRoleFilter() {
    const select = document.getElementById("roleFilter");
    select.innerHTML = '<option value="">Semua role</option>' +
        ROLE_OPTIONS.map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join("");
}

function roomNames(codes = []) {
    return codes
        .map((k) => state.rooms.find((r) => r.kodeRuang === k)?.namaRuang || k)
        .join(", ") || "-";
}

/* ======================================================
   TABEL
====================================================== */

function render() {

    const rows = state.users
        .filter((u) => !state.roleFilter || u.role === state.roleFilter)
        .filter((u) => !state.q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(state.q))
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "id"));

    renderTable("dataTable", rows, [
        { render: (u) => escapeHtml(u.name) + (u.id === state.me ? ' <small class="hint">(Anda)</small>' : "") },
        { render: (u) => escapeHtml(u.email) },
        { render: (u) => escapeHtml(roleLabel(u.role)) },
        { render: (u) => ROOM_ROLES.includes(u.role) ? escapeHtml(roomNames(u.ruangan)) : "-" },
        { render: statusChip },
        { render: actionButtons }
    ]);

    setText("rowCount", `${rows.length} dari ${state.users.length} user`);
}

function statusChip(u) {
    const off = u.status === "nonaktif";
    return `<span class="chip ${off ? "chip-off" : "chip-on"}">${off ? "Nonaktif" : "Aktif"}</span>`;
}

function actionButtons(u) {
    const id = escapeHtml(u.id);
    const self = u.id === state.me;
    return [
        `<button type="button" class="btn-mini" data-act="edit" data-id="${id}">Edit</button>`,
        USE_FUNCTIONS ? `<button type="button" class="btn-mini" data-act="password" data-id="${id}">Password</button>` : "",
        `<button type="button" class="btn-mini" data-act="reset" data-id="${id}" title="Kirim email atur ulang password">Email reset</button>`,
        self ? "" : `<button type="button" class="btn-mini danger" data-act="delete" data-id="${id}">Hapus</button>`
    ].join("");
}

async function onTableClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const row = state.users.find((u) => u.id === btn.dataset.id);
    if (!row) return;

    btn.disabled = true;
    try {
        switch (btn.dataset.act) {
            case "edit": openEditForm(row); break;
            case "password": openPasswordForm(row); break;
            case "reset": await sendResetEmail(row); break;
            case "delete": await deleteAccount(row); break;
        }
    } catch (error) {
        console.error(error);
        window.alert(error?.message || "Aksi gagal.");
    } finally {
        btn.disabled = false;
    }
}

/* ======================================================
   BUAT AKUN BARU
====================================================== */

/** Buat akun login + profil. Mengembalikan { uid, email }. */
async function createAccount({ name, email, role, password, ruangan }) {

    const rooms = ROOM_ROLES.includes(role) ? (ruangan || []) : [];

    if (USE_FUNCTIONS) {
        const created = await callFunction("createUserAccount", { name, email, role, password, ruangan: rooms });
        return { uid: created.uid, email: created.email || email };
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const uid = await createAuthAccount(cleanEmail, password);
    const stamp = new Date().toISOString();

    try {
        await createWithId(COLLECTION.USERS, uid, {
            name, email: cleanEmail, role, status: "aktif", ruangan: rooms,
            createdAt: stamp, updatedAt: stamp
        });
    } catch (error) {
        throw new Error(
            `Akun login dibuat (UID ${uid}) tapi profil gagal disimpan: ${error?.message || error}. ` +
            "Daftarkan manual lewat tombol 'Daftarkan UID yang sudah ada'."
        );
    }
    return { uid, email: cleanEmail };
}

function roomField() {
    return {
        name: "ruangan",
        label: "Ruangan yang ditugaskan (hanya berlaku untuk Operator, Guru, Wali Kelas, Viewer)",
        type: "checks", full: true,
        options: state.rooms.map((r) => ({ value: r.kodeRuang, label: r.namaRuang }))
    };
}

function openCreateForm() {

    openFormModal({
        title: "Buat Akun Baru",
        submitText: "Buat Akun",
        values: { password: randomPassword() },
        fields: [
            { name: "name", label: "Nama lengkap (sama dengan Penanggung Jawab ruangan)", required: true, full: true },
            { name: "email", label: "Email (dipakai untuk login)", type: "email", required: true },
            { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
            { name: "password", label: "Password awal (min. 8 karakter, sudah diisi acak - boleh diganti)", required: true, full: true },
            roomField()
        ],
        onSubmit: async (data) => {

            if (data.password.length < 8) throw new Error("Password minimal 8 karakter.");

            const created = await createAccount(data);

            await refresh();
            showCredentials({ title: "Akun berhasil dibuat", email: created.email, password: data.password });
        }
    });
}

/* ======================================================
   UBAH ROLE / STATUS / RUANGAN
====================================================== */

function openEditForm(row) {

    openFormModal({
        title: `Edit User - ${row.name || row.email}`,
        values: { ...row, status: row.status || "aktif" },
        fields: [
            { name: "name", label: "Nama", required: true, full: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
            { name: "status", label: "Status", type: "select", required: true,
              options: [{ value: "aktif", label: "Aktif" }, { value: "nonaktif", label: "Nonaktif (tidak bisa masuk)" }] },
            roomField()
        ],
        onSubmit: async (data) => {

            if (row.id === state.me && (data.role !== "admin" || data.status !== "aktif")) {
                throw new Error("Akun Anda sendiri harus tetap Admin dan Aktif.");
            }

            const ruangan = ROOM_ROLES.includes(data.role) ? (data.ruangan || []) : [];
            let fallback = false;

            try {
                if (!USE_FUNCTIONS) throw Object.assign(new Error("mode gratis"), { notDeployed: true, silent: true });
                await callFunction("updateUserAccount", {
                    uid: row.id, name: data.name, email: data.email,
                    role: data.role, status: data.status, ruangan
                });
            } catch (error) {
                if (!error.notDeployed) throw error;

                // Cloud Function belum aktif: tetap ubah profil di database
                // supaya halaman ini tidak mati total. Akun login (Auth) tidak ikut berubah.
                await update(COLLECTION.USERS, row.id, {
                    name: data.name, email: data.email, role: data.role,
                    status: data.status, ruangan, updatedAt: new Date().toISOString()
                });
                fallback = !USE_FUNCTIONS ? false : true;
            }

            await refresh();

            if (fallback) {
                window.alert(
                    "Cloud Function belum aktif, jadi hanya profil di database yang diubah " +
                    "(role, status, ruangan). Perubahan email/nonaktif pada akun login baru berlaku setelah Function di-deploy."
                );
            }
        }
    });
}

/* ======================================================
   PASSWORD
====================================================== */

function openPasswordForm(row) {

    openFormModal({
        title: `Ganti Password - ${row.name || row.email}`,
        submitText: "Ganti Password",
        values: { password: randomPassword() },
        fields: [
            { name: "password", label: "Password baru (min. 8 karakter, sudah diisi acak - boleh diganti)", required: true, full: true }
        ],
        onSubmit: async (data) => {

            if (data.password.length < 8) throw new Error("Password minimal 8 karakter.");

            await callFunction("setUserPassword", { uid: row.id, password: data.password });

            showCredentials({ title: "Password berhasil diganti", email: row.email, password: data.password });
        }
    });
}

async function sendResetEmail(row) {
    if (!confirmDialog(`Kirim email atur ulang password ke ${row.email}?`)) return;

    try {
        await resetPassword(row.email);
    } catch (error) {
        throw new Error(
            error?.code === "auth/user-not-found"
                ? "Akun login untuk email ini tidak ditemukan di Firebase Authentication."
                : "Gagal mengirim email atur ulang password."
        );
    }
    window.alert(`Email atur ulang password dikirim ke ${row.email}. Minta yang bersangkutan memeriksa kotak masuk dan folder spam.`);
}

/* ======================================================
   HAPUS
====================================================== */

async function deleteAccount(row) {
    if (!confirmDialog(
        `Hapus akun "${row.name || row.email}" (${row.email}) secara permanen?\n\n` +
        (USE_FUNCTIONS
            ? "Akun login dan profilnya akan dihapus dan tidak bisa dikembalikan."
            : "Profilnya dihapus sehingga tidak bisa masuk lagi (akun login di Firebase Authentication tidak ikut terhapus). Alternatif: set status Nonaktif lewat Edit.")
    )) return;

    if (USE_FUNCTIONS) {
        await callFunction("deleteUserAccount", { uid: row.id });
    } else {
        await remove(COLLECTION.USERS, row.id);
        window.alert(
            "Profil dihapus, jadi akun ini tidak bisa lagi masuk ke SARPRASIN. " +
            "Akun login-nya masih ada di Firebase Authentication (hapus manual di Firebase Console bila perlu)."
        );
    }
    await refresh();
}

/* ======================================================
   DAFTARKAN UID YANG SUDAH ADA (akun dari Firebase Console)
====================================================== */

function openLinkForm() {

    openFormModal({
        title: "Daftarkan UID yang sudah ada",
        values: { status: "aktif" },
        fields: [
            { name: "uid", label: "UID (dari Firebase Authentication)", required: true, full: true,
              placeholder: "tempel UID akun yang sudah dibuat di Firebase Console" },
            { name: "name", label: "Nama", required: true, full: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
            { name: "status", label: "Status", type: "select", required: true,
              options: [{ value: "aktif", label: "Aktif" }, { value: "nonaktif", label: "Nonaktif (tidak bisa masuk)" }] },
            roomField()
        ],
        onSubmit: async (data) => {

            const id = data.uid.trim();
            if (!id || id.includes("/")) throw new Error("UID tidak valid.");
            if (state.users.some((u) => u.id === id)) throw new Error("UID ini sudah terdaftar.");

            const stamp = new Date().toISOString();
            await createWithId(COLLECTION.USERS, id, {
                name: data.name,
                email: data.email,
                role: data.role,
                status: data.status,
                ruangan: ROOM_ROLES.includes(data.role) ? (data.ruangan || []) : [],
                createdAt: stamp,
                updatedAt: stamp
            });

            await refresh();
        }
    });
}

/* ======================================================
   KARTU KREDENSIAL (ditampilkan sekali)
====================================================== */

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function showCredentials({ title, email, password }) {

    const loginUrl = `${location.origin}/login`;

    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop";
    overlay.innerHTML = `
        <div class="modal-box glass cred-box" role="dialog" aria-modal="true">
            <div class="modal-head">
                <h3>${escapeHtml(title)}</h3>
                <button type="button" class="modal-close" aria-label="Tutup">✕</button>
            </div>
            <p class="hint">Catat atau salin sekarang. Password ini tidak akan ditampilkan lagi.
               Sampaikan langsung kepada yang bersangkutan dan sarankan menggantinya.</p>
            <dl class="cred-list">
                <dt>Alamat login</dt><dd>${escapeHtml(loginUrl)}</dd>
                <dt>Email</dt><dd>${escapeHtml(email)}</dd>
                <dt>Password</dt><dd><code>${escapeHtml(password)}</code></dd>
            </dl>
            <p class="form-error" hidden></p>
            <div class="modal-actions">
                <button type="button" class="btn-ghost" data-copy>Salin</button>
                <button type="button" class="btn-primary" data-close>Selesai</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.querySelector("[data-close]").addEventListener("click", close);

    const copyBtn = overlay.querySelector("[data-copy]");
    copyBtn.addEventListener("click", async () => {
        const ok = await copyText(`Login SARPRASIN\nAlamat: ${loginUrl}\nEmail: ${email}\nPassword: ${password}`);
        copyBtn.textContent = ok ? "Tersalin ✓" : "Salin manual";
    });
}


/* ======================================================
   SPREADSHEET: ekspor daftar akun & impor massal
====================================================== */

function csvCell(v) {
    const t = String(v ?? "");
    return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

function downloadCsv(filename, header, rows) {
    const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function exportUsers() {
    downloadCsv(
        "daftar-akun-sarprasin.csv",
        ["Nama", "Email", "Role", "Ruangan", "Status"],
        state.users.map((u) => [
            u.name, u.email, roleLabel(u.role),
            ROOM_ROLES.includes(u.role) ? (u.ruangan || []).map((k) => state.rooms.find((r) => r.kodeRuang === k)?.namaRuang || k).join("; ") : "",
            u.status === "nonaktif" ? "Nonaktif" : "Aktif"
        ])
    );
}

function sheetGuard() {
    if (sheetsEnabled()) return true;
    window.alert("Sinkron Spreadsheet belum diaktifkan. Isi VITE_SHEETS_URL di Vercel (lihat docs/sinkron-spreadsheet.md), lalu redeploy.");
    return false;
}

async function pushToSheet(e) {
    if (!sheetGuard()) return;
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
        const rows = [["Nama", "Email", "Role", "Ruangan", "Status"],
            ...state.users.map((u) => [
                u.name, u.email, roleLabel(u.role),
                ROOM_ROLES.includes(u.role) ? (u.ruangan || []).map((k) => state.rooms.find((r) => r.kodeRuang === k)?.namaRuang || k).join("; ") : "",
                u.status === "nonaktif" ? "Nonaktif" : "Aktif"
            ])];
        const res = await callSheet("export", { rows });
        window.alert(`${res.baris} akun ditulis ke sheet "Daftar Akun".`);
    } catch (error) {
        window.alert(error.message);
    } finally {
        btn.disabled = false;
    }
}

async function pullFromSheet(e) {
    if (!sheetGuard()) return;
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
        const res = await callSheet("pull");
        openImportModal({ rows: res.rows, fromSheet: true });
    } catch (error) {
        window.alert(error.message);
    } finally {
        btn.disabled = false;
    }
}

async function readRows(file) {
    if (file.size > 2 * 1024 * 1024) throw new Error("File terlalu besar (maks. 2 MB).");
    if (/\.csv$/i.test(file.name)) {
        const { parseCsv } = await import("../shared/import-clean.js");
        return parseCsv(await file.text());
    }
    if (!/\.xlsx$/i.test(file.name)) throw new Error("Format harus .xlsx atau .csv.");
    const { default: readXlsxFile } = await import("read-excel-file");
    return readXlsxFile(file);
}

function openImportModal(opts = {}) {

    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop";
    overlay.innerHTML = `
        <div class="modal-box glass" role="dialog" aria-modal="true" style="max-width:920px;width:96%;">
            <div class="modal-head">
                <h3>Impor Akun dari Spreadsheet</h3>
                <button type="button" class="modal-close" aria-label="Tutup">✕</button>
            </div>
            <p class="hint">Kolom: <b>Nama, Email, Role, Password</b> (boleh kosong = dibuat acak), <b>Ruangan</b> (boleh banyak, pisahkan dengan titik koma).
               <a href="/contoh/contoh-akun.xlsx" download>Unduh file contoh</a>.
               Hasil impor (termasuk password) bisa diunduh sekali setelah selesai; simpan di tempat aman dan bagikan langsung ke masing-masing orang.</p>
            <input type="file" accept=".xlsx,.csv" data-file>
            <p class="hint" data-msg></p>
            <div class="table-wrap" style="max-height:340px;overflow:auto;" data-preview hidden>
                <table class="table dashboard-table">
                    <thead><tr><th>#</th><th>Nama</th><th>Email</th><th>Role</th><th>Ruangan</th><th>Status</th></tr></thead>
                    <tbody data-body></tbody>
                </table>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-ghost" data-dl hidden>⬇ Unduh hasil (CSV)</button>
                <button type="button" class="btn-primary" data-go hidden>Buat akun</button>
                <button type="button" class="btn-ghost" data-close>Tutup</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const q = (sel) => overlay.querySelector(sel);
    const close = () => overlay.remove();
    q(".modal-close").addEventListener("click", close);
    q("[data-close]").addEventListener("click", close);

    let parsed = [];
    let results = [];

    const roomLabel = (codes) => codes.map((k) => state.rooms.find((r) => r.kodeRuang === k)?.namaRuang || k).join("; ") || "-";

    function paint() {
        q("[data-body]").innerHTML = parsed.map((r, i) => {
            const res = results[i];
            const cls = res ? (res.ok ? "chip-on" : "chip-off") : (r.status === "error" ? "chip-off" : "chip-on");
            const text = res ? (res.ok ? "Dibuat ✓" : res.error)
                : [...r.problems, ...r.warns].join("; ") || "Siap";
            return `<tr><td>${i + 1}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.email)}</td>
                <td>${escapeHtml(roleLabel(r.role))}</td><td>${escapeHtml(roomLabel(r.ruangan))}</td>
                <td><span class="chip ${cls}">${escapeHtml(text)}</span></td></tr>`;
        }).join("");
    }

    async function ingest(getRows) {
        results = [];
        try {
            const rows = await getRows();
            parsed = parseAccounts(rows, {
                rooms: state.rooms,
                existingEmails: new Set(state.users.map((u) => String(u.email || "").toLowerCase()))
            });
            if (!parsed.length) throw new Error("Tidak ada baris akun.");
            if (parsed.length > 100) throw new Error("Maksimal 100 akun per impor.");
            const ok = parsed.filter((r) => r.status !== "error").length;
            q("[data-msg]").textContent = `${parsed.length} baris: ${ok} siap dibuat, ${parsed.length - ok} bermasalah (dilewati).`;
            q("[data-preview]").hidden = false;
            q("[data-go]").hidden = ok === 0;
            q("[data-go]").textContent = `Buat ${ok} akun`;
            paint();
        } catch (error) {
            parsed = [];
            q("[data-preview]").hidden = true;
            q("[data-go]").hidden = true;
            q("[data-msg]").textContent = error.message;
        }
    }

    q("[data-file]").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) ingest(() => readRows(file));
    });

    if (opts.rows) {
        q("[data-file]").hidden = true;
        ingest(async () => opts.rows);
    }

    q("[data-go]").addEventListener("click", async () => {
        const goBtn = q("[data-go]");
        goBtn.disabled = true;
        q("[data-file]").disabled = true;
        results = [];

        for (let i = 0; i < parsed.length; i++) {
            const r = parsed[i];
            if (r.status === "error") { results[i] = { ok: false, error: r.problems.join("; ") }; continue; }
            q("[data-msg]").textContent = `Membuat akun ${i + 1} dari ${parsed.length}...`;
            try {
                await createAccount(r);
                results[i] = { ok: true };
            } catch (error) {
                results[i] = { ok: false, error: error.message };
            }
            paint();
            await new Promise((res) => setTimeout(res, 350));
        }

        const made = results.filter((x) => x?.ok).length;
        q("[data-msg]").textContent = `Selesai: ${made} akun dibuat, ${parsed.length - made} gagal/dilewati. Unduh hasilnya sekarang, password tidak ditampilkan lagi.`;
        goBtn.hidden = true;
        q("[data-dl]").hidden = false;
        await refresh();

        if (opts.fromSheet) {
            try {
                await callSheet("done", {
                    items: parsed.map((r, i) => ({
                        name: r.name, email: r.email, role: roleLabel(r.role),
                        ruangan: roomLabel(r.ruangan),
                        ok: Boolean(results[i]?.ok), error: results[i]?.error || ""
                    }))
                });
                q("[data-msg]").textContent += " Baris yang berhasil sudah dihapus dari sheet 'Akun' dan dicatat di 'Riwayat Impor'.";
            } catch (error) {
                q("[data-msg]").textContent += ` (Gagal memperbarui sheet: ${error.message})`;
            }
        }
    });

    q("[data-dl]").addEventListener("click", () => {
        downloadCsv(
            "hasil-impor-akun.csv",
            ["Nama", "Email", "Role", "Password", "Ruangan", "Hasil"],
            parsed.map((r, i) => [
                r.name, r.email, roleLabel(r.role),
                results[i]?.ok ? r.password : "",
                roomLabel(r.ruangan),
                results[i]?.ok ? "Dibuat" : (results[i]?.error || "Dilewati")
            ])
        );
    });
}
