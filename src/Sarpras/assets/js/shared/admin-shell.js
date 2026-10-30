/*
==========================================================
SARPRASIN v2.0
ADMIN SHELL (sidebar + topbar + guard login)
File : src/assets/js/shared/admin-shell.js

Dipakai SEMUA halaman admin. Tugasnya:
1. Cek login Firebase + role (guard) -> kalau gagal ke /login
2. Cek role boleh buka halaman ini (menurut MENU di bawah)
3. Membangun sidebar + topbar, toggle desktop & mobile, tema
4. Memanggil onReady(ctx) setelah semua siap
==========================================================
*/

import {
    authListener,
    getById,
    getAll,
    COLLECTION
} from "../../../services/firebase/index.js";

import { logout } from "../../../services/auth/auth.service.js";
import { PORTALS, defaultPath, roleLabel } from "../../../config/portals.js";

const ALL_ADMIN = ["admin", "waka_sarpras", "staff", "arsiparis"];

export const MENU = [
    { section: "Menu" },
    { key: "dashboard",   icon: "📊", text: "Dashboard",       href: "/admin",             roles: ALL_ADMIN },
    { key: "asset",       icon: "📦", text: "Asset",           href: "/admin/asset",       roles: ALL_ADMIN },
    { key: "ruangan",     icon: "🏫", text: "Ruangan",         href: "/admin/ruangan",     roles: ALL_ADMIN },
    { key: "bangunan",    icon: "🏢", text: "Bangunan",        href: "/admin/bangunan",    roles: ["admin", "staff", "arsiparis"] },
    { key: "pengadaan",   icon: "🛒", text: "Pengadaan",       href: "/admin/pengadaan",   roles: ["admin", "staff", "arsiparis"] },
    { key: "impor",       icon: "📥", text: "Impor Data",      href: "/admin/impor",       roles: ["admin", "staff", "arsiparis"] },
    { key: "maintenance", icon: "🔧", text: "Maintenance",     href: "/admin/maintenance", roles: ["admin", "waka_sarpras", "staff"], badge: true },
    { key: "laporan",     icon: "📄", text: "Laporan",         href: "/admin/laporan",     roles: ["admin", "waka_sarpras", "arsiparis"] },
    { key: "exec",        icon: "📈", text: "Portal Eksekutif", href: "/eksekutif",        roles: ["waka_sarpras"] },
    { key: "kir",         icon: "🖨️", text: "KIR",             href: "/admin/kir",         roles: ALL_ADMIN, hidden: true },
    { section: "Sistem" },
    { key: "users",       icon: "👥", text: "User Management", href: "/admin/users",       roles: ["admin"] },
    { key: "settings",    icon: "⚙️", text: "Settings",        href: "/admin/settings",    roles: ["admin"] }
];

export const EXEC_MENU = [
    { section: "Eksekutif" },
    { key: "dashboard", icon: "📈", text: "Ringkasan",          href: "/eksekutif" },
    { key: "kir",       icon: "🖨️", text: "Cetak KIR",          href: "/admin/kir" },
    { section: "Portal Lain" },
    { key: "admin",     icon: "🛠️", text: "Portal Admin",       href: "/admin" }
];

export const USER_MENU = [
    { section: "Menu" },
    { key: "dashboard", icon: "🏫", text: "Inventaris Ruangan", href: "/user" }
];

const MENUS = { admin: MENU, executive: EXEC_MENU, user: USER_MENU };

const THEME_KEY = "sarprasin_theme";
const COLLAPSE_KEY = "sarprasin_sidebar_collapsed";
const MOBILE_QUERY = "(max-width: 1024px)";

/* ---------- util ---------- */

export function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

