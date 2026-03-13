-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  copies INT NOT NULL DEFAULT 1,
  color_mode TEXT NOT NULL CHECK (color_mode IN ('color', 'bw')),
  printing_side TEXT NOT NULL CHECK (printing_side IN ('single', 'double')),
  total_price NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'Online',
  upi_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  printed_at TIMESTAMPTZ
);

-- If orders table already exists, add payment_method column:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Online';

-- 2. Storage: Dashboard > Storage > New bucket
--    Name: xerox-files
--    Public: Yes (so PDF links work)
--    Add policy: Allow uploads (service role handles this via API)
