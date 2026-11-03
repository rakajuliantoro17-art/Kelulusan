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
  v_intake jsonb;
  v_intake_id uuid;
  v_rate_result jsonb;
  v_i integer;
  v_partner_id uuid;
  v_proposal_id uuid;
  v_support_id uuid;
  v_proposal_events integer;
  v_partner_events integer;
  v_workflow_events integer;
  v_inactive_partner_count integer;
  v_agenda jsonb;
  v_task jsonb;
  v_task_updated jsonb;
  v_assignment_events integer;
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


  v_intake := humas.alumni_intake_submit(repeat('a',64),
    '{"full_name":"Alumni Intake Baru","graduation_year":2019,"whatsapp":"08123450000","current_status":"employed","employer":"Instansi Alumni","consent_data_processing":true,"consent_events":true,"consent_fundraising":false}'::jsonb);
  v_intake_id := (v_intake->>'submission_id')::uuid;
  IF v_intake->>'ok' <> 'true' OR v_intake->>'status' <> 'pending' OR v_intake_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: public alumni intake did not create a pending submission';
  END IF;
  v_intake := humas.alumni_intake_review(v_staff,'staff_humas',v_intake_id,'approve','Data diverifikasi');
  IF v_intake->>'status' <> 'approved' OR v_intake->>'profile_id' IS NULL THEN
    RAISE EXCEPTION 'FAIL: approved alumni intake was not added to the directory';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM humas.alumni_profiles WHERE id=(v_intake->>'profile_id')::uuid AND consent_events=true AND consent_fundraising=false) THEN
    RAISE EXCEPTION 'FAIL: intake consent values were not transferred to the alumni profile';
  END IF;
  v_intake := humas.alumni_intake_submit(repeat('c',64),
    '{"full_name":"Duplikat Potensial","graduation_year":2020,"whatsapp":"08123456789","consent_data_processing":true}'::jsonb);
  v_intake := humas.alumni_intake_review(v_staff,'staff_humas',(v_intake->>'submission_id')::uuid,'approve',NULL);
  IF v_intake->>'status' <> 'duplicate_possible' OR v_intake->>'matching_profile_id' <> v_alumni_id::text THEN
    RAISE EXCEPTION 'FAIL: duplicate alumni submission was not flagged for manual review';
  END IF;
  v_intake := humas.alumni_intake_submit(repeat('d',64),
    '{"full_name":"Pengajuan Ditolak","graduation_year":2018,"whatsapp":"08123459999","consent_data_processing":true}'::jsonb);
  v_intake := humas.alumni_intake_review(v_staff,'staff_humas',(v_intake->>'submission_id')::uuid,'reject','Tidak lolos verifikasi');
  IF v_intake->>'status' <> 'rejected' THEN RAISE EXCEPTION 'FAIL: rejected intake status not recorded'; END IF;
  FOR v_i IN 1..5 LOOP
    PERFORM humas.alumni_intake_submit(repeat('b',64),
      pg_catalog.jsonb_build_object('full_name','Rate Limit '||v_i,'graduation_year',2017,'whatsapp','0812345'||lpad(v_i::text,4,'0'),'consent_data_processing',true));
  END LOOP;
  v_rate_result := humas.alumni_intake_submit(repeat('b',64),
    '{"full_name":"Rate Limit Sixth","graduation_year":2017,"whatsapp":"08123458888","consent_data_processing":true}'::jsonb);
  IF v_rate_result->>'rate_limited' <> 'true' THEN
    RAISE EXCEPTION 'FAIL: public alumni intake rate limit did not reject the sixth request';
  END IF;
  -- Sprint 3: protocol task ownership can be claimed and released by active HUMAS staff.
  v_agenda := humas.protocol_agenda_create(v_staff,'staff_humas',
    pg_catalog.jsonb_build_object(
      'title','Agenda Protokoler Uji Sprint 3',
      'agenda_type','institutional_meeting',
      'starts_at',(now()+interval '2 days')::text,
      'ends_at',(now()+interval '2 days 2 hours')::text,
      'venue','Ruang Rapat Uji'
    ));
  v_task := humas.protocol_task_create(v_staff,'staff_humas',(v_agenda->>'id')::uuid,
    '{"task_category":"reception","task_title":"Siapkan meja penerimaan"}'::jsonb);
  v_task_updated := humas.protocol_task_update(v_staff,'staff_humas',(v_task->>'id')::uuid,
    pg_catalog.jsonb_build_object('assigned_to',v_staff));
  IF v_task_updated->>'assigned_to' <> v_staff::text THEN
    RAISE EXCEPTION 'FAIL: protocol task was not assigned to active staff';
  END IF;
  BEGIN
    PERFORM humas.protocol_task_update(v_staff,'staff_humas',(v_task->>'id')::uuid,
      pg_catalog.jsonb_build_object('assigned_to',v_inactive_staff));
    RAISE EXCEPTION 'FAIL: protocol task accepted inactive staff assignee';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  v_task_updated := humas.protocol_task_update(v_staff,'staff_humas',(v_task->>'id')::uuid,
    '{"assigned_to":""}'::jsonb);
  IF v_task_updated->>'assigned_to' IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: protocol task assignment could not be released';
  END IF;
  SELECT count(*) INTO v_assignment_events FROM humas.protocol_workflow_events
   WHERE agenda_id=(v_agenda->>'id')::uuid AND event_type='task_assignment_changed';
  IF v_assignment_events <> 2 THEN
    RAISE EXCEPTION 'FAIL: expected 2 task assignment audit events, got %',v_assignment_events;
  END IF;

  RAISE NOTICE 'PASS: partner, agreement, proposal, sponsorship, alumni consent, public intake review and rate limiting transactions; workflow transitions; audit immutability; role checks; and rollback';
END
$tests$;

RESET ROLE;
ROLLBACK;

DO $done$
BEGIN
  RAISE NOTICE 'HUMAS local integration smoke tests completed. Fixture transaction rolled back.';
END
$done$;
