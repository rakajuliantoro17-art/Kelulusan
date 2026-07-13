/**
 * ============================================================
 * SMANSASOO Graduation Portal
 * Service Worker
 * ------------------------------------------------------------
 * Version : 1.0.0
 * Status  : Production Ready (Phase 1)
 *
 * Author  : IT Team SMAN 1 Sooko Mojokerto
 * License : MIT
 * ============================================================
 *
 * ROADMAP
 *
 * Phase 1
 * ✔ Register Service Worker
 * ✔ Activate Immediately
 * ✔ Claim Existing Clients
 * ✔ Network Only Strategy
 *
 * Phase 1.5
 * □ Offline Page
 * □ Cache Assets
 * □ Cache HTML
 * □ Cache CSS
 * □ Cache JavaScript
 * □ Cache Audio
 * □ Cache Images
 *
 * Phase 2
 * □ Progressive Web App (PWA)
 * □ Install Prompt
 * □ Background Sync
 * □ Update Notification
 * □ Push Notification
 *
 * ============================================================
 */

"use strict";

/* ============================================================
   APPLICATION
============================================================ */

const APP_NAME = "SMANSASOO Graduation Portal";
const VERSION = "1.0.0";
const CACHE_NAME = `smansasoo-graduation-${VERSION}`;

/* ============================================================
   INSTALL
============================================================ */

self.addEventListener("install", (event) => {

    console.log(`[${APP_NAME}] Installing... (${VERSION})`);

    // Langsung aktif setelah install
    self.skipWaiting();

});

/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener("activate", (event) => {

    console.log(`[${APP_NAME}] Activated`);

    event.waitUntil(
        (async () => {

            // Mengambil alih seluruh tab yang sedang terbuka
            await self.clients.claim();

        })()
    );

});

/* ============================================================
   FETCH
============================================================ */

self.addEventListener("fetch", (event) => {

    // =========================================================
    // Phase 1
    // Semua request diteruskan ke jaringan.
    // Cache akan diaktifkan pada versi berikutnya.
    // =========================================================

    event.respondWith(fetch(event.request));

});

/* ============================================================
   MESSAGE
============================================================ */

self.addEventListener("message", (event) => {

    if (!event.data) return;

    switch (event.data) {

        case "skipWaiting":

            self.skipWaiting();
            break;

        default:
            break;

    }

});

/* ============================================================
   ERROR
============================================================ */

self.addEventListener("error", (event) => {

    console.error(`[${APP_NAME}]`, event.message);

});

/* ============================================================
   UNHANDLED REJECTION
============================================================ */

self.addEventListener("unhandledrejection", (event) => {

    console.error(`[${APP_NAME}]`, event.reason);

});

/* ============================================================
   END OF FILE
============================================================ */
