// ======================================================
// Backup Service
// Sarprasin v2.0
// Firebase -> Google Spreadsheet
// ======================================================

import {
    getAssets
} from "../core/asset.service.js";

import {
    createLog,
    LOG_ACTION
} from "../core/log.service.js";

/* ======================================================
   BACKUP STATUS
====================================================== */

export const BACKUP_STATUS = {

    SUCCESS: "SUCCESS",

    FAILED: "FAILED",

    RUNNING: "RUNNING"

};

/* ======================================================
   BACKUP ASSET
====================================================== */

export async function backupAssets() {

    try {

        const assets = await getAssets();

        /*
         * Tahap berikutnya:
         * kirim assets ke Google Apps Script API
         */

        await createLog({

            action: LOG_ACTION.EXPORT_REPORT,

            description: "Backup Asset ke Spreadsheet",

            additionalData: {

                totalAsset: assets.length,

                status: BACKUP_STATUS.SUCCESS

            }

        });

        return {

            success: true,

            total: assets.length

        };

    }

    catch(error){

        await createLog({

            action: LOG_ACTION.EXPORT_REPORT,

            description: "Backup gagal",

            additionalData:{

                status:BACKUP_STATUS.FAILED,

                error:error.message

            }

        });

        throw error;

    }

}

/* ======================================================
   BACKUP COLLECTION
====================================================== */

export async function backupCollection(name,data){

    /*
        Generic Backup

        nanti dipakai oleh

        master

        user

        aset

        log

        dll
    */

    return {

        success:true,

        collection:name,

        total:data.length

    };

}

/* ======================================================
   RESTORE
====================================================== */

export async function restoreBackup(){

    /*
        Phase 2

        Spreadsheet

            ↓

        Firestore

    */

}
