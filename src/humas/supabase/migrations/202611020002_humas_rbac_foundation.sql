-- PINTUKU / HUMAS — Sprint 3A: identity-to-role mapping
-- Apply only after reviewing Sprint 2 foundation migration.
-- This migration does not create users or assign roles automatically.

create table if not exists humas.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_code text not null check (role_code in (
    'staff_humas',
    'vice_principal_humas',
    'principal',
    'system_operator'
  )),
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  constraint user_roles_revocation_consistency check (
    (is_active = true and revoked_at is null)
    or (is_active = false and revoked_at is not null)
  ),
  unique (user_id, role_code)
);

create index if not exists user_roles_active_user_idx
  on humas.user_roles(user_id, role_code)
  where is_active = true;

create index if not exists user_roles_assignment_idx
  on humas.user_roles(assigned_at desc);

alter table humas.user_roles enable row level security;

-- Role assignments are private authorization data.
-- No browser role (anon/authenticated) receives table privileges or policies.
revoke all on table humas.user_roles from public, anon, authenticated;
grant select, insert, update, delete on table humas.user_roles to service_role;

comment on table humas.user_roles is
  'Server-managed HUMAS role assignments. Never expose this table to browser clients.';
comment on column humas.user_roles.role_code is
  'staff_humas, vice_principal_humas, principal, or system_operator. Operator is technical-only and must not approve agreements.';
comment on column humas.user_roles.is_active is
  'Only active assignments authorize actions. Revocation must set revoked_at.';
