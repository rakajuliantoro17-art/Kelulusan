// ======================================================
// Migration Service
// Sarprasin v2.0
// Spreadsheet -> Firestore
// ======================================================

import {
    createAsset,
    getAssets
} from "../core/asset.service.js";

import {
    createLog,
    LOG_ACTION
} from "../core/log.service.js";

/* ======================================================
   MIGRATION STATUS
====================================================== */

export const MIGRATION_STATUS = {

    READY: "READY",

    RUNNING: "RUNNING",

    SUCCESS: "SUCCESS",

    FAILED: "FAILED"

};

/* ======================================================
   MIGRATE ASSETS
====================================================== */

export async function migrateAssets(rows = []) {

    const result = {

        total: rows.length,

        success: 0,

        failed: 0,

        errors: []

    };

    for (const row of rows) {

        try {

            await createAsset(row);

            result.success++;

        }

        catch (error) {

            result.failed++;

            result.errors.push({

                kodeBarang: row.kodeBarang,

                error: error.message

            });

        }

    }

    await createLog({

        action: LOG_ACTION.IMPORT_SPREADSHEET,

        description: "Migrasi data aset",

        additionalData: result

    });

    return result;

}

/* ======================================================
   VALIDATE MIGRATION
====================================================== */

export async function validateMigration(expectedTotal) {

    const assets = await getAssets();

    return {

        expected: expectedTotal,

        actual: assets.length,

        valid: expectedTotal === assets.length

    };

}

/* ======================================================
   ROLLBACK (Future)
====================================================== */

export async function rollbackMigration() {

    // Phase berikutnya

}

/* ======================================================
   DRY RUN
====================================================== */

export function dryRun(rows = []) {

    return {

        total: rows.length,

        valid: rows.filter(r => r.namaBarang).length,

        invalid: rows.filter(r => !r.namaBarang).length

    };

}
