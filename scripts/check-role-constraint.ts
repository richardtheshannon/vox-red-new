/**
 * Check Role Constraint
 *
 * This script checks the exact definition of the users_role_check constraint
 * in the production database to understand what values are allowed.
 *
 * Usage:
 * set DATABASE_URL=postgresql://...
 * tsx scripts/check-role-constraint.ts
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function checkRoleConstraint() {
  console.log('🔍 Checking users_role_check Constraint')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    // Get the constraint definition
    console.log('📋 Checking constraint definition...')
    const constraintQuery = await client.query(`
      SELECT
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conname = 'users_role_check'
        AND conrelid = 'users'::regclass;
    `)

    if (constraintQuery.rows.length === 0) {
      console.log('❌ Constraint "users_role_check" not found')
      console.log('')
    } else {
      console.log('✅ Constraint found:')
      console.log('')
      constraintQuery.rows.forEach(row => {
        console.log(`  Name: ${row.constraint_name}`)
        console.log(`  Definition: ${row.constraint_definition}`)
        console.log('')
      })
    }

    // Also check all constraints on users table
    console.log('📋 All constraints on users table:')
    const allConstraintsQuery = await client.query(`
      SELECT
        conname AS constraint_name,
        contype AS constraint_type,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
      ORDER BY conname;
    `)

    if (allConstraintsQuery.rows.length === 0) {
      console.log('  No constraints found')
    } else {
      allConstraintsQuery.rows.forEach(row => {
        const typeMap: Record<string, string> = {
          'c': 'CHECK',
          'f': 'FOREIGN KEY',
          'p': 'PRIMARY KEY',
          'u': 'UNIQUE'
        }
        console.log(`  - ${row.constraint_name} (${typeMap[row.constraint_type] || row.constraint_type})`)
        console.log(`    ${row.constraint_definition}`)
        console.log('')
      })
    }

    // Check current role values in the table
    console.log('📊 Current role values in users table:')
    const rolesQuery = await client.query(`
      SELECT DISTINCT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role;
    `)

    if (rolesQuery.rows.length === 0) {
      console.log('  No users found')
    } else {
      rolesQuery.rows.forEach(row => {
        console.log(`  - '${row.role}': ${row.count} user(s)`)
      })
    }
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Error checking constraint:', error)
    console.error('')
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  checkRoleConstraint()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { checkRoleConstraint }
