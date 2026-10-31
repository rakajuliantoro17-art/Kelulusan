/**
 * Academic Portal dispatcher.
 * Keeps the original handler contracts while exposing module-scoped URLs.
 */
const HANDLERS = {
  kenaikan: () => require("../../akademik/api/kenaikan"),
  kelulusan: () => require("../../akademik/api/kelulusan"),
  nilai: () => require("../../akademik/api/nilai"),
  "kelas-list": () => require("../../akademik/api/kelas-list"),
  "kelas-summary": () => require("../../akademik/api/kelas-summary"),
  stats: () => require("../../akademik/api/stats"),
  "admin-auth": () => require("../../akademik/api/admin-auth"),
  announcements: () => require("../../akademik/api/announcements"),
  absensi: () => require("../../akademik/api/absensi"),
  "absensi-rekap": () => require("../../akademik/api/absensi-rekap"),
  "absensi-students": () => require("../../akademik/api/absensi-students")
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
