// ======================================================
// Master Data Service
// Sarprasin v2.0
// ======================================================

import {
    COLLECTION,
    createWithId,
    update,
    remove,
    getAll,
    getById
} from "../firebase";

/* ======================================================
   MASTER TYPE
====================================================== */

export const MASTER = {

    ROOM: "ruangan",

    CONDITION: "kondisi",

    SOURCE: "sumberDana",

    CATEGORY: "kategori",

    UNIT: "satuan",

    BRAND: "merek",

    VENDOR: "vendor"

};

/* ======================================================
   GET ALL MASTER
====================================================== */

export async function getMaster(type) {

    return await getAll(
        `${COLLECTION.MASTER}/${type}/data`
    );

}

/* ======================================================
   GET DETAIL MASTER
====================================================== */

export async function getMasterById(type,id){

    return await getById(
        `${COLLECTION.MASTER}/${type}/data`,
        id
    );

}

/* ======================================================
   CREATE MASTER
====================================================== */

export async function createMaster(type,id,data){

    await createWithId(
        `${COLLECTION.MASTER}/${type}/data`,
        id,
        data
    );

    return true;

}

/* ======================================================
   UPDATE MASTER
====================================================== */

export async function updateMaster(type,id,data){

    await update(
        `${COLLECTION.MASTER}/${type}/data`,
        id,
        data
    );

    return true;

}

/* ======================================================
   DELETE MASTER
====================================================== */

export async function deleteMaster(type,id){

    await remove(
        `${COLLECTION.MASTER}/${type}/data`,
        id
    );

    return true;

}
