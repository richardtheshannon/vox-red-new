-- Migration: Add playlist_delay_seconds to slide_rows table
-- Created: November 3, 2025
-- Purpose: Enable configurable delay between playlist tracks

-- Add playlist_delay_seconds column if it doesn't exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slide_rows' AND column_name = 'playlist_delay_seconds'
  ) THEN
    ALTER TABLE slide_rows
    ADD COLUMN playlist_delay_seconds INTEGER DEFAULT 0 NOT NULL;

    RAISE NOTICE 'Added playlist_delay_seconds column to slide_rows table';
  ELSE
    RAISE NOTICE 'Column playlist_delay_seconds already exists, skipping';
  END IF;
END $$;

-- Add check constraint to ensure valid range (0-45 seconds)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'slide_rows_playlist_delay_seconds_range'
  ) THEN
    ALTER TABLE slide_rows
    ADD CONSTRAINT slide_rows_playlist_delay_seconds_range
    CHECK (playlist_delay_seconds >= 0 AND playlist_delay_seconds <= 45);

    RAISE NOTICE 'Added range constraint for playlist_delay_seconds';
  ELSE
    RAISE NOTICE 'Constraint slide_rows_playlist_delay_seconds_range already exists, skipping';
  END IF;
END $$;
