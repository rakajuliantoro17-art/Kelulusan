-- PINTUKU HUMAS Sprint 2: cover frequently joined permit/protocol foreign keys.
create index if not exists permit_requests_created_by_idx on humas.permit_requests(created_by);
create index if not exists permit_documents_uploaded_by_idx on humas.permit_documents(uploaded_by);
create index if not exists permit_events_actor_idx on humas.permit_workflow_events(actor_id);
create index if not exists protocol_agendas_permit_idx on humas.protocol_agendas(permit_id);
create index if not exists protocol_agendas_created_by_idx on humas.protocol_agendas(created_by);
create index if not exists protocol_agendas_assignee_idx on humas.protocol_agendas(assigned_staff);
create index if not exists protocol_tasks_assignee_idx on humas.protocol_tasks(assigned_to);
create index if not exists protocol_events_actor_idx on humas.protocol_workflow_events(actor_id);
create index if not exists permit_inbox_permit_idx on humas.permit_inbox_notifications(permit_id);
create index if not exists permit_outbox_permit_idx on humas.permit_notification_outbox(permit_id);
