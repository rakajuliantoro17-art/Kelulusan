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
