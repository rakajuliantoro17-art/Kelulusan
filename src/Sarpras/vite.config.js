/*
==========================================================
SARPRASIN v2.0
Vite Configuration
File : vite.config.js
Version : 1.0.0

Vite secara default cuma build index.html di root.
Config ini memberitahu Vite bahwa halaman-halaman lain
di src/pages/ juga harus ikut di-build sebagai entry
terpisah (multi-page app).
==========================================================
*/

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({

    build: {

        rollupOptions: {

            input: {

                main: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "src/pages/login/index.html"),
                admin: resolve(__dirname, "src/pages/admin/index.html"),
                adminAsset: resolve(__dirname, "src/pages/admin/asset/index.html"),
                adminRuangan: resolve(__dirname, "src/pages/admin/ruangan/index.html"),
                adminMaintenance: resolve(__dirname, "src/pages/admin/maintenance/index.html"),
                adminLaporan: resolve(__dirname, "src/pages/admin/laporan/index.html"),
                adminUsers: resolve(__dirname, "src/pages/admin/users/index.html"),
                adminSettings: resolve(__dirname, "src/pages/admin/settings/index.html"),
                adminBangunan: resolve(__dirname, "src/pages/admin/bangunan/index.html"),
                adminPengadaan: resolve(__dirname, "src/pages/admin/pengadaan/index.html"),
                adminImpor: resolve(__dirname, "src/pages/admin/impor/index.html"),
                adminKir: resolve(__dirname, "src/pages/admin/kir/index.html"),
                executive: resolve(__dirname, "src/pages/executive/index.html"),
                user: resolve(__dirname, "src/pages/user/index.html")


            }

        }

    }

});
