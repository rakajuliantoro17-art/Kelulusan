"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../..");
const file = path.join(root, "src/humas/supabase/migrations/202611020011_humas_permits_protocol_foundation.sql");
const sql = fs.readFileSync(file, "utf8");

test("permit and protocol foundation defines three permit scopes", () => {
  assert.match(sql, /permit_type in \('internal','external','facility'\)/);
  assert.match(sql, /create table if not exists humas\.permit_requests/);
  assert.match(sql, /create table if not exists humas\.permit_documents/);
  assert.match(sql, /create table if not exists humas\.permit_workflow_events/);
});

test("protocol is independently scheduled and can link to a permit", () => {
  assert.match(sql, /create table if not exists humas\.protocol_agendas/);
  assert.match(sql, /permit_id uuid references humas\.permit_requests/);
  assert.match(sql, /create table if not exists humas\.protocol_guests/);
  assert.match(sql, /create table if not exists humas\.protocol_tasks/);
  assert.match(sql, /create table if not exists humas\.protocol_workflow_events/);
});

test("all private permit and protocol tables enable RLS and deny browser access", () => {
  for (const table of ["permit_requests","permit_documents","permit_workflow_events","protocol_agendas","protocol_guests","protocol_tasks","protocol_workflow_events"]) {
    assert.match(sql, new RegExp("alter table humas\\." + table + " enable row level security"));
  }
  assert.match(sql, /from public,anon,authenticated/);
  assert.match(sql, /to service_role/);
});

test("workflow event histories are append-only", () => {
  assert.match(sql, /create trigger permit_workflow_events_append_only/);
  assert.match(sql, /create trigger protocol_workflow_events_append_only/);
  assert.match(sql, /workflow_events_are_append_only/);
});

test("date ranges and guest/task states are constrained", () => {
  assert.match(sql, /permit_date_order/);
  assert.match(sql, /protocol_agenda_date_order/);
  assert.match(sql, /attendance_status in/);
  assert.match(sql, /task_status in/);
});
