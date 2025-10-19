import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addSlideScheduling = `
-- Add scheduling columns to slides table if they don't exist
DO $$
BEGIN
    -- Add publish_time_start column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slides' AND column_name = 'publish_time_start'
    ) THEN
        ALTER TABLE slides ADD COLUMN publish_time_start TIME;
        RAISE NOTICE 'Added publish_time_start column to slides table';
    ELSE
        RAISE NOTICE 'publish_time_start column already exists in slides table';
    END IF;

    -- Add publish_time_end column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slides' AND column_name = 'publish_time_end'
    ) THEN
        ALTER TABLE slides ADD COLUMN publish_time_end TIME;
        RAISE NOTICE 'Added publish_time_end column to slides table';
    ELSE
        RAISE NOTICE 'publish_time_end column already exists in slides table';
    END IF;

    -- Add publish_days column (JSON array of day numbers: 0=Sunday, 6=Saturday)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slides' AND column_name = 'publish_days'
    ) THEN
        ALTER TABLE slides ADD COLUMN publish_days TEXT;
        RAISE NOTICE 'Added publish_days column to slides table';
    ELSE
        RAISE NOTICE 'publish_days column already exists in slides table';
    END IF;
END $$;

-- Add indexes for scheduling queries (optional, but improves performance)
CREATE INDEX IF NOT EXISTS idx_slides_scheduling ON slides(publish_time_start, publish_time_end, publish_days);
`

async function addSlideSchedulingColumns() {
  try {
    console.log('🔄 Adding scheduling columns to slides table...')

    const client = await pool.connect()
    try {
      await client.query(addSlideScheduling)
      console.log('✅ Scheduling columns migration completed successfully')
      console.log('   - publish_time_start (TIME)')
      console.log('   - publish_time_end (TIME)')
      console.log('   - publish_days (TEXT/JSON)')
    } finally {
      client.release()
    }

    console.log('🎉 Migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addSlideSchedulingColumns()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addSlideSchedulingColumns }
