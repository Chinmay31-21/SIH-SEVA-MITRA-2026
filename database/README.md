# Krishi Mitra Database

The project uses Supabase PostgreSQL as the production database. The Market page reads public market rows from Supabase using RLS, while a protected Supabase Edge Function performs the daily APMC ingestion.

## Create and migrate the database

```sh
npx wrangler d1 create krishi-mitra
npx wrangler d1 execute krishi-mitra --remote --file=database/schema.sql
```

Add the generated D1 binding to the deployment configuration as `DB`. For local development, use a local D1 database with the same schema:

```sh
npx wrangler d1 execute krishi-mitra --local --file=database/schema.sql
```

The server reads `env.DB` when it is present. Every successful APMC fetch is upserted by source, observed date, crop, and market, so repeated daily fetches do not create duplicates. If the APMC pages are temporarily unavailable, the API queries the latest stored snapshot before returning the frontend demo fallback.

## Current persistence domains

- `market_prices`: dated Mumbai and Pune APMC price snapshots
- `farmer_profiles`: location, land, soil, and irrigation context
- `demand_training_records`: future model-training features and targets
- `demand_recommendations`: versioned farmer recommendations
- `produce_listings` and `produce_orders`: cash and barter marketplace workflows
- `storage_facilities` and `storage_bookings`: location-aware storage inventory
- `sensor_readings`: MQTT-ready farm telemetry history

Redis, MQTT, and a separate Spring Boot service are intentionally not added yet. They need deployment credentials, broker details, and defined message contracts. Supabase PostgreSQL is the durable system of record.

## Supabase migration

Supabase is now supported as the preferred database. Run `database/supabase-schema.sql` in the Supabase SQL Editor. The server uses Supabase first when these server-side values are configured:

```sh
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SECRET_KEY
```

Use `https://<project-ref>.supabase.co` for `SUPABASE_URL`. Do not use the Supabase dashboard URL, and never expose the service key through a `VITE_` variable. The browser-side publishable key can remain in `.env.local` as `VITE_SUPABASE_PUBLISHABLE_KEY`.

The browser uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only. The secret key is used only by the Edge Function.

## APMC ingestion

The market endpoint first loads each official APMC landing page, discovers its linked daily-price category pages, fetches those pages server-side, and parses the dated commodity tables. This is necessary because the Mumbai and Pune landing pages do not contain the actual price rows themselves. Marathi commodity names are supported, and the final three numeric columns are interpreted as minimum, maximum, and modal/average prices.

The current confirmed ingestion sources are Mumbai, Pune, and Nagpur. Nashik remains disabled until an official daily-price endpoint is confirmed.

```sql
insert into public.market_sources (name, url)
values ('Nashik APMC', 'https://apmcnashik.com/')
on conflict (name) do update set url = excluded.url;
```

## Supabase Edge Function

Apply the migration and deploy the ingestion function:

```sh
npx supabase db push
npx supabase functions deploy market-ingest --no-verify-jwt
npx supabase secrets set SUPABASE_SECRET_KEY=your_secret_key
```

Run one import manually:

```sh
curl -X POST "https://qzjgoitnbghyvrighybj.supabase.co/functions/v1/market-ingest" -H "apikey: $SUPABASE_SECRET_KEY"
```

Schedule that POST daily with Supabase Cron/pg_cron or an external scheduler. The function reports each source, date, row count, and error. It stores sectors and historical dates so the frontend can calculate changes without Google Sheets or Cloudflare.
