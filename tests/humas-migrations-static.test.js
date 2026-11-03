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
  "202611020005_humas_security_hardening.sql",
  "202611020006_humas_operator_role_separation.sql",
  "202611020007_humas_operational_workflow.sql",
  "202611020008_humas_proposals_sponsorship.sql",
  "202611020009_humas_alumni_tracer_study.sql",
  "202611020010_humas_alumni_public_intake.sql",
  "202611020011_humas_permits_protocol_foundation.sql",
  "202611020012_humas_permit_transactions.sql",
  "202611020013_humas_permit_public_intake_notifications.sql",
  "202611020014_humas_permit_rate_limit_persistence.sql",
  "202611020015_humas_permit_protocol_fk_indexes.sql",
  "202611030001_humas_protocol_task_assignment.sql",
  "202611030002_humas_permit_service_operations.sql",
  "202611030003_humas_alumni_analytics.sql",
  "202611030004_humas_alumni_analytics_filter_fix.sql",
  "202611030005_humas_alumni_import_collaboration.sql",
  "202611030006_humas_alumni_import_batch_duplicate_fix.sql",
  "202611030007_humas_alumni_import_update_existing.sql"
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

test("partner RPC role checks explicitly reject NULL labels", () => {
  const sql = migration(files[2]);
  assert.equal((sql.match(/p_actor_role is distinct from 'staff_humas'/g) || []).length, 3);
  assert.doesNotMatch(sql, /p_actor_role <> 'staff_humas'/);
});

test("technical operator role is exclusive from business roles", () => {
  const sql = migration(files[5]);
  assert.match(sql, /enforce_operator_role_separation/);
  assert.match(sql, /system_operator_must_be_exclusive/);
  assert.match(sql, /business_role_conflicts_with_system_operator/);
  assert.match(sql, /pg_advisory_xact_lock/);
});

test("no migration grants HUMAS table privileges to browser roles", () => {
  const all = files.map(migration).join("\n");
  assert.doesNotMatch(all, /grant[\s\S]{0,160}\bto\s+(anon|authenticated)\b/i);
});


test("operational workflow enforces role-specific transitions and separation of duties", () => {
  const sql = migration(files[6]);
  assert.match(sql, /create or replace function humas\.agreement_transition/);
  assert.match(sql, /create or replace function humas\.agreement_update_draft/);
  assert.match(sql, /create or replace function humas\.dashboard_summary/);
  assert.match(sql, /separation_of_duties_required/);
  assert.match(sql, /p_actor_role is distinct from v_required_role/);
  assert.match(sql, /case when v_decision='pending' then null/);
  assert.match(sql, /revoke all on function humas\.agreement_transition/);
  assert.match(sql, /grant execute on function humas\.agreement_transition.*to service_role/);
  assert.match(sql, /create trigger agreement_approvals_append_only/);
  assert.match(sql, /approval_records_are_append_only/);
});

test("proposal and sponsorship foundation uses transactional RPCs and immutable audit", () => {
  const sql = migration(files[7]);
  for (const table of ["proposals","proposal_supports","proposal_events"]) {
    assert.ok(sql.includes("create table if not exists humas." + table));
    assert.ok(sql.includes("alter table humas." + table + " enable row level security"));
  }
  for (const fn of ["proposal_create","proposal_update","proposal_set_status","proposal_support_create","proposal_support_update","proposal_summary"]) {
    assert.ok(sql.includes("create or replace function humas." + fn));
  }
  assert.match(sql, /proposal_events_append_only/);
  assert.match(sql, /active_staff_humas_role_required/);
  assert.match(sql, /revoke all on table humas\.proposals, humas\.proposal_supports, humas\.proposal_events from public, anon, authenticated/);
});

test("alumni CRM keeps private profiles and consent-gated append-only contact history",()=>{const sql=migration(files[8]);for(const table of ["alumni_profiles","alumni_contact_logs"]){assert.match(sql,new RegExp("create table if not exists humas\\."+table));assert.match(sql,new RegExp("alter table humas\\."+table+" enable row level security"));}for(const fn of ["alumni_profile_create","alumni_profile_update","alumni_contact_log_create","alumni_summary"])assert.match(sql,new RegExp("create or replace function humas\\."+fn));assert.match(sql,/consent_fundraising/);assert.match(sql,/alumni_contact_consent_required/);assert.match(sql,/alumni_contact_logs_append_only/);});

test("public alumni intake stores pending submissions and gates review through staff RPC",()=>{const sql=migration(files[9]);for(const table of ["alumni_intake_submissions","alumni_intake_rate_limits"])assert.match(sql,new RegExp("create table if not exists humas\\."+table));for(const fn of ["alumni_intake_submit","alumni_intake_review"])assert.match(sql,new RegExp("create or replace function humas\\."+fn));assert.match(sql,/consent_data_processing/);assert.match(sql,/rate_limited/);assert.match(sql,/duplicate_possible/);assert.match(sql,/grant execute on function humas\.alumni_intake_submit.*alumni_intake_review.*to service_role/s);});


test("Sprint 4 permit service operations add SLA, private notes and communication history",()=>{
  const sql=migration(files[16]);
  for(const column of ["priority","first_response_due_at","first_responded_at","resolution_due_at","sla_paused_at","sla_pause_reason","last_activity_at"])assert.ok(sql.includes("add column if not exists "+column));
  for(const table of ["permit_internal_notes","permit_communications"]){
    assert.ok(sql.includes("create table if not exists humas."+table));
    assert.ok(sql.includes("alter table humas."+table+" enable row level security"));
  }
  for(const fn of ["permit_set_service_level","permit_internal_note_create","permit_communication_log_create","permit_operational_summary"])assert.ok(sql.includes("create or replace function humas."+fn));
  assert.ok(sql.includes("first_responded_at is null"));
  assert.ok(sql.includes("resolution_due_at + (pg_catalog.now()-sla_paused_at)"));
  assert.ok(sql.includes("task_status in ('pending','in_progress','blocked')"));
  assert.ok(sql.includes("revoke all on table humas.permit_internal_notes,humas.permit_communications"));
  assert.ok(sql.includes("to service_role"));
});

test("Sprint 5 analytics RPC is aggregate-only and restricted to service role",()=>{
  const sql=migration(files[17]);
  assert.match(sql,/create or replace function humas\.alumni_analytics/);
  assert.match(sql,/'coverage_percent'/);
  assert.match(sql,/'top_institutions'/);
  assert.match(sql,/'data_quality'/);
  assert.match(sql,/revoke all on function humas\.alumni_analytics/);
  assert.match(sql,/grant execute on function humas\.alumni_analytics.*to service_role/s);
});


test("Sprint 6 alumni imports are private, role-gated, staged and auditable",()=>{
 const base=migration(files[19]);const duplicateFix=migration(files[20]);const updateFix=migration(files[21]);
 for(const table of ["alumni_import_batches","alumni_import_rows"]){assert.match(base,new RegExp("create table if not exists humas\\."+table));assert.match(base,new RegExp("alter table humas\\."+table+" enable row level security"));}
 for(const fn of ["alumni_import_batch_create","alumni_import_row_review"])assert.match(base,new RegExp("create or replace function humas\\."+fn));
 assert.match(base,/grant execute on function humas\\.alumni_import_batch_create.*to service_role/s);
 assert.match(duplicateFix,/v_duplicate_in_batch/);
 assert.match(updateFix,/update_existing/);
 assert.match(updateFix,/consent_fundraising',false/);
});
