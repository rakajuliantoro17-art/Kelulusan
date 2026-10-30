/**
 * ==========================================================
 * Sarprasin 2.0
 * Cloud Function : Spreadsheet Synchronization
 * File : functions/syncSpreadsheet.js
 * Version : 1.0.0
 * ==========================================================
 */

const logger = require("firebase-functions/logger");

// Business Service
const SpreadsheetService = require("../src/services/sync/spreadsheet.service");

const SyncSpreadsheet = {

    /**
     * ======================================================
     * Full Synchronization
     * Firestore -> Spreadsheet
     * ======================================================
     */
    async full(options = {}) {

        logger.info("Starting Full Spreadsheet Synchronization...");

        try {

            const result =
                await SpreadsheetService.syncAll(options);

            logger.info("Full Synchronization Completed.");

            return {

                success: true,

                type: "FULL",

                timestamp: new Date().toISOString(),

                ...result

            };

        } catch (error) {

            logger.error(error);

            return {

                success: false,

                type: "FULL",

                message: error.message

            };

        }

    },

    /**
     * ======================================================
     * Incremental Synchronization
     * ======================================================
     */
    async incremental(options = {}) {

        logger.info("Starting Incremental Synchronization...");

        try {

            const result =
                await SpreadsheetService.syncIncremental(options);

            logger.info("Incremental Synchronization Completed.");

            return {

                success: true,

                type: "INCREMENTAL",

                timestamp: new Date().toISOString(),

                ...result

            };

        } catch (error) {

            logger.error(error);

            return {

                success: false,

                type: "INCREMENTAL",

                message: error.message

            };

        }

    },

    /**
     * ======================================================
     * Synchronize One Collection
     * ======================================================
     */
    async collection(collectionName) {

        logger.info(`Synchronizing Collection: ${collectionName}`);

        try {

            const result =
                await SpreadsheetService.syncCollection(collectionName);

            return {

                success: true,

                collection: collectionName,

                timestamp: new Date().toISOString(),

                ...result

            };

        } catch (error) {

            logger.error(error);

            return {

                success: false,

                collection: collectionName,

                message: error.message

            };

        }

    },

    /**
     * ======================================================
     * Validate Spreadsheet
     * ======================================================
     */
    async validate() {

        logger.info("Validating Spreadsheet...");

        try {

            const result =
                await SpreadsheetService.validate();

            return {

                success: true,

                ...result

            };

        } catch (error) {

            logger.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },

    /**
     * ======================================================
     * Scheduler Trigger
     * ======================================================
     */
    async scheduled() {

        logger.info("Scheduled Spreadsheet Sync Triggered");

        return await this.incremental();

    }

};

module.exports = SyncSpreadsheet;
