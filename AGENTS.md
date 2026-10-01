# Krishi Mitra (SIH-SEVA-MITRA-2026) — Continuation Handoff

This document summarizes everything implemented so far and what remains, so work can continue seamlessly (including via other AI coding assistants, e.g. Antigravity).

---

## 1. Architecture (current target state)

- **Frontend:** TanStack Start (React) app, deployed as a Cloudflare Worker (Cloudflare is used for **hosting/static assets only** — not for the database anymore).
- **Database:** Supabase (PostgreSQL) — single source of truth. Row Level Security enabled.
- **Ingestion:** Supabase Edge Functions (Deno), scheduled via `pg_cron` + `pg_net`.
- **Legacy (being phased out):** Cloudflare D1/SQLite schema — kept temporarily as historical fallback code, not the primary store.

> ⚠️ A Supabase secret key was exposed multiple times in chat/terminal history during setup. **Rotate `SUPABASE_SECRET_KEY` in the Supabase dashboard before any further production use**, and set the new value via `npx supabase secrets set SUPABASE_SECRET_KEY=... --project-ref qzjgoitnbghyvrighybj`.

---

## 2. Done ✅

### Get Started page — video
- Hero background video (Krishi Mitra promo), infinite loop, muted autoplay, no controls.
- Separate top video header + a scroll-triggered floating "ad-style" popup player, dismissible.
- Popup resumes from the hero video's current playback position (no restart).
- Shared audio-on/off toggle synced between hero and popup, with echo bug fixed (only the visible player is ever unmuted).
- Video source moved off the local `public/` folder (was 43.3 MB, over Cloudflare's 25 MB asset limit) to an external Google Drive direct-download URL. Confirmed reachable (`HTTP 200`, `video/mp4`, ~43.3 MB).
- Scoped strictly to the Get Started route; does not affect the authenticated app shell.

### Marketplace — Phase 1 (APMC landing-page scraping, Cloudflare/D1 era)
- Server-side fetch of Mumbai, Pune, Nagpur APMC "landing" pages with category-link discovery (two-level).
- Marathi commodity name parsing; correct extraction of min/max/modal price (previously miscounted arrival quantity as price).
- Nashik APMC registered but **disabled** for ingestion — no confirmed official daily-price endpoint yet.
- Region filter (Mumbai / Pune / Nagpur / Nashik) and Sector filter (Vegetables, Fruits, Spices, Grains, Flowers, Oilseeds & Fibre, Other) added to the Market page UI.
- Sector inference improved to use category URL slugs + English/Marathi page headings (previously everything fell into "Other").
- Date-over-date **Change %** and a rule-based **Demand proxy** (High / Medium / Stable / Low / Insufficient history) computed from stored historical average price — explicitly labeled as a proxy, not true demand.
- "Previous date" fallback and stored-snapshot fallback when a live source is unavailable.

### Database
- Initial Cloudflare D1 (SQLite) schema created and provisioned (`market_prices`, `market_sources`, `farmer_profiles`, `demand_training_records`, `ai_recommendations`, `produce_listings`, `produce_orders`, `storage_facilities`, `storage_bookings`, `sensor_readings`).
- Migrated schema to Supabase/PostgreSQL (`supabase-schema.sql`) with the same domain tables + RLS policies.
- Added `sector` column and indexes; seeded Nagpur (and Nashik, disabled) as sources.
- `.env.local` configured with `SUPABASE_URL`, publishable key, secret key, JWKS URL; confirmed reachable via authenticated REST/Auth check (`HTTP 200`).
- `@supabase/server` package installed; server code updated to accept `SUPABASE_SECRET_KEY` (with legacy `SUPABASE_SERVICE_ROLE_KEY` fallback).

### Marketplace — Phase 2 (Supabase-native, Cloudflare removed from data path)
- Supabase Edge Function `market-ingest`: fetches active APMC sources (Mumbai, Pune, Nagpur), discovers category pages, parses English/Marathi headings for sector classification, upserts dated rows directly into PostgreSQL, reports per-source status (row count / date / error).
- Migration `20260915000000_market_ingestion.sql` applied.
- Marketplace frontend switched to read directly from Supabase (publishable key, public RLS read policies) instead of the Cloudflare `/api/market-prices` route.
- First manual ingestion run confirmed **successful** — verified real parsed rows in `market_prices` (Mumbai APMC, dated, Marathi commodity names, min/max/modal prices all populated correctly).
- Sector-classification fix (was `Other` for every row) written and ready to redeploy.

### MSAMB integration (Part 1 & 2 — in progress, scaffolded)
- Confirmed MSAMB endpoint contract documented: `GET /ApmcDetail/DataGridBind?commodityCode=null&apmcCode={CODE}` — stateless, needs `Referer` + `X-Requested-With` headers, returns raw `<tr>` HTML fragments grouped by date-separator rows.
- Planned schema extension: `source`, `apmc_code`, `variety`, `quantity` columns added to `market_prices`; new `apmc_list` reference table (code, name, district).
- Planned Edge Functions:
  - a protected **scraper** function (`msamb-ingest` or similar) using `deno-dom` to parse `<tr>` fragments, batching `apmcCode` calls with concurrency ~5 to stay under the 150s free-plan wall-clock limit, upserting on `(date, apmc, commodity, variety)`.
  - a public **read API** function (`market-data`) accepting `apmcCode` / `district` / `commodity` query params, reading only from Supabase (never MSAMB) for the frontend.
- Frontend Market page: partial patch applied for new APMC/district/commodity selectors backed by `market-data`; a larger combined patch was **rejected by the editor** (context mismatch) and needs to be re-applied in smaller pieces.

### Deployment / tooling
- Supabase CLI installed and working (`npx supabase --version` → 2.117.0).
- `npx supabase login`, `link --project-ref qzjgoitnbghyvrighybj`, `db push`, `functions deploy market-ingest --no-verify-jwt` — documented as the deploy flow.
- Cloudflare Worker subdomain chosen (`<subdomain>.workers.dev`) for static hosting only.
- TypeScript/build validated after each change: production build succeeds; only 3 pre-existing, unrelated `community.tsx` errors (`TS18048: 'name' is possibly 'undefined'`, lines 334/383/478) remain outstanding across the whole session.

---

## 3. Remaining / To Do 🔲

### Immediate (blocking correctness)
1. **Rotate the Supabase secret key** (exposed multiple times) and update it via `supabase secrets set SUPABASE_SECRET_KEY=...`. (Done previously)
2. **Redeploy `market-ingest`** with the sector-classification fix, then re-run ingestion so existing `Other`-tagged rows get corrected via upsert. (Done)
3. **Fix `community.tsx`** — 3 pre-existing `'name' is possibly 'undefined'` errors. (Fixed by typing explicitly as tuples)

### MSAMB pipeline (Part 1 — backend)
4. One-time fetch + parse of `APMCPriceInformation` page's `<select>` dropdown to build the full `apmc_list` (code → name → district) seed table. (Done)
5. Build the `msamb-ingest` Deno Edge Function. (Done - using regex parsing)
6. Upsert into `market_prices` using `(date, apmc, commodity, variety)` as the conflict key, tagged `source='msamb'`. (Done)
7. Schedule daily via `pg_cron` + `pg_net`. (Done - via migration `20260917000001_schedule_ingestion.sql`)

### MSAMB pipeline (Part 2 — frontend)
8. Finish applying the Market page selector patch (APMC / district / commodity dropdowns). (Done - fully functioning cascading filters)
9. Populate dropdowns from `apmc_list` + `DISTINCT commodity` in `market_prices` (not live MSAMB). (Done)
10. Implement `market-data` read API (Edge Function) with `apmcCode` / `district` / `commodity` filters. (Done)
11. Implement both lookup modes: (Done)
    - "By my market/district" → all commodities at that APMC.
    - "By my crop" → that commodity across all APMCs/districts (for regional comparison).
12. Show "Last updated: [date]" per APMC from stored data. (Done)

### Marketplace — remaining modules (not yet started)
13. **Demand Intelligence AI model** — needs Chinmay's prepared dataset (crop, soil type, land size, irrigation, location, season, input cost, yield, selling price, demand). Until then, only the rule-based price-change proxy exists.
14. **Buy Produce (farmer-to-farmer marketplace)** — barter/cash listings at farmer-set rates, independent of government rates; not yet built (`produce_listings` / `produce_orders` tables exist in schema but have no UI/API yet).
15. **Storage / Godown discovery** — nearby cold storage by location; not yet implemented (`storage_facilities` / `storage_bookings` tables exist in schema but need a real data source/API — public map/place API access decision pending).
16. **Location-based lookups** — GPS vs. manual village/district entry decision still pending for market price, storage, and selling features.
17. **Nashik APMC** — remains registered but disabled; needs a confirmed official daily-price URL before enabling ingestion.

### Infrastructure decisions still open
18. Redis / MQTT / Spring Boot were explicitly deferred — no credentials/broker/service contract exists yet; revisit only if a concrete need arises (e.g. real-time sensor telemetry).
19. Google Sheets — decided **not** to use as the primary pipeline; may still be added later as a manual correction/review tool or a controlled import path, not a production dependency.
20. Full removal of legacy Cloudflare/D1 code paths once the Supabase-only path is fully verified in production.
21. Buy/Sell transactions: decide whether to start demo-only or connect a real payment system.

---

## 4. Known Issues
- Repository-wide CRLF/Prettier lint baseline noise (pre-existing, not caused by this work) — full `npm run lint` reports ~11,000+ line-ending findings across untouched files.
- Google Drive video hosting is a stopgap; Drive can throttle/block streaming or range requests under load — consider moving to Supabase Storage or Cloudflare R2 for reliability.

---

## 5. Suggested Next Session Order
1. Move to Demand Intelligence dataset ingestion once Chinmay's data is available.
2. Implement Buy Produce (farmer-to-farmer marketplace) and Storage / Godown discovery.
