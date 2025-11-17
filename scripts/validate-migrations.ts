import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

/**
 * Migration Validation Script
 * Checks if all expected database columns and tables exist
 * Reports any pending migrations that need to be run
 */

interface ColumnCheck {
  table: string
  column: string
  description: string
}

interface ConstraintCheck {
  table: string
  constraint: string
  description: string
}

// Define all expected columns from migrations
const expectedColumns: ColumnCheck[] = [
  { table: 'slide_rows', column: 'id', description: 'Core table: slide_rows' },
  { table: 'slide_rows', column: 'title', description: 'Core table: slide_rows' },
  { table: 'slide_rows', column: 'row_type', description: 'Core table: slide_rows' },
  { table: 'slide_rows', column: 'playlist_delay_seconds', description: 'Playlist delay feature (Nov 2025)' },
  { table: 'slide_rows', column: 'randomize_enabled', description: 'Slide randomization feature (Jan 2025)' },
  { table: 'slide_rows', column: 'randomize_count', description: 'Slide randomization feature (Jan 2025)' },
  { table: 'slide_rows', column: 'randomize_interval', description: 'Slide randomization feature (Jan 2025)' },
  { table: 'slide_rows', column: 'randomize_seed', description: 'Slide randomization feature (Jan 2025)' },

  { table: 'slides', column: 'id', description: 'Core table: slides' },
  { table: 'slides', column: 'title', description: 'Core table: slides' },
  { table: 'slides', column: 'content_theme', description: 'Per-slide theme settings' },
  { table: 'slides', column: 'title_bg_opacity', description: 'Per-slide theme settings' },
  { table: 'slides', column: 'body_bg_opacity', description: 'Per-slide theme settings' },
  { table: 'slides', column: 'is_published', description: 'Publishing control' },
  { table: 'slides', column: 'publish_time_start', description: 'Dynamic scheduling' },
  { table: 'slides', column: 'publish_time_end', description: 'Dynamic scheduling' },
  { table: 'slides', column: 'publish_days', description: 'Dynamic scheduling' },
  { table: 'slides', column: 'icon_set', description: 'Per-slide icons (Oct 2025)' },
  { table: 'slides', column: 'temp_unpublish_until', description: 'Temporary unpublish feature (Oct 2025)' },

  { table: 'spa_tracks', column: 'id', description: 'Spa Mode: background music' },
  { table: 'spa_tracks', column: 'title', description: 'Spa Mode: background music' },
  { table: 'spa_tracks', column: 'volume', description: 'Spa Mode: per-track volume control (Oct 2025)' },

  { table: 'users', column: 'id', description: 'User authentication: users table (Nov 2025)' },
  { table: 'users', column: 'name', description: 'User authentication: users table (Nov 2025)' },
  { table: 'users', column: 'email', description: 'User authentication: users table (Nov 2025)' },
  { table: 'users', column: 'password_hash', description: 'User authentication: users table (Nov 2025)' },
  { table: 'users', column: 'role', description: 'User authentication: users table (Nov 2025)' },
]

const expectedConstraints: ConstraintCheck[] = [
  { table: 'slide_rows', constraint: 'slide_rows_playlist_delay_seconds_range', description: 'Playlist delay range: 0-45 seconds' },
  { table: 'slide_rows', constraint: 'check_randomize_count', description: 'Randomize count must be >= 1 if set' },
  { table: 'slide_rows', constraint: 'check_randomize_interval', description: 'Randomize interval must be hourly/daily/weekly' },
  { table: 'slide_rows', constraint: 'slide_rows_row_type_check', description: 'Row type must include SIMPLESHIFT (Nov 2025)' },
]

async function validateMigrations() {
  try {
    console.log('🔍 Validating database migrations...\n')

    const client = await pool.connect()
    let allValid = true
    const missingItems: string[] = []

    try {
      // Check for expected columns
      console.log('📋 Checking columns...')
      for (const check of expectedColumns) {
        const result = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = $2
        `, [check.table, check.column])

        if (result.rows.length === 0) {
          console.log(`  ❌ Missing: ${check.table}.${check.column} - ${check.description}`)
          missingItems.push(`${check.table}.${check.column}`)
          allValid = false
        } else {
          console.log(`  ✅ ${check.table}.${check.column}`)
        }
      }

      // Check for expected constraints
      console.log('\n🔒 Checking constraints...')
      for (const check of expectedConstraints) {
        const result = await client.query(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = $1 AND constraint_name = $2
        `, [check.table, check.constraint])

        if (result.rows.length === 0) {
          console.log(`  ❌ Missing: ${check.constraint} on ${check.table} - ${check.description}`)
          missingItems.push(`constraint: ${check.constraint}`)
          allValid = false
        } else {
          console.log(`  ✅ ${check.constraint}`)
        }
      }

      // Final report
      console.log('\n' + '='.repeat(60))
      if (allValid) {
        console.log('✅ All migrations are up to date!')
        console.log('✅ Database schema is valid')
        console.log('\n🚀 Ready to deploy to Railway!')
      } else {
        console.log('❌ PENDING MIGRATIONS DETECTED')
        console.log('\nMissing items:')
        missingItems.forEach(item => console.log(`  - ${item}`))
        console.log('\n⚠️  Action Required:')
        console.log('   Run: npm run railway:init')
        console.log('   Or manually run migration scripts in scripts/ directory')
        console.log('\n🚫 DO NOT DEPLOY to Railway until all migrations are applied!')
        process.exit(1)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Migration validation failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { validateMigrations }
