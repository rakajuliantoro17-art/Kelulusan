/*
==========================================================
Sarprasin 2.0
Backup Workflow Registry
File : src/services/automation/n8n/backup.workflow.js
Version : 2.0.0
==========================================================

Backup Workflow Registry

==========================================================
*/

export const BackupWorkflow = {

    /* ==========================================
       DATABASE
    ========================================== */

    database: {

        full:

            "backup-database-full",

        incremental:

            "backup-database-incremental",

        restore:

            "restore-database"

    },

    /* ==========================================
       FIRESTORE
    ========================================== */

    firestore: {

        export:

            "backup-firestore",

        import:

            "restore-firestore"

    },

    /* ==========================================
       STORAGE
    ========================================== */

    storage: {

        upload:

            "backup-storage",

        restore:

            "restore-storage"

    },

    /* ==========================================
       GOOGLE DRIVE
    ========================================== */

    drive: {

        upload:

            "backup-drive",

        restore:

            "restore-drive"

    },

    /* ==========================================
       REPORT
    ========================================== */

    reports: {

        archive:

            "backup-report-archive"

    },

    /* ==========================================
       LOG
    ========================================== */

    logs: {

        archive:

            "backup-log-archive"

    },

    /* ==========================================
       SETTINGS
    ========================================== */

    settings: {

        export:

            "backup-settings"

    },

    /* ==========================================
       AI
    ========================================== */

    ai: {

        knowledge:

            "backup-ai-knowledge",

        embeddings:

            "backup-ai-embeddings"

    },

    /* ==========================================
       COMPLETE SYSTEM
    ========================================== */

    system: {

        full:

            "backup-system-full"

    }

};

export default BackupWorkflow;
