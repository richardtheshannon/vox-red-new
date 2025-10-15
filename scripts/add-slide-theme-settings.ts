import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { query, closeDatabase } from '../src/lib/db'

async function addSlideThemeSettings() {
  try {
    console.log('🔄 Adding theme settings columns to slides table...')

    // Add theme settings columns to slides table
    await query(`
      ALTER TABLE slides
        ADD COLUMN IF NOT EXISTS content_theme VARCHAR CHECK (content_theme IN ('light', 'dark')),
        ADD COLUMN IF NOT EXISTS title_bg_opacity NUMERIC(3,2) CHECK (title_bg_opacity >= 0 AND title_bg_opacity <= 1),
        ADD COLUMN IF NOT EXISTS body_bg_opacity NUMERIC(3,2) CHECK (body_bg_opacity >= 0 AND body_bg_opacity <= 1)
    `)

    // Add helpful comments
    await query(`COMMENT ON COLUMN slides.content_theme IS 'Optional per-slide theme override (light/dark) - overrides global theme setting'`)
    await query(`COMMENT ON COLUMN slides.title_bg_opacity IS 'Optional semi-transparent background opacity for title text (0-1, e.g., 0.7)'`)
    await query(`COMMENT ON COLUMN slides.body_bg_opacity IS 'Optional semi-transparent background opacity for body text (0-1, e.g., 0.8)'`)

    console.log('✅ Successfully added theme settings columns!')
    console.log('   - content_theme: per-slide light/dark theme')
    console.log('   - title_bg_opacity: semi-transparent title background (0-1)')
    console.log('   - body_bg_opacity: semi-transparent body background (0-1)')
  } catch (error) {
    console.error('❌ Error adding theme settings columns:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run if executed directly
if (require.main === module) {
  addSlideThemeSettings()
    .then(() => {
      console.log('🎉 Migration completed successfully!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('💥 Migration failed:', err)
      process.exit(1)
    })
}

export { addSlideThemeSettings }
