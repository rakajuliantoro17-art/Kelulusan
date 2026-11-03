-- PINTUKU HUMAS Sprint 3: operational task ownership for protocol checklists.
-- Column protocol_tasks.assigned_to already exists; this migration activates it safely.

create or replace function humas.protocol_task_update(
 p_actor_id uuid,p_actor_role text,p_task_id uuid,p_payload jsonb
) returns jsonb
language plpgsql
set search_path=''
as $$
declare
 v_before humas.protocol_tasks%rowtype;
 v_row humas.protocol_tasks%rowtype;
 v_event text:='task_updated';
begin
 if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
  or not exists(select 1 from humas.user_roles ur where ur.user_id=p_actor_id
    and ur.role_code='staff_humas' and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='42501',message='forbidden';
 end if;
 if p_payload is null or pg_catalog.jsonb_typeof(p_payload)<>'object' or p_payload='{}'::jsonb then
  raise exception using errcode='22023',message='empty_update';
 end if;
 if p_payload ? 'task_status' and coalesce(p_payload->>'task_status','') not in ('pending','in_progress','done','blocked','cancelled') then
  raise exception using errcode='22023',message='invalid_task_status';
 end if;
 if p_payload ? 'task_category' and coalesce(p_payload->>'task_category','') not in
  ('reception','venue','accommodation','consumption','equipment','ceremony','documentation','security','transport','other') then
  raise exception using errcode='22023',message='invalid_task_category';
 end if;
 if p_payload ? 'task_title' and pg_catalog.length(pg_catalog.btrim(p_payload->>'task_title')) not between 2 and 200 then
  raise exception using errcode='22023',message='invalid_task_title';
 end if;
 if p_payload ? 'assigned_to' and nullif(p_payload->>'assigned_to','') is not null
  and not exists(select 1 from humas.user_roles ur
   where ur.user_id=(p_payload->>'assigned_to')::uuid and ur.role_code='staff_humas'
    and ur.is_active=true and ur.revoked_at is null) then
  raise exception using errcode='22023',message='invalid_task_assignee';
 end if;
 select * into v_before from humas.protocol_tasks where id=p_task_id for update;
 if not found then raise exception using errcode='P0002',message='task_not_found'; end if;
 if exists(select 1 from humas.protocol_agendas a where a.id=v_before.agenda_id and a.status in ('completed','cancelled')) then
  raise exception using errcode='22023',message='agenda_closed';
 end if;
 update humas.protocol_tasks set
  task_title=case when p_payload?'task_title' then pg_catalog.btrim(p_payload->>'task_title') else task_title end,
  task_category=case when p_payload?'task_category' then p_payload->>'task_category' else task_category end,
  task_status=case when p_payload?'task_status' then p_payload->>'task_status' else task_status end,
  due_at=case when p_payload?'due_at' then nullif(p_payload->>'due_at','')::timestamptz else due_at end,
  notes=case when p_payload?'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end,
  assigned_to=case when p_payload?'assigned_to' then nullif(p_payload->>'assigned_to','')::uuid else assigned_to end,
  completed_at=case when p_payload->>'task_status'='done' then pg_catalog.now()
   when p_payload?'task_status' then null else completed_at end
 where id=p_task_id returning * into v_row;
 if p_payload?'assigned_to' and v_before.assigned_to is distinct from v_row.assigned_to then
  v_event:='task_assignment_changed';
 end if;
 insert into humas.protocol_workflow_events(agenda_id,event_type,actor_id,actor_role,metadata)
 values(v_row.agenda_id,v_event,p_actor_id,p_actor_role,
  pg_catalog.jsonb_build_object('task_id',v_row.id,'task_status',v_row.task_status,
   'previous_assignee',v_before.assigned_to,'assigned_to',v_row.assigned_to));
 return pg_catalog.to_jsonb(v_row);
end;
$$;

revoke all on function humas.protocol_task_update(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function humas.protocol_task_update(uuid,text,uuid,jsonb) to service_role;

comment on function humas.protocol_task_update(uuid,text,uuid,jsonb) is
 'Updates protocol checklist tasks and validates assignee against active staff_humas role assignments.';
