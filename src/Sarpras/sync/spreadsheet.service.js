// ======================================================
// Spreadsheet Service
// Sarprasin v2.0
// Firestore <-> Google Spreadsheet Bridge
// ======================================================

/*
|--------------------------------------------------------------------------
| KONFIGURASI
|--------------------------------------------------------------------------
|
| Deploy URL Google Apps Script
|
*/

const GAS_URL = import.meta.env.VITE_GAS_URL;

/* ======================================================
   REQUEST
====================================================== */

async function request(action, payload = {}) {

    const response = await fetch(GAS_URL, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            action,

            payload

        })

    });

    if (!response.ok) {

        throw new Error("Spreadsheet Service Error");

    }

    return await response.json();

}

/* ======================================================
   READ
====================================================== */

export async function readSheet(sheetName) {

    return await request("readSheet", {

        sheetName

    });

}

/* ======================================================
   WRITE
====================================================== */

export async function writeSheet(sheetName, rows) {

    return await request("writeSheet", {

        sheetName,

        rows

    });

}

/* ======================================================
   APPEND
====================================================== */

export async function appendSheet(sheetName, row) {

    return await request("appendSheet", {

        sheetName,

        row

    });

}

/* ======================================================
   UPDATE
====================================================== */

export async function updateSheet(sheetName, rowNumber, row) {

    return await request("updateSheet", {

        sheetName,

        rowNumber,

        row

    });

}

/* ======================================================
   DELETE
====================================================== */

export async function deleteSheetRow(sheetName, rowNumber) {

    return await request("deleteRow", {

        sheetName,

        rowNumber

    });

}

/* ======================================================
   PING
====================================================== */

export async function pingSpreadsheet() {

    return await request("ping");

}
