/*
==========================================================
Sarprasin 2.0
Validation Workflow Registry
File : src/services/automation/n8n/validation.workflow.js
Version : 2.0.0
==========================================================

Workflow Mapping
Validation -> n8n Workflow

==========================================================
*/

export const ValidationWorkflow = {

    /* ==========================================
       ASSET
    ========================================== */

    asset: {

        success:

            "asset-created",

        failed:

            "asset-validation-failed"

    },

    /* ==========================================
       IMPORT
    ========================================== */

    import: {

        success:

            "asset-import",

        failed:

            "asset-import-failed"

    },

    /* ==========================================
       MAINTENANCE
    ========================================== */

    maintenance: {

        success:

            "maintenance",

        failed:

            "maintenance-invalid"

    },

    /* ==========================================
       QR
    ========================================== */

    qr: {

        success:

            "qr-generator",

        failed:

            "qr-invalid"

    },

    /* ==========================================
       REPORT
    ========================================== */

    report: {

        success:

            "daily-report",

        failed:

            "report-invalid"

    },

    /* ==========================================
       AI
    ========================================== */

    ai: {

        success:

            "ai-summary",

        failed:

            "ai-validation"

    }

};

export default ValidationWorkflow;
