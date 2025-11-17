import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

/**
 * Make slide title optional
 * This allows slides to be created without titles (for image-only slides)
 */
async function makeTitleOptional() {
  try {
    console.log('🔄 Making slide title optional...')

    const client = await pool.connect()
    try {
      // Check if title column already allows NULL
      const checkResult = await client.query(`
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_name = 'slides'
        AND column_name = 'title'
      `)

      if (checkResult.rows.length === 0) {
        throw new Error('Title column not found in slides table')
      }

      const isNullable = checkResult.rows[0].is_nullable === 'YES'

      if (isNullable) {
        console.log('ℹ️ Title column already allows NULL, skipping migration')
        return
      }

      // Make title column nullable
      await client.query('ALTER TABLE slides ALTER COLUMN title DROP NOT NULL')
      console.log('✅ Title column is now optional')
    } finally {
      client.release()
    }

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  makeTitleOptional()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { makeTitleOptional }
