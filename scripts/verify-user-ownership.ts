import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

async function verifyUserOwnership() {
  try {
    console.log('🔍 Verifying user ownership feature...')

    const client = await pool.connect()
    try {
      // Check if user_id column exists
      const columnCheck = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'slide_rows' AND column_name = 'user_id'
      `)

      if (columnCheck.rows.length === 0) {
        console.log('❌ user_id column not found in slide_rows table')
        process.exit(1)
      }

      console.log('✅ user_id column exists:')
      console.log('   - Type:', columnCheck.rows[0].data_type)
      console.log('   - Nullable:', columnCheck.rows[0].is_nullable)

      // Check if index exists
      const indexCheck = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'slide_rows' AND indexname = 'idx_slide_rows_user_id'
      `)

      if (indexCheck.rows.length > 0) {
        console.log('✅ Index idx_slide_rows_user_id exists')
      } else {
        console.log('⚠️  Index idx_slide_rows_user_id not found')
      }

      // Show current slide rows
      const rowsCheck = await client.query(`
        SELECT id, title, user_id
        FROM slide_rows
        ORDER BY display_order
        LIMIT 5
      `)

      console.log(`\n📊 Current slide rows (showing first 5):`)
      rowsCheck.rows.forEach(row => {
        console.log(`   - ${row.title}: user_id = ${row.user_id || 'NULL (public)'}`)
      })

    } finally {
      client.release()
    }

    console.log('\n🎉 Verification completed!')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyUserOwnership()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { verifyUserOwnership }
