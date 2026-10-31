/*
==========================================================

SARPRASIN
LOGIN PAGE CONTROLLER

Version : 2.1.0

==========================================================
*/

import { login } from "../../services/auth/auth.service.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const submitButton = form?.querySelector('button[type="submit"]');

function setMessage(text = "", type = "info") {

    if (!message) return;

    message.textContent = text;
    message.className = `login-message ${type}`;

}

function setLoading(isLoading) {

    if (!submitButton) return;

    submitButton.disabled = isLoading;

    submitButton.textContent = isLoading
        ? "Memproses..."
        : "Masuk";

}

const AUTH_MESSAGE = {
    "auth/invalid-credential": "Email atau password salah, atau akun ini belum dibuat di Firebase Authentication (membuat dokumen di Firestore TIDAK membuat akun login).",
    "auth/user-not-found": "Akun belum ada di Firebase Authentication.",
    "auth/wrong-password": "Password salah.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/user-disabled": "Akun dinonaktifkan di Firebase.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Tunggu beberapa menit atau reset password.",
    "auth/network-request-failed": "Koneksi internet bermasalah.",
    "auth/operation-not-allowed": "Login Email/Password belum diaktifkan di Firebase Authentication → Sign-in method.",
    "auth/invalid-api-key": "API key Firebase salah/kosong (cek VITE_FIREBASE_API_KEY di Vercel lalu Redeploy).",
    "auth/unauthorized-domain": "Domain ini belum didaftarkan di Firebase → Authentication → Settings → Authorized domains.",
    "permission-denied": "Firestore menolak membaca profil. Publish firestore.rules terbaru dan pastikan dokumen users/{UID} ada."
};

function friendlyError(error) {
    const code = error?.code || (String(error?.message || "").match(/\((auth\/[a-z-]+)\)/) || [])[1];
    if (code && AUTH_MESSAGE[code]) return `${AUTH_MESSAGE[code]} [${code}]`;
    return error?.message || "Login gagal.";
}

async function handleLogin(event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!email || !password) {

        setMessage(
            "Email dan password wajib diisi.",
            "warning"
        );

        return;

    }

    try {

        setLoading(true);

        setMessage(
            "Sedang masuk ke sistem...",
            "info"
        );

        /*
        ======================================================
        AuthService akan menangani:

        ✓ Firebase Authentication

        ✓ Ambil profile Firestore

        ✓ Ambil role

        ✓ Ambil permission

        ✓ Simpan ke auth.store

        ✓ Simpan ke user.store

        ✓ Redirect sesuai role

        ======================================================
        */

        await login(email, password);

        setMessage(
            "Berhasil masuk. Mengalihkan...",
            "success"
        );

        // login() di auth.service sudah mengarahkan ke portal sesuai role
        // (atau ke ?next= bila diizinkan), jadi tidak ada redirect lagi di sini.

    }

    catch (error) {

        console.error(error);

        setMessage(friendlyError(error), "error");

    }

    finally {

        setLoading(false);

    }

}

if (form) {

    form.addEventListener(
        "submit",
        handleLogin
    );

}

window.__loginReady = true;
