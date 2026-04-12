-- Lightweight rate-limiting table used by Edge Functions.
-- Each row records one request; a periodic cleanup deletes old rows.

create table if not exists rate_limit (
  id         bigint generated always as identity primary key,
  user_id    uuid not null,
  action     text not null,
  created_at timestamptz not null default now()
);

create index idx_rate_limit_lookup
  on rate_limit (user_id, action, created_at desc);

-- Auto-purge rows older than 1 hour to keep the table small
create or replace function cleanup_rate_limit()
returns void language sql security definer as $$
  delete from rate_limit where created_at < now() - interval '1 hour';
$$;

-- RLS: functions use the service-role key so RLS is bypassed,
-- but enable it anyway so the anon/authenticated roles can't touch it.
alter table rate_limit enable row level security;

-- Schedule cleanup every 15 minutes
create extension if not exists pg_cron;
select cron.schedule('cleanup-rate-limit', '*/15 * * * *', 'select cleanup_rate_limit()');
