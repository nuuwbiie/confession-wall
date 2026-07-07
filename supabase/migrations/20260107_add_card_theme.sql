-- Add card_theme column to confessions table
-- Run this in Supabase SQL Editor (or via supabase db push)

ALTER TABLE confessions
ADD COLUMN card_theme TEXT DEFAULT 'default'
CHECK (card_theme IN ('default', 'pink', 'blue', 'green', 'yellow', 'orange', 'purple'));
