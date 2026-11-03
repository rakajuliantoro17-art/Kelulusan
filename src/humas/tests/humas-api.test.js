"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../../../src/server/api/humas.js");

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PARTNER_ID = "22222222-2222-4222-8222-222222222222";

async function invoke({ role = "staff_humas", token = "valid-token", method = "GET", op = "partners", body = {}, query = {} } = {}) {
  const originalFetch = global.fetch;
  const calls = [];
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  global.fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    calls.push({ url, options });
    if (url.pathname === "/auth/v1/token") return new Response(JSON.stringify({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600, user: { id: USER_ID, email: "test@example.invalid" } }), { status: 200 });
    if (url.pathname === "/auth/v1/user") {
      if (token === "invalid-token") return new Response(JSON.stringify({ message: "invalid" }), { status: 401 });
      return new Response(JSON.stringify({ id: USER_ID, email: "test@example.invalid" }), { status: 200 });
    }
    if (url.pathname === "/rest/v1/user_roles") {
      return new Response(JSON.stringify(role ? [{ role_code: role }] : []), { status: 200 });
    }
    if (url.pathname === "/rest/v1/partners") {
      return new Response(JSON.stringify([{ id: PARTNER_ID, partner_name: "Mitra Uji" }]), { status: 200 });
    }
    if (url.pathname === "/rest/v1/agreements") {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (url.pathname === "/rest/v1/alumni_intake_submissions") return new Response(JSON.stringify([{id:"66666666-6666-4666-8666-666666666666",full_name:"Pengajuan Uji",graduation_year:2020,status:"pending"}]),{status:200});
    if (url.pathname === "/rest/v1/alumni_profiles") return new Response(JSON.stringify([{id:"55555555-5555-4555-8555-555555555555",full_name:"Alumni Uji",graduation_year:2020,consent_fundraising:true}]),{status:200});
    if (url.pathname === "/rest/v1/proposals") {
      return new Response(JSON.stringify([{ id: "44444444-4444-4444-8444-444444444444", title: "Proposal Uji" }]), { status: 200 });
    }
    if (url.pathname.endsWith("/rpc/alumni_intake_review")) return new Response(JSON.stringify({status:"approved",profile_id:"77777777-7777-4777-8777-777777777777"}),{status:200});
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      return new Response(JSON.stringify({ id: PARTNER_ID, status: "draft" }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
  };
  const req = { method, headers: token ? { authorization: `Bearer ${token}` } : {}, query: { op, ...query }, body };
  const res = {
    statusCode: 200, headers: {}, payload: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(value) { this.payload = value; return this; }
  };
  try { await handler(req, res); return { status: res.statusCode, payload: res.payload, calls, headers: res.headers }; }
  finally { global.fetch = originalFetch; }
}

test("unauthenticated requests are rejected", async () => {
  const r = await invoke({ token: null });
  assert.equal(r.status, 401);
});

test("invalid Supabase access token is rejected", async () => {
  const r = await invoke({ token: "invalid-token" });
  assert.equal(r.status, 401);
});

test("system operator cannot read partner business data", async () => {
  const r = await invoke({ role: "system_operator" });
  assert.equal(r.status, 403);
});

test("staff HUMAS can read partner directory", async () => {
  const r = await invoke({ role: "staff_humas" });
  assert.equal(r.status, 200);
  assert.equal(r.payload.data.partners.length, 1);
});

test("principal cannot create partner master data", async () => {
  const r = await invoke({ role: "principal", method: "POST", body: { partner_name: "Mitra", partner_type: "education" } });
  assert.equal(r.status, 403);
  assert.equal(r.calls.some(x => x.url.pathname.includes("/rpc/")), false);
});

test("vice principal can read but cannot create partner records", async () => {
  const r = await invoke({ role: "vice_principal_humas", method: "POST", body: { partner_name: "Mitra", partner_type: "education" } });
  assert.equal(r.status, 403);
  assert.equal(r.calls.some(x => x.url.pathname.includes("/rpc/")), false);
});

test("system operator cannot create partner records", async () => {
  const r = await invoke({ role: "system_operator", method: "POST", body: { partner_name: "Mitra", partner_type: "education" } });
  assert.equal(r.status, 403);
  assert.equal(r.calls.some(x => x.url.pathname.includes("/rpc/")), false);
});

test("staff partner creation uses authenticated actor identity", async () => {
  const r = await invoke({ role: "staff_humas", method: "POST", body: { partner_name: "Mitra Uji", partner_type: "education" } });
  assert.equal(r.status, 201);
  const rpc = r.calls.find(x => x.url.pathname.endsWith("/rpc/partner_create"));
  assert.ok(rpc);
  const payload = JSON.parse(rpc.options.body);
  assert.equal(payload.p_actor_id, USER_ID);
  assert.equal(payload.p_actor_role, "staff_humas");
});

test("invalid calendar date is rejected before database RPC", async () => {
  const r = await invoke({ role: "staff_humas", method: "POST", op: "agreements", body: {
    partner_id: PARTNER_ID, title: "MoU Uji", agreement_type: "mou", purpose: "Pengujian",
    start_date: "2026-02-30", end_date: "2027-02-28"
  } });
  assert.equal(r.status, 400);
  assert.equal(r.calls.some(x => x.url.pathname.includes("/rpc/")), false);
});

test("invalid pagination is rejected", async () => {
  const r = await invoke({ query: { page: "0", limit: "999" } });
  assert.equal(r.status, 400);
});


test("login exchanges credentials with Supabase Auth and returns a session", async () => {
  const r = await invoke({ token: null, method: "POST", op: "login", body: { email: "test@example.invalid", password: "test-password" } });
  assert.equal(r.status, 200);
  assert.equal(r.payload.data.access_token, "new-access");
  assert.ok(r.calls.some(x => x.url.pathname === "/auth/v1/token"));
});

test("dashboard uses one aggregate RPC", async () => {
  const r = await invoke({ role: "staff_humas", op: "dashboard" });
  assert.equal(r.status, 200);
  assert.ok(r.calls.some(x => x.url.pathname.endsWith("/rpc/dashboard_summary")));
});

test("workflow transition sends the verified actor and selected action to SQL", async () => {
  const r = await invoke({ role: "vice_principal_humas", method: "PATCH", op: "agreements", body: {
    id: "33333333-3333-4333-8333-333333333333", action: "recommend", reason: "Sesuai kebutuhan sekolah"
  } });
  assert.equal(r.status, 200);
  const rpc = r.calls.find(x => x.url.pathname.endsWith("/rpc/agreement_transition"));
  assert.ok(rpc);
  const payload = JSON.parse(rpc.options.body);
  assert.equal(payload.p_actor_id, USER_ID);
  assert.equal(payload.p_actor_role, "vice_principal_humas");
  assert.equal(payload.p_action, "recommend");
});


test("workspace consolidates the initial dashboard and first-page data", async () => {
  const r = await invoke({ role: "staff_humas", op: "workspace" });
  assert.equal(r.status, 200);
  assert.ok(r.payload.data.roles.includes("staff_humas"));
  assert.ok(r.calls.some(x => x.url.pathname.endsWith("/rpc/dashboard_summary")));
  assert.ok(r.calls.some(x => x.url.pathname === "/rest/v1/partners"));
  assert.ok(r.calls.some(x => x.url.pathname === "/rest/v1/agreements"));
});


test("staff HUMAS can create a proposal through the transactional RPC", async () => {
  const r = await invoke({ role: "staff_humas", method: "POST", op: "proposals", body: {
    title: "Proposal Kegiatan Uji", category: "education", description: "Kebutuhan kegiatan sekolah",
    requested_amount: "1500000", proposal_date: "2026-11-02", owner_unit: "Kurikulum"
  } });
  assert.equal(r.status, 201);
  const rpc = r.calls.find(x => x.url.pathname.endsWith("/rpc/proposal_create"));
  assert.ok(rpc);
  const payload = JSON.parse(rpc.options.body);
  assert.equal(payload.p_actor_id, USER_ID);
  assert.equal(payload.p_actor_role, "staff_humas");
  assert.equal(payload.p_payload.title, "Proposal Kegiatan Uji");
});

test("non-staff role cannot create proposal records", async () => {
  const r = await invoke({ role: "principal", method: "POST", op: "proposals", body: {
    title: "Proposal", category: "education", description: "Test"
  } });
  assert.equal(r.status, 403);
  assert.equal(r.calls.some(x => x.url.pathname.endsWith("/rpc/proposal_create")), false);
});

test("invalid proposal date is rejected before database RPC", async () => {
  const r = await invoke({ role: "staff_humas", method: "POST", op: "proposals", body: {
    title: "Proposal", category: "education", description: "Test", proposal_date: "2026-02-30"
  } });
  assert.equal(r.status, 400);
  assert.equal(r.calls.some(x => x.url.pathname.endsWith("/rpc/proposal_create")), false);
});

test("proposal workspace returns aggregate summary and paginated proposal data", async () => {
  const r = await invoke({ role: "staff_humas", op: "proposal-workspace" });
  assert.equal(r.status, 200);
  assert.ok(r.calls.some(x => x.url.pathname.endsWith("/rpc/proposal_summary")));
  assert.ok(r.calls.some(x => x.url.pathname === "/rest/v1/proposals"));
});

test("proposal sponsor creation sends actor and proposal identity to SQL", async () => {
  const r = await invoke({ role: "staff_humas", method: "POST", op: "proposal-supports", body: {
    proposal_id: "44444444-4444-4444-8444-444444444444",
    sponsor_name: "Mitra Uji", support_type: "cash", estimated_value: "1000000"
  } });
  assert.equal(r.status, 201);
  const rpc = r.calls.find(x => x.url.pathname.endsWith("/rpc/proposal_support_create"));
  assert.ok(rpc);
  const payload = JSON.parse(rpc.options.body);
  assert.equal(payload.p_actor_id, USER_ID);
  assert.equal(payload.p_proposal_id, "44444444-4444-4444-8444-444444444444");
});

test("alumni workspace returns aggregate and filtered directory",async()=>{const r=await invoke({role:"staff_humas",op:"alumni-workspace",query:{year:"2020",consent:"fundraising"}});assert.equal(r.status,200);assert.ok(r.calls.some(x=>x.url.pathname.endsWith("/rpc/alumni_summary")));const q=r.calls.find(x=>x.url.pathname==="/rest/v1/alumni_profiles").url.searchParams;assert.equal(q.get("graduation_year"),"eq.2020");assert.equal(q.get("consent_fundraising"),"eq.true");});
test("staff can create alumni profile with explicit consent values",async()=>{const r=await invoke({role:"staff_humas",method:"POST",op:"alumni",body:{full_name:"Alumni Uji",graduation_year:2020,current_status:"employed",whatsapp:"08123456789",consent_events:true,consent_fundraising:false,consent_source:"Formulir alumni"}});assert.equal(r.status,201);const rpc=r.calls.find(x=>x.url.pathname.endsWith("/rpc/alumni_profile_create"));assert.ok(rpc);const p=JSON.parse(rpc.options.body);assert.equal(p.p_actor_id,USER_ID);assert.equal(p.p_payload.consent_events,true);assert.equal(p.p_payload.consent_fundraising,false);});
test("non-staff cannot create alumni profiles",async()=>{const r=await invoke({role:"principal",method:"POST",op:"alumni",body:{full_name:"Alumni Uji",graduation_year:2020}});assert.equal(r.status,403);assert.equal(r.calls.some(x=>x.url.pathname.endsWith("/rpc/alumni_profile_create")),false);});
test("alumni contact log is created through consent-checked RPC",async()=>{const r=await invoke({role:"staff_humas",method:"POST",op:"alumni-contact",body:{alumni_id:"55555555-5555-4555-8555-555555555555",purpose:"reunion",channel:"whatsapp",outcome:"sent",summary:"Undangan reuni"}});assert.equal(r.status,201);const rpc=r.calls.find(x=>x.url.pathname.endsWith("/rpc/alumni_contact_log_create"));assert.ok(rpc);const p=JSON.parse(rpc.options.body);assert.equal(p.p_actor_id,USER_ID);assert.equal(p.p_payload.purpose,"reunion");});

test("staff can list pending public alumni submissions",async()=>{const r=await invoke({role:"staff_humas",op:"alumni-intakes"});assert.equal(r.status,200);assert.equal(r.payload.data.submissions[0].status,"pending");assert.ok(r.calls.some(x=>x.url.pathname==="/rest/v1/alumni_intake_submissions"));});
test("staff approval uses the authenticated actor and review RPC",async()=>{const r=await invoke({role:"staff_humas",method:"PATCH",op:"alumni-intakes",body:{id:"66666666-6666-4666-8666-666666666666",action:"approve"}});assert.equal(r.status,200);const rpc=r.calls.find(x=>x.url.pathname.endsWith("/rpc/alumni_intake_review"));assert.ok(rpc);const p=JSON.parse(rpc.options.body);assert.equal(p.p_actor_id,USER_ID);assert.equal(p.p_action,"approve");});
test("non-staff cannot access public alumni intake queue",async()=>{const r=await invoke({role:"principal",op:"alumni-intakes"});assert.equal(r.status,403);assert.equal(r.calls.some(x=>x.url.pathname==="/rest/v1/alumni_intake_submissions"),false);});
