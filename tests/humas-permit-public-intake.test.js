"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sql=read("supabase/migrations/202611020013_humas_permit_public_intake_notifications.sql");
const api=read("src/server/api/humas.js");
const page=read("src/pintuku/dashboard/humas-perizinan-public.html");
const js=read("src/pintuku/assets/js/humas-perizinan-public.js");
const internal=read("src/pintuku/assets/js/humas-perizinan.js");
const vercel=JSON.parse(read("vercel.json"));
const build=read("src/tools/build.js");

test("public permit intake stores hashed tracking credentials and rate-limits submissions",()=>{
 for(const table of ["permit_public_access","permit_rate_limits","permit_inbox_notifications","permit_notification_outbox"]){
  assert.match(sql,new RegExp("create table if not exists humas\\."+table));
  assert.match(sql,new RegExp("alter table humas\\."+table+" enable row level security"));
 }
 assert.match(sql,/token_hash text not null unique/);
 assert.match(sql,/p_token_hash !~/);
 assert.match(sql,/create_ip/);
 assert.match(sql,/create_email/);
 assert.match(sql,/rate_limit_exceeded/);
 assert.match(sql,/created_by,assigned_staff,submitted_at/);
 assert.match(sql,/"submitted",null,null/);
});

test("public tracking and cancellation require request code plus token digest",()=>{
 for(const fn of ["permit_public_create","permit_public_track","permit_public_cancel"])assert.match(sql,new RegExp("function humas\\."+fn));
 assert.match(sql,/expires_at>pg_catalog\.now\(\)/);
 assert.match(sql,/a\.token_hash=p_token_hash/);
 assert.match(sql,/public_cancel_not_allowed/);
 assert.match(sql,/public_cancelled/);
});

test("private notification inbox and email outbox have controlled delivery lifecycle",()=>{
 for(const fn of ["permit_notifications_list","permit_notification_mark_read","permit_notification_claim","permit_notification_finish"])assert.match(sql,new RegExp("function humas\\."+fn));
 assert.match(sql,/for update skip locked/);
 assert.match(sql,/attempt_count<5/);
 assert.match(sql,/status='sent'/);
 assert.match(sql,/permit_status_notification/);
 assert.match(sql,/revoke all on humas\.permit_public_access[\s\S]*from public,anon,authenticated/);
});

test("public API is routed before authenticated HUMAS session enforcement",()=>{
 const handler=api.indexOf('if(opInput==="permit-public-create"');
 const bearer=api.indexOf("const token=bearer(req)",api.indexOf("module.exports=async function humasApi"));
 assert.ok(handler>0&&handler<bearer);
 for(const op of ["permit-public-create","permit-public-track","permit-public-cancel","notifications-dispatch","permit-notifications"])assert.ok(api.includes(op),op);
 assert.match(api,/createHmac\("sha256"/);
 assert.match(api,/createHash\("sha256"/);
 assert.match(api,/timingSafeEqual/);
 assert.match(api,/RESEND_API_KEY/);
 assert.match(api,/HUMAS_PUBLIC_RATE_SECRET/);
});

test("public application and tracking page protects token display and exposes both workflows",()=>{
 for(const id of ["publicPermitForm","trackPermitForm","publicFacilityFields","submissionSuccess","successCode","successToken","trackingResult"])assert.ok(page.includes(id),id);
 for(const op of ["permit-public-create","permit-public-track","permit-public-cancel"])assert.ok(js.includes(op),op);
 assert.match(js,/sessionStorage\.setItem\("pintuku_humas_last_token"/);
 assert.match(js,/textContent=result\.tracking_token/);
 assert.match(js,/escape/); // dynamic content is escaped through the local esc helper.
 assert.match(internal,/permit-notifications/);
});

test("Vercel routes, scheduled notification worker and static build include public assets",()=>{
 for(const route of ["/humas/perizinan/ajukan","/humas/perizinan/lacak"])assert.ok(vercel.rewrites.some(x=>x.source===route),route);
 assert.ok(vercel.crons.some(x=>x.path==="/api/humas-notifications"&&x.schedule==="*/5 * * * *"));
 assert.match(build,/humas-perizinan-public\.html/);
 assert.match(build,/humas-perizinan-public\.js/);
});
