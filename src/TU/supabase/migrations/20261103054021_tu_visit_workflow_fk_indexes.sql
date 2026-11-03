-- Cover the remaining actor foreign key for visit workflow updates.
create index if not exists tu_visits_updated_by_idx on tu.visits(updated_by) where updated_by is not null;
