import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const createSpaTracksTables = `
-- Spa Background Music Tracks
CREATE TABLE IF NOT EXISTS spa_tracks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Content
    title VARCHAR NOT NULL,
    audio_url VARCHAR NOT NULL, -- Path or URL to MP3 file

    -- Display settings
    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0, -- Order for sequential playback
    is_random BOOLEAN DEFAULT FALSE, -- Enable random selection

    -- Dynamic scheduling (same pattern as slides)
    publish_time_start TIME, -- Start time for visibility window
    publish_time_end TIME, -- End time for visibility window
    publish_days TEXT, -- JSON array of day numbers [0-6] (0=Sunday, 6=Saturday)

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spa_tracks_published ON spa_tracks(is_published);
CREATE INDEX IF NOT EXISTS idx_spa_tracks_order ON spa_tracks(display_order);
CREATE INDEX IF NOT EXISTS idx_spa_tracks_random ON spa_tracks(is_random);

-- Apply updated_at trigger to spa_tracks
DROP TRIGGER IF EXISTS update_spa_tracks_updated_at ON spa_tracks;
CREATE TRIGGER update_spa_tracks_updated_at BEFORE UPDATE ON spa_tracks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeSpaTracksTables() {
  try {
    console.log('🔄 Initializing spa tracks tables...')

    const client = await pool.connect()
    try {
      // Execute the CREATE TABLES script
      await client.query(createSpaTracksTables)
      console.log('✅ Spa tracks tables created successfully')
      console.log('   - spa_tracks')
      console.log('   - Triggers and indexes applied')
    } finally {
      client.release()
    }

    console.log('🎉 Spa tracks tables initialization completed!')
  } catch (error) {
    console.error('❌ Spa tracks tables initialization failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeSpaTracksTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { initializeSpaTracksTables }
