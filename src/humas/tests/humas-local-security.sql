-- HUMAS local privilege, RLS, and audit immutability assertions.
-- Run after migrations 001-008 on pintuku_humas_test.

DO $guard$
BEGIN
  IF current_database() <> 'pintuku_humas_test' THEN
    RAISE EXCEPTION 'Refusing security checks on database %. Expected pintuku_humas_test.', current_database();
  END IF;
END
$guard$;

DO $security$
DECLARE
  v_table text;
  v_rls boolean;
  v_policy_count integer;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'partners',
    'agreements',
    'agreement_documents',
    'agreement_approvals',
    'agreement_workflow_events',
    'user_roles',
    'partner_events',
    'proposals',
    'proposal_supports',
    'proposal_events',
    'alumni_profiles',
    'alumni_contact_logs',
    'alumni_intake_submissions',
    'alumni_intake_rate_limits'
  ] LOOP
    SELECT c.relrowsecurity
      INTO v_rls
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'humas' AND c.relname = v_table AND c.relkind = 'r';

    IF v_rls IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'FAIL: RLS is not enabled on humas.%', v_table;
    END IF;
  END LOOP;

  SELECT count(*) INTO v_policy_count
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'humas';

  IF v_policy_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: unexpected browser-facing policies exist in humas schema (%).', v_policy_count;
  END IF;

  IF has_schema_privilege('anon', 'humas', 'USAGE')
     OR has_schema_privilege('authenticated', 'humas', 'USAGE') THEN
    RAISE EXCEPTION 'FAIL: browser roles unexpectedly have humas schema USAGE';
  END IF;

  IF has_table_privilege('anon', 'humas.partners', 'SELECT')
     OR has_table_privilege('authenticated', 'humas.partners', 'SELECT')
     OR has_table_privilege('anon', 'humas.agreements', 'SELECT')
     OR has_table_privilege('authenticated', 'humas.agreements', 'SELECT')
     OR has_table_privilege('anon', 'humas.user_roles', 'SELECT')
     OR has_table_privilege('authenticated', 'humas.user_roles', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: browser roles unexpectedly have direct table SELECT';
  END IF;

  IF has_table_privilege('service_role', 'humas.partner_events', 'UPDATE')
     OR has_table_privilege('service_role', 'humas.partner_events', 'DELETE')
     OR has_table_privilege('service_role', 'humas.agreement_workflow_events', 'UPDATE')
     OR has_table_privilege('service_role', 'humas.agreement_workflow_events', 'DELETE') THEN
    RAISE EXCEPTION 'FAIL: service_role can mutate append-only audit tables';
  END IF;

  IF NOT has_table_privilege('service_role', 'humas.partner_events', 'INSERT')
     OR NOT has_table_privilege('service_role', 'humas.partner_events', 'SELECT')
     OR NOT has_table_privilege('service_role', 'humas.agreement_workflow_events', 'INSERT')
     OR NOT has_table_privilege('service_role', 'humas.agreement_workflow_events', 'SELECT') THEN
    RAISE EXCEPTION 'FAIL: service_role is missing required audit SELECT/INSERT';
  END IF;

  IF has_table_privilege('service_role','humas.proposal_events','UPDATE')
     OR has_table_privilege('service_role','humas.proposal_events','DELETE')
     OR NOT has_table_privilege('service_role','humas.proposal_events','INSERT')
     OR NOT has_table_privilege('service_role','humas.proposals','UPDATE')
     OR NOT has_table_privilege('service_role','humas.proposal_supports','UPDATE') THEN
    RAISE EXCEPTION 'FAIL: proposal/support/audit privileges are incorrect';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='humas' AND c.relname='proposal_events'
      AND t.tgname='proposal_events_append_only' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'FAIL: proposal append-only audit trigger is missing';
  END IF;

  IF has_function_privilege('anon','humas.proposal_create(uuid,text,jsonb)','EXECUTE')
     OR has_function_privilege('authenticated','humas.proposal_create(uuid,text,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.proposal_create(uuid,text,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.proposal_summary()','EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: proposal RPC privileges are incorrect';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='humas' AND c.relname='agreement_approvals'
      AND t.tgname='agreement_approvals_append_only' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'FAIL: approval append-only trigger is missing';
  END IF;

  IF has_function_privilege('anon', 'humas.partner_create(uuid,text,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'humas.partner_create(uuid,text,jsonb)', 'EXECUTE')
     OR has_function_privilege('anon', 'humas.agreement_create_draft(uuid,text,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'humas.agreement_create_draft(uuid,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: browser roles unexpectedly have business RPC EXECUTE';
  END IF;

  IF NOT has_function_privilege('service_role', 'humas.partner_create(uuid,text,jsonb)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'humas.agreement_create_draft(uuid,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role is missing required business RPC EXECUTE';
  END IF;

  IF has_function_privilege('anon', 'humas.agreement_transition(uuid,text,uuid,text,text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'humas.agreement_transition(uuid,text,uuid,text,text)', 'EXECUTE')
     OR has_function_privilege('anon', 'humas.dashboard_summary()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'humas.dashboard_summary()', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'humas.agreement_transition(uuid,text,uuid,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'humas.dashboard_summary()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: operational workflow/dashboard RPC privileges are incorrect';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'humas' AND c.relname = 'user_roles'
      AND t.tgname = 'user_roles_operator_separation' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'FAIL: operator role separation trigger is missing';
  END IF;


  IF NOT has_table_privilege('service_role','humas.alumni_profiles','UPDATE')
     OR NOT has_table_privilege('service_role','humas.alumni_contact_logs','INSERT')
     OR has_table_privilege('service_role','humas.alumni_contact_logs','UPDATE')
     OR has_table_privilege('service_role','humas.alumni_contact_logs','DELETE') THEN
    RAISE EXCEPTION 'FAIL: alumni table privileges are incorrect';
  END IF;
  IF has_function_privilege('anon','humas.alumni_profile_create(uuid,text,jsonb)','EXECUTE')
     OR has_function_privilege('authenticated','humas.alumni_profile_create(uuid,text,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.alumni_profile_create(uuid,text,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.alumni_contact_log_create(uuid,text,uuid,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: alumni RPC privileges are incorrect';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='humas' AND c.relname='alumni_contact_logs'
      AND t.tgname='alumni_contact_logs_append_only' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'FAIL: alumni contact history append-only trigger is missing';
  END IF;


  IF has_table_privilege('anon','humas.alumni_intake_submissions','SELECT')
     OR has_table_privilege('authenticated','humas.alumni_intake_submissions','SELECT')
     OR has_table_privilege('anon','humas.alumni_intake_rate_limits','SELECT')
     OR has_table_privilege('authenticated','humas.alumni_intake_rate_limits','SELECT')
     OR has_table_privilege('anon','humas.alumni_intake_submissions','INSERT')
     OR has_table_privilege('authenticated','humas.alumni_intake_submissions','INSERT') THEN
    RAISE EXCEPTION 'FAIL: browser roles can access alumni intake tables directly';
  END IF;
  IF NOT has_table_privilege('service_role','humas.alumni_intake_submissions','SELECT')
     OR NOT has_table_privilege('service_role','humas.alumni_intake_submissions','INSERT')
     OR NOT has_table_privilege('service_role','humas.alumni_intake_submissions','UPDATE')
     OR NOT has_table_privilege('service_role','humas.alumni_intake_rate_limits','INSERT')
     OR NOT has_table_privilege('service_role','humas.alumni_intake_rate_limits','UPDATE') THEN
    RAISE EXCEPTION 'FAIL: service_role is missing alumni intake privileges';
  END IF;
  IF has_function_privilege('anon','humas.alumni_intake_submit(text,jsonb)','EXECUTE')
     OR has_function_privilege('authenticated','humas.alumni_intake_submit(text,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.alumni_intake_submit(text,jsonb)','EXECUTE')
     OR has_function_privilege('anon','humas.alumni_intake_review(uuid,text,uuid,text,text)','EXECUTE')
     OR has_function_privilege('authenticated','humas.alumni_intake_review(uuid,text,uuid,text,text)','EXECUTE')
     OR NOT has_function_privilege('service_role','humas.alumni_intake_review(uuid,text,uuid,text,text)','EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: alumni intake RPC privileges are incorrect';
  END IF;
  RAISE NOTICE 'PASS: RLS, browser restrictions, append-only audit, proposal/alumni intake RPC privileges, and operator separation';
END
$security$;
