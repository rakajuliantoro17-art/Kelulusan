-- HUMAS local privilege, RLS, and audit immutability assertions.
-- Run after migrations 001-005 on pintuku_humas_test.

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
    'partner_events'
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'humas' AND c.relname = 'user_roles'
      AND t.tgname = 'user_roles_operator_separation' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'FAIL: operator role separation trigger is missing';
  END IF;

  RAISE NOTICE 'PASS: RLS, no browser policies/grants, append-only audit, RPC privileges, and operator separation';
END
$security$;
