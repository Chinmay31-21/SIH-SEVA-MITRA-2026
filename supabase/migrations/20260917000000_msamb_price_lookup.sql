create table if not exists public.apmc_list (
  code text primary key,
  name text not null,
  district text,
  active boolean not null default true,
  source text not null default 'msamb',
  updated_at timestamptz not null default now()
);

alter table public.market_prices
  add column if not exists source text not null default 'apmc',
  add column if not exists apmc_code text,
  add column if not exists variety text not null default '',
  add column if not exists quantity numeric,
  add column if not exists source_url text;

insert into public.market_sources (name, url, active)
values ('MSAMB', 'https://www.msamb.com/ApmcDetail/APMCPriceInformation', true)
on conflict (name) do update set url = excluded.url, active = excluded.active;

alter table public.market_prices drop constraint if exists market_prices_source_id_observed_on_crop_market_key;
create unique index if not exists market_prices_source_identity_idx
  on public.market_prices (source, apmc_code, observed_on, crop, variety);
create index if not exists idx_market_prices_apmc_date
  on public.market_prices (apmc_code, observed_on desc);

alter table public.apmc_list enable row level security;
create policy "Anyone can read APMC list" on public.apmc_list
  for select using (true);

create policy "Anyone can read MSAMB prices" on public.market_prices
  for select using (source = 'msamb');
