alter table public.market_prices
  add column if not exists sector text not null default 'Other';

insert into public.market_sources (name, url, active) values
  ('Nagpur APMC', 'https://apmcnagpur.in/en/market-price-en/daily-market-price-en', true),
  ('Nashik APMC', 'https://apmcnashik.com/', false)
on conflict (name) do update set
  url = excluded.url,
  active = excluded.active;

create index if not exists idx_market_prices_source_date
  on public.market_prices (source_id, observed_on desc);