export function escapeHtml(value) {
    return String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Snapshot Firestore (atau array) -> array objek biasa */
export function toRows(result) {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    return result.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function formatTimestamp(timestamp) {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("id-ID");
}

/** Render tabel generik: columns = [{label, render(row)}] */
export function renderTable(tbodyId, rows, columns) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML =
            `<tr><td colspan="${columns.length}" class="page-empty">Belum ada data.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows
        .map((row) =>
            `<tr>${columns.map((c) => `<td>${c.render(row)}</td>`).join("")}</tr>`
        )
        .join("");
}

/** Filter baris tabel dari input pencarian */
export function bindTableSearch(inputId, tbodyId) {
    const input = document.getElementById(inputId);
    const tbody = document.getElementById(tbodyId);
    if (!input || !tbody) return;

    input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        tbody.querySelectorAll("tr").forEach((tr) => {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
        });
    });
}

/* ---------- tema ---------- */

function applyTheme() {
    let saved = "light";
    try { saved = localStorage.getItem(THEME_KEY) || "light"; } catch { /* abaikan */ }
    document.documentElement.setAttribute("data-theme", saved);
    document.documentElement.classList.toggle("dark-theme", saved === "dark");
    document.body.classList.toggle("dark-theme", saved === "dark");
}

function toggleTheme() {
    const next =
        document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch { /* abaikan */ }
    applyTheme();
}

/* ---------- sidebar ---------- */

function menuHtml(menu, role, activeKey) {
    return menu
        .filter((m) => !m.hidden && (m.section || !m.roles || m.roles.includes(role)))
        .map((m) => {
            if (m.section) return `<div class="sidebar-menu-title">${m.section}</div>`;
            const active = m.key === activeKey ? " active" : "";
            const badge = m.badge
                ? `<span class="sidebar-badge" id="maintenanceBadge">0</span>` : "";
            return `
                <a href="${m.href}" class="sidebar-link${active}">
                    <span class="sidebar-icon">${m.icon}</span>
                    <span class="sidebar-text">${m.text}</span>
                    ${badge}
                </a>`;
        })
        .join("");
}

function buildShell({ portal, role, name, activeKey, title }) {
    const cfg = PORTALS[portal];

    const content = document.getElementById("pageContent");
    const loading = document.getElementById("shellLoading");

    const wrapper = document.createElement("div");
    wrapper.className = "dashboard";

    wrapper.innerHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <img src="/logo/icon.png" alt="SARPRASIN" class="sidebar-logo">
                <div class="sidebar-brand">
                    <h3>SARPRASIN</h3>
                    <span>${escapeHtml(cfg.label)}</span>
                </div>
            </div>
            <nav class="sidebar-menu">${menuHtml(MENUS[portal], role, activeKey)}</nav>
            <div class="sidebar-footer">
                <div class="sidebar-profile">
                    <img src="/logo/icon.png" alt="User" class="profile-avatar">
                    <div class="profile-info">
                        <h4>${escapeHtml(name)}</h4>
                        <span>${escapeHtml(roleLabel(role))}</span>
                    </div>
                </div>
                <button class="sidebar-logout" id="logoutButton" type="button">Keluar</button>
            </div>
        </aside>

        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <div class="dashboard-main" id="shellMain">
            <header class="topbar">
                <div class="topbar-left">
                    <button class="topbar-toggle" id="sidebarToggle" type="button"
                        aria-label="Buka/tutup menu">☰</button>
                    <div class="breadcrumb">
                        <a href="${cfg.path}">${escapeHtml(cfg.label)}</a> / <span>${escapeHtml(title)}</span>
                    </div>
                </div>
                <div class="topbar-right">
                    <button class="topbar-action" id="themeToggle" type="button"
                        aria-label="Ganti tema">🌙</button>
                    <div class="topbar-user">
                        <img src="/logo/icon.png" alt="User" class="topbar-avatar">
                        <div class="topbar-user-info">
                            <h4>${escapeHtml(name)}</h4>
                            <span>${escapeHtml(roleLabel(role))}</span>
                        </div>
                    </div>
                </div>
            </header>
        </div>`;

    document.body.insertBefore(wrapper, document.body.firstChild);
    document.getElementById("shellMain").appendChild(content);
    content.hidden = false;
    if (loading) loading.hidden = true;

    document.body.classList.add("has-shell");
}

function bindShellEvents() {

    const mobile = window.matchMedia(MOBILE_QUERY);
    const body = document.body;

    // restore state desktop
    try {
        if (!mobile.matches && localStorage.getItem(COLLAPSE_KEY) === "1") {
            body.classList.add("sidebar-collapsed");
        }
    } catch { /* abaikan */ }

    document.getElementById("sidebarToggle").addEventListener("click", () => {
        if (mobile.matches) {
            body.classList.toggle("sidebar-open");
        } else {
            const collapsed = body.classList.toggle("sidebar-collapsed");
            try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"); } catch { /* abaikan */ }
        }
    });

    document.getElementById("sidebarOverlay").addEventListener("click", () => {
        body.classList.remove("sidebar-open");
    });

    // tutup drawer mobile saat pindah halaman / tekan Esc
    document.querySelectorAll(".sidebar-link").forEach((a) =>
        a.addEventListener("click", () => body.classList.remove("sidebar-open"))
    );
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") body.classList.remove("sidebar-open");
    });

    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("logoutButton").addEventListener("click", logout);
}

