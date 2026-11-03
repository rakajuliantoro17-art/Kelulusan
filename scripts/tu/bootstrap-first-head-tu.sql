-- PINTUKU — First Head TU bootstrap (run manually in Supabase SQL Editor)
-- IMPORTANT:
-- 1. Create/invite the designated Head TU account in Supabase Auth first.
-- 2. Verify the person's identity through the school's official process.
-- 3. In Authentication > Users, copy the UUID from the exact verified account.
-- 4. Replace the placeholder UUID below. Never guess or match by email alone.
-- 5. Run this script from Supabase SQL Editor as postgres/supabase_admin.
-- 6. The procedure is one-time and fails if a Head TU role is already active.
--
-- This script does not create users, change passwords, or grant any role to the caller.

select
  id,
  email_confirmed_at,
  banned_until,
  deleted_at
from auth.users
where id = '00000000-0000-0000-0000-000000000000'::uuid;
-- Stop if the row is absent, email_confirmed_at is NULL, deleted_at is non-NULL,
-- or banned_until is in the future.

select tu_private.bootstrap_first_head_tu(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Administrator database sekolah'
) as bootstrapped_head_tu_user_id;

-- Verify the assignment and its audit event.
select
  ur.user_id,
  ur.role_code,
  u.unit_code,
  ur.is_active,
  ur.assigned_at
from tu.user_roles ur
join tu.units u on u.id = ur.unit_id
where ur.role_code = 'head_tu'
  and ur.is_active
  and ur.revoked_at is null;

select
  target_user_id,
  actor_label,
  action,
  role_code,
  created_at
from tu.role_audit_logs
where role_code = 'head_tu'
order by created_at desc
limit 5;
