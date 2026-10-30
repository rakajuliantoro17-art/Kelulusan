/*
==========================================================
Sarprasin 2.0
Self Correction Service
File : src/services/ai/self-correction.service.js
Version : 2.0.0
==========================================================
*/

import assistantService from "./assistant.service.js";

class SelfCorrectionService {

    constructor() {

        this.useAI = false;

        this.roomMap = {

            "lab komputer": "Lab Komputer",
            "lab ipa": "Lab IPA",
            "lab bahasa": "Lab Bahasa",
            "perpustakaan": "Perpustakaan",
            "ruang guru": "Ruang Guru",
            "kepala sekolah": "Ruang Kepala Sekolah",
            "tu": "Tata Usaha"

        };

        this.brandMap = {

            "epson indonesia": "Epson",
            "epson": "Epson",
            "asus indonesia": "ASUS",
            "asus": "ASUS",
            "acer": "Acer",
            "canon": "Canon",
            "hp": "HP",
            "lenovo": "Lenovo"

        };

    }

    /* ==================================================
       CONFIG
    ================================================== */

    enableAI(value = true) {

        this.useAI = value;

    }

    /* ==================================================
       CLEAN
    ================================================== */

    cleanText(text = "") {

        return text

            .replace(/\s+/g, " ")

            .replace(/[^\w\s\-./]/g, "")

            .trim();

    }

    /* ==================================================
       TITLE CASE
    ================================================== */

    titleCase(text = "") {

        return text

            .toLowerCase()

            .split(" ")

            .filter(Boolean)

            .map(word =>

                word.charAt(0).toUpperCase() +

                word.slice(1)

            )

            .join(" ");

    }

    /* ==================================================
       ASSET NAME
    ================================================== */

    normalizeAssetName(name = "") {

        name = this.cleanText(name);

        name = this.titleCase(name);

        name = name

            .replace(/\bPc\b/g, "PC")

            .replace(/\bCpu\b/g, "CPU")

            .replace(/\bUps\b/g, "UPS")

            .replace(/\bAsus\b/g, "ASUS")

            .replace(/\bHp\b/g, "HP");

        return name;

    }

    /* ==================================================
       ROOM
    ================================================== */

    normalizeRoom(room = "") {

        room = this.cleanText(room)

            .toLowerCase();

        return this.roomMap[room] ||

            this.titleCase(room);

    }

    /* ==================================================
       BRAND
    ================================================== */

    normalizeBrand(brand = "") {

        brand = this.cleanText(brand)

            .toLowerCase();

        return this.brandMap[brand] ||

            this.titleCase(brand);

    }

    /* ==================================================
       INVENTORY CODE
    ================================================== */

    normalizeInventoryCode(code = "") {

        return this.cleanText(code)

            .toUpperCase();

    }

    /* ==================================================
       SERIAL NUMBER
    ================================================== */

    normalizeSerialNumber(sn = "") {

        return this.cleanText(sn)

            .toUpperCase()

            .replace(/\s+/g, "");

    }

    /* ==================================================
       DATE
    ================================================== */

    normalizeDate(value) {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {

            return null;

        }

        return date

            .toISOString()

            .split("T")[0];

    }

    /* ==================================================
       ASSET OBJECT
    ================================================== */

    normalizeAsset(asset = {}) {

        return {

            ...asset,

            name:

                this.normalizeAssetName(

                    asset.name

                ),

            brand:

                this.normalizeBrand(

                    asset.brand

                ),

            room:

                this.normalizeRoom(

                    asset.room

                ),

            assetCode:

                this.normalizeInventoryCode(

                    asset.assetCode

                ),

            serialNumber:

                this.normalizeSerialNumber(

                    asset.serialNumber

                )

        };

    }

    /* ==================================================
       AI CORRECTION
    ================================================== */

    async correctWithAI(asset = {}) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Correction dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Perbaiki data inventaris berikut agar konsisten, rapi, dan sesuai standar."

            },

            {

                role: "user",

                content:

                    JSON.stringify(asset)

            }

        ]);

    }

}

const selfCorrectionService =

    new SelfCorrectionService();

export default selfCorrectionService;

export {

    SelfCorrectionService

};
