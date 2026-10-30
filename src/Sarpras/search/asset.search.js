/*
==========================================================
Sarprasin 2.0
Asset Search Service
File : src/services/search/asset.search.js
Version : 2.0.0
==========================================================
*/

class AssetSearchService {

    /* ==========================================
       SEARCH
    ========================================== */

    search(

        assets = [],

        keyword = ""

    ) {

        if (!keyword?.trim()) {

            return assets;

        }

        const query = keyword

            .toLowerCase()

            .trim();

        return assets.filter(asset =>

            Object.values(asset)

                .some(value =>

                    String(value)

                        .toLowerCase()

                        .includes(query)

                )

        );

    }

    /* ==========================================
       FILTER
    ========================================== */

    filter(

        assets = [],

        filters = {}

    ) {

        return assets.filter(asset => {

            return Object.entries(filters)

                .every(([key, value]) => {

                    if (

                        value === "" ||

                        value === null ||

                        value === undefined

                    ) {

                        return true;

                    }

                    return asset[key] === value;

                });

        });

    }

    /* ==========================================
       SORT
    ========================================== */

    sort(

        assets = [],

        field,

        direction = "asc"

    ) {

        return [...assets].sort((a, b) => {

            if (a[field] < b[field])

                return direction === "asc"

                    ? -1

                    : 1;

            if (a[field] > b[field])

                return direction === "asc"

                    ? 1

                    : -1;

            return 0;

        });

    }

    /* ==========================================
       PAGINATION
    ========================================== */

    paginate(

        assets = [],

        page = 1,

        limit = 20

    ) {

        const start =

            (page - 1) * limit;

        return {

            total: assets.length,

            page,

            limit,

            pages: Math.ceil(

                assets.length / limit

            ),

            data: assets.slice(

                start,

                start + limit

            )

        };

    }

}

const assetSearchService =

    new AssetSearchService();

export default assetSearchService;

export {

    AssetSearchService

};
