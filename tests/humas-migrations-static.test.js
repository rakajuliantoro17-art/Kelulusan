"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const migration = (name) => fs.readFileSync(path.join(root, "supabase/migrations", name), "utf8");
const files = [
  "202611020001_humas_partnership_foundation.sql",
  "202611020002_humas_rbac_foundation.sql",
  "202611020003_humas_partner_management.sql",
  "202611020004_humas_agreement_drafts.sql",
  "202611020005_humas_security_hardening.sql"
];

test("HUMAS migrations exist in dependency order", () => {
  for (const file of files) assert.ok(fs.existsSync(path.join(root, "supabase/migrations", file)), file);
  assert.deepEqual([...files].sort(), files);
});

test("foundation defines core HUMAS entities and enables RLS", () => {
  const sql = migration(files[0]);
  for (const table of ["partners", "agreements", "agreement_documents", "agreement_approvals", "agreement_workflow_events"]) {
    assert.match(sql, new RegExp("create table if not exists humas\\." + table));
    assert.match(sql, new RegExp("alter table humas\\." + table + " enable row level security"));
  }
});

test("RBAC mapping is server-managed and RLS enabled", () => {
  const sql = migration(files[1]);
  assert.match(sql, /create table if not exists humas\.user_roles/);
  assert.match(sql, /alter table humas\.user_roles enable row level security/);
  assert.match(sql, /revoke all on table humas\.user_roles from public, anon, authenticated/);
});

test("partner writes use transactional RPCs and append-only audit table", () => {
  const sql = migration(files[2]);
  for (const fn of ["partner_create", "partner_update", "partner_set_status"]) assert.match(sql, new RegExp("create or replace function humas\\." + fn));
  assert.match(sql, /create table if not exists humas\.partner_events/);
  assert.match(sql, /grant select, insert on table humas\.partner_events to service_role/);
});

test("agreement draft RPC creates draft only", () => {
  const sql = migration(files[3]);
  assert.match(sql, /create or replace function humas\.agreement_create_draft/);
  assert.match(sql, /'draft_created'/);
  assert.match(sql, /'draft',p_actor_id,p_actor_id/);
});

test("audit actor guard validates active staff role", () => {
  const sql = migration(files[4]);
  assert.match(sql, /create or replace function humas\.enforce_humas_audit_actor/);
  assert.match(sql, /ur\.role_code = 'staff_humas'/);
  assert.match(sql, /ur\.is_active = true/);
  assert.match(sql, /ur\.revoked_at is null/);
  assert.match(sql, /when \(new\.event_type = 'draft_created'\)/);
});

test("no migration grants HUMAS table privileges to browser roles", () => {
  const all = files.map(migration).join("\n");
  assert.doesNotMatch(all, /grant[\s\S]{0,160}\bto\s+(anon|authenticated)\b/i);
});
