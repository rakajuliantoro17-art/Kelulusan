"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const migration = fs.readFileSync("src/TU/supabase/migrations/20261103051204_tu_head_tu_bootstrap_audit.sql", "utf8");
const bootstrap = fs.readFileSync("src/TU/scripts/bootstrap-first-head-tu.sql", "utf8");
const docs = fs.readFileSync("docs/TU-HEAD-TU-BOOTSTRAP.md", "utf8");

test("first Head TU bootstrap is private and not executable by application roles", () => {
  assert.match(migration, /create schema if not exists tu_private/);
  assert.match(migration, /revoke all on schema tu_private from public, anon, authenticated, service_role/);
  assert.match(migration, /revoke all on function tu_private\.bootstrap_first_head_tu\(uuid, text\) from public, anon, authenticated, service_role/);
  assert.match(migration, /current_user not in \('postgres', 'supabase_admin'\)/);
  assert.doesNotMatch(migration, /security definer/i);
});

test("bootstrap verifies confirmed, active Auth identity and is one-time", () => {
  assert.match(migration, /v_confirmed_at is null/);
  assert.match(migration, /v_deleted_at is not null/);
  assert.match(migration, /v_banned_until > now\(\)/);
  assert.match(migration, /Bootstrap ditutup: sudah ada Head TU aktif/);
  assert.match(migration, /tu_single_active_head_tu_idx/);
});

test("all role changes are audited and browser access is denied", () => {
  assert.match(migration, /create table if not exists tu\.role_audit_logs/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /after insert or update or delete on tu\.user_roles/);
  assert.match(migration, /revoke all on table tu\.role_audit_logs from public, anon, authenticated/);
});

test("manual bootstrap script never assumes or invents a real account UUID", () => {
  assert.equal((bootstrap.match(/00000000-0000-0000-0000-000000000000/g) || []).length, 2);
  assert.match(bootstrap, /copy the UUID/i);
  assert.match(docs, /email-only auto-matching/);
  assert.match(docs, /all-zero placeholder UUID/);
});
