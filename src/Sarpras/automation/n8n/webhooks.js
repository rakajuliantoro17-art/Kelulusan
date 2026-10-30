/*
==========================================================
Sarprasin 2.0
n8n Webhook Registry
File : src/services/automation/n8n/webhooks.js
Version : 2.0.0
==========================================================
*/

import { N8N_WEBHOOK_URL } from "../../../config/env.js";

/* ======================================================
   BASE URL
====================================================== */

const BASE = (N8N_WEBHOOK_URL || "").replace(/\/$/, "");

/* ======================================================
   HELPER
====================================================== */

const build = (path) => `${BASE}/${path}`;

/* ======================================================
   WEBHOOKS
====================================================== */

export const WEBHOOKS = {

    /* ===============================
       BACKUP
    =============================== */

    BACKUP: build("backup"),

    RESTORE: build("restore"),

    /* ===============================
       REPORT
    =============================== */

    DAILY_REPORT: build("daily-report"),

    WEEKLY_REPORT: build("weekly-report"),

    MONTHLY_REPORT: build("monthly-report"),

    /* ===============================
       ASSET
    =============================== */

    ASSET_CREATED: build("asset-created"),

    ASSET_UPDATED: build("asset-updated"),

    ASSET_DELETED: build("asset-deleted"),

    /* ===============================
       MAINTENANCE
    =============================== */

    MAINTENANCE: build("maintenance"),

    /* ===============================
       QR
    =============================== */

    QR_GENERATOR: build("qr-generator"),

    /* ===============================
       NOTIFICATION
    =============================== */

    EMAIL: build("notification-email"),

    TELEGRAM: build("notification-telegram"),

    WHATSAPP: build("notification-whatsapp"),

    DISCORD: build("notification-discord"),

    PUSH: build("notification-push"),

    SYSTEM: build("notification-system"),

    /* ===============================
       AI
    =============================== */

    AI_REPORT: build("ai-report"),

    AI_SUMMARY: build("ai-summary"),

    AI_MAINTENANCE: build("ai-maintenance"),

    AI_CHAT: build("ai-chat"),

    AI_VISION: build("ai-vision"),

    AI_RECOMMENDATION: build("ai-recommendation")

};

/* ======================================================
   HELPER
====================================================== */

export function getWebhook(name) {

    return WEBHOOKS[name] || null;

}

export default WEBHOOKS;
