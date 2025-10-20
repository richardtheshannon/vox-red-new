import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addTempUnpublish = `
-- Add temp_unpublish_until column to slides table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slides' AND column_name = 'temp_unpublish_until'
    ) THEN
        ALTER TABLE slides ADD COLUMN temp_unpublish_until TIMESTAMP;
        CREATE INDEX IF NOT EXISTS idx_slides_temp_unpublish ON slides(temp_unpublish_until);
        RAISE NOTICE 'Added temp_unpublish_until column to slides table';
    ELSE
        RAISE NOTICE 'temp_unpublish_until column already exists in slides table';
    END IF;
END $$;
`

async function addTempUnpublishColumn() {
  try {
    console.log('🔄 Adding temp_unpublish_until column to slides table...')

    const client = await pool.connect()
    try {
      await client.query(addTempUnpublish)
      console.log('✅ temp_unpublish_until column migration completed successfully')
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
  addTempUnpublishColumn()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addTempUnpublishColumn }
