-- Persist staff confirmation that the visitor privacy notice was delivered.
alter table tu.visits
  add column if not exists privacy_notice_delivered boolean not null default false,
  add column if not exists privacy_notice_delivered_at timestamptz;
alter table tu.visits drop constraint if exists tu_visits_privacy_notice_consistency;
alter table tu.visits add constraint tu_visits_privacy_notice_consistency
  check ((privacy_notice_delivered and privacy_notice_delivered_at is not null)
      or (not privacy_notice_delivered and privacy_notice_delivered_at is null));
