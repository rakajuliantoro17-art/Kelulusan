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
 assert.match(sql,/facility_details->>'facility_name'/);
 assert.ok(sql.includes("insert into humas.permit_workflow_events"));
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
 assert.match(api,/signed.token/);
});

test("permit workspace provides list, detail, workflow and document interactions",()=>{
 for(const id of ["permitMetrics","permitList","permitDetailPanel","permitForm","documentForm","protocolMetrics","protocolList","agendaForm","agendaDetail"])assert.ok(ui.includes(id),id);
 for(const action of ["submit","verify","recommend","request_revision","approve","reject","cancel","complete","archive"])assert.ok(ui.includes(action),action);
 assert.match(ui,/permit-upload-url/);
 assert.match(ui,/permit-document-url/);
 assert.match(ui,/editingPermitId/);
 assert.match(ui,/facilityFields/);
 assert.match(ui,/agendaPermitSelect/);
});


test("Sprint 3 protocol checklist tasks support validated staff assignment end-to-end",()=>{
 const migration=fs.readFileSync(path.join(root,"supabase/migrations/202611030001_humas_protocol_task_assignment.sql"),"utf8");
 assert.ok(migration.includes("task_assignment_changed"));
 assert.ok(migration.includes("invalid_task_assignee"));
 assert.ok(migration.includes("ur.role_code='staff_humas'"));
 assert.ok(api.includes("payload.assigned_to=assignee"));
 assert.ok(ui.includes("data-task-assignment"));
 assert.ok(ui.includes("Tugas berhasil diambil."));
});


test("Sprint 4 authenticated API exposes SLA and private operational activity only internally",()=>{
 for(const op of ["permit-service-level","permit-internal-notes","permit-communications","permit-operational-summary"])assert.ok(api.includes('op==="'+op+'"'),op);
 for(const fn of ["permit_set_service_level","permit_internal_note_create","permit_communication_log_create","permit_operational_summary"])assert.ok(api.includes('"'+fn+'"'),fn);
 assert.match(api,/first_response_due_at,resolution_due_at/);
 assert.match(api,/permit_internal_notes/);
 assert.match(api,/permit_communications/);
 const publicTrack=api.slice(api.indexOf('if(opInput==="permit-public-create"'),api.indexOf('if(opInput==="notifications-dispatch")'));
 assert.doesNotMatch(publicTrack,/permit_internal_notes|permit_communications|permit_operational_summary/);
});

test("Sprint 4 workspace UI renders SLA controls, private notes, communication and readiness KPIs",()=>{
 for(const id of ["operationalMetrics","refreshOperational","slaForm","internalNoteForm","communicationForm","hp-readiness-panel","hp-sla-panel"])assert.ok(ui.includes(id),id);
 for(const op of ["permit-service-level","permit-internal-notes","permit-communications"])assert.ok(ui.includes('"'+op+'"'),op);
 assert.match(ui,/Jeda SLA/);
 assert.match(ui,/Tenggat penyelesaian/);
 assert.match(ui,/Catatan internal · Privat/);
 assert.match(ui,/Tindak lanjut/);
});
