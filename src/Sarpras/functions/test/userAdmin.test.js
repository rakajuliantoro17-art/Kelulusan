"use strict";

/**
 * Uji logika manajemen akun dengan auth & db palsu (tanpa emulator).
 * Jalankan: cd functions && npm test
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { createHandlers, AppError } = require("../userAdmin");

/* ---------- fakes ---------- */

function makeEnv() {
    const store = new Map();     // path -> data
    const logs = [];
    const authUsers = new Map(); // uid -> record
    const calls = { revoked: [], deleted: [] };
    let seq = 0;

    const db = {
        doc(path) {
            return {
                async get() {
                    return { exists: store.has(path), data: () => store.get(path) };
                },
                async set(data) { store.set(path, { ...data }); },
                async update(data) {
                    if (!store.has(path)) throw new Error("no doc");
                    store.set(path, { ...store.get(path), ...data });
                },
                async delete() { store.delete(path); }
            };
        },
        collection(name) {
            return { async add(data) { if (name === "logs") logs.push(data); } };
        }
    };

    const auth = {
        async createUser({ email, password, displayName, disabled }) {
            if ([...authUsers.values()].some((u) => u.email === email)) {
                throw Object.assign(new Error("exists"), { code: "auth/email-already-exists" });
            }
            const uid = `uid${++seq}`;
            authUsers.set(uid, { uid, email, password, displayName, disabled });
            return { uid };
        },
        async updateUser(uid, changes) {
            const u = authUsers.get(uid);
            if (!u) throw Object.assign(new Error("nf"), { code: "auth/user-not-found" });
            if (changes.email && [...authUsers.values()].some((o) => o.uid !== uid && o.email === changes.email)) {
                throw Object.assign(new Error("exists"), { code: "auth/email-already-exists" });
            }
            authUsers.set(uid, { ...u, ...changes });
        },
        async deleteUser(uid) {
            if (!authUsers.has(uid)) throw Object.assign(new Error("nf"), { code: "auth/user-not-found" });
            authUsers.delete(uid);
            calls.deleted.push(uid);
        },
        async revokeRefreshTokens(uid) { calls.revoked.push(uid); }
    };

    // admin yang sedang login
    authUsers.set("admin1", { uid: "admin1", email: "admin@sekolah.id" });
    store.set("users/admin1", { name: "Admin", email: "admin@sekolah.id", role: "admin", status: "aktif" });

    const handlers = createHandlers({ auth, db, now: () => "2026-10-18T00:00:00.000Z" });
    return { handlers, store, logs, authUsers, calls, db, auth };
}

const ADMIN = { uid: "admin1", email: "admin@sekolah.id" };

const valid = {
    email: "Guru.Satu@Sekolah.id",
    name: "Guru Satu",
    role: "guru",
    password: "Rahasia123",
    ruangan: ["R-01", "R-02", "R-01"]
};

async function rejects(promise, code) {
    await assert.rejects(promise, (e) => e instanceof AppError && e.code === code,
        `harus ditolak dengan kode ${code}`);
}

/* ---------- hak akses ---------- */

test("non-admin ditolak untuk semua aksi", async () => {
    const env = makeEnv();
    env.store.set("users/guru1", { role: "guru", status: "aktif" });
    const guru = { uid: "guru1", email: "g@x.id" };

    await rejects(env.handlers.createUserAccount(guru, valid), "permission-denied");
    await rejects(env.handlers.updateUserAccount(guru, { uid: "admin1", ...valid, status: "aktif" }), "permission-denied");
    await rejects(env.handlers.setUserPassword(guru, { uid: "admin1", password: "abcdefgh" }), "permission-denied");
    await rejects(env.handlers.deleteUserAccount(guru, { uid: "admin1" }), "permission-denied");
});

test("pengguna tanpa profil atau admin nonaktif ditolak", async () => {
    const env = makeEnv();
    await rejects(env.handlers.createUserAccount({ uid: "hantu" }, valid), "permission-denied");

    env.store.set("users/admin1", { role: "admin", status: "nonaktif" });
    await rejects(env.handlers.createUserAccount(ADMIN, valid), "permission-denied");
});

test("role admin dari waka_sarpras/staff tidak cukup", async () => {
    const env = makeEnv();
    env.store.set("users/waka1", { role: "waka_sarpras", status: "aktif" });
    await rejects(env.handlers.createUserAccount({ uid: "waka1" }, valid), "permission-denied");
});

/* ---------- buat akun ---------- */

test("admin membuat akun: email dirapikan, ruangan unik, profil & log tertulis", async () => {
    const env = makeEnv();
    const res = await env.handlers.createUserAccount(ADMIN, valid);

    assert.equal(res.email, "guru.satu@sekolah.id");
    const profile = env.store.get(`users/${res.uid}`);
    assert.equal(profile.role, "guru");
    assert.equal(profile.status, "aktif");
    assert.deepEqual(profile.ruangan, ["R-01", "R-02"]);
    assert.equal(profile.createdBy, "admin1");

    assert.equal(env.authUsers.get(res.uid).displayName, "Guru Satu");

    assert.equal(env.logs.length, 1);
    assert.equal(env.logs[0].action, "CREATE_USER");
    assert.ok(!JSON.stringify(env.logs[0]).includes("Rahasia123"), "password tidak boleh masuk log");
});

test("ruangan dikosongkan untuk role yang bukan pengguna ruangan", async () => {
    const env = makeEnv();
    const res = await env.handlers.createUserAccount(ADMIN, { ...valid, role: "staff" });
    assert.deepEqual(env.store.get(`users/${res.uid}`).ruangan, []);
});

