import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addVideoUrlColumn = `
-- Add video_url column to slides table
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS video_url VARCHAR;
`;

async function migrateDatabase() {
  try {
    console.log('🔄 Adding video_url column to slides table...')

    const client = await pool.connect()
    try {
      await client.query(addVideoUrlColumn)
      console.log('✅ video_url column added successfully')
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
  migrateDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { migrateDatabase }
