/**
 * Migration: Add SIMPLESHIFT to row_type check constraint
 * Date: 2025-11-17
 * Description: Allows 'SIMPLESHIFT' as a valid row_type value
 */

-- Drop the existing check constraint
ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check;

-- Add new check constraint with SIMPLESHIFT included
ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
  CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT'));
