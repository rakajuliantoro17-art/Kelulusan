"use strict";

/*
 * Titik masuk fungsi serverless Vercel untuk Akademik.
 * Vercel hanya mendaftarkan fungsi dari direktori /api di root, jadi berkas ini sengaja
 * tipis: seluruh logika tetap di src/server/api/akademik.js.
 */
module.exports = require("../src/server/api/akademik.js");
