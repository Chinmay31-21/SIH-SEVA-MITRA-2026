-- Daily MSAMB sync: 10:00 AM IST is 04:30 UTC.
-- The secret is read only at run time from Supabase Vault; it is never stored
-- in this repository or in the cron job definition.
create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$
begin
  if not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'supabase_secret_key'
  ) then
    raise exception
      'Create Vault secret "supabase_secret_key" before applying this migration.';
  end if;
end
$$;

-- Replace the old unauthenticated schedules.
do $$
declare
  scheduled_job record;
begin
  for scheduled_job in
    select jobid
    from cron.job
    where jobname in ('invoke-market-ingest', 'invoke-msamb-ingest')
       or jobname like 'daily-msamb-sync-%'
  loop
    perform cron.unschedule(scheduled_job.jobid);
  end loop;
end
$$;

-- Keep the existing three landing-page sources fresh at 10:00 AM IST.
select cron.schedule(
  'invoke-market-ingest',
  '30 4 * * *',
  $$
  select net.http_post(
    url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/market-ingest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')
    )
  );
  $$
);

-- MSAMB has 278 APMCs. Run ten bounded batches (30 + ... + 8) two minutes
-- apart, starting at 10:00 AM IST. The last batch also removes records older
-- than the three calendar days that the product retains.
select cron.schedule('daily-msamb-sync-00', '30 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=0', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-01', '32 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=30', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-02', '34 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=60', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-03', '36 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=90', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-04', '38 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=120', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-05', '40 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=150', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-06', '42 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=180', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-07', '44 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=210', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-08', '46 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=240', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
select cron.schedule('daily-msamb-sync-09', '48 4 * * *', $$
  select net.http_post(url := 'https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest?limit=30&offset=270&prune=true', headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')));
$$);
