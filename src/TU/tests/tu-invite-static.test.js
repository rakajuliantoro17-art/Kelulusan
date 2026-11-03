"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const page = fs.readFileSync("src/pintuku/dashboard/tata-usaha-accept-invite.html", "utf8");
const client = fs.readFileSync("src/pintuku/assets/js/tu-invite.js", "utf8");
const build = fs.readFileSync("src/tools/build.js", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("invite verification accepts only a bounded token hash and fixed invite type", () => {
  assert.match(api, /action === "verify-invite"/);
  assert.match(api, /type: "invite"/);
  assert.match(api, /tokenHash\.length < 20 \|\| tokenHash\.length > 512/);
  assert.match(api, /invite_expired/);
});

test("password setup requires a verified access token and bounded strong password length", () => {
  assert.match(api, /action === "set-invite-password"/);
  assert.match(api, /password\.length < 12 \|\| password\.length > 256/);
  assert.match(api, /await authenticate\(c, accessToken\)/);
  assert.match(api, /method: "PUT"/);
  assert.match(api, /await supabaseAuth\(c, "logout", \{\}, accessToken\)/);
});

test("invite flow does not grant a TU role or store invite session in browser storage", () => {
  assert.doesNotMatch(client, /localStorage|sessionStorage/);
  assert.doesNotMatch(api.slice(api.indexOf('action === "verify-invite"'), api.indexOf('action === "logout"')), /user_roles|role_code/);
});

test("one-time token is removed from address bar and referrer is suppressed", () => {
  assert.match(client, /history\.replaceState\(null,"",location\.pathname\)/);
  assert.match(client, /referrerPolicy:"no-referrer"/);
  assert.match(page, /name="referrer" content="no-referrer"/);
});

test("production invite route and static assets are included in build", () => {
  assert.ok(routes.some(route => route.source === "/tata-usaha/accept-invite"));
  for (const file of [
    "src/pintuku/dashboard/tata-usaha-accept-invite.html",
    "src/pintuku/assets/css/tu-invite.css",
    "src/pintuku/assets/js/tu-invite.js"
  ]) assert.ok(build.includes(file), "build requirement missing: " + file);
});
