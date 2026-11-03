"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const guard = fs.readFileSync("src/pintuku/assets/js/tu-auth.js", "utf8");
const login = fs.readFileSync("src/pintuku/assets/js/tu-login.js", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("TU auth endpoint only accepts POST for auth operations", () => {
  assert.match(api, /if \(req\.method !== "POST"\)/);
  assert.match(api, /op === "auth"/);
  assert.match(api, /action === "login"/);
  assert.match(api, /action === "refresh"/);
  assert.match(api, /action === "logout"/);
});

test("TU login validates bounded email and password input", () => {
  assert.match(api, /email\.length > 254/);
  assert.match(api, /password\.length > 256/);
  assert.match(api, /refreshToken\.length > 4096/);
});

test("TU workspace access requires an explicit TU business role", () => {
  assert.match(api, /const TU_ACCESS_ROLES = new Set/);
  assert.match(api, /TU_ACCESS_ROLES\.has\(role\.role_code\)/);
  assert.doesNotMatch(api, /role\.role_code !== "system_operator"/);
});

test("TU browser session is tab-scoped and never uses localStorage", () => {
  assert.match(guard, /sessionStorage\.setItem/);
  assert.match(guard, /sessionStorage\.removeItem/);
  assert.doesNotMatch(guard, /localStorage/);
  assert.match(guard, /action:"refresh"/);
});

test("TU login never stores credentials and uses same-origin auth endpoint", () => {
  assert.match(login, /fetch\("\/api\/tu\/auth"/);
  assert.match(login, /sessionStorage\.setItem\("pintuku-tu-session"/);
  assert.match(login, /password\.value=""/);
  assert.doesNotMatch(login, /localStorage/);
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
