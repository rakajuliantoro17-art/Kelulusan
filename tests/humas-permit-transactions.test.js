"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const sql=fs.readFileSync(path.join(root,"supabase/migrations/202611020012_humas_permit_transactions.sql"),"utf8");
const api=fs.readFileSync(path.join(root,"src/server/api/humas.js"),"utf8");
const ui=fs.readFileSync(path.join(root,"src/pintuku/assets/js/humas-perizinan.js"),"utf8");

test("permit transaction RPCs enforce active HUMAS roles and legal transitions",()=>{
 for(const fn of ["permit_create","permit_update_draft","permit_transition","permit_assign","permit_register_document","permit_summary","protocol_agenda_create","protocol_agenda_transition","protocol_guest_create","protocol_guest_update","protocol_task_create","protocol_task_update","protocol_summary"])assert.match(sql,new RegExp("create or replace function humas\\."+fn));
 assert.match(sql,/p_actor_role is distinct from 'staff_humas'/);
 assert.match(sql,/p_actor_role is distinct from v_required_role/);
 assert.match(sql,/separation_of_duties_required/);
 assert.match(sql,/reason_required/);
 assert.match(sql,/protocol_workflow_events/);
 assert.match(sql,/guest_added/);
 assert.match(sql,/task_created/);
 assert.match(sql,/create trigger permit_workflow_events_append_only/);
});

test("permit documents use a private restricted storage bucket",()=>{
 assert.match(sql,/values \(\s*'humas-permit-documents','humas-permit-documents',false,26214400/s);
 assert.match(sql,/allowed_mime_types/);
 assert.match(sql,/create policy "humas_permit_documents_no_browser_access"/);
 assert.match(sql,/as restrictive for all to anon,authenticated/);
 assert.match(sql,/permit_register_document/);
 assert.match(sql,/file_size_bytes.*26214400/s);
});

test("permit API requires authenticated HUMAS roles and uses server-side RPCs",()=>{
 for(const op of ["permit-workspace","permits","permit-upload-url","permit-documents","permit-document-url","protocol-workspace","protocol-agendas","protocol-guests","protocol-tasks"])assert.ok(api.includes('op==="'+op+'"'),op);
 for(const fn of ["permit_create","permit_transition","permit_assign","permit_register_document","permit_summary","protocol_agenda_create","protocol_agenda_transition","protocol_guest_create","protocol_guest_update","protocol_task_create","protocol_task_update","protocol_summary"])assert.ok(api.includes('"'+fn+'"'),fn);
 assert.match(api,/PERMIT_MIMES/);
 assert.match(api,/26214400/);
 assert.match(api,/storageRequest/);
});

test("permit workspace provides list, detail, workflow and document interactions",()=>{
 for(const id of ["permitMetrics","permitList","permitDetailPanel","permitForm","documentForm","protocolMetrics","protocolList","agendaForm","agendaDetail"])assert.ok(ui.includes(id),id);
 for(const action of ["submit","verify","recommend","request_revision","approve","reject","cancel","complete","archive"])assert.ok(ui.includes(action),action);
 assert.match(ui,/permit-upload-url/);
 assert.match(ui,/permit-document-url/);
});
