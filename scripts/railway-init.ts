/**
 * Railway initialization script
 * This script runs on Railway deployment to set up the database
 */

import { initializeDatabase } from './init-db'
import { seedData } from './seed-db'
import { initializeSlideTables } from './init-slide-tables'
import { seedSlideData } from './seed-slide-data'
import { addSlideThemeSettings } from './add-slide-theme-settings'
import { addSlideIsPublishedColumn } from './add-slide-is-published'
import { addSlideSchedulingColumns } from './add-slide-scheduling'
import { addQuickslideType } from './add-quickslide-row-type'
import { addSlideIconSet } from './add-slide-icon-set'
import { addTempUnpublishColumn } from './add-temp-unpublish'
import { initializeSpaTracksTables } from './init-spa-tables'
import { addSpaVolume } from './add-spa-volume'
import { addPlaylistDelay } from './add-playlist-delay'

async function railwayInit() {
  try {
    console.log('🚂 Starting Railway database initialization...')

    // Initialize database schema (safe to run multiple times)
    try {
      await initializeDatabase()
      console.log('✅ Database schema initialized')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Database schema already exists, skipping initialization')
      } else {
        console.error('❌ Database initialization failed:', error)
        throw error
      }
    }

    // Initialize slide tables (safe to run multiple times)
    try {
      await initializeSlideTables()
      console.log('✅ Slide tables initialized')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide tables already exist, skipping initialization')
      } else {
        console.error('❌ Slide table initialization failed:', error)
        throw error
      }
    }

    // Add slide theme settings columns (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addSlideThemeSettings()
      console.log('✅ Slide theme settings columns added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide theme settings already exist, skipping')
      } else {
        console.error('❌ Slide theme settings migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without theme settings columns')
      }
    }

    // Add is_published column to slides (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addSlideIsPublishedColumn()
      console.log('✅ Slide is_published column added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide is_published column already exists, skipping')
      } else {
        console.error('❌ Slide is_published migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without is_published column')
      }
    }

    // Add scheduling columns to slides (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addSlideSchedulingColumns()
      console.log('✅ Slide scheduling columns added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide scheduling columns already exist, skipping')
      } else {
        console.error('❌ Slide scheduling migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without scheduling columns')
      }
    }

    // Add QUICKSLIDE row type (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addQuickslideType()
      console.log('✅ QUICKSLIDE row type added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ QUICKSLIDE row type already exists, skipping')
      } else {
        console.error('❌ QUICKSLIDE migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without QUICKSLIDE row type')
      }
    }

    // Add icon_set column to slides (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addSlideIconSet()
      console.log('✅ Slide icon_set column added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide icon_set column already exists, skipping')
      } else {
        console.error('❌ Slide icon_set migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without icon_set column')
      }
    }

    // Add temp_unpublish_until column to slides (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addTempUnpublishColumn()
      console.log('✅ Slide temp_unpublish_until column added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Slide temp_unpublish_until column already exists, skipping')
      } else {
        console.error('❌ Slide temp_unpublish_until migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without temp_unpublish_until column')
      }
    }

    // Initialize spa tracks tables (safe to run multiple times)
    try {
      await initializeSpaTracksTables()
      console.log('✅ Spa tracks tables initialized')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Spa tracks tables already exist, skipping initialization')
      } else {
        console.error('❌ Spa tracks table initialization failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without spa tracks tables')
      }
    }

    // Add volume column to spa_tracks (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addSpaVolume()
      console.log('✅ Spa volume column added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Spa volume column already exists, skipping')
      } else {
        console.error('❌ Spa volume migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without spa volume column')
      }
    }

    // Add playlist_delay_seconds column to slide_rows (safe to run multiple times - uses IF NOT EXISTS)
    try {
      await addPlaylistDelay()
      console.log('✅ Playlist delay column added')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Playlist delay column already exists, skipping')
      } else {
        console.error('❌ Playlist delay migration failed:', error)
        // Don't throw - this is a non-critical enhancement
        console.log('⚠️ Continuing without playlist delay column')
      }
    }

    // Seed with initial data (safe to run multiple times)
    try {
      await seedData()
      console.log('✅ Database seeded with initial data')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Database already seeded, skipping seed data')
      } else {
        console.error('❌ Database seeding failed:', error)
        throw error
      }
    }

    // Skip automatic slide data seeding to prevent duplicate/resurrected rows
    // Use `npm run db:slides:seed` manually if needed
    console.log('ℹ️  Skipping automatic slide data seeding (run manually with: npm run db:slides:seed)')

    // Seed slide data (safe to run multiple times) - DISABLED FOR AUTO-STARTUP
    // try {
    //   await seedSlideData()
    //   console.log('✅ Slide data seeded')
    // } catch (error) {
    //   if (error instanceof Error && error.message.includes('already exists')) {
    //     console.log('ℹ️ Slide data already seeded, skipping')
    //   } else {
    //     console.error('❌ Slide data seeding failed:', error)
    //     // Don't throw - slide seeding is optional
    //     console.log('⚠️ Continuing without slide seed data')
    //   }
    // }

    console.log('🎉 Railway database initialization completed successfully!')
  } catch (error) {
    console.error('❌ Railway database initialization failed:', error)
    console.log('⚠️ Continuing startup anyway - database may already be initialized')
    // Don't throw error to allow startup to continue
  }
}

// Run if executed directly
if (require.main === module) {
  railwayInit()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { railwayInit }