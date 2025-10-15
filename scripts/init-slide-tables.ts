import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const createSlideTables = `
-- Slide Row Management (collections of slides)
CREATE TABLE IF NOT EXISTS slide_rows (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    description TEXT,
    row_type VARCHAR NOT NULL CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM')),

    -- Display settings
    is_published BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,

    -- Visual styling
    icon_set TEXT, -- JSON array of Material Symbol icon names
    theme_color VARCHAR, -- Hex color for UI theming

    -- Metadata
    slide_count INTEGER DEFAULT 0, -- Computed count of slides in this row
    created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual slides within a row
CREATE TABLE IF NOT EXISTS slides (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slide_row_id VARCHAR NOT NULL REFERENCES slide_rows(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    body_content TEXT, -- Main article content (supports HTML)

    -- Media
    audio_url VARCHAR, -- Path to MP3 file
    image_url VARCHAR, -- Optional background or header image
    video_url VARCHAR, -- Optional YouTube video URL

    -- Display settings
    position INTEGER NOT NULL, -- Order within the row (1, 2, 3, etc.)
    layout_type VARCHAR DEFAULT 'STANDARD' CHECK (layout_type IN ('STANDARD', 'OVERFLOW', 'MINIMAL')),

    -- Metadata
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0, -- For tracking user progress
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(slide_row_id, position) -- Each position unique within a row
);

-- Optional: Custom icon configurations per slide
CREATE TABLE IF NOT EXISTS slide_icons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slide_id VARCHAR NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
    icon_name VARCHAR NOT NULL, -- Material Symbol icon name
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(slide_id, display_order)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slide_rows_type ON slide_rows(row_type);
CREATE INDEX IF NOT EXISTS idx_slide_rows_published ON slide_rows(is_published);
CREATE INDEX IF NOT EXISTS idx_slide_rows_order ON slide_rows(display_order);
CREATE INDEX IF NOT EXISTS idx_slides_row_id ON slides(slide_row_id);
CREATE INDEX IF NOT EXISTS idx_slides_position ON slides(position);
CREATE INDEX IF NOT EXISTS idx_slide_icons_slide_id ON slide_icons(slide_id);

-- Trigger for auto-updating slide_count
CREATE OR REPLACE FUNCTION update_slide_row_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slide_rows
    SET slide_count = (
        SELECT COUNT(*)
        FROM slides
        WHERE slide_row_id = COALESCE(NEW.slide_row_id, OLD.slide_row_id)
    )
    WHERE id = COALESCE(NEW.slide_row_id, OLD.slide_row_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply triggers for slide count updates
DROP TRIGGER IF EXISTS update_slide_count_insert ON slides;
CREATE TRIGGER update_slide_count_insert AFTER INSERT ON slides
FOR EACH ROW EXECUTE FUNCTION update_slide_row_count();

DROP TRIGGER IF EXISTS update_slide_count_delete ON slides;
CREATE TRIGGER update_slide_count_delete AFTER DELETE ON slides
FOR EACH ROW EXECUTE FUNCTION update_slide_row_count();

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS update_slide_rows_updated_at ON slide_rows;
CREATE TRIGGER update_slide_rows_updated_at BEFORE UPDATE ON slide_rows
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slides_updated_at ON slides;
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeSlideTables() {
  try {
    console.log('🔄 Initializing slide management tables...')

    const client = await pool.connect()
    try {
      // Execute the CREATE TABLES script
      await client.query(createSlideTables)
      console.log('✅ Slide management tables created successfully')
      console.log('   - slide_rows')
      console.log('   - slides')
      console.log('   - slide_icons')
      console.log('   - Triggers and indexes applied')
    } finally {
      client.release()
    }

    console.log('🎉 Slide tables initialization completed!')
  } catch (error) {
    console.error('❌ Slide tables initialization failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeSlideTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { initializeSlideTables }
