/*
==========================================================
SARPRASIN v2.0 - Impor akun dari spreadsheet (fungsi murni)

Kolom yang dikenali (urutan bebas, judul toleran):
  Nama | Email | Role | Password (opsional) | Ruangan (opsional)
Ruangan boleh lebih dari satu, dipisah ; , atau garis baru.
==========================================================
*/

import { matchRoom, norm } from "./import-clean.js";

const HEAD = {
    name: ["nama", "nama lengkap", "name", "nama guru", "nama pengguna"],
    email: ["email", "e mail", "surel", "email login", "alamat email"],
    role: ["role", "peran", "hak akses", "jabatan", "level"],
    password: ["password", "kata sandi", "sandi", "pass"],
    ruangan: ["ruangan", "ruang", "kelas", "kode ruang", "penugasan", "ruangan ditugaskan"]
};

const ROLE_ALIAS = {
    admin: "admin", administrator: "admin",
    "waka sarpras": "waka_sarpras", waka: "waka_sarpras", wakasek: "waka_sarpras", "waka sarana": "waka_sarpras", eksekutif: "waka_sarpras",
    staff: "staff", "staff sarpras": "staff", staf: "staff", "staf sarpras": "staff", sarpras: "staff",
    arsiparis: "arsiparis",
    operator: "operator",
    guru: "guru",
    "wali kelas": "wali_kelas", walikelas: "wali_kelas", wali: "wali_kelas",
    viewer: "viewer", pengamat: "viewer"
};

export const ROOM_ROLES = ["operator", "guru", "wali_kelas", "viewer"];

const str = (v) => (v == null ? "" : String(v).trim());
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRole(text) {
    const n = norm(text).replace(/_/g, " ");
    return ROLE_ALIAS[n] || "";
}

export function randomPassword(length = 12) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes].map((n) => alphabet[n % alphabet.length]).join("");
}

function findHeader(rows) {
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const cells = (rows[i] || []).map((c) => norm(c));
        const map = {};
        for (const [field, names] of Object.entries(HEAD)) {
            const idx = cells.findIndex((c) => names.includes(c));
            if (idx >= 0) map[field] = idx;
        }
        if (map.email !== undefined && (map.name !== undefined || map.role !== undefined)) return { index: i, map };
    }
    return null;
}

/**
 * @param rows  baris mentah (array of array) dari xlsx/csv
 * @param ctx   { rooms: [{kodeRuang,namaRuang}], existingEmails: Set<string> }
 */
export function parseAccounts(rows, { rooms = [], existingEmails = new Set() } = {}) {
    const head = findHeader(rows);
    if (!head) throw new Error("Judul kolom tidak ditemukan. Wajib ada kolom 'Email' dan 'Nama' atau 'Role' (lihat file contoh).");

    const seen = new Set();
    const out = [];

    for (const raw of rows.slice(head.index + 1)) {
        const get = (f) => (head.map[f] === undefined ? "" : str(raw[head.map[f]]));
        const name = get("name");
        const email = get("email").toLowerCase();
        if (!name && !email) continue;

        const problems = [];
        const warns = [];

        if (!name) problems.push("Nama kosong");
        if (!EMAIL_RE.test(email)) problems.push("Email tidak valid");
        else if (existingEmails.has(email)) problems.push("Email sudah terdaftar");
        else if (seen.has(email)) problems.push("Email dobel di file");
        seen.add(email);

        const roleText = get("role");
        const role = roleText ? parseRole(roleText) : "guru";
        if (!role) problems.push(`Role '${roleText}' tidak dikenali`);
        else if (!roleText) warns.push("Role kosong, dianggap Guru");

        let password = get("password");
        let generated = false;
        if (!password) { password = randomPassword(); generated = true; }
        else if (password.length < 8) problems.push("Password kurang dari 8 karakter");

        const ruangan = [];
        const roomText = get("ruangan");
        if (roomText) {
            if (role && !ROOM_ROLES.includes(role)) {
                warns.push("Role ini tidak memakai penugasan ruangan, kolom ruangan diabaikan");
            } else {
                for (const part of roomText.split(/[;,\n|]+/).map(str).filter(Boolean)) {
                    const { room } = matchRoom(part, rooms);
                    if (room) { if (!ruangan.includes(room.kodeRuang)) ruangan.push(room.kodeRuang); }
                    else warns.push(`Ruangan '${part}' tidak ditemukan`);
                }
            }
        } else if (ROOM_ROLES.includes(role)) {
            warns.push("Belum ada ruangan ditugaskan");
        }

        out.push({
            name, email, role, password, generated, ruangan,
            problems, warns,
            status: problems.length ? "error" : (warns.length ? "warn" : "ok")
        });
    }
    return out;
}