test("validasi input ditolak", async () => {
    const env = makeEnv();
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, email: "bukan-email" }), "invalid-argument");
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, password: "pendek" }), "invalid-argument");
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, name: " " }), "invalid-argument");
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, role: "superuser" }), "invalid-argument");
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, ruangan: "R-01" }), "invalid-argument");
    await rejects(env.handlers.createUserAccount(ADMIN, { ...valid, ruangan: ["a/b"] }), "invalid-argument");
});

test("email yang sudah ada ditolak dengan petunjuk", async () => {
    const env = makeEnv();
    await env.handlers.createUserAccount(ADMIN, valid);
    await assert.rejects(
        env.handlers.createUserAccount(ADMIN, valid),
        (e) => e.code === "already-exists" && /UID yang sudah ada/.test(e.message)
    );
});

test("jika profil gagal ditulis, akun login dibatalkan (tidak yatim)", async () => {
    const env = makeEnv();
    const realDoc = env.db.doc.bind(env.db);
    env.db.doc = (path) => {
        const d = realDoc(path);
        if (path.startsWith("users/uid")) {
            d.set = async () => { throw new Error("firestore down"); };
        }
        return d;
    };
    await assert.rejects(env.handlers.createUserAccount(ADMIN, valid), /firestore down/);
    assert.equal(env.calls.deleted.length, 1);
    assert.equal([...env.authUsers.keys()].filter((k) => k !== "admin1").length, 0);
});

/* ---------- ubah ---------- */

test("admin mengubah role, ruangan, dan menonaktifkan user", async () => {
    const env = makeEnv();
    const { uid } = await env.handlers.createUserAccount(ADMIN, valid);

    await env.handlers.updateUserAccount(ADMIN, {
        uid, name: "Guru Satu B", email: "guru.satu@sekolah.id",
        role: "wali_kelas", status: "nonaktif", ruangan: ["R-09"]
    });

    const p = env.store.get(`users/${uid}`);
    assert.equal(p.role, "wali_kelas");
    assert.equal(p.status, "nonaktif");
    assert.deepEqual(p.ruangan, ["R-09"]);
    assert.equal(env.authUsers.get(uid).disabled, true);
    assert.ok(env.calls.revoked.includes(uid), "sesi user nonaktif harus dicabut");
    assert.ok(env.logs.some((l) => l.action === "UPDATE_USER" && /role guru -> wali_kelas/.test(l.description)));
});

test("admin tidak bisa menurunkan atau menonaktifkan dirinya sendiri", async () => {
    const env = makeEnv();
    const base = { uid: "admin1", name: "Admin", email: "admin@sekolah.id", ruangan: [] };
    await rejects(env.handlers.updateUserAccount(ADMIN, { ...base, role: "staff", status: "aktif" }), "failed-precondition");
    await rejects(env.handlers.updateUserAccount(ADMIN, { ...base, role: "admin", status: "nonaktif" }), "failed-precondition");
    // tetap boleh mengubah nama
    await env.handlers.updateUserAccount(ADMIN, { ...base, name: "Admin Baru", role: "admin", status: "aktif" });
    assert.equal(env.store.get("users/admin1").name, "Admin Baru");
});

test("ubah email ke email akun lain ditolak; user tak dikenal -> not-found", async () => {
    const env = makeEnv();
    const a = await env.handlers.createUserAccount(ADMIN, valid);
    await env.handlers.createUserAccount(ADMIN, { ...valid, email: "dua@sekolah.id" });

    await rejects(env.handlers.updateUserAccount(ADMIN, {
        uid: a.uid, name: "X Y", email: "dua@sekolah.id", role: "guru", status: "aktif", ruangan: []
    }), "already-exists");

    await rejects(env.handlers.updateUserAccount(ADMIN, {
        uid: "tidakada", name: "X Y", email: "x@y.id", role: "guru", status: "aktif", ruangan: []
    }), "not-found");
});

/* ---------- password & hapus ---------- */

test("admin mengganti password user dan sesi lamanya dicabut", async () => {
    const env = makeEnv();
    const { uid } = await env.handlers.createUserAccount(ADMIN, valid);
    await env.handlers.setUserPassword(ADMIN, { uid, password: "PasswordBaru99" });

    assert.equal(env.authUsers.get(uid).password, "PasswordBaru99");
    assert.ok(env.calls.revoked.includes(uid));
    assert.ok(!JSON.stringify(env.logs).includes("PasswordBaru99"));

    await rejects(env.handlers.setUserPassword(ADMIN, { uid, password: "pendek" }), "invalid-argument");
});

test("hapus akun: user lain boleh, diri sendiri tidak", async () => {
    const env = makeEnv();
    const { uid } = await env.handlers.createUserAccount(ADMIN, valid);

    await rejects(env.handlers.deleteUserAccount(ADMIN, { uid: "admin1" }), "failed-precondition");

    await env.handlers.deleteUserAccount(ADMIN, { uid });
    assert.equal(env.store.has(`users/${uid}`), false);
    assert.equal(env.authUsers.has(uid), false);
    assert.ok(env.logs.some((l) => l.action === "DELETE_USER"));

    await rejects(env.handlers.deleteUserAccount(ADMIN, { uid }), "not-found");
});

test("kegagalan menulis log tidak menggagalkan aksi", async () => {
    const env = makeEnv();
    env.db.collection = () => ({ add: async () => { throw new Error("log down"); } });
    const res = await env.handlers.createUserAccount(ADMIN, valid);
    assert.ok(env.store.has(`users/${res.uid}`));
});