/* ---------- entry ---------- */

/**
 * @param {object}   opts
 * @param {string}   opts.key      key menu halaman ini (mis. "asset")
 * @param {string}   opts.activeKey (opsional) menu yang di-highlight kalau beda dari key
 * @param {string}   opts.title    judul untuk breadcrumb & <title>
 * @param {Function} opts.onReady  dipanggil setelah shell siap: onReady({role,name,uid})
 */
export function initAdminPage(opts) {
    return initPortalPage({ portal: "admin", ...opts });
}

/**
 * Guard + shell untuk portal mana pun.
 * portal: "admin" | "executive" | "user"  (lihat src/config/portals.js)
 */
export function initPortalPage({ portal = "admin", key, title, activeKey, onReady }) {

    applyTheme();

    const cfg = PORTALS[portal];
    let started = false;

    authListener(async (authUser) => {

        if (started) return;

        if (!authUser) {
            // simpan tujuan supaya setelah login kembali ke halaman ini
            const next = encodeURIComponent(location.pathname);
            window.location.href = `/login?next=${next}`;
            return;
        }

        let profile = null;

        try {
            const snap = await getById(COLLECTION.USERS, authUser.uid);
            profile = snap.exists() ? snap.data() : null;
        } catch (error) {
            console.error("Gagal membaca profil user:", error);
        }

        const role = profile?.role;

        if (!role || profile.status === "nonaktif") {
            window.location.href = "/login";
            return;
        }

        // role ini tidak berhak di portal ini -> arahkan ke portalnya sendiri
        if (!cfg.roles.includes(role)) {
            window.location.href = defaultPath(role) || "/login";
            return;
        }

        // halaman tertentu di dalam portal admin punya batas role sendiri
        const menuItem = MENUS[portal].find((m) => m.key === key);
        if (menuItem?.roles && !menuItem.roles.includes(role)) {
            window.location.href = cfg.path;
            return;
        }

        started = true;

        const name = profile.name || authUser.email;

        document.title = `${title} | SARPRASIN`;
        buildShell({ portal, role, name, activeKey: activeKey || key, title });
        bindShellEvents();
        applyTheme();

        if (onReady) {
            try {
                await onReady({ role, name, uid: authUser.uid, profile });
            } catch (error) {
                console.error("Gagal memuat halaman:", error);
            }
        }

        if (portal === "admin") refreshMaintenanceBadge();
    });
}

async function refreshMaintenanceBadge() {
    const badge = document.getElementById("maintenanceBadge");
    if (!badge) return;
    try {
        const rows = toRows(await getAll(COLLECTION.ASSETS));
        const n = rows.filter((a) => /^(PERBAIKAN|RUSAK)/.test(String(a.kodeKondisi || a.kondisi || "").toUpperCase())).length;
        badge.textContent = n;
    } catch { badge.textContent = "0"; }
}
