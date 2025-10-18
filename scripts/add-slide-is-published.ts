import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addSlideIsPublished = `
-- Add is_published column to slides table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slides' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE slides ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
        CREATE INDEX IF NOT EXISTS idx_slides_published ON slides(is_published);
        RAISE NOTICE 'Added is_published column to slides table';
    ELSE
        RAISE NOTICE 'is_published column already exists in slides table';
    END IF;
END $$;
`

async function addSlideIsPublishedColumn() {
  try {
    console.log('🔄 Adding is_published column to slides table...')

    const client = await pool.connect()
    try {
      await client.query(addSlideIsPublished)
      console.log('✅ is_published column migration completed successfully')
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
  addSlideIsPublishedColumn()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addSlideIsPublishedColumn }
