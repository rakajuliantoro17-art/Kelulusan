/*
==========================================================
Sarprasin 2.0
Endpoint Service
File : src/services/api/endpoint.service.js
Version : 2.0.0
==========================================================
*/

class EndpointService {

    constructor() {

        /* ==========================================
           AUTH
        ========================================== */

        this.auth = {

            login:

                "/auth/login",

            logout:

                "/auth/logout",

            refresh:

                "/auth/refresh",

            profile:

                "/auth/profile",

            changePassword:

                "/auth/change-password",

            forgotPassword:

                "/auth/forgot-password"

        };

        /* ==========================================
           USERS
        ========================================== */

        this.users = {

            list:

                "/users",

            detail:

                id => `/users/${id}`,

            create:

                "/users",

            update:

                id => `/users/${id}`,

            delete:

                id => `/users/${id}`

        };

        /* ==========================================
           ASSETS
        ========================================== */

        this.assets = {

            list:

                "/assets",

            detail:

                id => `/assets/${id}`,

            create:

                "/assets",

            update:

                id => `/assets/${id}`,

            delete:

                id => `/assets/${id}`,

            upload:

                "/assets/upload",

            import:

                "/assets/import",

            export:

                "/assets/export"

        };

        /* ==========================================
           CATEGORY
        ========================================== */

        this.categories = {

            list:

                "/categories",

            create:

                "/categories",

            update:

                id => `/categories/${id}`,

            delete:

                id => `/categories/${id}`

        };

        /* ==========================================
           ROOMS
        ========================================== */

        this.rooms = {

            list:

                "/rooms",

            detail:

                id => `/rooms/${id}`

        };

        /* ==========================================
           MAINTENANCE
        ========================================== */

        this.maintenance = {

            list:

                "/maintenance",

            create:

                "/maintenance",

            update:

                id => `/maintenance/${id}`

        };

        /* ==========================================
           REPORT
        ========================================== */

        this.report = {

            summary:

                "/reports/summary",

            asset:

                "/reports/assets",

            maintenance:

                "/reports/maintenance",

            exportPdf:

                "/reports/export/pdf",

            exportExcel:

                "/reports/export/excel"

        };

        /* ==========================================
           DASHBOARD
        ========================================== */

        this.dashboard = {

            summary:

                "/dashboard",

            statistics:

                "/dashboard/statistics",

            charts:

                "/dashboard/charts"

        };

        /* ==========================================
           QR CODE
        ========================================== */

        this.qr = {

            generate:

                "/qr/generate",

            verify:

                "/qr/verify"

        };

        /* ==========================================
           FILE
        ========================================== */

        this.file = {

            upload:

                "/upload",

            delete:

                id => `/upload/${id}`

        };

        /* ==========================================
           AI
        ========================================== */

        this.ai = {

            assistant:

                "/ai/chat",

            vision:

                "/ai/vision",

            ocr:

                "/ai/ocr",

            embedding:

                "/ai/embedding",

            prediction:

                "/ai/predict",

            recommendation:

                "/ai/recommend"

        };

    }

}

const endpointService =

    new EndpointService();

export default endpointService;

export {

    EndpointService

};
