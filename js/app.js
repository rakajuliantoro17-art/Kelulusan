/*
==========================================================
SMANSASOO Academic Portal
Application Bootstrap
Version : 2.0.0
==========================================================

Main Entry Point

Fungsi:
- Memulai aplikasi
- Memuat konfigurasi
- Registrasi Service Worker
- Melakukan Health Check API
- Menginisialisasi Search Module

Semua logika aplikasi berada pada module lain.
==========================================================
*/

"use strict";

/* ==========================================
   APPLICATION
========================================== */

const App = {

    async initialize() {

        console.info("====================================");
        console.info(CONFIG.APP_NAME);
        console.info(`Version : ${CONFIG.APP_VERSION}`);
        console.info("Initializing...");
        console.info("====================================");

        try {

            // Service Worker
            if ("serviceWorker" in navigator) {

                window.addEventListener("load", () => {

                    navigator.serviceWorker
                        .register("./sw.js")
                        .then(() => {

                            console.info("Service Worker Registered");

                        })
                        .catch((error) => {

                            console.warn("Service Worker Failed", error);

                        });

                });

            }

            // API Health Check
            if (window.API) {

                API.checkAPI()
                    .then(result => {

                        if (CONFIG.DEBUG) {

                            console.info("API Status :", result);

                        }

                    })
                    .catch(error => {

                        console.warn("API Error :", error);

                    });

            }

            // Search Module
            if (window.Search) {

                Search.initialize();

            }

            console.info("Application Ready");

        } catch (error) {

            console.error("Application Error :", error);

        }

    }

};

/* ==========================================
   START APPLICATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    App.initialize();

});

/* ==========================================
   EXPORT
========================================== */

window.App = App;
