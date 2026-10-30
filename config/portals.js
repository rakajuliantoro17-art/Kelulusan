/*
==========================================================
SARPRASIN v2.0
PETA PORTAL & HAK AKSES ROLE  (satu sumber kebenaran)
File : src/config/portals.js

Dipakai oleh: halaman depan, login, dan semua shell portal.
Mau menambah role / memindah akses? Cukup ubah di sini.
==========================================================
*/

export const PORTALS = {

    admin: {
        label: "Portal Admin",
        path: "/admin",
        icon: "🛠️",
        desc: "Kelola aset, ruangan, perawatan, pengguna, dan cetak Kartu Inventaris Ruangan.",
        who: "Admin, Waka Sarpras, Staff Sarpras, Arsiparis",
        roles: ["admin", "waka_sarpras", "staff", "arsiparis"]
    },

    executive: {
        label: "Portal Eksekutif",
        path: "/eksekutif",
        icon: "📈",
        desc: "Ringkasan kondisi sarana-prasarana untuk pelaporan ke Kepala Sekolah dan Dinas.",
        who: "Waka Sarpras",
        roles: ["waka_sarpras"]
    },

    user: {
        label: "Portal Pengguna",
        path: "/user",
        icon: "👩‍🏫",
        desc: "Lihat inventaris ruangan yang menjadi tanggung jawab Anda dan cetak kartunya.",
        who: "Operator, Guru, Wali Kelas, Viewer / Ketua Kelas",
        roles: ["operator", "guru", "wali_kelas", "viewer"]
    },

    public: {
        label: "Portal Publik",
        path: "/",
        icon: "🌐",
        desc: "Ringkasan sarana-prasarana sekolah untuk masyarakat, wali murid, dan alumni. Tanpa login.",
        who: "Masyarakat, Wali Murid, Alumni",
        roles: null
    }
};

export const ROLE_LABEL = {
    admin: "Administrator",
    waka_sarpras: "Waka Sarpras",
    staff: "Staff Sarpras",
    arsiparis: "Arsiparis",
    operator: "Operator",
    guru: "Guru",
    wali_kelas: "Wali Kelas",
    viewer: "Viewer"
};

export function roleLabel(role) {
    return ROLE_LABEL[role] || role || "-";
}

/** Daftar key portal (selain publik) yang boleh dibuka role ini */
export function portalsForRole(role) {
    return Object.entries(PORTALS)
        .filter(([, p]) => p.roles && p.roles.includes(role))
        .map(([key]) => key);
}

export function canAccess(portalKey, role) {
    const p = PORTALS[portalKey];
    return Boolean(p && p.roles && p.roles.includes(role));
}

/** Tujuan default setelah login. Waka Sarpras -> Eksekutif. */
export function defaultPath(role) {
    if (role === "waka_sarpras") return PORTALS.executive.path;
    const first = portalsForRole(role)[0];
    return first ? PORTALS[first].path : null;
}

/**
 * Validasi parameter ?next= supaya tidak bisa dipakai
 * untuk redirect ke tempat sembarang. Hanya path portal
 * (atau sub-halamannya) yang boleh untuk role tersebut.
 */
export function safeNext(next, role) {
    if (!next || typeof next !== "string" || !next.startsWith("/")) return null;
    const clean = next.split("?")[0].replace(/\/+$/, "");
    const hit = Object.entries(PORTALS).find(([, p]) =>
        p.roles && (clean === p.path || clean.startsWith(p.path + "/"))
    );
    return hit && hit[1].roles.includes(role) ? next : null;
}
