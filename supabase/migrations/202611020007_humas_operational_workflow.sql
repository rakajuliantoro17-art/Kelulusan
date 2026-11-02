-- PINTUKU HUMAS — Sprint 3H: operational agreement workflow and dashboard summary
-- Source migration only. Apply manually after migrations 001–006 have passed local integration tests.
-- No production database changes are performed by this commit.

create or replace function humas.agreement_update_draft(
  p_actor_id uuid, p_actor_role text, p_agreement_id uuid, p_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_before humas.agreements%rowtype; v_after humas.agreements%rowtype;
begin
  if p_actor_id is null or p_actor_role is distinct from 'staff_humas'
     or not exists (
       select 1 from humas.user_roles ur
       where ur.user_id=p_actor_id and ur.role_code='staff_humas'
         and ur.is_active=true and ur.revoked_at is null
     ) then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object'
     or p_payload = '{}'::jsonb then
    raise exception using errcode='22023', message='empty_update';
  end if;
  select * into v_before from humas.agreements
    where id=p_agreement_id for update;
  if not found then raise exception using errcode='P0002', message='agreement_not_found'; end if;
  if v_before.status not in ('draft','revision_required') then
    raise exception using errcode='22023', message='agreement_not_editable';
  end if;
  if p_payload ? 'title' and nullif(pg_catalog.btrim(p_payload->>'title'),'') is null
     or p_payload ? 'purpose' and nullif(pg_catalog.btrim(p_payload->>'purpose'),'') is null
     or p_payload ? 'agreement_type' and coalesce(p_payload->>'agreement_type','') not in ('mou','pks','implementation','other')
     or p_payload ? 'partner_id' and not exists (
       select 1 from humas.partners p where p.id=(p_payload->>'partner_id')::uuid and p.record_status='active'
     ) then
    raise exception using errcode='22023', message='invalid_agreement_payload';
  end if;
  update humas.agreements set
    partner_id=case when p_payload ? 'partner_id' then (p_payload->>'partner_id')::uuid else partner_id end,
    title=case when p_payload ? 'title' then pg_catalog.btrim(p_payload->>'title') else title end,
    agreement_type=case when p_payload ? 'agreement_type' then p_payload->>'agreement_type' else agreement_type end,
    purpose=case when p_payload ? 'purpose' then pg_catalog.btrim(p_payload->>'purpose') else purpose end,
    scope_of_work=case when p_payload ? 'scope_of_work' then nullif(pg_catalog.btrim(p_payload->>'scope_of_work'),'') else scope_of_work end,
    start_date=case when p_payload ? 'start_date' then nullif(p_payload->>'start_date','')::date else start_date end,
    end_date=case when p_payload ? 'end_date' then nullif(p_payload->>'end_date','')::date else end_date end,
    estimated_value=case when p_payload ? 'estimated_value' then nullif(p_payload->>'estimated_value','')::numeric else estimated_value end,
    school_coordinator=case when p_payload ? 'school_coordinator' then nullif(pg_catalog.btrim(p_payload->>'school_coordinator'),'') else school_coordinator end,
    partner_coordinator=case when p_payload ? 'partner_coordinator' then nullif(pg_catalog.btrim(p_payload->>'partner_coordinator'),'') else partner_coordinator end
  where id=p_agreement_id returning * into v_after;
  if v_after.start_date is not null and v_after.end_date is not null and v_after.end_date < v_after.start_date then
    raise exception using errcode='22023', message='invalid_date_order';
  end if;
  insert into humas.agreement_workflow_events(
    agreement_id,event_type,from_status,to_status,actor_id,actor_role,reason,metadata
  ) values (
    p_agreement_id,'draft_updated',v_before.status,v_after.status,p_actor_id,p_actor_role,
    nullif(pg_catalog.btrim(p_payload->>'reason'),''),
    pg_catalog.jsonb_build_object('changed_fields',pg_catalog.jsonb_agg(key))
  );
  return pg_catalog.to_jsonb(v_after);
end;
$$;

create or replace function humas.agreement_transition(
  p_actor_id uuid, p_actor_role text, p_agreement_id uuid,
  p_action text, p_reason text default null
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_agreement humas.agreements%rowtype;
  v_from text;
  v_to text;
  v_stage text;
  v_decision text;
  v_required_role text;
begin
  if p_actor_id is null or p_actor_role not in ('staff_humas','vice_principal_humas','principal') then
    raise exception using errcode='42501', message='forbidden';
  end if;
  if not exists (
    select 1 from humas.user_roles ur
    where ur.user_id=p_actor_id and ur.role_code=p_actor_role
      and ur.is_active=true and ur.revoked_at is null
  ) then raise exception using errcode='42501', message='forbidden'; end if;

  select * into v_agreement from humas.agreements
    where id=p_agreement_id for update;
  if not found then raise exception using errcode='P0002', message='agreement_not_found'; end if;
  v_from := v_agreement.status;

  case p_action
    when 'submit' then v_required_role:='staff_humas'; v_to:='submitted'; v_stage:='staff_verification'; v_decision:='pending';
      if v_from not in ('draft','revision_required') then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'verify' then v_required_role:='staff_humas'; v_to:='verified'; v_stage:='staff_verification'; v_decision:='verified';
      if v_from<>'submitted' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'recommend' then v_required_role:='vice_principal_humas'; v_to:='recommended'; v_stage:='vice_principal_review'; v_decision:='recommended';
      if v_from<>'verified' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'request_revision' then
      if p_actor_role='vice_principal_humas' and v_from in ('submitted','verified') then
        v_required_role:='vice_principal_humas'; v_stage:='vice_principal_review';
      elsif p_actor_role='principal' and v_from='pending_principal_approval' then
        v_required_role:='principal'; v_stage:='principal_decision';
      else raise exception using errcode='42501',message='forbidden'; end if;
      v_to:='revision_required'; v_decision:='revision_required';
      if nullif(pg_catalog.btrim(p_reason),'') is null then raise exception using errcode='22023',message='reason_required'; end if;
    when 'forward_to_principal' then v_required_role:='vice_principal_humas'; v_to:='pending_principal_approval';
      if v_from<>'recommended' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'approve' then v_required_role:='principal'; v_to:='approved'; v_stage:='principal_decision'; v_decision:='approved';
      if v_from<>'pending_principal_approval' then raise exception using errcode='22023',message='invalid_transition'; end if;
      if v_agreement.created_by=p_actor_id or v_agreement.assigned_staff=p_actor_id then
        raise exception using errcode='42501',message='separation_of_duties_required';
      end if;
    when 'reject' then v_required_role:='principal'; v_to:='rejected'; v_stage:='principal_decision'; v_decision:='rejected';
      if v_from<>'pending_principal_approval' then raise exception using errcode='22023',message='invalid_transition'; end if;
      if nullif(pg_catalog.btrim(p_reason),'') is null then raise exception using errcode='22023',message='reason_required'; end if;
    when 'prepare_signature' then v_required_role:='principal'; v_to:='pending_signature';
      if v_from<>'approved' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'sign_physical' then v_required_role:='staff_humas'; v_to:='physically_signed';
      if v_from<>'pending_signature' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'sign_electronic' then v_required_role:='staff_humas'; v_to:='electronically_signed';
      if v_from<>'pending_signature' then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'register' then v_required_role:='staff_humas'; v_to:='registered';
      if v_from not in ('physically_signed','electronically_signed') then raise exception using errcode='22023',message='invalid_transition'; end if;
    when 'archive' then v_required_role:='staff_humas'; v_to:='archived';
      if v_from<>'registered' then raise exception using errcode='22023',message='invalid_transition'; end if;
    else raise exception using errcode='22023',message='unknown_action';
  end case;

  if p_actor_role is distinct from v_required_role then
    raise exception using errcode='42501',message='forbidden';
  end if;
  if p_action in ('submit','verify','recommend','request_revision','approve','reject')
     and nullif(pg_catalog.btrim(p_reason),'') is null
     and p_action not in ('submit','verify','recommend','approve') then
    raise exception using errcode='22023',message='reason_required';
  end if;

  update humas.agreements set
    status=v_to,
    submitted_at=case when p_action='submit' then pg_catalog.now() else submitted_at end,
    approved_at=case when p_action='approve' then pg_catalog.now() else approved_at end,
    signed_at=case when p_action in ('sign_physical','sign_electronic') then pg_catalog.now() else signed_at end,
    registered_at=case when p_action='register' then pg_catalog.now() else registered_at end,
    archived_at=case when p_action='archive' then pg_catalog.now() else archived_at end
  where id=p_agreement_id returning * into v_agreement;

  if v_stage is not null and v_decision is not null then
    insert into humas.agreement_approvals(
      agreement_id,stage,decision,actor_id,actor_role,notes,acted_at
    ) values (
      p_agreement_id,v_stage,v_decision,p_actor_id,p_actor_role,
      nullif(pg_catalog.btrim(p_reason),''),pg_catalog.now()
    );
  end if;

  insert into humas.agreement_workflow_events(
    agreement_id,event_type,from_status,to_status,actor_id,actor_role,reason,metadata
  ) values (
    p_agreement_id,p_action,v_from,v_to,p_actor_id,p_actor_role,
    nullif(pg_catalog.btrim(p_reason),''),
    pg_catalog.jsonb_build_object('workflow_version',1)
  );
  return pg_catalog.to_jsonb(v_agreement);
end;
$$;

create or replace function humas.dashboard_summary()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'total_partners',(select pg_catalog.count(*) from humas.partners),
    'active_partners',(select pg_catalog.count(*) from humas.partners where record_status='active'),
    'total_agreements',(select pg_catalog.count(*) from humas.agreements),
    'in_process',(select pg_catalog.count(*) from humas.agreements where status in ('draft','submitted','verified','recommended','pending_principal_approval','revision_required','pending_signature')),
    'active_agreements',(select pg_catalog.count(*) from humas.agreements where status in ('physically_signed','electronically_signed','registered')),
    'expiring_soon',(select pg_catalog.count(*) from humas.agreements where end_date between pg_catalog.current_date and pg_catalog.current_date+interval '90 days' and status not in ('archived','rejected','expired'))
  );
$$;

revoke all on function humas.agreement_update_draft(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function humas.agreement_transition(uuid,text,uuid,text,text) from public,anon,authenticated;
revoke all on function humas.dashboard_summary() from public,anon,authenticated;
grant execute on function humas.agreement_update_draft(uuid,text,uuid,jsonb) to service_role;
grant execute on function humas.agreement_transition(uuid,text,uuid,text,text) to service_role;
grant execute on function humas.dashboard_summary() to service_role;

comment on function humas.agreement_transition(uuid,text,uuid,text,text) is
  'Validates active HUMAS role and legal workflow transition in one transaction; recommendation, approval, signature, registration and archive remain separate.';
