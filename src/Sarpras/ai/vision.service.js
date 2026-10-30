/*
==========================================================
Sarprasin 2.0
Vision Service
File : src/services/ai/vision.service.js
Version : 2.0.0
==========================================================

Computer Vision Gateway

Roadmap

Phase 2
- Metadata
- Image Validation

Phase 5
- AI Vision

Phase 6
- Local Computer Vision

==========================================================
*/

import assistantService from "./assistant.service.js";

class VisionService {

    constructor() {

        this.useAI = false;

    }

    /* ==================================================
       CONFIG
    ================================================== */

    enableAI(value = true) {

        this.useAI = value;

    }

    /* ==================================================
       VALIDATE IMAGE
    ================================================== */

    validate(file) {

        if (!file) {

            return {

                valid: false,

                message: "File tidak ditemukan."

            };

        }

        if (

            !file.type.startsWith("image/")

        ) {

            return {

                valid: false,

                message: "File harus berupa gambar."

            };

        }

        return {

            valid: true

        };

    }

    /* ==================================================
       METADATA
    ================================================== */

    metadata(file) {

        return {

            name: file.name,

            size: file.size,

            type: file.type,

            lastModified:

                file.lastModified

        };

    }

    /* ==================================================
       BASIC ANALYSIS
    ================================================== */

    analyze(file) {

        const validation =

            this.validate(file);

        if (!validation.valid) {

            return validation;

        }

        return {

            success: true,

            metadata:

                this.metadata(file),

            message:

                "Analisis dasar selesai."

        };

    }

    /* ==================================================
       DETECT ASSET
    ================================================== */

    detectAsset(file) {

        return {

            detected: false,

            label: null,

            confidence: 0

        };

    }

    /* ==================================================
       DETECT CONDITION
    ================================================== */

    detectCondition(file) {

        return {

            condition:

                "Belum diketahui",

            confidence: 0

        };

    }

    /* ==================================================
       OCR PLACEHOLDER
    ================================================== */

    detectText(file) {

        return {

            text: ""

        };

    }

    /* ==================================================
       QR PLACEHOLDER
    ================================================== */

    detectQRCode(file) {

        return {

            found: false,

            value: null

        };

    }

    /* ==================================================
       AI ANALYSIS
    ================================================== */

    async analyzeWithAI(file) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Vision dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Analisis gambar aset sekolah."

            },

            {

                role: "user",

                content:

                    "Analisis gambar inventaris."

            }

        ]);

    }

}

const visionService =

    new VisionService();

export default visionService;

export {

    VisionService

};
