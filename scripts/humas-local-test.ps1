# PINTUKU HUMAS — local PostgreSQL integration runner
# Requires PostgreSQL client (psql) and a local database named pintuku_humas_test.
# Set HUMAS_TEST_DATABASE_URL locally; do not commit it or paste credentials into chat.
# Example database creation (run once as local PostgreSQL admin):
#   createdb -U postgres pintuku_humas_test
#
# Run from repository root:
#   $env:HUMAS_TEST_DATABASE_URL = "postgresql://postgres:<LOCAL_PASSWORD>@localhost:5432/pintuku_humas_test"
#   .\scripts\humas-local-test.ps1

$ErrorActionPreference = "Stop"

if (-not $env:HUMAS_TEST_DATABASE_URL) {
  throw "HUMAS_TEST_DATABASE_URL belum diatur. Gunakan koneksi ke database lokal pintuku_humas_test."
}

try {
  $dbUri = [System.Uri]$env:HUMAS_TEST_DATABASE_URL
} catch {
  throw "HUMAS_TEST_DATABASE_URL bukan URI PostgreSQL yang valid."
}
if ($dbUri.Host -notin @("localhost", "127.0.0.1", "::1")) {
  throw "Ditolak: runner hanya boleh terhubung ke localhost. Host yang diberikan: $($dbUri.Host)"
}
if ($dbUri.AbsolutePath.Trim("/") -ne "pintuku_humas_test") {
  throw "Ditolak: nama database wajib pintuku_humas_test."
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  throw "psql tidak ditemukan. Instal PostgreSQL lokal beserta Command Line Tools, lalu buka ulang PowerShell."
}

$bootstrap = "tests/humas-local-bootstrap.sql"
$integration = "tests/humas-local-integration.sql"
$migrations = @(
  "supabase/migrations/202611020001_humas_partnership_foundation.sql",
  "supabase/migrations/202611020002_humas_rbac_foundation.sql",
  "supabase/migrations/202611020003_humas_partner_management.sql",
  "supabase/migrations/202611020004_humas_agreement_drafts.sql",
  "supabase/migrations/202611020005_humas_security_hardening.sql"
)

if (-not (Test-Path $bootstrap) -or -not (Test-Path $integration)) {
  throw "Jalankan script dari root repository Kelulusan."
}

Write-Host "1/3 Bootstrap compatibility scaffold..."
& $psql.Source $env:HUMAS_TEST_DATABASE_URL -X -v ON_ERROR_STOP=1 -f $bootstrap
if ($LASTEXITCODE -ne 0) { throw "Bootstrap gagal. Periksa output PostgreSQL di atas." }

Write-Host "2/3 Apply migrations to LOCAL test database only..."
foreach ($migration in $migrations) {
  if (-not (Test-Path $migration)) { throw "Migration tidak ditemukan: $migration" }
  Write-Host "   -> $migration"
  & $psql.Source $env:HUMAS_TEST_DATABASE_URL -X -v ON_ERROR_STOP=1 -f $migration
  if ($LASTEXITCODE -ne 0) { throw "Migration gagal: $migration" }
}

Write-Host "3/3 Run integration smoke tests..."
& $psql.Source $env:HUMAS_TEST_DATABASE_URL -X -v ON_ERROR_STOP=1 -f $integration
if ($LASTEXITCODE -ne 0) { throw "Integration test gagal. Periksa output PostgreSQL di atas." }

Write-Host "SELESAI: migrasi dan smoke test lokal berhasil. Tidak ada akses ke Supabase Production."
