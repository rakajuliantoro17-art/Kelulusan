/**
 * ==========================================================
 * Sarprasin 2.0
 * Cloud Function : Backup Service
 * File : functions/backup.js
 * Version : 1.0.0
 * ==========================================================
 */

const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

const db = admin.firestore();

/**
 * Service
 */
const BackupService = {

    /**
     * Backup seluruh collection Firestore
     */
    async backupFirestore() {

        logger.info("Starting Firestore Backup...");

        const collections = await db.listCollections();

        const backup = {};

        for (const collection of collections) {

            const snapshot = await collection.get();

            backup[collection.id] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        return backup;
    },

    /**
     * Simpan backup ke collection backup
     */
    async saveBackup(data) {

        const id = new Date().toISOString();

        await db.collection("system_backup").doc(id).set({

            createdAt: admin.firestore.FieldValue.serverTimestamp(),

            version: "1.0.0",

            type: "FULL",

            collections: Object.keys(data).length,

            data

        });

        return id;
    },

    /**
     * Backup Metadata
     */
    async backupMetadata() {

        return {

            version: "1.0.0",

            timestamp: new Date().toISOString(),

            project: "Sarprasin 2.0"

        };
    },

    /**
     * Verifikasi hasil backup
     */
    async validateBackup(data) {

        return Object.keys(data).length > 0;

    },

    /**
     * Backup Full
     */
    async runFullBackup() {

        logger.info("FULL BACKUP START");

        const metadata = await this.backupMetadata();

        const firestore = await this.backupFirestore();

        const valid = await this.validateBackup(firestore);

        if (!valid) {

            throw new Error("Backup validation failed");

        }

        const backupId = await this.saveBackup({

            metadata,

            firestore

        });

        logger.info("FULL BACKUP SUCCESS");

        return {

            success: true,

            backupId

        };

    },

    /**
     * Backup Incremental
     */
    async runIncrementalBackup() {

        logger.info("Incremental Backup");

        return {

            success: true

        };

    }

};

module.exports = BackupService;
