"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const migration = fs.readFileSync("supabase/migrations/20261103053529_tu_front_office_visits_workflow.sql", "utf8");
const followup = fs.readFileSync("supabase/migrations/20261103053750_tu_visit_resubmission_notification.sql", "utf8");
const appendOnly = fs.readFileSync("supabase/migrations/20261103053857_tu_visit_events_append_only.sql", "utf8");
const ui = fs.readFileSync("src/pintuku/assets/js/tata-usaha-front-office.js", "utf8");
const html = fs.readFileSync("src/pintuku/dashboard/tata-usaha-front-office.html", "utf8");
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8")).rewrites;

test("visit API is server-authenticated and exposes read/create/transition operations", () => {
  assert.match(api, /op === "visits" && req\.method === "GET"/);
  assert.match(api, /op === "visits" && req\.method === "POST"/);
  assert.match(api, /op === "visits" && req\.method === "PATCH"/);
  assert.match(api, /const auth = await authenticate\(c, token\)/);
});

test("registration derives actor and source on the server", () => {
  assert.match(api, /created_by: userId, updated_by: userId/);
  assert.match(api, /source: "receptionist", status: "pending_unit"/);
  assert.match(api, /FRONT_OFFICE_ROLES/);
  assert.doesNotMatch(api, /source:\s*body\.source/);
});

test("unit approval and front office check-in/check-out are separate authorities", () => {
  assert.match(api, /assignedApprover = roles\.some/);
  assert.match(api, /if \(!isApprover\) throw visitError\("visit_forbidden"\)/);
  assert.match(api, /if \(!isFrontOffice\) throw visitError\("visit_forbidden"\)/);
  assert.match(api, /visit\.status !== "approved"/);
  assert.match(api, /visit\.status !== "checked_in"/);
  assert.match(api, /nextStatus = "checked_in"/);
});

test("visit schema has RLS, private browser grants, audit and notification triggers", () => {
  assert.match(migration, /alter table tu\.visits enable row level security/);
  assert.match(migration, /alter table tu\.visit_events enable row level security/);
  assert.match(migration, /revoke all on tu\.visits, tu\.visit_events from public, anon, authenticated/);
  assert.match(migration, /security invoker[\s\S]*set search_path = ''/);
  assert.match(migration, /create trigger tu_visits_workflow_events/);
  assert.match(migration, /insert into tu\.visit_events/);
  assert.match(migration, /insert into tu\.visit_notifications/);
});

test("resubmitted clarification notifies the destination unit again", () => {
  assert.match(followup, /new\.status = 'pending_unit'/);
  assert.match(followup, /Klarifikasi kunjungan telah dikirim/);
  assert.match(followup, /recipient_unit_id, notification_type/);
  assert.ok(appendOnly.includes("revoke update, delete on tu.visit_events from service_role"));
  assert.ok(appendOnly.includes("grant select, insert on tu.visit_events to service_role"));
});

test("Front Office UI uses server APIs and does not keep volatile visitor arrays", () => {
  assert.match(ui, /window\.tuAuth\.getAccessToken/);
  assert.match(ui, /api\("\/api\/tu\/visits"/);
  assert.doesNotMatch(ui, /const visitors\s*=\s*\[\]/);
  assert.match(ui, /foApprovalQueue/);
});

test("kiosk remains explicitly unavailable until public intake is secured", () => {
  assert.match(html, /Self-Service Kiosk belum aktif/);
  assert.match(html, /public intake/);
  assert.doesNotMatch(ui, /foKioskForm/);
});

test("visit API route is registered in Vercel", () => {
  assert.ok(routes.some(route => route.source === "/api/tu/visits" && route.destination === "/api/tu?op=visits"));
});
