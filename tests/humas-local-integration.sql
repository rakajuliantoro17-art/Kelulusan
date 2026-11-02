-- HUMAS local PostgreSQL integration smoke tests.
-- All fixture data is rolled back. Run after bootstrap and migrations 001-006.

DO $guard$
BEGIN
  IF current_database() <> 'pintuku_humas_test' THEN
    RAISE EXCEPTION 'Refusing to test database %. Expected pintuku_humas_test.', current_database();
  END IF;
END
$guard$;

BEGIN;

INSERT INTO auth.users(id) VALUES
  ('10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO humas.user_roles(user_id, role_code, is_active, revoked_at)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'staff_humas', true, null),
  ('10000000-0000-4000-8000-000000000002', 'staff_humas', false, now()),
  ('10000000-0000-4000-8000-000000000003', 'principal', true, null),
  ('10000000-0000-4000-8000-000000000004', 'system_operator', true, null)
ON CONFLICT (user_id, role_code) DO UPDATE
SET is_active = EXCLUDED.is_active,
    revoked_at = EXCLUDED.revoked_at;

SET LOCAL ROLE service_role;

-- Technical operator must not receive an active business role.
DO $operator_guard$
BEGIN
  BEGIN
    INSERT INTO humas.user_roles(user_id, role_code, is_active, revoked_at)
    VALUES ('10000000-0000-4000-8000-000000000004', 'staff_humas', true, null);
    RAISE EXCEPTION 'FAIL: system_operator account accepted an active business role';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO humas.user_roles(user_id, role_code, is_active, revoked_at)
    VALUES ('10000000-0000-4000-8000-000000000001', 'system_operator', true, null);
    RAISE EXCEPTION 'FAIL: business-role account accepted system_operator';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    UPDATE humas.user_roles
    SET role_code = 'principal'
    WHERE user_id = '10000000-0000-4000-8000-000000000004'
      AND role_code = 'system_operator';
    RAISE EXCEPTION 'FAIL: role assignment identity was mutable';
  EXCEPTION WHEN invalid_parameter_value THEN
    NULL;
  END;
END
$operator_guard$;

DO $tests$
DECLARE
  v_staff constant uuid := '10000000-0000-4000-8000-000000000001';
  v_inactive_staff constant uuid := '10000000-0000-4000-8000-000000000002';
  v_principal constant uuid := '10000000-0000-4000-8000-000000000003';
  v_partner jsonb;
  v_updated jsonb;
  v_status jsonb;
  v_agreement jsonb;
  v_partner_id uuid;
  v_partner_events integer;
  v_workflow_events integer;
  v_inactive_partner_count integer;
BEGIN
  -- Active staff can create a partner; creation and audit are atomic.
  v_partner := humas.partner_create(
    v_staff, 'staff_humas',
    '{"partner_name":"Mitra Uji Lokal","partner_type":"education","contact_person":"Petugas Uji"}'::jsonb
  );
  v_partner_id := (v_partner->>'id')::uuid;
  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: partner_create did not return an id';
  END IF;

  -- Active staff can update and change partner status.
  v_updated := humas.partner_update(
    v_staff, 'staff_humas', v_partner_id,
    '{"contact_person":"Petugas Uji Diperbarui"}'::jsonb
  );
  IF v_updated->>'contact_person' <> 'Petugas Uji Diperbarui' THEN
    RAISE EXCEPTION 'FAIL: partner_update did not persist the requested field';
  END IF;

  -- Active partner can be used to create a draft; no approval is implied.
  v_agreement := humas.agreement_create_draft(
    v_staff, 'staff_humas',
    pg_catalog.jsonb_build_object(
      'partner_id', v_partner_id,
      'title', 'MoU Uji Lokal',
      'purpose', 'Validasi alur draft',
      'agreement_type', 'mou'
    )
  );
  IF v_agreement->>'status' <> 'draft' THEN
    RAISE EXCEPTION 'FAIL: agreement_create_draft must create draft only';
  END IF;

  SELECT count(*) INTO v_workflow_events
  FROM humas.agreement_workflow_events
  WHERE agreement_id = (v_agreement->>'id')::uuid
    AND event_type = 'draft_created';
  IF v_workflow_events <> 1 THEN
    RAISE EXCEPTION 'FAIL: expected exactly one draft_created event, got %', v_workflow_events;
  END IF;

  v_status := humas.partner_set_status(
    v_staff, 'staff_humas', v_partner_id, 'under_review', 'Pengujian lokal'
  );
  IF v_status->>'record_status' <> 'under_review' THEN
    RAISE EXCEPTION 'FAIL: partner_set_status did not change status';
  END IF;

  SELECT count(*) INTO v_partner_events
  FROM humas.partner_events WHERE partner_id = v_partner_id;
  IF v_partner_events <> 3 THEN
    RAISE EXCEPTION 'FAIL: expected 3 partner audit events, got %', v_partner_events;
  END IF;

  -- Principal cannot use staff-only partner write RPC.
  BEGIN
    PERFORM humas.partner_create(
      v_principal, 'principal',
      '{"partner_name":"Tidak Boleh","partner_type":"education"}'::jsonb
    );
    RAISE EXCEPTION 'FAIL: principal unexpectedly passed staff-only write guard';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  -- A null role label must be rejected explicitly by the RPC guard.
  BEGIN
    PERFORM humas.partner_create(
      v_staff, NULL,
      '{"partner_name":"Role Null","partner_type":"education"}'::jsonb
    );
    RAISE EXCEPTION 'FAIL: partner_create accepted a NULL role label';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM humas.agreement_create_draft(
      v_staff, NULL,
      pg_catalog.jsonb_build_object(
        'partner_id', v_partner_id,
        'title', 'Role Null',
        'purpose', 'Should be rejected'
      )
    );
    RAISE EXCEPTION 'FAIL: agreement_create_draft accepted a NULL role label';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  -- An inactive staff assignment must be rejected by the database audit trigger.
  BEGIN
    PERFORM humas.partner_create(
      v_inactive_staff, 'staff_humas',
      '{"partner_name":"Staff Nonaktif","partner_type":"education"}'::jsonb
    );
    RAISE EXCEPTION 'FAIL: inactive staff unexpectedly passed audit actor trigger';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  SELECT count(*) INTO v_inactive_partner_count
  FROM humas.partners WHERE partner_name = 'Staff Nonaktif';
  IF v_inactive_partner_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: rejected inactive actor left a partner record behind';
  END IF;

  BEGIN
    PERFORM humas.partner_set_status(
      v_staff, 'staff_humas', v_partner_id, NULL, 'Null status test'
    );
    RAISE EXCEPTION 'FAIL: partner_set_status accepted NULL status';
  EXCEPTION WHEN invalid_parameter_value THEN
    NULL;
  END;

  RAISE NOTICE 'PASS: partner transactions, draft workflow, null-role rejection, inactive actor rejection, and rollback';
END
$tests$;

RESET ROLE;
ROLLBACK;

DO $done$
BEGIN
  RAISE NOTICE 'HUMAS local integration smoke tests completed. Fixture transaction rolled back.';
END
$done$;
