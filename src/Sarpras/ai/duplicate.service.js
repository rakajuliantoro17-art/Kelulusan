/*
==========================================================
Sarprasin 2.0
Duplicate Detection Service
File : src/services/ai/duplicate.service.js
Version : 2.0.0
==========================================================
*/

import assistantService from "./assistant.service.js";

class DuplicateService {

    constructor() {

        this.useAI = false;

        this.threshold = 0.85;

    }

    /* ==================================================
       CONFIG
    ================================================== */

    enableAI(value = true) {

        this.useAI = value;

    }

    setThreshold(value = 0.85) {

        this.threshold = value;

    }

    /* ==================================================
       NORMALIZE
    ================================================== */

    normalize(text = "") {

        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
            .replace(/[^\w\s]/g, "");

    }

    /* ==================================================
       STRING SIMILARITY
    ================================================== */

    similarity(a = "", b = "") {

        a = this.normalize(a);

        b = this.normalize(b);

        if (a === b) {

            return 1;

        }

        if (!a.length || !b.length) {

            return 0;

        }

        const longer =
            a.length > b.length ? a : b;

        const shorter =
            a.length > b.length ? b : a;

        let same = 0;

        for (const word of shorter.split(" ")) {

            if (longer.includes(word)) {

                same++;

            }

        }

        return same /

            Math.max(

                shorter.split(" ").length,

                1

            );

    }

    /* ==================================================
       DUPLICATE
    ================================================== */

    isDuplicate(assetA, assetB) {

        const score = this.score(

            assetA,

            assetB

        );

        return score >= this.threshold;

    }

    /* ==================================================
       SCORE
    ================================================== */

    score(assetA, assetB) {

        const nameScore =

            this.similarity(

                assetA.name,

                assetB.name

            );

        const roomScore =

            this.similarity(

                assetA.room,

                assetB.room

            );

        const codeScore =

            assetA.assetCode ===

            assetB.assetCode

                ? 1

                : 0;

        return (

            nameScore * 0.6 +

            roomScore * 0.2 +

            codeScore * 0.2

        );

    }

    /* ==================================================
       FIND
    ================================================== */

    findDuplicates(

        target,

        collection = []

    ) {

        return collection

            .map(item => ({

                item,

                score: this.score(

                    target,

                    item

                )

            }))

            .filter(

                result =>

                    result.score >=

                    this.threshold

            )

            .sort(

                (a, b) =>

                    b.score -

                    a.score

            );

    }

    /* ==================================================
       AI
    ================================================== */

    async detectWithAI(asset) {

        if (!this.useAI) {

            return {

                success: false,

                message:

                    "AI Duplicate Detection dinonaktifkan."

            };

        }

        return assistantService.chat([

            {

                role: "system",

                content:

                    "Analisis kemungkinan aset duplikat."

            },

            {

                role: "user",

                content:

                    JSON.stringify(asset)

            }

        ]);

    }

}

const duplicateService =

    new DuplicateService();

export default duplicateService;

export {

    DuplicateService

};
