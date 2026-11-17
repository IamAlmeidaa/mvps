import { getDb } from './client.js';

const sql = getDb(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS price_observations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  availability TEXT,
  source_url TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE INDEX IF NOT EXISTS price_observations_product_time_idx ON price_observations(product_id, observed_at DESC)`;
await sql`CREATE INDEX IF NOT EXISTS price_observations_store_time_idx ON price_observations(store_id, observed_at DESC)`;
await sql`CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
console.log('Estrutura inicial criada com sucesso.');
