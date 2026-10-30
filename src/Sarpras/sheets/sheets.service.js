/*
==========================================================
SARPRASIN v2.0 - Sinkron Google Spreadsheet (lewat Apps Script)

Browser memanggil Web App Apps Script (docs/apps-script/sinkron-akun.gs)
dengan ID token Firebase milik admin. Skrip memverifikasi token dan
role admin sebelum menyentuh spreadsheet. Tidak ada rahasia di frontend.

Env: VITE_SHEETS_URL = URL Web App (berakhiran /exec)
==========================================================
*/

import { auth } from "../firebase/firebase.auth.js";

export const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || "";

export const sheetsEnabled = () => Boolean(SHEETS_URL);

/** action: ping | export | pull | done */
export async function callSheet(action, payload = {}) {

    if (!SHEETS_URL) {
        throw new Error("VITE_SHEETS_URL belum diisi di Vercel. Lihat docs/sinkron-spreadsheet.md.");
    }

    const user = auth.currentUser;
    if (!user) throw new Error("Sesi login habis. Silakan login ulang.");
    const idToken = await user.getIdToken();

    let res;
    try {
        // text/plain = "simple request" (tanpa preflight; Apps Script tidak menangani OPTIONS)
        res = await fetch(SHEETS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action, idToken, ...payload })
        });
    } catch {
        throw new Error("Tidak bisa menghubungi Apps Script. Cek URL Web App dan akses 'Siapa saja' saat deploy.");
    }

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error("Respons Apps Script tidak valid (kemungkinan belum di-deploy atau akses dibatasi).");
    }
    if (!data.ok) throw new Error(data.error || "Apps Script menolak permintaan.");
    return data;
}
