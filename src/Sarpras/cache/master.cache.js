/*
==========================================================
Sarprasin 2.0
Master Cache Manager
File : src/services/cache/master.cache.js
Version : 2.0.0
==========================================================
*/

import assetCache from "./asset.cache.js";
import dashboardCache from "./dashboard.cache.js";

class MasterCache {

    constructor() {

        this.caches = {

            asset: assetCache,

            dashboard: dashboardCache

        };

    }

    /* ==========================================
       REGISTER
    ========================================== */

    register(name, cache) {

        this.caches[name] = cache;

    }

    /* ==========================================
       GET CACHE
    ========================================== */

    get(name) {

        return this.caches[name] || null;

    }

    /* ==========================================
       CLEAR ALL
    ========================================== */

    clearAll() {

        Object.values(this.caches)

            .forEach(cache => {

                cache.clear();

            });

    }

    /* ==========================================
       INFO
    ========================================== */

    info() {

        const result = {};

        Object.entries(this.caches)

            .forEach(([key, cache]) => {

                if (

                    typeof cache.info === "function"

                ) {

                    result[key] =

                        cache.info();

                }

            });

        return result;

    }

    /* ==========================================
       EXPIRED
    ========================================== */

    expired() {

        const result = {};

        Object.entries(this.caches)

            .forEach(([key, cache]) => {

                if (

                    typeof cache.isExpired === "function"

                ) {

                    result[key] =

                        cache.isExpired();

                }

            });

        return result;

    }

    /* ==========================================
       REFRESH
    ========================================== */

    refresh() {

        Object.values(this.caches)

            .forEach(cache => {

                if (

                    typeof cache.clear === "function"

                ) {

                    cache.clear();

                }

            });

    }

}

const masterCache = new MasterCache();

export default masterCache;

export {

    MasterCache

};
