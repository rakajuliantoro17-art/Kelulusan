/*
==========================================================
Sarprasin 2.0
Prediction Service
File : src/services/ai/prediction.service.js
Version : 2.0.0
==========================================================
*/

import assistantService from "./assistant.service.js";

class PredictionService {

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
       CONDITION SCORE
    ================================================== */

    predictCondition(asset = {}) {

        const age = Number(asset.age ?? 0);

        const maintenance = Number(

            asset.maintenanceCount ?? 0

        );

        let score = 100;

        score -= age * 3;

        score += maintenance * 2;

        score = Math.max(

            0,

            Math.min(score, 100)

        );

        return {

            score,

            level:

                this.conditionLevel(score)

        };

    }

    /* ==================================================
       REPLACEMENT
    ================================================== */

    predictReplacement(asset = {}) {

        const age = Number(asset.age ?? 0);

        const score =

            this.predictCondition(asset).score;

        if (age >= 10 || score < 30) {

            return "Segera Diganti";

        }

        if (age >= 7 || score < 50) {

            return "Perlu Perencanaan";

        }

        if (age >= 5) {

            return "Pantau";

        }

        return "Belum Perlu";

    }

    /* ==================================================
       MAINTENANCE
    ================================================== */

    predictMaintenance(asset = {}) {

        const days = Number(

            asset.daysSinceService ?? 0

        );

        if (days > 365) {

            return "Segera Servis";

        }

        if (days > 180) {

            return "Jadwalkan";

        }

        return "Normal";

    }

    /* ==================================================
       PROCUREMENT
    ================================================== */

    predictProcurement(asset = {}) {

        const replacement =

            this.predictReplacement(asset);

        return {

            recommended:

                replacement ===

                "Segera Diganti",

            priority:

                replacement

        };

    }

    /* ==================================================
       RISK
    ================================================== */

    predictRisk(asset = {}) {

        const condition =

            this.predictCondition(asset).score;

        if (condition < 30) {

            return "Tinggi";

        }

        if (condition < 60) {

            return "Sedang";

        }

        return "Rendah";

    }

    /* ==================================================
       AI
    ================================================== */

    async predictWithAI(data) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Prediction dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Prediksi kondisi dan kebutuhan aset."

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

            condition:

                this.predictCondition(asset),

            maintenance:

                this.predictMaintenance(asset),

            replacement:

                this.predictReplacement(asset),

            procurement:

                this.predictProcurement(asset),

            risk:

                this.predictRisk(asset)

        };

    }

    /* ==================================================
       LEVEL
    ================================================== */

    conditionLevel(score) {

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

}

const predictionService =

    new PredictionService();

export default predictionService;

export {

    PredictionService

};
