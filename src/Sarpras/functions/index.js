/**
 * ==========================================================
 * SARPRASIN 2.0
 * Cloud Functions entry point
 * File : functions/index.js
 *
 * Fungsi manajemen akun (khusus Admin):
 *   createUserAccount, updateUserAccount,
 *   setUserPassword,  deleteUserAccount
 *
 * Region harus sama dengan FUNCTIONS_REGION di
 * src/services/firebase/firebase.functions.js
 *
 * Catatan: file functions lain di folder ini (backup.js,
 * exportPdf.js, syncSpreadsheet.js, webhook.js) belum
 * diekspor dari sini, jadi belum ikut ter-deploy.
 * ==========================================================
 */

"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const { createHandlers, AppError } = require("./userAdmin");

initializeApp();

const handlers = createHandlers({
    auth: getAuth(),
    db: getFirestore()
});

const OPTIONS = {
    region: "asia-southeast2",   // Jakarta
    maxInstances: 5,             // batasi biaya jika ada lonjakan
    cors: true
};

function guarded(name) {
    return onCall(OPTIONS, async (request) => {

        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Silakan login terlebih dahulu.");
        }

        const caller = {
            uid: request.auth.uid,
            email: request.auth.token.email || null
        };

        try {
            return await handlers[name](caller, request.data || {});
        } catch (error) {
            if (error instanceof AppError) {
                throw new HttpsError(error.code, error.message);
            }
            logger.error(`${name} gagal`, error);
            throw new HttpsError("internal", "Terjadi kesalahan di server. Coba lagi.");
        }
    });
}

exports.createUserAccount = guarded("createUserAccount");
exports.updateUserAccount = guarded("updateUserAccount");
exports.setUserPassword = guarded("setUserPassword");
exports.deleteUserAccount = guarded("deleteUserAccount");
