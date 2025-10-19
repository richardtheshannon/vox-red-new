import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addQuickslideRowType = `
-- Add QUICKSLIDE to row_type enum constraint
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check;

  -- Add new constraint with QUICKSLIDE included
  ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
    CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE'));

  RAISE NOTICE 'QUICKSLIDE row type constraint added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating constraint: %', SQLERRM;
END $$;

-- Create "Quick Slides" row if it doesn't exist
DO $$
BEGIN
  -- Check if Quick Slides row already exists
  IF NOT EXISTS (SELECT 1 FROM slide_rows WHERE row_type = 'QUICKSLIDE') THEN
    INSERT INTO slide_rows (
      title,
      description,
      row_type,
      is_published,
      display_order,
      icon_set,
      theme_color
    ) VALUES (
      'Quick Slides',
      'Quick thoughts and notes',
      'QUICKSLIDE',
      true,
      999, -- Display at the end
      '["chat", "note", "edit"]',
      '#4F46E5' -- Indigo color
    );
    RAISE NOTICE 'Quick Slides row created successfully';
  ELSE
    RAISE NOTICE 'Quick Slides row already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating Quick Slides row: %', SQLERRM;
END $$;
`;

async function addQuickslideType() {
  try {
    console.log('🔄 Adding QUICKSLIDE row type...')

    const client = await pool.connect()
    try {
      await client.query(addQuickslideRowType)
      console.log('✅ QUICKSLIDE row type added successfully')
      console.log('✅ Quick Slides row created (if not exists)')
    } finally {
      client.release()
    }

    console.log('🎉 QUICKSLIDE migration completed!')
  } catch (error) {
    console.error('❌ QUICKSLIDE migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addQuickslideType()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addQuickslideType }
