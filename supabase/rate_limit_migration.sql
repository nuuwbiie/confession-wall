-- Migration: Anti-Spam Rate Limiting
-- Jalankan SQL ini di Supabase SQL Editor
-- Membuat tabel untuk tracking request rate per IP per endpoint

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,          -- e.g. 'login', 'register', 'create_confession', 'create_comment', 'like'
  window_start TIMESTAMPTZ NOT NULL, -- start of the current rate limit window
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups: find rate limit record by IP + endpoint + active window
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
  ON rate_limits(ip_address, endpoint, window_start DESC);

-- Index for cleanup: find old records to delete
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
  ON rate_limits(window_start);

-- Cleanup function: remove expired rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Auto-cleanup: periodically remove expired records (runs every 30 minutes)
-- Note: This requires pg_cron extension. If not available, run cleanup manually.
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-rate-limits', '*/30 * * * *', 'SELECT cleanup_rate_limits();');
