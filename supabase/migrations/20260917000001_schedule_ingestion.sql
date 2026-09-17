-- Enable pg_net and pg_cron extensions if they are not already enabled
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Schedule market-ingest daily at 1:00 AM UTC
select cron.schedule(
  'invoke-market-ingest',
  '0 1 * * *',
  $$
  select net.http_post(
    url:='https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/market-ingest',
    headers:='{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule msamb-ingest daily at 2:00 AM UTC
select cron.schedule(
  'invoke-msamb-ingest',
  '0 2 * * *',
  $$
  select net.http_post(
    url:='https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/msamb-ingest',
    headers:='{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);
