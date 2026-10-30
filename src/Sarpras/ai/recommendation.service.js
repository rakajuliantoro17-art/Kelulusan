/*
==========================================================
Sarprasin 2.0
Recommendation Service
File : src/services/ai/recommendation.service.js
Version : 2.0.0
==========================================================

Recommendation Engine

Phase 2 :
- Rule Based

Phase 5 :
- Hybrid AI

Phase 6 :
- Machine Learning Recommendation

==========================================================
*/

import assistantService from "./assistant.service.js";

class RecommendationService {

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
       MAINTENANCE
    ================================================== */

    maintenance(asset = {}) {

        const score =

            Number(asset.conditionScore ?? 100);

        const days =

            Number(asset.daysSinceService ?? 0);

        if (score < 40) {

            return {

                priority: "TINGGI",

                action: "Segera lakukan perbaikan atau penggantian aset."

            };

        }

        if (days > 365) {

            return {

                priority: "TINGGI",

                action: "Jadwalkan maintenance secepatnya."

            };

        }

        if (days > 180) {

            return {

                priority: "SEDANG",

                action: "Masukkan ke jadwal maintenance berikutnya."

            };

        }

        return {

            priority: "RENDAH",

            action: "Aset dalam kondisi normal."

        };

    }

    /* ==================================================
       PROCUREMENT
    ================================================== */

    procurement(asset = {}) {

        const age =

            Number(asset.age ?? 0);

        if (age >= 10) {

            return {

                recommended: true,

                action:

                    "Disarankan mengajukan pengadaan aset baru."

            };

        }

        if (age >= 7) {

            return {

                recommended: true,

                action:

                    "Mulai rencanakan penggantian aset."

            };

        }

        return {

            recommended: false,

            action:

                "Belum diperlukan pengadaan."

        };

    }

    /* ==================================================
       INVENTORY
    ================================================== */

    inventory(asset = {}) {

        if (!asset.location) {

            return {

                priority: "SEDANG",

                action:

                    "Lengkapi informasi lokasi aset."

            };

        }

        if (!asset.assetCode) {

            return {

                priority: "TINGGI",

                action:

                    "Generate kode inventaris."

            };

        }

        if (!asset.qrCode) {

            return {

                priority: "SEDANG",

                action:

                    "Generate QR Code."

            };

        }

        return {

            priority: "RENDAH",

            action:

                "Data inventaris sudah lengkap."

        };

    }

    /* ==================================================
       REPORT
    ================================================== */

    report(summary = {}) {

        const recommendations = [];

        if (

            summary.damagedAssets > 0

        ) {

            recommendations.push(

                "Prioritaskan perbaikan aset rusak."

            );

        }

        if (

            summary.expiredMaintenance > 0

        ) {

            recommendations.push(

                "Susun jadwal maintenance."

            );

        }

        if (

            summary.missingQr > 0

        ) {

            recommendations.push(

                "Lengkapi QR Code seluruh aset."

            );

        }

        if (

            recommendations.length === 0

        ) {

            recommendations.push(

                "Seluruh indikator berada dalam kondisi baik."

            );

        }

        return recommendations;

    }

    /* ==================================================
       DASHBOARD
    ================================================== */

    dashboard(summary = {}) {

        return {

            maintenance:

                this.report(summary),

            generatedAt:

                new Date()

        };

    }

    /* ==================================================
       AI
    ================================================== */

    async recommendWithAI(data) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Recommendation dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Berikan rekomendasi pengelolaan aset sekolah."

            },

            {

                role: "user",

                content:

                    JSON.stringify(data)

            }

        ]);

    }

}

const recommendationService =

    new RecommendationService();

export default recommendationService;

export {

    RecommendationService

};
