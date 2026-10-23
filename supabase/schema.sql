create table if not exists public.repo_snapshots (
  id bigint generated always as identity primary key,
  observed_at timestamptz not null default now(),
  source text not null,
  metric text not null,
  value bigint not null check (value >= 0),
  is_estimate boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists repo_snapshots_metric_time_idx
  on public.repo_snapshots (metric, observed_at desc);

alter table public.repo_snapshots enable row level security;

drop policy if exists "Public can read snapshots" on public.repo_snapshots;
create policy "Public can read snapshots"
  on public.repo_snapshots for select
  to anon, authenticated
  using (true);

-- Intentionally no public insert/update/delete policies.
-- The server/collector writes through the service-role key; never expose it client-side.
