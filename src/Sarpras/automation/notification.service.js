/*
==========================================================
Sarprasin 2.0
Notification Service
File : src/services/automation/notification.service.js
Version : 2.0.0
==========================================================

Notification Orchestrator

Supported Channels

- Email
- Telegram
- WhatsApp
- Discord
- Push Notification
- SMS

Delivery dilakukan oleh n8n Cloud.

==========================================================
*/

import workflowService from "./workflow.service.js";

class NotificationService {

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
       SEND
    ================================================== */

    async send(payload = {}) {

        if (!this.enabled) {

            return {

                success: false,

                message:

                    "Notification dinonaktifkan."

            };

        }

        return workflowService.custom(

            "notification",

            payload

        );

    }

    /* ==================================================
       EMAIL
    ================================================== */

    email({

        to,

        subject,

        message,

        data = {}

    }) {

        return workflowService.custom(

            "notification-email",

            {

                to,

                subject,

                message,

                data

            }

        );

    }

    /* ==================================================
       TELEGRAM
    ================================================== */

    telegram({

        chatId,

        message,

        data = {}

    }) {

        return workflowService.custom(

            "notification-telegram",

            {

                chatId,

                message,

                data

            }

        );

    }

    /* ==================================================
       WHATSAPP
    ================================================== */

    whatsapp({

        number,

        message,

        data = {}

    }) {

        return workflowService.custom(

            "notification-whatsapp",

            {

                number,

                message,

                data

            }

        );

    }

    /* ==================================================
       DISCORD
    ================================================== */

    discord({

        channel,

        message,

        data = {}

    }) {

        return workflowService.custom(

            "notification-discord",

            {

                channel,

                message,

                data

            }

        );

    }

    /* ==================================================
       PUSH
    ================================================== */

    push({

        title,

        body,

        token,

        data = {}

    }) {

        return workflowService.custom(

            "notification-push",

            {

                title,

                body,

                token,

                data

            }

        );

    }

    /* ==================================================
       SYSTEM
    ================================================== */

    system({

        title,

        message,

        level = "info",

        data = {}

    }) {

        return workflowService.custom(

            "notification-system",

            {

                title,

                message,

                level,

                data

            }

        );

    }

    /* ==================================================
       ASSET CREATED
    ================================================== */

    assetCreated(asset = {}) {

        return this.system({

            title:

                "Aset Baru",

            message:

                `${asset.name} berhasil ditambahkan.`,

            data: asset

        });

    }

    /* ==================================================
       MAINTENANCE
    ================================================== */

    maintenance(asset = {}) {

        return this.system({

            title:

                "Maintenance",

            message:

                `Maintenance dijadwalkan untuk ${asset.name}.`,

            data: asset

        });

    }

    /* ==================================================
       BACKUP
    ================================================== */

    backup(result = {}) {

        return this.system({

            title:

                "Backup",

            message:

                "Backup database selesai.",

            data: result

        });

    }

    /* ==================================================
       REPORT
    ================================================== */

    report(data = {}) {

        return this.system({

            title:

                "Laporan",

            message:

                "Laporan berhasil dibuat.",

            data

        });

    }

}

const notificationService =

    new NotificationService();

export default notificationService;

export {

    NotificationService

};
