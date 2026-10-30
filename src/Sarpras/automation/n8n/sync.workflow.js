/*
==========================================================
Sarprasin 2.0
Sync Workflow Registry
File : src/services/automation/n8n/sync.workflow.js
Version : 2.0.0
==========================================================

Synchronization Workflow Registry

==========================================================
*/

export const SyncWorkflow = {

    /* ==========================================
       USERS
    ========================================== */

    users: {

        push: "sync-users-push",

        pull: "sync-users-pull"

    },

    /* ==========================================
       ASSETS
    ========================================== */

    assets: {

        push: "sync-assets-push",

        pull: "sync-assets-pull"

    },

    /* ==========================================
       CATEGORIES
    ========================================== */

    categories: {

        push: "sync-categories-push",

        pull: "sync-categories-pull"

    },

    /* ==========================================
       ROOMS
    ========================================== */

    rooms: {

        push: "sync-rooms-push",

        pull: "sync-rooms-pull"

    },

    /* ==========================================
       MAINTENANCE
    ========================================== */

    maintenance: {

        push: "sync-maintenance-push",

        pull: "sync-maintenance-pull"

    },

    /* ==========================================
       REPORT
    ========================================== */

    reports: {

        push: "sync-report-push",

        pull: "sync-report-pull"

    },

    /* ==========================================
       DASHBOARD
    ========================================== */

    dashboard: {

        refresh: "dashboard-refresh"

    },

    /* ==========================================
       GOOGLE SHEETS
    ========================================== */

    spreadsheet: {

        export: "spreadsheet-export",

        import: "spreadsheet-import"

    },

    /* ==========================================
       FIRESTORE
    ========================================== */

    firestore: {

        export: "firestore-export",

        import: "firestore-import"

    },

    /* ==========================================
       GOOGLE DRIVE
    ========================================== */

    drive: {

        upload: "drive-upload",

        download: "drive-download"

    },

    /* ==========================================
       AI
    ========================================== */

    ai: {

        embedding: "ai-embedding-sync",

        recommendation: "ai-recommendation-sync",

        prediction: "ai-prediction-sync"

    }

};

export default SyncWorkflow;
