/**
 * ==========================================================
 * SARPRASIN 2.0
 * Manajemen akun user (khusus Admin)
 * File : functions/userAdmin.js
 *
 * Logika inti dibuat tanpa ketergantungan langsung ke Firebase
 * (auth & db disuntikkan) supaya bisa diuji tanpa emulator.
 * Pembungkus onCall ada di functions/index.js.
 *
 * Aturan:
 *  - Hanya user dengan users/{uid}.role == "admin" dan status
 *    bukan "nonaktif" yang boleh memanggil fungsi di sini.
 *  - Password tidak pernah ditulis ke log.
 *  - Admin tidak bisa menurunkan / menonaktifkan / menghapus
 *    akunnya sendiri (mencegah terkunci dari sistem).
 * ==========================================================
 */

"use strict";

const ROLES = [
    "admin", "waka_sarpras", "staff", "arsiparis",
    "operator", "guru", "wali_kelas", "viewer"
];

// Hanya role ini yang memakai penugasan ruangan (sesuai firestore.rules)
const ROOM_ROLES = ["operator", "guru", "wali_kelas", "viewer"];

const STATUSES = ["aktif", "nonaktif"];

class AppError extends Error {
    /** code mengikuti kode HttpsError: invalid-argument, permission-denied, dst. */
    constructor(code, message) {
        super(message);
        this.name = "AppError";
        this.code = code;
    }
}

/* ======================================================
   VALIDASI INPUT
====================================================== */

function cleanEmail(value) {
    const email = String(value ?? "").trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("invalid-argument", "Format email tidak valid.");
    }
    return email;
}

function cleanName(value) {
    const name = String(value ?? "").trim();
    if (name.length < 2 || name.length > 100) {
        throw new AppError("invalid-argument", "Nama wajib diisi (2-100 karakter).");
    }
    return name;
}

function cleanRole(value) {
    if (!ROLES.includes(value)) {
        throw new AppError("invalid-argument", "Role tidak dikenal.");
    }
    return value;
}

function cleanStatus(value) {
    if (!STATUSES.includes(value)) {
        throw new AppError("invalid-argument", "Status harus aktif atau nonaktif.");
    }
    return value;
}

function cleanPassword(value) {
    const password = String(value ?? "");
    if (password.length < 8 || password.length > 128) {
        throw new AppError("invalid-argument", "Password minimal 8 karakter.");
    }
    return password;
}

function cleanUid(value) {
    const uid = String(value ?? "").trim();
    if (!uid || uid.length > 128 || uid.includes("/")) {
        throw new AppError("invalid-argument", "UID tidak valid.");
    }
    return uid;
}

function cleanRooms(value, role) {
    if (!ROOM_ROLES.includes(role)) return [];
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > 300) {
        throw new AppError("invalid-argument", "Daftar ruangan tidak valid.");
    }
    const rooms = value.map((k) => String(k).trim());
    if (rooms.some((k) => !k || k.length > 60 || k.includes("/"))) {
        throw new AppError("invalid-argument", "Kode ruangan tidak valid.");
    }
    return [...new Set(rooms)];
}

/* ======================================================
   FACTORY
====================================================== */

