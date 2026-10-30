/*
==========================================================
SARPRASIN v2.0
UNGGAH FOTO (diperkecil dulu di browser)
File : src/assets/js/shared/photo.js

Foto dari HP biasanya 3-8 MB. Di sini diperkecil ke maks. 1280 px
(JPEG) sebelum diunggah ke Firebase Storage, supaya cepat dan
lolos batas 5 MB di Storage Rules.
==========================================================
*/

import { uploadFile } from "../../../services/firebase/index.js";

const MAX_SIDE = 1280;
const MAX_BYTES = 5 * 1024 * 1024;

async function shrink(file) {
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
        if (blob) return blob;
    } catch (error) {
        console.warn("Foto tidak bisa diperkecil, dipakai apa adanya:", error.message);
    }
    return file;
}

/** Unggah satu foto; mengembalikan URL unduhan. Melempar Error bila tidak valid. */
export async function uploadPhoto(file) {

    if (!file) return "";
    if (!String(file.type).startsWith("image/")) {
        throw new Error("File harus berupa gambar (JPG/PNG).");
    }

    const blob = await shrink(file);

    if (blob.size > MAX_BYTES) {
        throw new Error("Ukuran foto terlalu besar (maks. 5 MB).");
    }

    const rand = Math.random().toString(36).slice(2, 8);
    return await uploadFile(`aset/${Date.now()}_${rand}.jpg`, blob);
}
