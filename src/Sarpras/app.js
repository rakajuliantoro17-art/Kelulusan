/**
 * ==========================================================
 * Sarprasin 2.0
 * Application Entry Point
 * File : src/app.js
 * Version : 1.0.0
 * ==========================================================
 */

import Config from "./config/index.js";

// Core Services
import AuthService from "./services/auth/auth.service.js";
import SessionService from "./services/auth/session.service.js";
import ProfileService from "./services/auth/profile.service.js";

// Core Modules
import AssetService from "./services/core/asset.service.js";
import MasterService from "./services/core/master.service.js";
import ReportService from "./services/core/report.service.js";
import UserService from "./services/core/user.service.js";

// Synchronization
import SpreadsheetService from "./services/sync/spreadsheet.service.js";

// Utilities
import Logger from "./utils/logger.js";

class SarprasinApp {

    constructor() {

        this.version = "2.0.0";
        this.name = "Sarprasin 2.0";

    }

    /**
     * ==========================================
     * Initialize Application
     * ==========================================
     */
    async init() {

        Logger.info(`${this.name} Starting...`);

        try {

            await Config.initialize();

            await this.initializeServices();

            await this.initializeSession();

            await this.initializeModules();

            this.registerGlobalEvents();

            Logger.success("Application Ready.");

        } catch (error) {

            Logger.error("Application Failed.", error);

        }

    }

    /**
     * ==========================================
     * Initialize Services
     * ==========================================
     */
    async initializeServices() {

        await AuthService.initialize();

        await ProfileService.initialize();

        await SpreadsheetService.initialize();

    }

    /**
     * ==========================================
     * Initialize Session
     * ==========================================
     */
    async initializeSession() {

        await SessionService.restore();

    }

    /**
     * ==========================================
     * Initialize Modules
     * ==========================================
     */
    async initializeModules() {

        await AssetService.initialize();

        await MasterService.initialize();

        await UserService.initialize();

        await ReportService.initialize();

    }

    /**
     * ==========================================
     * Register Browser Events
     * ==========================================
     */
    registerGlobalEvents() {

        window.addEventListener("online", () => {

            Logger.info("Connection Restored");

        });

        window.addEventListener("offline", () => {

            Logger.warn("Offline Mode");

        });

        window.addEventListener("beforeunload", () => {

            SessionService.save();

        });

    }

}

const app = new SarprasinApp();

app.init();

export default app;
