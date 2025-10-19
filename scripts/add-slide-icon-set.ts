import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addSlideIconSetColumn = `
-- Add icon_set column to slides table for per-slide icon display
DO $$
BEGIN
  -- Add icon_set column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'icon_set'
  ) THEN
    ALTER TABLE slides ADD COLUMN icon_set TEXT;
    RAISE NOTICE 'Added icon_set column to slides table';
  ELSE
    RAISE NOTICE 'icon_set column already exists in slides table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding icon_set column: %', SQLERRM;
END $$;
`;

async function addSlideIconSet() {
  try {
    console.log('🔄 Adding icon_set column to slides table...')

    const client = await pool.connect()
    try {
      await client.query(addSlideIconSetColumn)
      console.log('✅ icon_set column added successfully (or already exists)')
    } finally {
      client.release()
    }

    console.log('🎉 Slide icon_set migration completed!')
  } catch (error) {
    console.error('❌ Slide icon_set migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addSlideIconSet()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addSlideIconSet }
