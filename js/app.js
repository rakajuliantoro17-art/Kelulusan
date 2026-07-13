/*
==========================================================
SMANSASOO Graduation Portal
Application Bootstrap
Version : 2.1.0
==========================================================

Main Entry Point

Fungsi:
- Memulai aplikasi
- Memuat konfigurasi
- Registrasi Service Worker
- Melakukan Health Check API
- Menginisialisasi Search Module

Semua logika aplikasi berada pada module lain.

FIX (v2.1.0):
- CONFIG.APP_VERSION -> CONFIG.VERSION (key APP_VERSION
  tidak pernah ada di config.js, jadi log version selama
  ini selalu tercetak "undefined").
- CONFIG.DEBUG -> CONFIG.ENABLE_CONSOLE_LOG (key DEBUG
  tidak pernah ada di config.js, jadi log "API Status"
  selama ini tidak pernah muncul walau health check sukses).
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
        console.info(`Version : ${CONFIG.VERSION}`);
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

                        if (CONFIG.ENABLE_CONSOLE_LOG) {

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
