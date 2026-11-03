-- Cover remaining foreign-key lookups for staged alumni imports.
create index if not exists alumni_import_batches_created_by_idx
  on humas.alumni_import_batches(created_by);
create index if not exists alumni_import_rows_created_profile_idx
  on humas.alumni_import_rows(created_profile_id) where created_profile_id is not null;
create index if not exists alumni_import_rows_reviewed_by_idx
  on humas.alumni_import_rows(reviewed_by) where reviewed_by is not null;
