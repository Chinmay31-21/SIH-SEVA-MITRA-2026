-- Krishi Mitra D1/SQLite schema
-- Apply with: npx wrangler d1 execute krishi-mitra --remote --file=database/schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS market_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL REFERENCES market_sources(id),
  observed_on TEXT NOT NULL,
  crop TEXT NOT NULL,
  market TEXT NOT NULL,
  minimum_price REAL,
  maximum_price REAL,
  average_price REAL,
  unit TEXT NOT NULL DEFAULT 'quintal',
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, observed_on, crop, market)
);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date
  ON market_prices(crop, observed_on DESC);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  village TEXT,
  district TEXT,
  state TEXT,
  latitude REAL,
  longitude REAL,
  land_size_acres REAL,
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demand_training_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop TEXT NOT NULL,
  observed_on TEXT NOT NULL,
  location TEXT,
  soil_type TEXT,
  irrigation_type TEXT,
  land_size_acres REAL,
  input_cost REAL,
  yield_kg REAL,
  market_price REAL,
  demand_score REAL,
  target_profit REAL,
  features_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demand_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id TEXT REFERENCES farmer_profiles(id),
  crop TEXT NOT NULL,
  generated_on TEXT NOT NULL,
  expected_price REAL,
  expected_yield_kg REAL,
  estimated_cost REAL,
  estimated_profit REAL,
  confidence REAL,
  explanation TEXT NOT NULL,
  model_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produce_listings (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmer_profiles(id),
  crop TEXT NOT NULL,
  quantity_kg REAL NOT NULL CHECK(quantity_kg > 0),
  price_per_kg REAL,
  barter_description TEXT,
  quality_grade TEXT,
  harvest_date TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produce_orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES produce_listings(id),
  buyer_id TEXT NOT NULL REFERENCES farmer_profiles(id),
  seller_id TEXT NOT NULL REFERENCES farmer_profiles(id),
  quantity_kg REAL NOT NULL CHECK(quantity_kg > 0),
  settlement_type TEXT NOT NULL CHECK(settlement_type IN ('cash', 'barter')),
  cash_amount REAL,
  barter_description TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storage_facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  capacity_kg REAL,
  price_per_quintal_day REAL,
  accepted_produce TEXT,
  source TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_storage_location
  ON storage_facilities(latitude, longitude);

CREATE TABLE IF NOT EXISTS storage_bookings (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL REFERENCES storage_facilities(id),
  farmer_id TEXT NOT NULL REFERENCES farmer_profiles(id),
  produce TEXT NOT NULL,
  quantity_kg REAL NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id TEXT REFERENCES farmer_profiles(id),
  device_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  reading_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  recorded_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time
  ON sensor_readings(device_id, recorded_at DESC);

INSERT OR IGNORE INTO market_sources (name, url) VALUES
  ('Mumbai APMC', 'https://www.mumbaiapmc.org/en/market-price-en/daily-market-price-en'),
  ('Pune APMC', 'https://apmcpune.in/en/market-price-en/daily-market-price-en');
