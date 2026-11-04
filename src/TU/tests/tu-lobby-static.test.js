"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const html=fs.readFileSync("src/pintuku/dashboard/tata-usaha-lobby.html","utf8"),css=fs.readFileSync("src/pintuku/assets/css/tata-usaha-lobby.css","utf8"),js=fs.readFileSync("src/pintuku/assets/js/tata-usaha-lobby.js","utf8"),build=fs.readFileSync("src/tools/build.js","utf8"),routes=JSON.parse(fs.readFileSync("vercel.json","utf8")).rewrites;
test("public lobby route and service directory exist",()=>{assert.ok(routes.some(r=>r.source==="/lobby"&&r.destination==="/src/pintuku/dashboard/tata-usaha-lobby.html"));assert.ok(routes.some(r=>r.source==="/lobby/"&&r.destination==="/src/pintuku/dashboard/tata-usaha-lobby.html"));assert.match(html,/Selamat datang di/);assert.match(html,/lobby-service-grid/);assert.match(html,/Empat langkah sederhana/);assert.match(html,/assets\/shared\/logos\/sman1-sooko\.png/);assert.match(html,/alt="Logo SMAN 1 Sooko"/);assert.match(html,/INFORMASI PENGUNJUNG/);assert.match(html,/lobbyNotice/);assert.equal((html.match(/<svg viewBox="0 0 24 24"/g)||[]).length,8);});
test("lobby display never collects visitor records or calls APIs",()=>{assert.doesNotMatch(html,/<form\b|name="phone"|name="email"|name="nik"/i);assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);assert.doesNotMatch(html,/foQueue|foNotifications|foCurrentIdentity|foCurrentRole/);assert.match(html,/pencatatan pada buku layanan/);});
test("service selection is local-only and accessible",()=>{assert.match(js,/guidance/);assert.match(js,/aria-pressed/);assert.match(js,/const notices=/);assert.match(js,/8500/);assert.match(js,/prefers-reduced-motion/);assert.match(js,/textContent=item\[1\]/);assert.match(html,/aria-live="polite"/);assert.match(css,/:focus-visible/);assert.match(css,/backdrop-filter/);assert.match(css,/@media\(min-width:1450px\)/);assert.match(css,/lobby-brand-mark img/);assert.match(css,/lobby-service-icon svg/);assert.match(css,/lobby-notice-copy/);});
test("lobby assets are included in static build requirements",()=>{assert.match(build,/src\/pintuku\/dashboard\/tata-usaha-lobby\.html/);assert.match(build,/src\/pintuku\/assets\/css\/tata-usaha-lobby\.css/);assert.match(build,/src\/pintuku\/assets\/js\/tata-usaha-lobby\.js/);});

test("TU public entry, queue display, and protected dashboard routes stay separated", () => {
  const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  const routes = new Map(config.rewrites.map((item) => [item.source, item.destination]));
  assert.equal(routes.get("/tata-usaha"), "/src/pintuku/dashboard/tata-usaha-visitor.html");
  assert.equal(routes.get("/tata-usaha/dashboard"), "/src/pintuku/dashboard/tata-usaha.html");
  assert.equal(routes.get("/tata-usaha/queue-display"), "/src/pintuku/dashboard/tata-usaha-queue-display.html");
});
test("TU public queue display does not expose visitor personal information", () => {
  const html = fs.readFileSync("src/pintuku/dashboard/tata-usaha-queue-display.html", "utf8");
  assert.match(html, /Status Antrean per Unit/);
  assert.doesNotMatch(html, /visitor_name|contact_phone|visitor_email|Nama Pengunjung|Nomor Telepon/);
});
test("TU public visitor form is explicitly preview-only until public intake API is implemented", () => {
  const html = fs.readFileSync("src/pintuku/dashboard/tata-usaha-visitor.html", "utf8");
  const js = fs.readFileSync("src/pintuku/assets/js/tata-usaha-public.js", "utf8");
  assert.match(html, /Mode pratinjau UI/);
  assert.match(js, /endpoint registrasi publik belum diaktifkan/);
  assert.doesNotMatch(js, /fetch\s*\(/);
});
