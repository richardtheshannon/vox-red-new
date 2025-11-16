/**
 * Fix Users Table Schema
 *
 * This script fixes the users table schema mismatch in production.
 *
 * Problem: Production database has a 'username' column but code expects different schema
 * Solution: Either drop username column OR make it nullable
 *
 * Usage:
 * 1. Set DATABASE_URL to production database
 * 2. Run: tsx scripts/fix-users-schema.ts
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function fixUsersSchema() {
  console.log('🔧 Fixing Users Table Schema')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    // First, check current schema
    console.log('📊 Checking current users table schema...')
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `)

    console.log('')
    console.log('Current columns:')
    schemaCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    console.log('')

    // Check if username column exists
    const hasUsername = schemaCheck.rows.some(row => row.column_name === 'username')

    if (hasUsername) {
      console.log('⚠️  Found "username" column - this is causing the issue')
      console.log('')
      console.log('Options:')
      console.log('  A) Drop the username column (if not needed)')
      console.log('  B) Make username nullable (keep column but allow NULL)')
      console.log('')

      // For safety, we'll make it nullable instead of dropping
      console.log('🔄 Making username column nullable...')
      await client.query(`
        ALTER TABLE users
        ALTER COLUMN username DROP NOT NULL;
      `)
      console.log('✅ Username column is now nullable')
      console.log('')
    } else {
      console.log('✅ No username column found - schema looks correct')
      console.log('')
    }

    // Verify expected columns exist
    const expectedColumns = ['id', 'name', 'email', 'password_hash', 'role', 'created_at', 'updated_at']
    const missingColumns = expectedColumns.filter(col =>
      !schemaCheck.rows.some(row => row.column_name === col)
    )

    if (missingColumns.length > 0) {
      console.log('⚠️  Missing expected columns:', missingColumns.join(', '))
      console.log('   You may need to run migrations')
      console.log('')
    } else {
      console.log('✅ All expected columns present')
      console.log('')
    }

    console.log('🎉 Schema fix completed!')
    console.log('')
    console.log('You can now run: npm run db:seed:admin')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Error fixing schema:', error)
    console.error('')
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  fixUsersSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { fixUsersSchema }
