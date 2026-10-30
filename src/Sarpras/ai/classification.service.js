/*
==========================================================
Sarprasin 2.0
Classification Service
File : src/services/ai/classification.service.js
Version : 2.0.0
==========================================================
*/

import assistantService from "./assistant.service.js";

class ClassificationService {

    constructor() {

        this.useAI = false;

    }

    /* ==================================================
       ENABLE AI
    ================================================== */

    enableAI(value = true) {

        this.useAI = value;

    }

    /* ==================================================
       ASSET CATEGORY
    ================================================== */

    classifyAsset(asset = {}) {

        const name =

            (asset.name || "")

            .toLowerCase();

        if (name.includes("komputer")) {

            return "Komputer";

        }

        if (name.includes("laptop")) {

            return "Laptop";

        }

        if (name.includes("printer")) {

            return "Printer";

        }

        if (name.includes("proyektor")) {

            return "Proyektor";

        }

        if (name.includes("kursi")) {

            return "Furniture";

        }

        if (name.includes("meja")) {

            return "Furniture";

        }

        return "Lainnya";

    }

    /* ==================================================
       CONDITION
    ================================================== */

    classifyCondition(asset = {}) {

        const score =

            Number(asset.conditionScore ?? 100);

        if (score >= 90) {

            return "Sangat Baik";

        }

        if (score >= 75) {

            return "Baik";

        }

        if (score >= 60) {

            return "Cukup";

        }

        if (score >= 40) {

            return "Rusak Ringan";

        }

        return "Rusak Berat";

    }

    /* ==================================================
       PRIORITY
    ================================================== */

    classifyPriority(asset = {}) {

        const score =

            Number(asset.conditionScore ?? 100);

        if (score < 40) {

            return "Tinggi";

        }

        if (score < 70) {

            return "Sedang";

        }

        return "Rendah";

    }

    /* ==================================================
       MAINTENANCE
    ================================================== */

    classifyMaintenance(asset = {}) {

        const days =

            Number(asset.daysSinceService ?? 0);

        if (days > 365) {

            return "Segera Servis";

        }

        if (days > 180) {

            return "Jadwalkan";

        }

        return "Normal";

    }

    /* ==================================================
       AI CLASSIFICATION
    ================================================== */

    async classifyWithAI(data) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Classification dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Klasifikasikan data inventaris berikut."

            },

            {

                role: "user",

                content:

                    JSON.stringify(data)

            }

        ]);

    }

    /* ==================================================
       SUMMARY
    ================================================== */

    summarize(asset = {}) {

        return {

            category:

                this.classifyAsset(asset),

            condition:

                this.classifyCondition(asset),

            priority:

                this.classifyPriority(asset),

            maintenance:

                this.classifyMaintenance(asset)

        };

    }

}

const classificationService =

    new ClassificationService();

export default classificationService;

export {

    ClassificationService

};
