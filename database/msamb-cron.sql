-- Krishi Mitra — scheduled market ingestion via pg_cron + pg_net.
-- Run this in Supabase SQL Editor after deploying both Edge Functions.
-- Store function URLs and secret key in Vault; never put secrets in source control.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- ┌──────────────────────────────────────────────────────────────────┐
-- │  Run these statements ONCE manually with your real values:      │
-- │                                                                  │
-- │  select vault.create_secret(                                     │
-- │    'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest', │
-- │    'msamb_ingest_url'                                            │
-- │  );                                                              │
-- │  select vault.create_secret(                                     │
-- │    'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/market-ingest',│
-- │    'market_ingest_url'                                           │
-- │  );                                                              │
-- │  select vault.create_secret(                                     │
-- │    'sb_secret_REPLACE_ME',                                       │
-- │    'ingest_secret_key'                                           │
-- │  );                                                              │
-- └──────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════
-- 1. MSAMB ingestion — daily at 12:30 UTC (18:00 IST)
-- ═══════════════════════════════════════════════════════════════════

select cron.unschedule('msamb-market-daily')
where exists (
  select 1 from cron.job where jobname = 'msamb-market-daily'
);

select cron.schedule(
  'msamb-market-daily',
  '30 12 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'msamb_ingest_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'ingest_secret_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ═══════════════════════════════════════════════════════════════════
-- 2. APMC scraper ingestion — daily at 06:00 UTC (11:30 IST)
-- ═══════════════════════════════════════════════════════════════════

select cron.unschedule('apmc-market-daily')
where exists (
  select 1 from cron.job where jobname = 'apmc-market-daily'
);

select cron.schedule(
  'apmc-market-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'market_ingest_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'ingest_secret_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
