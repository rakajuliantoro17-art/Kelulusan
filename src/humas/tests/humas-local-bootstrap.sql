-- Local-only Supabase compatibility scaffold for HUMAS integration tests.
-- Run ONLY against database: pintuku_humas_test.
-- Requires a local PostgreSQL superuser. Never run against Supabase Production.

DO $guard$
BEGIN
  IF current_database() <> 'pintuku_humas_test' THEN
    RAISE EXCEPTION 'Refusing to bootstrap database %. Expected pintuku_humas_test.', current_database();
  END IF;
END
$guard$;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  ELSE
    ALTER ROLE service_role BYPASSRLS;
  END IF;
END
$roles$;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY
);

GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;

COMMENT ON SCHEMA auth IS
  'Minimal local test scaffold only; not a replacement for Supabase Auth.';
COMMENT ON TABLE auth.users IS
  'Minimal id-only fixture table for HUMAS FK tests; not a real Auth implementation.';

-- Minimal Supabase Storage schema for isolated migration tests only.
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  name text NOT NULL,
  owner uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bucket_id,name)
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO service_role;
GRANT SELECT ON storage.buckets TO service_role;
