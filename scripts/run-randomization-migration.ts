import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

async function runRandomizationMigration() {
  try {
    console.log('🔄 Running slide randomization migration...')

    // Read the migration SQL file
    const migrationPath = join(__dirname, 'migrations', 'add-slide-randomization.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    const client = await pool.connect()
    try {
      // Execute the migration
      await client.query(migrationSQL)
      console.log('✅ Migration completed successfully')
      console.log('   - Added randomize_enabled column to slide_rows table')
      console.log('   - Added randomize_count column to slide_rows table')
      console.log('   - Added randomize_interval column to slide_rows table')
      console.log('   - Added randomize_seed column to slide_rows table')
      console.log('   - Added check constraints for validation')
      console.log('   - Added index on randomize_enabled')
      console.log('   - Added column comments')
    } finally {
      client.release()
    }

    console.log('🎉 Slide randomization migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runRandomizationMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { runRandomizationMigration }
