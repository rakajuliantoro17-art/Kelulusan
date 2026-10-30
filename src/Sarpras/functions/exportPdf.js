/**
 * ==========================================================
 * Sarprasin 2.0
 * Cloud Function : Export PDF
 * File : functions/exportPdf.js
 * Version : 1.0.0
 * ==========================================================
 */

const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Service
const ReportService = require("../src/services/core/report.service");

const db = admin.firestore();

const ExportPdf = {

    /**
     * Generate PDF Report
     */
    async generate(options = {}) {

        logger.info("PDF Export Started");

        const report = await ReportService.generateReport(options);

        const pdf = await this.createPdf(report);

        const url = await this.savePdf(pdf);

        logger.info("PDF Export Success");

        return {

            success: true,

            url,

            createdAt: new Date().toISOString()

        };

    },

    /**
     * Membuat PDF
     * (sementara masih placeholder)
     */
    async createPdf(report) {

        logger.info("Creating PDF...");

        return Buffer.from(JSON.stringify(report, null, 2));

    },

    /**
     * Simpan PDF ke Firebase Storage
     */
    async savePdf(buffer) {

        const bucket = admin.storage().bucket();

        const filename =
            `reports/report-${Date.now()}.pdf`;

        const file = bucket.file(filename);

        await file.save(buffer, {

            metadata: {

                contentType: "application/pdf"

            }

        });

        await file.makePublic().catch(() => {});

        return file.publicUrl();

    },

    /**
     * Generate Executive Report
     */
    async executive() {

        return this.generate({

            type: "executive"

        });

    },

    /**
     * Generate Asset Report
     */
    async assets() {

        return this.generate({

            type: "asset"

        });

    },

    /**
     * Generate Maintenance Report
     */
    async maintenance() {

        return this.generate({

            type: "maintenance"

        });

    }

};

module.exports = ExportPdf;
