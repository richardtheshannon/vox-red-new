-- Migration: Add slide randomization to slide_rows
-- Date: 2025-01-17
-- Purpose: Allow rows to randomize slides with configurable count and interval

-- Add randomize_enabled column (default FALSE - backward compatible)
ALTER TABLE slide_rows
ADD COLUMN IF NOT EXISTS randomize_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add randomize_count column (number of slides to show when randomized)
ALTER TABLE slide_rows
ADD COLUMN IF NOT EXISTS randomize_count INTEGER;

-- Add randomize_interval column (hourly, daily, weekly)
ALTER TABLE slide_rows
ADD COLUMN IF NOT EXISTS randomize_interval VARCHAR(20);

-- Add randomize_seed column (stores current randomization window timestamp)
ALTER TABLE slide_rows
ADD COLUMN IF NOT EXISTS randomize_seed BIGINT;

-- Add check constraint: randomize_count must be >= 1 if set
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_randomize_count') THEN
    ALTER TABLE slide_rows ADD CONSTRAINT check_randomize_count
    CHECK (randomize_count IS NULL OR randomize_count >= 1);
  END IF;
END $$;

-- Add check constraint: randomize_interval must be valid value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_randomize_interval') THEN
    ALTER TABLE slide_rows ADD CONSTRAINT check_randomize_interval
    CHECK (randomize_interval IS NULL OR randomize_interval IN ('hourly', 'daily', 'weekly'));
  END IF;
END $$;

-- Add index for efficient filtering by randomization status
CREATE INDEX IF NOT EXISTS idx_slide_rows_randomize_enabled ON slide_rows(randomize_enabled);

-- Add comments explaining the columns
COMMENT ON COLUMN slide_rows.randomize_enabled IS 'Whether to randomize slides in this row';
COMMENT ON COLUMN slide_rows.randomize_count IS 'Number of slides to show when randomized (must be >= 1)';
COMMENT ON COLUMN slide_rows.randomize_interval IS 'Interval for re-randomization: hourly, daily, or weekly';
COMMENT ON COLUMN slide_rows.randomize_seed IS 'Current randomization window seed (timestamp)';
