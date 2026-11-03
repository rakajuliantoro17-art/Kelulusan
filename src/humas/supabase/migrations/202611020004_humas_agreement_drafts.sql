-- PINTUKU HUMAS — Sprint 3D: agreement register and draft creation
-- Approval, recommendation, signing, registration and archive transitions are deliberately excluded.

create index if not exists agreements_created_at_idx
  on humas.agreements(created_at desc);
create index if not exists agreements_partner_created_idx
  on humas.agreements(partner_id, created_at desc);

create or replace function humas.agreement_create_draft(
  p_actor_id uuid, p_actor_role text, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_agreement humas.agreements%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  if nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
     or nullif(pg_catalog.btrim(p_payload->>'purpose'),'') is null
     or coalesce(p_payload->>'agreement_type','mou') not in ('mou','pks','implementation','other')
     or nullif(p_payload->>'partner_id','') is null then
    raise exception using errcode = '22023', message = 'invalid_agreement_payload';
  end if;
  if not exists (
    select 1 from humas.partners p
    where p.id=(p_payload->>'partner_id')::uuid and p.record_status='active'
  ) then
    raise exception using errcode = '22023', message = 'partner_not_active_or_missing';
  end if;

  insert into humas.agreements (
    partner_id,title,agreement_type,purpose,scope_of_work,start_date,end_date,
    estimated_value,currency_code,school_coordinator,partner_coordinator,
    status,created_by,assigned_staff
  ) values (
    (p_payload->>'partner_id')::uuid,
    pg_catalog.btrim(p_payload->>'title'),
    coalesce(p_payload->>'agreement_type','mou'),
    pg_catalog.btrim(p_payload->>'purpose'),
    nullif(pg_catalog.btrim(p_payload->>'scope_of_work'),''),
    nullif(p_payload->>'start_date','')::date,
    nullif(p_payload->>'end_date','')::date,
    nullif(p_payload->>'estimated_value','')::numeric,
    coalesce(nullif(p_payload->>'currency_code',''),'IDR'),
    nullif(pg_catalog.btrim(p_payload->>'school_coordinator'),''),
    nullif(pg_catalog.btrim(p_payload->>'partner_coordinator'),''),
    'draft',p_actor_id,p_actor_id
  ) returning * into v_agreement;

  insert into humas.agreement_workflow_events(
    agreement_id,event_type,from_status,to_status,actor_id,actor_role,reason,metadata
  ) values (
    v_agreement.id,'draft_created',null,'draft',p_actor_id,p_actor_role,
    'Draft awal dibuat',pg_catalog.jsonb_build_object('source','humas_api')
  );
  return pg_catalog.to_jsonb(v_agreement);
end;
$$;

revoke all on function humas.agreement_create_draft(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function humas.agreement_create_draft(uuid,text,jsonb) to service_role;

comment on function humas.agreement_create_draft(uuid,text,jsonb) is
  'Creates only draft agreements. It does not approve, recommend, sign, register, or archive.';
