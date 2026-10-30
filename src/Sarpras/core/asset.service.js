// ======================================================
// Asset Service
// Sarprasin v2.0
// Business Logic Layer
// ======================================================

import {
    COLLECTION,
    create,
    update,
    remove,
    getAll,
    getById,
    getWhere
} from "../firebase";

import {
    trackEvent,
    EVENTS
} from "../firebase";

/* ======================================================
   VALIDATION
====================================================== */

export function validateAsset(data) {

    const errors = [];

    if (!data.namaBarang?.trim())
        errors.push("Nama barang wajib diisi.");

    if (!data.kodeRuang)
        errors.push("Ruangan wajib dipilih.");

    if (!data.kodeKondisi)
        errors.push("Kondisi wajib dipilih.");

    if (!data.kodeSumber)
        errors.push("Sumber dana wajib dipilih.");

    if (!data.tahun)
        errors.push("Tahun pengadaan wajib diisi.");

    if (Number(data.nilai) < 0)
        errors.push("Nilai aset tidak valid.");

    return {

        valid: errors.length === 0,

        errors

    };

}

/* ======================================================
   CREATE ASSET
====================================================== */

export async function createAsset(data) {

    const validation = validateAsset(data);

    if (!validation.valid)
        return validation;

    await create(COLLECTION.ASSETS, data);

    trackEvent(EVENTS.CREATE_ASSET);

    return {

        success: true

    };

}

/* ======================================================
   UPDATE ASSET
====================================================== */

export async function updateAsset(id, data) {

    await update(COLLECTION.ASSETS, id, data);

    trackEvent(EVENTS.UPDATE_ASSET);

    return {

        success: true

    };

}

/* ======================================================
   DELETE ASSET
====================================================== */

export async function deleteAsset(id) {

    await remove(COLLECTION.ASSETS, id);

    trackEvent(EVENTS.DELETE_ASSET);

    return {

        success: true

    };

}

/* ======================================================
   GET ALL
====================================================== */

export async function getAssets() {

    return await getAll(COLLECTION.ASSETS);

}

/* ======================================================
   GET DETAIL
====================================================== */

export async function getAsset(id) {

    return await getById(COLLECTION.ASSETS, id);

}

/* ======================================================
   FILTER RUANG
====================================================== */

export async function getAssetByRoom(kodeRuang) {

    return await getWhere(

        COLLECTION.ASSETS,

        "kodeRuang",

        "==",

        kodeRuang

    );

}

/* ======================================================
   FILTER KONDISI
====================================================== */

export async function getAssetByCondition(kodeKondisi) {

    return await getWhere(

        COLLECTION.ASSETS,

        "kodeKondisi",

        "==",

        kodeKondisi

    );

}
