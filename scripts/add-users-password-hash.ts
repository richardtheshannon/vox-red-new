import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { query, closeDatabase } from '../src/lib/db'

async function addUsersPasswordHash() {
  try {
    console.log('🔄 Adding password_hash column to users table...')

    // Add password_hash column to users table
    await query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `)

    // Add helpful comment
    await query(`COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for authentication (never store plain text)'`)

    console.log('✅ Successfully added password_hash column!')
    console.log('   - password_hash: bcrypt hashed passwords for authentication')
  } catch (error) {
    console.error('❌ Error adding password_hash column:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run if executed directly
if (require.main === module) {
  addUsersPasswordHash()
    .then(() => {
      console.log('🎉 Migration completed successfully!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('💥 Migration failed:', err)
      process.exit(1)
    })
}

export { addUsersPasswordHash }
