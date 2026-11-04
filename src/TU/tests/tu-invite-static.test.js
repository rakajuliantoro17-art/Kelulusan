"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const page = fs.readFileSync("src/pintuku/dashboard/tata-usaha-accept-invite.html", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("legacy Supabase invitation actions are no longer accepted by TU auth API", () => {
  assert.doesNotMatch(api, /action === "verify-invite"|action === "set-invite-password"|supabaseAuth/);
  assert.match(api, /action !== "login"/);
});

test("legacy invite page clearly directs staff to spreadsheet-based account administration", () => {
  assert.match(page, /Alur undangan Supabase sudah tidak digunakan/);
  assert.match(page, /Spreadsheet Pengguna TU/);
  assert.match(page, /\/tata-usaha\/login/);
  assert.doesNotMatch(page, /tu-invite\.js/);
});

test("legacy route remains harmless and static assets remain buildable", () => {
  assert.ok(routes.some(route => route.source === "/tata-usaha/accept-invite"));
  for (const file of [
    "src/pintuku/dashboard/tata-usaha-accept-invite.html",
    "src/pintuku/assets/css/tu-invite.css",
    "src/pintuku/assets/js/tu-invite.js"
  ]) assert.ok(build.includes(file), "build requirement missing: " + file);
});