function createHandlers({ auth, db, now = () => new Date().toISOString() }) {

    /** Pastikan pemanggil adalah admin aktif. */
    async function requireAdmin(caller) {
        const snap = await db.doc(`users/${caller.uid}`).get();
        const profile = snap.exists ? snap.data() : null;
        if (!profile || profile.role !== "admin" || profile.status === "nonaktif") {
            throw new AppError("permission-denied", "Hanya Admin yang boleh mengelola akun.");
        }
    }

    async function writeLog(caller, action, description, additionalData = {}) {
        try {
            await db.collection("logs").add({
                action,
                description,
                kodeBarang: null,
                uid: caller.uid,
                email: caller.email ?? null,
                timestamp: now(),
                additionalData
            });
        } catch (error) {
            // Kegagalan mencatat log tidak boleh menggagalkan aksi utama.
            console.error("Gagal menulis log:", error);
        }
    }

    async function loadProfile(uid) {
        const snap = await db.doc(`users/${uid}`).get();
        if (!snap.exists) {
            throw new AppError("not-found", "Profil user tidak ditemukan.");
        }
        return snap.data();
    }

    /* ---------- buat akun ---------- */

    async function createUserAccount(caller, data) {
        await requireAdmin(caller);

        const email = cleanEmail(data.email);
        const name = cleanName(data.name);
        const role = cleanRole(data.role);
        const password = cleanPassword(data.password);
        const ruangan = cleanRooms(data.ruangan, role);

        let record;
        try {
            record = await auth.createUser({
                email,
                password,
                displayName: name,
                emailVerified: false,
                disabled: false
            });
        } catch (error) {
            if (error.code === "auth/email-already-exists") {
                throw new AppError(
                    "already-exists",
                    "Email ini sudah punya akun. Jika akunnya dibuat lewat Firebase Console, " +
                    "gunakan tombol 'Daftarkan UID yang sudah ada'."
                );
            }
            if (error.code === "auth/invalid-password" || error.code === "auth/invalid-email") {
                throw new AppError("invalid-argument", "Email atau password ditolak oleh Firebase Auth.");
            }
            throw error;
        }

        const stamp = now();
        try {
            await db.doc(`users/${record.uid}`).set({
                name,
                email,
                role,
                status: "aktif",
                ruangan,
                createdAt: stamp,
                updatedAt: stamp,
                createdBy: caller.uid
            });
        } catch (error) {
            // Jangan tinggalkan akun login tanpa profil.
            await auth.deleteUser(record.uid).catch(() => {});
            throw error;
        }

        await writeLog(caller, "CREATE_USER", `Membuat akun ${email} (${role})`,
            { targetUid: record.uid, role });

        return { uid: record.uid, email };
    }

    /* ---------- ubah profil / role / status ---------- */

    async function updateUserAccount(caller, data) {
        await requireAdmin(caller);

        const uid = cleanUid(data.uid);
        const name = cleanName(data.name);
        const email = cleanEmail(data.email);
        const role = cleanRole(data.role);
        const status = cleanStatus(data.status);
        const ruangan = cleanRooms(data.ruangan, role);

        if (uid === caller.uid && (role !== "admin" || status !== "aktif")) {
            throw new AppError(
                "failed-precondition",
                "Akun Anda sendiri harus tetap Admin dan Aktif."
            );
        }

        const before = await loadProfile(uid);

        const authChanges = {
            displayName: name,
            disabled: status === "nonaktif"
        };
        if (email !== before.email) authChanges.email = email;

        try {
            await auth.updateUser(uid, authChanges);
        } catch (error) {
            if (error.code === "auth/email-already-exists") {
                throw new AppError("already-exists", "Email itu sudah dipakai akun lain.");
            }
            if (error.code === "auth/user-not-found") {
                throw new AppError("not-found", "Akun login tidak ditemukan di Firebase Auth.");
            }
            throw error;
        }

        if (status === "nonaktif") {
            await auth.revokeRefreshTokens(uid);
        }

        await db.doc(`users/${uid}`).update({
            name, email, role, status, ruangan, updatedAt: now()
        });

        const changes = [];
        if (before.role !== role) changes.push(`role ${before.role} -> ${role}`);
        if ((before.status || "aktif") !== status) changes.push(`status -> ${status}`);
        await writeLog(caller, "UPDATE_USER",
            `Mengubah akun ${email}${changes.length ? " (" + changes.join(", ") + ")" : ""}`,
            { targetUid: uid });

        return { uid };
    }

    /* ---------- ganti password langsung ---------- */

    async function setUserPassword(caller, data) {
        await requireAdmin(caller);

        const uid = cleanUid(data.uid);
        const password = cleanPassword(data.password);
        const profile = await loadProfile(uid);

        try {
            await auth.updateUser(uid, { password });
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                throw new AppError("not-found", "Akun login tidak ditemukan di Firebase Auth.");
            }
            throw error;
        }
        // Paksa login ulang di semua perangkat dengan password lama.
        await auth.revokeRefreshTokens(uid);

        await writeLog(caller, "RESET_PASSWORD", `Mengganti password ${profile.email}`,
            { targetUid: uid });

        return { uid };
    }

    /* ---------- hapus akun ---------- */

    async function deleteUserAccount(caller, data) {
        await requireAdmin(caller);

        const uid = cleanUid(data.uid);
        if (uid === caller.uid) {
            throw new AppError("failed-precondition", "Anda tidak bisa menghapus akun Anda sendiri.");
        }

        const profile = await loadProfile(uid);

        try {
            await auth.deleteUser(uid);
        } catch (error) {
            if (error.code !== "auth/user-not-found") throw error;
        }
        await db.doc(`users/${uid}`).delete();

        await writeLog(caller, "DELETE_USER", `Menghapus akun ${profile.email}`,
            { targetUid: uid, role: profile.role });

        return { uid };
    }

    return { createUserAccount, updateUserAccount, setUserPassword, deleteUserAccount };
}

module.exports = {
    createHandlers,
    AppError,
    ROLES,
    ROOM_ROLES,
    STATUSES
};
