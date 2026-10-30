/*
==========================================================
Sarprasin 2.0
Asset Cache Service
File : src/services/cache/asset.cache.js
Version : 2.0.0
==========================================================
*/

const CACHE_KEY = "sarprasin.assets";
const META_KEY = "sarprasin.assets.meta";

const DEFAULT_TTL = 1000 * 60 * 10; // 10 menit

class AssetCache {

    constructor(ttl = DEFAULT_TTL) {

        this.ttl = ttl;

    }

    /* ==================================================
       SAVE
    ================================================== */

    save(data = []) {

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

    /* ==================================================
       GET
    ================================================== */

    get() {

        const raw = localStorage.getItem(

            CACHE_KEY

        );

        if (!raw) {

            return [];

        }

        try {

            return JSON.parse(raw);

        } catch {

            return [];

        }

    }

    /* ==================================================
       FIND
    ================================================== */

    find(id) {

        return this.get().find(

            item => item.id === id

        );

    }

    /* ==================================================
       ADD
    ================================================== */

    add(asset) {

        const assets = this.get();

        assets.push(asset);

        this.save(assets);

    }

    /* ==================================================
       UPDATE
    ================================================== */

    update(id, payload) {

        const assets = this.get();

        const index = assets.findIndex(

            item => item.id === id

        );

        if (index === -1) {

            return false;

        }

        assets[index] = {

            ...assets[index],

            ...payload

        };

        this.save(assets);

        return true;

    }

    /* ==================================================
       REMOVE
    ================================================== */

    remove(id) {

        const assets = this.get().filter(

            item => item.id !== id

        );

        this.save(assets);

    }

    /* ==================================================
       CLEAR
    ================================================== */

    clear() {

        localStorage.removeItem(

            CACHE_KEY

        );

        localStorage.removeItem(

            META_KEY

        );

    }

    /* ==================================================
       TTL
    ================================================== */

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

        } catch {

            return true;

        }

    }

    /* ==================================================
       INFO
    ================================================== */

    info() {

        const meta = JSON.parse(

            localStorage.getItem(

                META_KEY

            ) || "{}"

        );

        return {

            count: this.get().length,

            updatedAt: meta.updatedAt || null,

            expired: this.isExpired()

        };

    }

}

const assetCache = new AssetCache();

export default assetCache;

export {

    AssetCache

};
