"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const migration = fs.readFileSync("src/TU/supabase/migrations/202611050001_tu_independent_identity.sql", "utf8");
const rollback = fs.readFileSync("src/TU/supabase/rollback/202611050001_tu_independent_identity_rollback.sql", "utf8");
const auth = fs.readFileSync("src/TU/server/auth.js", "utf8");
const api = fs.readFileSync("src/server/api/tu.js", "utf8");
const docs = fs.readFileSync("docs/TU-INDEPENDENT-IDENTITY-SPRINT.md", "utf8");

test("migration creates a standalone internal identity table without storing passwords", () => {
  assert.match(migration, /create table if not exists tu\.identities/);
  assert.match(migration, /external_subject text not null/);
  assert.match(migration, /display_name text not null/);
  assert.doesNotMatch(migration, /password\s+text/i);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on tu\.identities from public, anon, authenticated/);
});

test("operational actor foreign keys move to standalone identities", () => {
  for (const column of [
    "identity_id", "assigned_by_identity_id", "target_identity_id", "actor_identity_id",
    "initiated_by_identity_id", "recipient_identity_id", "created_by_identity_id",
    "updated_by_identity_id", "checked_in_by_identity_id", "checked_out_by_identity_id"
  ]) assert.ok(migration.includes(column), "missing identity reference: " + column);
  assert.match(migration, /references tu\.identities\(id\)/);
  assert.match(migration, /drop function if exists tu_private\.bootstrap_first_head_tu/);
  assert.doesNotMatch(migration, /references auth\.users/);
});

test("spreadsheet session is revalidated against current account status and role", () => {
  assert.match(auth, /Pengguna!A:F/);
  assert.match(auth, /async function resolveSession/);
  assert.match(auth, /currentRole !== payload\.r/);
  assert.match(auth, /const TTL_SECONDS = 60 \* 60/);
  assert.match(api, /resolveSession\(token\)/);
  assert.match(api, /identity_id=eq\./);
  assert.match(api, /recipient_identity_id/);
  assert.match(api, /created_by_identity_id/);
  assert.match(api, /SUPABASE_SECRET_KEY \|\| process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(api, /auth\/v1\/user/);
});

test("unit officer assignment is resolved from the optional UnitCode spreadsheet column", () => {
  assert.match(auth, /unitCode: headers\.indexOf\("unitcode"\)/);
  assert.match(api, /unit_assignment_required/);
  assert.match(api, /unit_assignment_invalid/);
  assert.match(api, /unit_code=eq\./);
});

test("rollback is guarded against removing active identity and audit history", () => {
  assert.match(rollback, /Rollback blocked: tu\.identities is not empty/);
  assert.match(rollback, /Rollback blocked: TU operational or audit records exist/);
  assert.match(docs, /Prefer PITR/);
  assert.match(docs, /NOT applied/);
});
