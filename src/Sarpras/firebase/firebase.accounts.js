/*
==========================================================
SARPRASIN v2.0 - Buat akun login TANPA Cloud Functions (paket Spark/gratis)

Memakai instance Firebase kedua supaya admin yang sedang login
tidak ikut keluar saat akun baru dibuat. Profil (users/{uid}) ditulis
terpisah oleh pemanggil memakai sesi admin.

Batasan: tidak bisa menghapus akun login atau mengganti password
orang lain dari browser (butuh Admin SDK / Cloud Functions).
==========================================================
*/

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from "./firebase.config.js";

const NAME = "akun-baru";

function secondaryAuth() {
    const app = getApps().some((a) => a.name === NAME) ? getApp(NAME) : initializeApp(firebaseConfig, NAME);
    return getAuth(app);
}

const MESSAGE = {
    "auth/email-already-in-use": "Email sudah terdaftar di Firebase Authentication. Pakai 'Daftarkan UID yang sudah ada' atau kirim Email reset.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/weak-password": "Password terlalu lemah (minimal 8 karakter).",
    "auth/operation-not-allowed": "Login Email/Password belum diaktifkan di Firebase Authentication → Sign-in method.",
    "auth/too-many-requests": "Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.",
    "auth/network-request-failed": "Koneksi internet bermasalah."
};

/** Buat akun login baru, kembalikan UID-nya. */
export async function createAuthAccount(email, password) {
    const auth = secondaryAuth();
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        return cred.user.uid;
    } catch (error) {
        throw new Error(MESSAGE[error?.code] || error?.message || "Gagal membuat akun login.");
    } finally {
        try { await signOut(auth); } catch { /* abaikan */ }
    }
}
