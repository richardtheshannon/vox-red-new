import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addSpaVolumeColumn = `
-- Add volume column to spa_tracks table
-- Volume stored as integer 0-100 (percentage)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'spa_tracks' AND column_name = 'volume'
    ) THEN
        ALTER TABLE spa_tracks ADD COLUMN volume INTEGER DEFAULT 50 CHECK (volume >= 0 AND volume <= 100);
        RAISE NOTICE 'Added volume column to spa_tracks';
    ELSE
        RAISE NOTICE 'Volume column already exists in spa_tracks';
    END IF;
END $$;
`;

async function addSpaVolume() {
  try {
    console.log('🔄 Adding volume column to spa_tracks table...')

    const client = await pool.connect()
    try {
      await client.query(addSpaVolumeColumn)
      console.log('✅ Volume column added successfully')
    } finally {
      client.release()
    }

    console.log('🎉 Spa volume migration completed!')
  } catch (error) {
    console.error('❌ Spa volume migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addSpaVolume()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addSpaVolume }
