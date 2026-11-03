-- PINTUKU / HUMAS — Kemitraan & MoU foundation
-- Migration is intentionally isolated from legacy Firebase modules.
-- Direct browser access is denied: RLS is enabled and no client policies are created yet.
-- Application access must be added only after Auth/RBAC and server-side authorization are reviewed.

create schema if not exists humas;

create table if not exists humas.partners (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  partner_type text not null check (partner_type in (
    'government', 'education', 'business', 'community', 'nonprofit', 'alumni', 'other'
  )),
  institution_address text,
  contact_person text,
  contact_email text,
  contact_phone text,
  website_url text,
  notes text,
  record_status text not null default 'active'
    check (record_status in ('active', 'inactive', 'under_review')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists humas.agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_code text unique,
  partner_id uuid not null references humas.partners(id) on delete restrict,
  title text not null,
  agreement_type text not null default 'mou'
    check (agreement_type in ('mou', 'pks', 'implementation', 'other')),
  purpose text not null,
  scope_of_work text,
  start_date date,
  end_date date,
  estimated_value numeric(16,2) check (estimated_value is null or estimated_value >= 0),
  currency_code char(3) not null default 'IDR',
  school_coordinator text,
  partner_coordinator text,
  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'verified', 'recommended',
    'pending_principal_approval', 'revision_required', 'rejected',
    'approved', 'pending_signature', 'physically_signed',
    'electronically_signed', 'registered', 'archived', 'expired'
  )),
  submitted_at timestamptz,
  approved_at timestamptz,
  signed_at timestamptz,
  registered_at timestamptz,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  assigned_staff uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agreement_date_order check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create table if not exists humas.agreement_documents (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references humas.agreements(id) on delete cascade,
  document_type text not null check (document_type in (
    'proposal', 'draft_agreement', 'supporting_document',
    'approved_final', 'signed_scan', 'signed_electronic', 'other'
  )),
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  checksum_sha256 text,
  version_number integer not null default 1 check (version_number > 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  is_current boolean not null default true,
  unique (agreement_id, document_type, version_number),
  unique (storage_bucket, storage_path)
);

create table if not exists humas.agreement_approvals (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references humas.agreements(id) on delete cascade,
  stage text not null check (stage in (
    'staff_verification', 'vice_principal_review', 'principal_decision'
  )),
  decision text not null check (decision in (
    'pending', 'verified', 'recommended', 'approved', 'rejected', 'revision_required'
  )),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  notes text,
  document_version_id uuid references humas.agreement_documents(id) on delete set null,
  acted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint approval_action_time check (
    (decision = 'pending' and acted_at is null)
    or (decision <> 'pending' and acted_at is not null)
  )
);

create table if not exists humas.agreement_workflow_events (
  id bigint generated always as identity primary key,
  agreement_id uuid not null references humas.agreements(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists agreements_partner_idx
  on humas.agreements(partner_id);
create index if not exists agreements_status_idx
  on humas.agreements(status);
create index if not exists agreements_end_date_idx
  on humas.agreements(end_date);
create index if not exists agreement_documents_agreement_idx
  on humas.agreement_documents(agreement_id, uploaded_at desc);
create index if not exists agreement_approvals_queue_idx
  on humas.agreement_approvals(stage, decision, created_at);
create index if not exists agreement_events_timeline_idx
  on humas.agreement_workflow_events(agreement_id, occurred_at desc);

create or replace function humas.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partners_set_updated_at on humas.partners;
create trigger partners_set_updated_at
before update on humas.partners
for each row execute function humas.set_updated_at();

drop trigger if exists agreements_set_updated_at on humas.agreements;
create trigger agreements_set_updated_at
before update on humas.agreements
for each row execute function humas.set_updated_at();

alter table humas.partners enable row level security;
alter table humas.agreements enable row level security;
alter table humas.agreement_documents enable row level security;
alter table humas.agreement_approvals enable row level security;
alter table humas.agreement_workflow_events enable row level security;

-- No grants or policies for anon/authenticated: browser clients cannot access these tables.
-- service_role is reserved for trusted server-side functions and bypasses RLS by design.
grant usage on schema humas to service_role;
grant all on all tables in schema humas to service_role;
grant usage, select on all sequences in schema humas to service_role;
grant execute on function humas.set_updated_at() to service_role;

comment on schema humas is
  'PINTUKU HUMAS domain. Not intended for direct browser access.';
comment on table humas.agreements is
  'Master records for MoU/PKS. Approval, signature, registration and archive are distinct states.';
comment on table humas.agreement_workflow_events is
  'Append-only workflow timeline; write access must be restricted to trusted server-side operations.';
