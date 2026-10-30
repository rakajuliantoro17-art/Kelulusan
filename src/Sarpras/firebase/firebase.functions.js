/*
==========================================================
SARPRASIN v2.0
Firebase Cloud Functions (callable) - sisi browser
File : src/services/firebase/firebase.functions.js

FUNCTIONS_REGION harus sama dengan region di
functions/index.js (asia-southeast2 = Jakarta).
==========================================================
*/

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase.init.js";

export const FUNCTIONS_REGION = "asia-southeast2";

const functions = getFunctions(app, FUNCTIONS_REGION);

/** Pesan generik dari SDK saat fungsi belum ada / server bermasalah. */
const GENERIC = new Set(["NOT_FOUND", "INTERNAL", "UNAVAILABLE", "UNKNOWN", "DEADLINE_EXCEEDED"]);

/**
 * Panggil Cloud Function. Error dilempar sebagai Error biasa dengan
 * pesan yang sudah ramah. error.notDeployed = true bila fungsinya
 * belum di-deploy / tidak terjangkau.
 */
export async function callFunction(name, data = {}) {
    try {
        const result = await httpsCallable(functions, name)(data);
        return result.data;
    } catch (error) {

        const message = String(error?.message || "");
        const unreachable =
            error?.code === "functions/unavailable" ||
            (error?.code === "functions/not-found" && GENERIC.has(message.toUpperCase())) ||
            message.toLowerCase().includes("failed to fetch");

        const friendly = new Error(
            unreachable
                ? "Cloud Function belum aktif atau tidak terjangkau. Pastikan sudah di-deploy (lihat docs/manajemen-akun.md)."
                : (error?.code === "functions/unauthenticated"
                    ? "Sesi login habis. Silakan login ulang."
                    : (GENERIC.has(message.toUpperCase())
                        ? "Terjadi kesalahan di server. Coba lagi."
                        : message || "Permintaan gagal."))
        );
        friendly.notDeployed = unreachable;
        throw friendly;
    }
}
