// ======================================================
// Activity Log Service
// Sarprasin v2.0
// ======================================================

import {
    COLLECTION,
    create,
    getAll,
    getWhere
} from "../firebase";

import { getCurrentUser } from "../firebase";

/* ======================================================
   LOG ACTION
====================================================== */

export const LOG_ACTION = {

    LOGIN: "LOGIN",

    LOGOUT: "LOGOUT",

    CREATE_ASSET: "CREATE_ASSET",

    UPDATE_ASSET: "UPDATE_ASSET",

    DELETE_ASSET: "DELETE_ASSET",

    MOVE_ASSET: "MOVE_ASSET",

    CHANGE_CONDITION: "CHANGE_CONDITION",

    SCAN_QR: "SCAN_QR",

    GENERATE_QR: "GENERATE_QR",

    EXPORT_REPORT: "EXPORT_REPORT",

    IMPORT_SPREADSHEET: "IMPORT_SPREADSHEET"

};

/* ======================================================
   CREATE LOG
====================================================== */

export async function createLog({

    action,

    description,

    kodeBarang = null,

    additionalData = {}

}) {

    const user = getCurrentUser();

    const payload = {

        action,

        description,

        kodeBarang,

        uid: user?.uid ?? null,

        email: user?.email ?? null,

        timestamp: new Date().toISOString(),

        additionalData

    };

    await create(COLLECTION.LOGS, payload);

}

/* ======================================================
   GET ALL LOG
====================================================== */

export async function getLogs() {

    return await getAll(COLLECTION.LOGS);

}

/* ======================================================
   GET LOG BY ASSET
====================================================== */

export async function getAssetLogs(kodeBarang) {

    return await getWhere(

        COLLECTION.LOGS,

        "kodeBarang",

        "==",

        kodeBarang

    );

}

/* ======================================================
   GET LOG BY USER
====================================================== */

export async function getUserLogs(uid) {

    return await getWhere(

        COLLECTION.LOGS,

        "uid",

        "==",

        uid

    );

}
