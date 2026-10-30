/*
==========================================================
Sarprasin 2.0
Trigger Service
File : src/services/automation/trigger.service.js
Version : 2.0.0
==========================================================

Application Event Trigger Engine

==========================================================
*/

import workflowService from "./workflow.service.js";

class TriggerService {

    constructor() {

        this.enabled = true;

    }

    /* ==================================================
       CONFIG
    ================================================== */

    enable() {

        this.enabled = true;

    }

    disable() {

        this.enabled = false;

    }

    isEnabled() {

        return this.enabled;

    }

    /* ==================================================
       GENERIC TRIGGER
    ================================================== */

    async trigger(event, payload = {}) {

        if (!this.enabled) {

            return {

                success: false,

                message: "Automation dinonaktifkan."

            };

        }

        switch (event) {

            case "asset.created":

                return workflowService.custom(

                    "asset-created",

                    payload

                );

            case "asset.updated":

                return workflowService.custom(

                    "asset-updated",

                    payload

                );

            case "asset.deleted":

                return workflowService.custom(

                    "asset-deleted",

                    payload

                );

            case "maintenance.created":

                return workflowService.maintenance(

                    payload

                );

            case "backup":

                return workflowService.backup(

                    payload

                );

            case "daily.report":

                return workflowService.dailyReport(

                    payload

                );

            case "weekly.report":

                return workflowService.weeklyReport(

                    payload

                );

            case "monthly.report":

                return workflowService.monthlyReport(

                    payload

                );

            case "notification.email":

                return workflowService.email(

                    payload

                );

            case "notification.telegram":

                return workflowService.telegram(

                    payload

                );

            case "ai.report":

                return workflowService.aiReport(

                    payload

                );

            case "ai.summary":

                return workflowService.aiSummary(

                    payload

                );

            case "ai.maintenance":

                return workflowService.aiMaintenance(

                    payload

                );

            default:

                return {

                    success: false,

                    message:

                        `Event "${event}" belum terdaftar.`

                };

        }

    }

    /* ==================================================
       SHORTCUT
    ================================================== */

    assetCreated(payload) {

        return this.trigger(

            "asset.created",

            payload

        );

    }

    assetUpdated(payload) {

        return this.trigger(

            "asset.updated",

            payload

        );

    }

    assetDeleted(payload) {

        return this.trigger(

            "asset.deleted",

            payload

        );

    }

    backup(payload = {}) {

        return this.trigger(

            "backup",

            payload

        );

    }

    maintenance(payload = {}) {

        return this.trigger(

            "maintenance.created",

            payload

        );

    }

    dailyReport(payload = {}) {

        return this.trigger(

            "daily.report",

            payload

        );

    }

    weeklyReport(payload = {}) {

        return this.trigger(

            "weekly.report",

            payload

        );

    }

    monthlyReport(payload = {}) {

        return this.trigger(

            "monthly.report",

            payload

        );

    }

}

const triggerService = new TriggerService();

export default triggerService;

export {

    TriggerService

};
