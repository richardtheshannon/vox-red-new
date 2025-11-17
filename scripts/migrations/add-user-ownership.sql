-- Migration: Add user ownership to slide_rows
-- Date: 2025-01-17
-- Purpose: Allow rows to be assigned to specific users (private rows)

-- Add user_id column to slide_rows (nullable - null means public)
ALTER TABLE slide_rows
ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL;

-- Add index for efficient filtering by user
CREATE INDEX IF NOT EXISTS idx_slide_rows_user_id ON slide_rows(user_id);

-- Add comment explaining the column
COMMENT ON COLUMN slide_rows.user_id IS 'User who owns this row (null = public, visible to all)';
