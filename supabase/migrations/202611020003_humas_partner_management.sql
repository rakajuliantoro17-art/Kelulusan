-- PINTUKU HUMAS — Sprint 3C: partner management and immutable audit trail
-- Apply only after reviewing all HUMAS migrations. Not applied to production by this commit.

create table if not exists humas.partner_events (
  id bigint generated always as identity primary key,
  partner_id uuid references humas.partners(id) on delete set null,
  event_type text not null check (event_type in ('created','updated','status_changed')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null check (actor_role = 'staff_humas'),
  before_data jsonb,
  after_data jsonb,
  reason text,
  occurred_at timestamptz not null default now()
);

create index if not exists partner_events_partner_timeline_idx
  on humas.partner_events(partner_id, occurred_at desc);
alter table humas.partner_events enable row level security;
revoke all on table humas.partner_events from public, anon, authenticated;
grant select, insert on table humas.partner_events to service_role;

create or replace function humas.partner_create(
  p_actor_id uuid, p_actor_role text, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_partner humas.partners%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  if nullif(pg_catalog.btrim(p_payload->>'partner_name'), '') is null
     or coalesce(p_payload->>'partner_type','') not in
       ('government','education','business','community','nonprofit','alumni','other') then
    raise exception using errcode = '22023', message = 'invalid_partner_payload';
  end if;

  insert into humas.partners (
    partner_name, partner_type, institution_address, contact_person,
    contact_email, contact_phone, website_url, notes, record_status, created_by
  ) values (
    pg_catalog.btrim(p_payload->>'partner_name'),
    p_payload->>'partner_type',
    nullif(pg_catalog.btrim(p_payload->>'institution_address'),''),
    nullif(pg_catalog.btrim(p_payload->>'contact_person'),''),
    nullif(pg_catalog.btrim(p_payload->>'contact_email'),''),
    nullif(pg_catalog.btrim(p_payload->>'contact_phone'),''),
    nullif(pg_catalog.btrim(p_payload->>'website_url'),''),
    nullif(pg_catalog.btrim(p_payload->>'notes'),''),
    'active', p_actor_id
  ) returning * into v_partner;

  insert into humas.partner_events(partner_id,event_type,actor_id,actor_role,after_data)
  values (v_partner.id,'created',p_actor_id,p_actor_role,
    pg_catalog.to_jsonb(v_partner) - 'created_by');

  return pg_catalog.to_jsonb(v_partner) - 'created_by';
end;
$$;

create or replace function humas.partner_update(
  p_actor_id uuid, p_actor_role text, p_partner_id uuid, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.partners%rowtype; v_after humas.partners%rowtype;
begin
  if p_actor_id is null or p_actor_role <> 'staff_humas' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object'
     or p_payload = '{}'::jsonb then
    raise exception using errcode = '22023', message = 'empty_update';
  end if;
  if p_payload ? 'partner_type' and coalesce(p_payload->>'partner_type','') not in
       ('government','education','business','community','nonprofit','alumni','other') then
    raise exception using errcode = '22023', message = 'invalid_partner_type';
  end if;
  select * into v_before from humas.partners where id=p_partner_id for update;
  if not found then raise exception using errcode='P0002', message='partner_not_found'; end if;

  update humas.partners set
    partner_name = case when p_payload ? 'partner_name' then nullif(pg_catalog.btrim(p_payload->>'partner_name'),'') else partner_name end,
    partner_type = case when p_payload ? 'partner_type' then p_payload->>'partner_type' else partner_type end,
    institution_address = case when p_payload ? 'institution_address' then nullif(pg_catalog.btrim(p_payload->>'institution_address'),'') else institution_address end,
    contact_person = case when p_payload ? 'contact_person' then nullif(pg_catalog.btrim(p_payload->>'contact_person'),'') else contact_person end,
    contact_email = case when p_payload ? 'contact_email' then nullif(pg_catalog.btrim(p_payload->>'contact_email'),'') else contact_email end,
    contact_phone = case when p_payload ? 'contact_phone' then nullif(pg_catalog.btrim(p_payload->>'contact_phone'),'') else contact_phone end,
    website_url = case when p_payload ? 'website_url' then nullif(pg_catalog.btrim(p_payload->>'website_url'),'') else website_url end,
    notes = case when p_payload ? 'notes' then nullif(pg_catalog.btrim(p_payload->>'notes'),'') else notes end
  where id=p_partner_id returning * into v_after;

  if v_after.partner_name is null then
    raise exception using errcode='22023', message='partner_name_required';
  end if;
  insert into humas.partner_events(partner_id,event_type,actor_id,actor_role,before_data,after_data)
  values (v_after.id,'updated',p_actor_id,p_actor_role,
    pg_catalog.to_jsonb(v_before)-'created_by',pg_catalog.to_jsonb(v_after)-'created_by');
  return pg_catalog.to_jsonb(v_after)-'created_by';
end;
$$;

create or replace function humas.partner_set_status(
  p_actor_id uuid, p_actor_role text, p_partner_id uuid, p_status text, p_reason text
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.partners%rowtype; v_after humas.partners%rowtype;
begin
  if p_actor_id is null or p_actor_role <> 'staff_humas' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  if p_status is null or p_status not in ('active','inactive','under_review') then
    raise exception using errcode = '22023', message = 'invalid_partner_status';
  end if;
  select * into v_before from humas.partners where id=p_partner_id for update;
  if not found then raise exception using errcode='P0002', message='partner_not_found'; end if;
  update humas.partners set record_status=p_status where id=p_partner_id returning * into v_after;
  insert into humas.partner_events(partner_id,event_type,actor_id,actor_role,before_data,after_data,reason)
  values (v_after.id,'status_changed',p_actor_id,p_actor_role,
    pg_catalog.jsonb_build_object('record_status',v_before.record_status),
    pg_catalog.jsonb_build_object('record_status',v_after.record_status),
    nullif(pg_catalog.btrim(p_reason),''));
  return pg_catalog.to_jsonb(v_after)-'created_by';
end;
$$;

revoke all on function humas.partner_create(uuid,text,jsonb) from public, anon, authenticated;
revoke all on function humas.partner_update(uuid,text,uuid,jsonb) from public, anon, authenticated;
revoke all on function humas.partner_set_status(uuid,text,uuid,text,text) from public, anon, authenticated;
grant execute on function humas.partner_create(uuid,text,jsonb) to service_role;
grant execute on function humas.partner_update(uuid,text,uuid,jsonb) to service_role;
grant execute on function humas.partner_set_status(uuid,text,uuid,text,text) to service_role;

comment on table humas.partner_events is 'Append-only audit timeline for partner master-data changes; server-side only.';
