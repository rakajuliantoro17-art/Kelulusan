/*
==========================================================
Sarprasin 2.0
Dashboard Cache Service
File : src/services/cache/dashboard.cache.js
Version : 2.0.0
==========================================================

Dashboard Cache Manager

Digunakan untuk menyimpan hasil agregasi dashboard
agar loading lebih cepat.

==========================================================
*/

const CACHE_KEY = "sarprasin.dashboard";
const META_KEY = "sarprasin.dashboard.meta";

const DEFAULT_TTL = 1000 * 60 * 5; // 5 menit

class DashboardCache {

    constructor(ttl = DEFAULT_TTL) {

        this.ttl = ttl;

    }

    /* ==========================================
       SAVE
    ========================================== */

    save(data = {}) {

        localStorage.setItem(

            CACHE_KEY,

            JSON.stringify(data)

        );

        localStorage.setItem(

            META_KEY,

            JSON.stringify({

                updatedAt: Date.now()

            })

        );

    }

    /* ==========================================
       GET
    ========================================== */

    get() {

        const raw = localStorage.getItem(

            CACHE_KEY

        );

        if (!raw) {

            return {};

        }

        try {

            return JSON.parse(raw);

        }

        catch {

            return {};

        }

    }

    /* ==========================================
       UPDATE
    ========================================== */

    update(partial = {}) {

        const current = this.get();

        this.save({

            ...current,

            ...partial

        });

    }

    /* ==========================================
       CLEAR
    ========================================== */

    clear() {

        localStorage.removeItem(

            CACHE_KEY

        );

        localStorage.removeItem(

            META_KEY

        );

    }

    /* ==========================================
       TTL
    ========================================== */

    isExpired() {

        const raw = localStorage.getItem(

            META_KEY

        );

        if (!raw) {

            return true;

        }

        try {

            const meta = JSON.parse(raw);

            return (

                Date.now() - meta.updatedAt

            ) > this.ttl;

        }

        catch {

            return true;

        }

    }

    /* ==========================================
       INFO
    ========================================== */

    info() {

        const raw = localStorage.getItem(

            META_KEY

        );

        let updatedAt = null;

        if (raw) {

            try {

                updatedAt = JSON.parse(raw).updatedAt;

            }

            catch {

                updatedAt = null;

            }

        }

        return {

            updatedAt,

            expired: this.isExpired(),

            size: JSON.stringify(

                this.get()

            ).length

        };

    }

}

const dashboardCache =

    new DashboardCache();

export default dashboardCache;

export {

    DashboardCache

};
