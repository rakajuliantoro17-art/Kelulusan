/*
==========================================================
Sarprasin 2.0
Report Workflow Registry
File : src/services/automation/n8n/report.workflow.js
Version : 2.0.0
==========================================================

Report Workflow Registry

==========================================================
*/

export const ReportWorkflow = {

    /* ==========================================
       DASHBOARD
    ========================================== */

    dashboard: {

        summary:

            "dashboard-summary",

        statistics:

            "dashboard-statistics"

    },

    /* ==========================================
       ASSET
    ========================================== */

    asset: {

        inventory:

            "report-asset-inventory",

        condition:

            "report-asset-condition",

        mutation:

            "report-asset-mutation",

        depreciation:

            "report-asset-depreciation"

    },

    /* ==========================================
       MAINTENANCE
    ========================================== */

    maintenance: {

        daily:

            "report-maintenance-daily",

        monthly:

            "report-maintenance-monthly",

        yearly:

            "report-maintenance-yearly"

    },

    /* ==========================================
       PROCUREMENT
    ========================================== */

    procurement: {

        summary:

            "report-procurement-summary"

    },

    /* ==========================================
       USERS
    ========================================== */

    users: {

        activity:

            "report-user-activity"

    },

    /* ==========================================
       EXPORT
    ========================================== */

    export: {

        pdf:

            "export-pdf",

        excel:

            "export-excel",

        csv:

            "export-csv"

    },

    /* ==========================================
       EMAIL
    ========================================== */

    email: {

        daily:

            "email-daily-report",

        weekly:

            "email-weekly-report",

        monthly:

            "email-monthly-report"

    },

    /* ==========================================
       AI
    ========================================== */

    ai: {

        summary:

            "ai-summary-report",

        prediction:

            "ai-prediction-report",

        recommendation:

            "ai-recommendation-report"

    }

};

export default ReportWorkflow;
