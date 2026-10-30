/**
 * ==========================================================
 * Sarprasin 2.0
 * Cloud Function : Webhook Gateway
 * File : functions/webhook.js
 * Version : 1.0.0
 * ==========================================================
 */

const logger = require("firebase-functions/logger");

// Services
const SpreadsheetService = require("../src/services/sync/spreadsheet.service");
const BackupService = require("../src/services/sync/backup.service");
const MigrationService = require("../src/services/sync/migration.service");
const NotificationService = require("../src/services/core/notification.service");

const Webhook = {

    /**
     * Main Dispatcher
     */
    async handle(payload = {}) {

        try {

            logger.info("Incoming Webhook", payload);

            if (!payload.event) {

                return {

                    success: false,

                    message: "Missing event"

                };

            }

            switch (payload.event) {

                case "sync":

                    return await SpreadsheetService.syncAll(payload);

                case "backup":

                    return await BackupService.runFullBackup(payload);

                case "migration":

                    return await MigrationService.run(payload);

                case "notification":

                    return await NotificationService.send(payload);

                case "ping":

                    return {

                        success: true,

                        message: "Sarprasin Webhook Online",

                        timestamp: new Date().toISOString()

                    };

                default:

                    return {

                        success: false,

                        message: "Unknown event"

                    };

            }

        } catch (error) {

            logger.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },

    /**
     * Health Check
     */
    async health() {

        return {

            success: true,

            service: "Webhook Gateway",

            version: "1.0.0",

            timestamp: new Date().toISOString()

        };

    }

};

module.exports = Webhook;
