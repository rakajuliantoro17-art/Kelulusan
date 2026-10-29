/**
 * SMANSASOO Digital Portal — shared service worker.
 * Network-first pass-through while modules are being integrated.
 * Do not cache private API responses or student data.
 */
"use strict";

const APP_NAME = "SMANSASOO Digital Portal";
const VERSION = "0.2.0";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Remove only legacy caches owned by the former standalone graduation app.
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("smansasoo-graduation-")).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  // Preserve the existing network-only behavior. In particular, do not cache
  // authenticated API responses, student records, or sensitive school data.
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("error", (event) => console.error("[" + APP_NAME + "]", event.message));
self.addEventListener("unhandledrejection", (event) => console.error("[" + APP_NAME + "]", event.reason));
