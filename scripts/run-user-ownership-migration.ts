import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

async function runUserOwnershipMigration() {
  try {
    console.log('🔄 Running user ownership migration...')

    // Read the migration SQL file
    const migrationPath = join(__dirname, 'migrations', 'add-user-ownership.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    const client = await pool.connect()
    try {
      // Execute the migration
      await client.query(migrationSQL)
      console.log('✅ Migration completed successfully')
      console.log('   - Added user_id column to slide_rows table')
      console.log('   - Added index on user_id')
      console.log('   - Added column comment')
    } finally {
      client.release()
    }

    console.log('🎉 User ownership migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runUserOwnershipMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { runUserOwnershipMigration }
