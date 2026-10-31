/**
 * Academic Portal dispatcher.
 * Keeps the original handler contracts while exposing module-scoped URLs.
 */
const HANDLERS = {
  kenaikan: () => require("../src/akademik/api/kenaikan"),
  kelulusan: () => require("../src/akademik/api/kelulusan"),
  nilai: () => require("../src/akademik/api/nilai"),
  "kelas-list": () => require("../src/akademik/api/kelas-list"),
  "kelas-summary": () => require("../src/akademik/api/kelas-summary"),
  stats: () => require("../src/akademik/api/stats"),
  "admin-auth": () => require("../src/akademik/api/admin-auth"),
  announcements: () => require("../src/akademik/api/announcements"),
  absensi: () => require("../src/akademik/api/absensi"),
  "absensi-rekap": () => require("../src/akademik/api/absensi-rekap"),
  "absensi-students": () => require("../src/akademik/api/absensi-students")
};

module.exports = async function akademikDispatcher(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const op = String((req.query && req.query.op) || "");
  const getHandler = HANDLERS[op];
  if (!getHandler) {
    return res.status(404).json({
      success: false,
      message: "Layanan Akademik tidak ditemukan."
    });
  }
  return getHandler()(req, res);
};
