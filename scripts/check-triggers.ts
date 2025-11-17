/**
 * Check for database triggers on users table
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function checkTriggers() {
  console.log('🔍 Checking Database Triggers')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    const result = await client.query(`
      SELECT
        t.tgname AS trigger_name,
        p.proname AS function_name,
        pg_get_triggerdef(t.oid) AS trigger_definition
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = 'users'::regclass
      AND NOT t.tgisinternal
      ORDER BY t.tgname;
    `)

    if (result.rows.length === 0) {
      console.log('✅ No custom triggers found on users table')
    } else {
      console.log(`Found ${result.rows.length} trigger(s):`)
      console.log('')
      result.rows.forEach(row => {
        console.log(`Trigger: ${row.trigger_name}`)
        console.log(`Function: ${row.function_name}`)
        console.log(`Definition:`)
        console.log(row.trigger_definition)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error checking triggers:', error)
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  checkTriggers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { checkTriggers }
