"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/pintuku/dashboard/tata-usaha.html", "utf8");
const dashboard = fs.readFileSync("src/pintuku/assets/js/tata-usaha-dashboard.js", "utf8");
const guard = fs.readFileSync("src/pintuku/assets/js/tu-auth.js", "utf8");
const frontOffice = fs.readFileSync("src/pintuku/assets/js/tata-usaha-front-office.js", "utf8");
const css = fs.readFileSync("src/pintuku/assets/css/tata-usaha-dashboard.css", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");

test("all spreadsheet roles have an explicit role-specific workspace", () => {
  for (const role of ["head_tu", "staff_tu", "receptionist", "fo_coordinator", "unit_officer", "principal"]) {
    assert.ok(dashboard.includes(role + ":"), "dashboard role config missing: " + role);
  }
  assert.match(dashboard, /Dashboard Kepala Tata Usaha/);
  assert.match(dashboard, /Ruang Kerja Staf Tata Usaha/);
  assert.match(dashboard, /Dashboard Front Office/);
  assert.match(dashboard, /Dashboard Koordinator Front Office/);
  assert.match(dashboard, /Dashboard Petugas Unit/);
  assert.match(dashboard, /Dashboard Eksekutif Tata Usaha/);
});

test("dashboard navigation, sections, and service tiles are explicitly role-filtered", () => {
  assert.match(html, /data-tu-nav="spreadsheet"/);
  assert.match(html, /data-tu-nav="front-office"/);
  assert.match(html, /data-tu-section="spreadsheet"/);
  assert.match(html, /data-tu-section="coordination"/);
  assert.match(html, /data-tu-service="front-office"/);
  assert.match(dashboard, /querySelectorAll\("\[data-tu-nav\]"\)/);
  assert.match(dashboard, /querySelectorAll\("\[data-tu-section\]"\)/);
  assert.match(dashboard, /querySelectorAll\("\[data-tu-service\]"\)/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});

test("workspace selection is derived from the signed session, not the query string", () => {
  assert.match(dashboard, /context\.roles\?\.\[0\]\?\.role_code/);
  assert.match(dashboard, /params\.set\("workspace",role\)/);
  assert.match(dashboard, /location\.replace\("\/tata-usaha\/login/);
});

test("sensitive TU pages are gated by authenticated role", () => {
  assert.match(guard, /\/tata-usaha\/akses/);
  assert.match(guard, /roles:\["head_tu"\]/);
  assert.match(guard, /\/tata-usaha\/front-office/);
  assert.match(guard, /"receptionist"/);
  assert.match(guard, /location\.replace\(target\)/);
});

test("front office UI recognizes the spreadsheet receptionist role", () => {
  assert.match(frontOffice, /"receptionist"/);
  assert.match(frontOffice, /context\.user\?\.nama/);
});

test("role-aware dashboard files are included in static build", () => {
  for (const file of [
    "src/pintuku/dashboard/tata-usaha.html",
    "src/pintuku/assets/js/tata-usaha-dashboard.js",
    "src/pintuku/assets/js/tu-auth.js",
    "src/pintuku/assets/css/tata-usaha-dashboard.css"
  ]) assert.ok(build.includes(file), "build requirement missing: " + file);
});
