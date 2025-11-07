import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const addPlaylistDelayColumn = `
-- Add playlist_delay_seconds column to slide_rows table
-- Delay stored as integer 0-45 seconds
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'slide_rows' AND column_name = 'playlist_delay_seconds'
    ) THEN
        ALTER TABLE slide_rows ADD COLUMN playlist_delay_seconds INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added playlist_delay_seconds column to slide_rows';
    ELSE
        RAISE NOTICE 'playlist_delay_seconds column already exists in slide_rows';
    END IF;
END $$;

-- Add check constraint to ensure valid range (0-45 seconds)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'slide_rows_playlist_delay_seconds_range'
    ) THEN
        ALTER TABLE slide_rows
        ADD CONSTRAINT slide_rows_playlist_delay_seconds_range
        CHECK (playlist_delay_seconds >= 0 AND playlist_delay_seconds <= 45);
        RAISE NOTICE 'Added range constraint for playlist_delay_seconds';
    ELSE
        RAISE NOTICE 'Constraint slide_rows_playlist_delay_seconds_range already exists';
    END IF;
END $$;
`;

async function addPlaylistDelay() {
  try {
    console.log('🔄 Adding playlist_delay_seconds column to slide_rows table...')

    const client = await pool.connect()
    try {
      await client.query(addPlaylistDelayColumn)
      console.log('✅ Playlist delay column added successfully')
    } finally {
      client.release()
    }

    console.log('🎉 Playlist delay migration completed!')
  } catch (error) {
    console.error('❌ Playlist delay migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addPlaylistDelay()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { addPlaylistDelay }
