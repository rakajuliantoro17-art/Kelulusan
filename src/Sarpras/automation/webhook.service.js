/*
==========================================================
Sarprasin 2.0
Webhook Service
File : src/services/automation/webhook.service.js
Version : 2.0.0
==========================================================

Webhook Gateway

Supported

- n8n
- Google Apps Script
- Firebase Functions
- Node API
- Discord
- Telegram
- Custom Webhook

==========================================================
*/

import apiService from "../api/api.service.js";

import {

    N8N_WEBHOOK_URL,
    APPS_SCRIPT_WEBHOOK_URL,
    FIREBASE_FUNCTION_URL

} from "../../config/env.js";

class WebhookService {

    constructor() {

        this.endpoints = {

            n8n:

                N8N_WEBHOOK_URL || "",

            appsScript:

                APPS_SCRIPT_WEBHOOK_URL || "",

            firebase:

                FIREBASE_FUNCTION_URL || ""

        };

    }

    /* ==================================================
       SEND
    ================================================== */

    async send(url, payload = {}) {

        if (!url) {

            return {

                success: false,

                message:

                    "Webhook URL belum dikonfigurasi."

            };

        }

        return apiService.post(

            url,

            payload

        );

    }

    /* ==================================================
       N8N
    ================================================== */

    n8n(

        workflow,

        payload = {}

    ) {

        return this.send(

            `${this.endpoints.n8n}/${workflow}`,

            payload

        );

    }

    /* ==================================================
       APPS SCRIPT
    ================================================== */

    appsScript(payload = {}) {

        return this.send(

            this.endpoints.appsScript,

            payload

        );

    }

    /* ==================================================
       FIREBASE
    ================================================== */

    firebase(

        functionName,

        payload = {}

    ) {

        return this.send(

            `${this.endpoints.firebase}/${functionName}`,

            payload

        );

    }

    /* ==================================================
       CUSTOM
    ================================================== */

    custom(

        url,

        payload = {}

    ) {

        return this.send(

            url,

            payload

        );

    }

    /* ==================================================
       TEST
    ================================================== */

    async ping(url) {

        try {

            const response =

                await apiService.get(url);

            return {

                success:

                    response.success,

                status:

                    response.status

            };

        }

        catch {

            return {

                success: false,

                status: 0

            };

        }

    }

    /* ==================================================
       HEALTH CHECK
    ================================================== */

    async health() {

        const result = {};

        result.n8n =

            await this.ping(

                this.endpoints.n8n

            );

        result.appsScript =

            await this.ping(

                this.endpoints.appsScript

            );

        result.firebase =

            await this.ping(

                this.endpoints.firebase

            );

        return result;

    }

}

const webhookService =

    new WebhookService();

export default webhookService;

export {

    WebhookService

};
