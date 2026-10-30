/*
==========================================================
Sarprasin 2.0
Workflow Service
File : src/services/automation/workflow.service.js
Version : 2.0.0
==========================================================

Workflow Orchestrator

Phase 2
- n8n Cloud

Phase 3
- Internal Workflow

Phase 5
- AI Workflow

==========================================================
*/

import apiService from "../api/api.service.js";

import {

    N8N_WEBHOOK_URL

} from "../../config/env.js";

class WorkflowService {

    constructor() {

        this.baseUrl = N8N_WEBHOOK_URL || "";

    }

    /* ==================================================
       EXECUTE
    ================================================== */

    async execute(

        workflow,

        payload = {}

    ) {

        if (!this.baseUrl) {

            return {

                success: false,

                message:

                    "N8N webhook belum dikonfigurasi."

            };

        }

        return apiService.post(

            `${this.baseUrl}/${workflow}`,

            payload

        );

    }

    /* ==================================================
       BACKUP
    ================================================== */

    backup(data = {}) {

        return this.execute(

            "backup",

            data

        );

    }

    /* ==================================================
       RESTORE
    ================================================== */

    restore(data = {}) {

        return this.execute(

            "restore",

            data

        );

    }

    /* ==================================================
       MAINTENANCE
    ================================================== */

    maintenance(data = {}) {

        return this.execute(

            "maintenance",

            data

        );

    }

    /* ==================================================
       DAILY REPORT
    ================================================== */

    dailyReport(data = {}) {

        return this.execute(

            "daily-report",

            data

        );

    }

    /* ==================================================
       WEEKLY REPORT
    ================================================== */

    weeklyReport(data = {}) {

        return this.execute(

            "weekly-report",

            data

        );

    }

    /* ==================================================
       MONTHLY REPORT
    ================================================== */

    monthlyReport(data = {}) {

        return this.execute(

            "monthly-report",

            data

        );

    }

    /* ==================================================
       EMAIL
    ================================================== */

    email(data = {}) {

        return this.execute(

            "email",

            data

        );

    }

    /* ==================================================
       TELEGRAM
    ================================================== */

    telegram(data = {}) {

        return this.execute(

            "telegram",

            data

        );

    }

    /* ==================================================
       QR GENERATOR
    ================================================== */

    qr(data = {}) {

        return this.execute(

            "qr-generator",

            data

        );

    }

    /* ==================================================
       AI REPORT
    ================================================== */

    aiReport(data = {}) {

        return this.execute(

            "ai-report",

            data

        );

    }

    /* ==================================================
       AI SUMMARY
    ================================================== */

    aiSummary(data = {}) {

        return this.execute(

            "ai-summary",

            data

        );

    }

    /* ==================================================
       AI MAINTENANCE
    ================================================== */

    aiMaintenance(data = {}) {

        return this.execute(

            "ai-maintenance",

            data

        );

    }

    /* ==================================================
       CUSTOM
    ================================================== */

    custom(

        workflow,

        payload

    ) {

        return this.execute(

            workflow,

            payload

        );

    }

}

const workflowService =

    new WorkflowService();

export default workflowService;

export {

    WorkflowService

};
