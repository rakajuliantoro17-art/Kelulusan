-- HUMAS local PostgreSQL integration smoke tests.
-- All fixture data is rolled back. Run after bootstrap and migrations 001-008.

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
  ('10000000-0000-4000-8000-000000000004'),
  ('10000000-0000-4000-8000-000000000005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO humas.user_roles(user_id, role_code, is_active, revoked_at)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'staff_humas', true, null),
  ('10000000-0000-4000-8000-000000000001', 'principal', true, null),
  ('10000000-0000-4000-8000-000000000002', 'staff_humas', false, now()),
  ('10000000-0000-4000-8000-000000000003', 'principal', true, null),
  ('10000000-0000-4000-8000-000000000004', 'system_operator', true, null),
  ('10000000-0000-4000-8000-000000000005', 'vice_principal_humas', true, null)
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
  v_vice constant uuid := '10000000-0000-4000-8000-000000000005';
  v_partner jsonb;
  v_updated jsonb;
  v_status jsonb;
  v_agreement jsonb;
  v_proposal jsonb;
  v_support jsonb;
  v_alumni jsonb;
  v_alumni_id uuid;
  v_partner_id uuid;
  v_proposal_id uuid;
  v_support_id uuid;
  v_proposal_events integer;
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

  -- Staff can edit a draft before submission.
  v_agreement := humas.agreement_update_draft(
    v_staff, 'staff_humas', (v_agreement->>'id')::uuid,
    '{"title":"MoU Uji Lokal Diperbarui","reason":"Perbaikan judul"}'::jsonb
  );
  IF v_agreement->>'title' <> 'MoU Uji Lokal Diperbarui' THEN
    RAISE EXCEPTION 'FAIL: agreement_update_draft did not persist the title';
  END IF;

  -- Exercise the full valid path with distinct staff, vice principal and principal actors.
  v_agreement := humas.agreement_transition(v_staff,'staff_humas',(v_agreement->>'id')::uuid,'submit',null);
  v_agreement := humas.agreement_transition(v_staff,'staff_humas',(v_agreement->>'id')::uuid,'verify','Administrasi lengkap');
  v_agreement := humas.agreement_transition(v_vice,'vice_principal_humas',(v_agreement->>'id')::uuid,'recommend','Substansi sesuai');
  v_agreement := humas.agreement_transition(v_vice,'vice_principal_humas',(v_agreement->>'id')::uuid,'forward_to_principal',null);
  BEGIN
    PERFORM humas.agreement_transition(v_staff,'principal',(v_agreement->>'id')::uuid,'approve','Uji pemisahan tugas');
    RAISE EXCEPTION 'FAIL: creator was allowed to approve their own agreement';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  v_agreement := humas.agreement_transition(v_principal,'principal',(v_agreement->>'id')::uuid,'approve','Disetujui Kepala Sekolah');
  v_agreement := humas.agreement_transition(v_principal,'principal',(v_agreement->>'id')::uuid,'prepare_signature',null);
  v_agreement := humas.agreement_transition(v_staff,'staff_humas',(v_agreement->>'id')::uuid,'sign_physical','Dokumen fisik telah ditandatangani');
  v_agreement := humas.agreement_transition(v_staff,'staff_humas',(v_agreement->>'id')::uuid,'register','Nomor register dicatat');
  v_agreement := humas.agreement_transition(v_staff,'staff_humas',(v_agreement->>'id')::uuid,'archive','Arsip final disimpan');
  IF v_agreement->>'status' <> 'archived' THEN
    RAISE EXCEPTION 'FAIL: full agreement workflow did not end in archived';
  END IF;

  -- Approval history is append-only even for the privileged server role.
  BEGIN
    UPDATE humas.agreement_approvals
    SET notes='Mutation must be rejected'
    WHERE agreement_id=(v_agreement->>'id')::uuid;
    RAISE EXCEPTION 'FAIL: approval history unexpectedly allowed UPDATE';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  SELECT count(*) INTO v_workflow_events
  FROM humas.agreement_workflow_events
  WHERE agreement_id = (v_agreement->>'id')::uuid
    AND event_type = 'draft_created';
  IF v_workflow_events <> 1 THEN
    RAISE EXCEPTION 'FAIL: expected exactly one draft_created event, got %', v_workflow_events;
  END IF;


  -- Proposal creation, editing, sponsor commitment, realization, and lifecycle.
  v_proposal := humas.proposal_create(v_staff,'staff_humas',
    pg_catalog.jsonb_build_object(
      'title','Proposal Uji Lokal','category','facility',
      'description','Pengujian proposal dan dukungan sponsor.',
      'objectives','Memastikan alur pencatatan dukungan.',
      'requested_amount','1500000','owner_unit','Sarpras',
      'proposal_date',current_date::text
    ));
  v_proposal_id := (v_proposal->>'id')::uuid;
  IF v_proposal_id IS NULL OR v_proposal->>'status' <> 'draft' THEN
    RAISE EXCEPTION 'FAIL: proposal_create did not return a draft';
  END IF;

  v_proposal := humas.proposal_update(v_staff,'staff_humas',v_proposal_id,
    '{"title":"Proposal Uji Lokal Diperbarui"}'::jsonb);
  IF v_proposal->>'title' <> 'Proposal Uji Lokal Diperbarui' THEN
    RAISE EXCEPTION 'FAIL: proposal_update did not persist title';
  END IF;

  v_support := humas.proposal_support_create(v_staff,'staff_humas',v_proposal_id,
    pg_catalog.jsonb_build_object(
      'sponsor_name','Mitra Uji Lokal','partner_id',v_partner_id,
      'support_type','cash','support_description','Bantuan dana kegiatan',
      'estimated_value','1000000','contact_person','Petugas Uji'
    ));
  v_support_id := (v_support->>'id')::uuid;
  IF v_support_id IS NULL OR v_support->>'support_status' <> 'prospect' THEN
    RAISE EXCEPTION 'FAIL: proposal_support_create did not create prospect';
  END IF;

  v_support := humas.proposal_support_update(v_staff,'staff_humas',v_support_id,
    '{"support_status":"committed","realized_value":"250000"}'::jsonb);
  IF v_support->>'support_status' <> 'committed' OR (v_support->>'realized_value')::numeric <> 250000 THEN
    RAISE EXCEPTION 'FAIL: proposal_support_update did not persist commitment';
  END IF;

  v_support := humas.proposal_support_update(v_staff,'staff_humas',v_support_id,
    pg_catalog.jsonb_build_object(
      'support_status','realized','realized_value','1000000',
      'realization_date',current_date::text
    ));
  IF v_support->>'support_status' <> 'realized' THEN
    RAISE EXCEPTION 'FAIL: sponsor realization was not recorded';
  END IF;

  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'submitted','Proposal siap diajukan');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'under_review','Pemeriksaan awal');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'approved','Disetujui untuk penggalangan');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'fundraising','Mulai mencari dukungan');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'funded','Target dukungan terpenuhi');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'in_progress','Kegiatan berjalan');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'completed','Kegiatan selesai');
  v_proposal := humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,'archived','Arsip proposal');
  IF v_proposal->>'status' <> 'archived' THEN
    RAISE EXCEPTION 'FAIL: proposal lifecycle did not end in archived';
  END IF;

  SELECT count(*) INTO v_proposal_events FROM humas.proposal_events WHERE proposal_id=v_proposal_id;
  IF v_proposal_events < 10 THEN
    RAISE EXCEPTION 'FAIL: expected proposal and sponsor audit history, got %',v_proposal_events;
  END IF;

  BEGIN
    UPDATE humas.proposal_events SET reason='mutation denied' WHERE proposal_id=v_proposal_id;
    RAISE EXCEPTION 'FAIL: proposal audit unexpectedly allowed UPDATE';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM humas.proposal_create(v_staff,NULL,
      '{"title":"Null Role","category":"education","description":"Should fail"}'::jsonb);
    RAISE EXCEPTION 'FAIL: proposal_create accepted NULL role';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM humas.proposal_create(v_inactive_staff,'staff_humas',
      '{"title":"Inactive Staff","category":"education","description":"Should fail"}'::jsonb);
    RAISE EXCEPTION 'FAIL: proposal_create accepted inactive staff';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM humas.proposal_set_status(v_staff,'staff_humas',v_proposal_id,NULL,'Null status');
    RAISE EXCEPTION 'FAIL: proposal_set_status accepted NULL status';
  EXCEPTION WHEN invalid_parameter_value THEN
    NULL;
  END;

  IF (humas.proposal_summary()->>'total_proposals')::integer <> 1
     OR (humas.proposal_summary()->>'realized_support')::numeric <> 1000000 THEN
    RAISE EXCEPTION 'FAIL: proposal_summary totals are incorrect';
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


  v_alumni := humas.alumni_profile_create(v_staff,'staff_humas',
    '{"full_name":"Alumni Uji","graduation_year":2020,"whatsapp":"08123456789","current_status":"employed","employer":"Instansi Uji","consent_events":true,"consent_fundraising":false,"consent_source":"Formulir uji"}'::jsonb);
  v_alumni_id := (v_alumni->>'id')::uuid;
  IF v_alumni_id IS NULL OR v_alumni->>'full_name' <> 'Alumni Uji' THEN
    RAISE EXCEPTION 'FAIL: alumni_profile_create did not create a profile';
  END IF;
  PERFORM humas.alumni_contact_log_create(v_staff,'staff_humas',v_alumni_id,
    '{"purpose":"reunion","channel":"whatsapp","outcome":"sent","summary":"Undangan uji"}'::jsonb);
  BEGIN
    PERFORM humas.alumni_contact_log_create(v_staff,'staff_humas',v_alumni_id,
      '{"purpose":"fundraising","channel":"whatsapp","outcome":"sent"}'::jsonb);
    RAISE EXCEPTION 'FAIL: fundraising contact bypassed explicit consent';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  v_alumni := humas.alumni_profile_update(v_staff,'staff_humas',v_alumni_id,
    '{"consent_fundraising":true,"consent_source":"Persetujuan ulang"}'::jsonb);
  IF v_alumni->>'consent_fundraising' <> 'true' OR v_alumni->>'consent_source' <> 'Persetujuan ulang' THEN
    RAISE EXCEPTION 'FAIL: alumni consent update did not persist';
  END IF;
  PERFORM humas.alumni_contact_log_create(v_staff,'staff_humas',v_alumni_id,
    '{"purpose":"fundraising","channel":"whatsapp","outcome":"planned","summary":"Rencana penggalangan"}'::jsonb);
  IF (humas.alumni_summary()->>'total_alumni')::integer <> 1
     OR (humas.alumni_summary()->>'fundraising_reachable')::integer <> 1 THEN
    RAISE EXCEPTION 'FAIL: alumni_summary totals are incorrect';
  END IF;
  BEGIN
    UPDATE humas.alumni_contact_logs SET summary='mutated' WHERE alumni_id=v_alumni_id;
    RAISE EXCEPTION 'FAIL: alumni contact history unexpectedly allowed UPDATE';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  RAISE NOTICE 'PASS: partner, agreement, proposal, sponsorship, alumni consent and contact history transactions; workflow transitions; audit immutability; role checks; and rollback';
END
$tests$;

RESET ROLE;
ROLLBACK;

DO $done$
BEGIN
  RAISE NOTICE 'HUMAS local integration smoke tests completed. Fixture transaction rolled back.';
END
$done$;
