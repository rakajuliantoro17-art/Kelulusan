"use strict";

/**
 * Dispatcher Kesiswaan/GDS untuk deployment portal terpadu.
 * Handler asli tetap berada di src/kesiswaan/api agar kontraknya terjaga.
 * Setiap handler tetap bertanggung jawab atas autentikasi dan otorisasi.
 */
const DIRECT = {
  "admin-auth": () => require("../src/kesiswaan/api/admin-auth"),
  "cek-poin": () => require("../src/kesiswaan/api/cek-poin"),
  dashboard: () => require("../src/kesiswaan/api/dashboard"),
  pelanggaran: () => require("../src/kesiswaan/api/pelanggaran"),
  pembinaan: () => require("../src/kesiswaan/api/pembinaan"),
  stats: () => require("../src/kesiswaan/api/stats"),
  surat: () => require("../src/kesiswaan/api/surat"),
  "tata-tertib": () => require("../src/kesiswaan/api/tata-tertib")
};
const SERVICE_OPS = new Set(["ai-catat", "eksekutif", "perapian", "qr", "ringkasan", "tanya", "walikelas"]);

module.exports = async function kesiswaanDispatcher(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const op = String((req.query && req.query.op) || "");
  if (Object.prototype.hasOwnProperty.call(DIRECT, op)) return DIRECT[op]()(req, res);
  if (SERVICE_OPS.has(op)) return require("../src/kesiswaan/api/layanan")(req, res);
  return res.status(404).json({ success: false, message: "Layanan Kesiswaan tidak ditemukan." });
};
