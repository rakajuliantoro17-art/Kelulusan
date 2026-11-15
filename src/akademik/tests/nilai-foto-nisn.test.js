"use strict";
// Foto siswa di cek nilai publik hanya bila NIS + NISN cocok; QR tidak pernah ikut.
const assert = require("assert");
const root = require("path").join(__dirname, "..", "api") + "/";
const gs = require(root + "_lib/gsheet");
gs.fetchSheetRows = async (n) => (n === gs.SHEET_NAMES.wajib
  ? [["h"], ["", "X-1", "123", "Budi", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] : []);
gs.resolveSheetId = () => "sid";
require(root + "_lib/siswa-sync").ambilSiswa = async () => ({
  list: [{ nis: "123", nama: "Budi", kelas: "X-1", foto: "http://f/1.jpg", nisn: "0012345678" }]
});
const nilai = require(root + "nilai.js");
const call = async (q, ip = "1.1.1.1") => {
  let out;
  await nilai({ query: q, headers: { "x-forwarded-for": ip } }, { setHeader() {}, status() { return this; }, json(b) { out = b; } });
  return out;
};
(async () => {
  let r = await call({ keyword: "123" });
  assert.strictEqual(r.data[0].foto, undefined);
  r = await call({ keyword: "123", nisn: "0012345678" });
  assert.strictEqual(r.data[0].foto, "http://f/1.jpg");
  assert.strictEqual(r.data[0].kode, undefined);
  r = await call({ keyword: "123", nisn: "9999999999" });
  assert.strictEqual(r.data[0].foto, undefined);
  assert.ok(r.fotoPesan);
  for (let i = 0; i < 8; i++) await call({ keyword: "123", nisn: "11111111" + i + "1" }, "2.2.2.2");
  r = await call({ keyword: "123", nisn: "0012345678" }, "2.2.2.2");
  assert.strictEqual(r.data[0].foto, undefined);
  console.log("nilai-foto-nisn ok");
})();
