"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const sheet = fs.readFileSync("src/TU/api/sheets-auth.js", "utf8");
const guard = fs.readFileSync("src/pintuku/assets/js/tu-auth.js", "utf8");
const login = fs.readFileSync("src/pintuku/assets/js/tu-login.js", "utf8");
const loginPage = fs.readFileSync("src/pintuku/dashboard/tata-usaha-login.html", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("TU auth endpoint accepts only POST login and local logout", () => {
  assert.match(api, /if \(req\.method !== "POST"\)/);
  assert.match(api, /op === "auth"/);
  assert.match(api, /action === "login"/);
  assert.match(api, /action === "logout"/);
  assert.doesNotMatch(api, /action === "refresh"|verify-invite|set-invite-password|supabaseAuth/);
});

test("TU login validates bounded username and password input and signs HMAC sessions", () => {
  assert.match(api, /username\.length > 254/);
  assert.match(api, /password\.length > 256/);
  assert.match(api, /createHmac\("sha256", sessionSecret\(\)\)/);
  assert.match(api, /SESSION_TTL = 8 \* 60 \* 60/);
  assert.match(api, /TU_SESSION_SECRET/);
});

test("TU accounts and roles come only from the dedicated Pengguna spreadsheet", () => {
  assert.match(sheet, /GOOGLE_SHEET_ID_TU/);
  assert.match(sheet, /'Pengguna'!A:E/);
  assert.match(sheet, /Username/);
  assert.match(sheet, /Status/);
  assert.match(sheet, /kepala tu/i);
  assert.match(sheet, /return ACTIVE\.has\(status\) && !INACTIVE\.has\(status\)/);
  assert.match(sheet, /ROLE_ALIASES\.get\(key\) \|\| null/);
  assert.match(api, /tuSheetAuth\.authenticatePassword/);
  assert.match(api, /tuSheetAuth\.findActiveUser/);
});

test("TU workspace authorization revalidates the spreadsheet on protected requests", () => {
  assert.match(api, /const TU_ACCESS_ROLES = new Set/);
  assert.match(api, /TU_ACCESS_ROLES\.has\(role\.role_code\)/);
  assert.match(api, /await tuSheetAuth\.findActiveUser\(payload\.u\)/);
  assert.match(api, /await ensureStaffIdentity\(c, user\)/);
  assert.doesNotMatch(api, /\/auth\/v1\/user|\/auth\/v1\/token|supabaseAuth/);
});

test("TU browser session is tab-scoped and does not depend on refresh tokens", () => {
  assert.match(guard, /sessionStorage\.setItem/);
  assert.match(guard, /sessionStorage\.removeItem/);
  assert.doesNotMatch(guard, /localStorage\s*\./);
  assert.doesNotMatch(guard, /refresh_token|action:"refresh"/);
});

test("TU login accepts the spreadsheet Username and uses the same-origin endpoint", () => {
  assert.match(login, /fetch\("\/api\/tu\/auth"/);
  assert.match(login, /sessionStorage\.setItem\("pintuku-tu-session"/);
  assert.match(login, /password\.value=""/);
  assert.doesNotMatch(login, /localStorage/);
  assert.match(loginPage, /Username \/ email akun/);
  assert.match(loginPage, /type="text" inputmode="email"/);
});

test("TU login routes and assets are included in deployment build", () => {
  assert.ok(routes.some(route => route.source === "/tata-usaha/login"));
  assert.ok(routes.some(route => route.source === "/api/tu/auth"));
  for (const file of [
    "src/pintuku/dashboard/tata-usaha-login.html",
    "src/pintuku/assets/css/tata-usaha-login.css",
    "src/pintuku/assets/js/tu-login.js",
    "src/pintuku/assets/js/tu-auth.js"
  ]) assert.ok(build.includes(file), "build requirement missing: " + file);
});
