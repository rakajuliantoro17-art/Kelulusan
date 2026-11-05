"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const auth = fs.readFileSync("src/TU/server/auth.js", "utf8");
const guard = fs.readFileSync("src/pintuku/assets/js/tu-auth.js", "utf8");
const login = fs.readFileSync("src/pintuku/assets/js/tu-login.js", "utf8");
const loginPage = fs.readFileSync("src/pintuku/dashboard/tata-usaha-login.html", "utf8");
const dashboard = fs.readFileSync("src/pintuku/assets/js/tata-usaha-dashboard.js", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("TU workspace login is handled before Supabase operational configuration", () => {
  assert.match(api, /if \(op === "auth"\)/);
  assert.match(api, /TU\/server\/auth/);
  assert.ok(api.indexOf('if (op === "auth")') < api.indexOf("const c = config();"));
});

test("TU account source is the private Pengguna tab in its own spreadsheet", () => {
  assert.match(auth, /GOOGLE_SHEET_ID_TU/);
  assert.match(auth, /Pengguna!A:F/);
  assert.match(auth, /unitCode/);
  assert.match(auth, /GOOGLE_SERVICE_ACCOUNT_EMAIL/);
  assert.match(auth, /GOOGLE_SERVICE_ACCOUNT_KEY/);
  assert.match(auth, /spreadsheets\.readonly/);
  assert.match(auth, /username/);
  assert.match(auth, /password/);
  assert.match(auth, /status/);
  assert.match(auth, /peran/);
});

test("TU session is signed, bounded to eight hours, and verified server-side", () => {
  assert.match(auth, /createHmac\("sha256"/);
  assert.match(auth, /8 \* 60 \* 60/);
  assert.match(auth, /TU_SESSION_SECRET/);
  assert.match(auth, /function verifyToken/);
  assert.match(auth, /async function resolveSession/);
  assert.match(auth, /currentRole !== payload\\.r/);
  assert.match(auth, /timingSafeEqual/);
});

test("TU role aliases map to known workspace roles", () => {
  for (const role of ["head_tu", "staff_tu", "receptionist", "fo_coordinator", "unit_officer", "principal"]) {
    assert.ok(auth.includes('"' + role + '"'), "missing role: " + role);
  }
});

test("TU login uses username and never calls Supabase Auth", () => {
  assert.match(loginPage, /Username akun/);
  assert.match(loginPage, /id="tuUsername"/);
  assert.doesNotMatch(loginPage, /Supabase Auth/);
  assert.match(login, /username:username\.value\.trim\(\)/);
  assert.match(login, /sessionStorage\.setItem\("pintuku-tu-session"/);
  assert.match(login, /workspace=/);
  assert.doesNotMatch(login, /localStorage/);
});

test("TU browser guard verifies the signed session and uses tab-scoped storage", () => {
  assert.match(guard, /sessionStorage\.setItem/);
  assert.match(guard, /sessionStorage\.removeItem/);
  assert.match(guard, /GET/);
  assert.match(guard, /\/api\/tu\/auth/);
  assert.doesNotMatch(guard, /refresh_token/);
  assert.doesNotMatch(guard, /localStorage\\s*\\./);
});

test("TU dashboard displays the authenticated account role", () => {
  assert.match(dashboard, /getContext/);
  assert.match(dashboard, /dataset\.tuRole/);
  assert.match(dashboard, /Kepala Tata Usaha/);
});

test("TU login routes and browser assets remain in deployment build", () => {
  assert.ok(routes.some(route => route.source === "/tata-usaha/login"));
  assert.ok(routes.some(route => route.source === "/api/tu/auth"));
  for (const file of [
    "src/pintuku/dashboard/tata-usaha-login.html",
    "src/pintuku/assets/css/tata-usaha-login.css",
    "src/pintuku/assets/js/tu-login.js",
    "src/pintuku/assets/js/tu-auth.js"
  ]) assert.ok(build.includes(file), "build requirement missing: " + file);
});
