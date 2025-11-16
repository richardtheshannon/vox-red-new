/**
 * Check Database Constraints
 *
 * This script checks the constraints on the users table to see what values are allowed.
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function checkConstraints() {
  console.log('🔍 Checking Database Constraints')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    // Check table schema
    console.log('📊 Users Table Schema:')
    console.log('-'.repeat(50))
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `)

    schemaCheck.rows.forEach(row => {
      console.log(`  ${row.column_name}:`)
      console.log(`    Type: ${row.data_type}`)
      console.log(`    Nullable: ${row.is_nullable}`)
      console.log(`    Default: ${row.column_default || 'none'}`)
      console.log('')
    })

    // Check constraints
    console.log('🔒 Table Constraints:')
    console.log('-'.repeat(50))
    const constraintCheck = await client.query(`
      SELECT
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass;
    `)

    if (constraintCheck.rows.length === 0) {
      console.log('  No constraints found')
    } else {
      constraintCheck.rows.forEach(row => {
        console.log(`  ${row.constraint_name}:`)
        console.log(`    ${row.constraint_definition}`)
        console.log('')
      })
    }

    // Check existing users
    console.log('👥 Existing Users:')
    console.log('-'.repeat(50))
    const usersCheck = await client.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5;
    `)

    if (usersCheck.rows.length === 0) {
      console.log('  No users found')
    } else {
      console.log(`  Found ${usersCheck.rows.length} user(s):`)
      usersCheck.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.name} (${row.email})`)
        console.log(`     Role: ${row.role}`)
        console.log(`     Created: ${row.created_at}`)
        console.log('')
      })
    }

    console.log('='.repeat(50))

  } catch (error) {
    console.error('')
    console.error('❌ Error checking constraints:', error)
    console.error('')
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  checkConstraints()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { checkConstraints }
