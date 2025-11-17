/**
 * Fix Role Constraint
 *
 * Problem: Production database has CHECK constraint that only accepts lowercase roles
 * Solution: Drop the constraint or update it to accept both cases
 *
 * Usage:
 * 1. Set DATABASE_URL to production database
 * 2. Run: tsx scripts/fix-role-constraint.ts
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function fixRoleConstraint() {
  console.log('🔧 Fixing Role Constraint')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    // Check current constraint
    console.log('📊 Checking current role constraint...')
    const constraintCheck = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
      AND conname LIKE '%role%';
    `)

    console.log('')
    if (constraintCheck.rows.length > 0) {
      console.log('Current constraint:')
      constraintCheck.rows.forEach(row => {
        console.log(`  - ${row.conname}: ${row.definition}`)
      })
      console.log('')
    } else {
      console.log('✅ No role constraint found')
      console.log('')
    }

    // Drop the restrictive constraint
    console.log('🔄 Dropping restrictive role constraint...')
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `)
    console.log('✅ Constraint dropped')
    console.log('')

    // Add new flexible constraint that accepts ALL case variations
    console.log('🔄 Adding flexible role constraint...')
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (LOWER(role) IN ('admin', 'user', 'moderator'));
    `)
    console.log('✅ New constraint added (accepts any case: admin, ADMIN, Admin, etc.)')
    console.log('')

    console.log('🎉 Role constraint fix completed!')
    console.log('')
    console.log('You can now create users with both uppercase and lowercase roles.')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Error fixing constraint:', error)
    console.error('')
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  fixRoleConstraint()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { fixRoleConstraint }
