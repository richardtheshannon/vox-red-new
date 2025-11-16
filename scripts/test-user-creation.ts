/**
 * Test User Creation
 *
 * This script tests creating a user directly to see the actual error
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function testUserCreation() {
  console.log('🧪 Testing User Creation')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123'
    const hashedPassword = await bcrypt.hash(testPassword, SALT_ROUNDS)

    console.log('📝 Test user data:')
    console.log(`  Email: ${testEmail}`)
    console.log(`  Name: Test User`)
    console.log(`  Role: ADMIN (uppercase)`)
    console.log('')

    // Try the exact SQL that createUser() uses
    console.log('🔄 Attempting to create user with current SQL...')
    const sql = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `

    try {
      const result = await client.query(sql, [
        'Test User',
        testEmail,
        hashedPassword,
        'ADMIN'
      ])

      console.log('✅ User created successfully!')
      console.log('')
      console.log('Created user:')
      console.log(result.rows[0])
      console.log('')

      // Clean up - delete the test user
      await client.query('DELETE FROM users WHERE email = $1', [testEmail])
      console.log('🧹 Test user cleaned up')
      console.log('')

    } catch (insertError) {
      console.error('❌ Insert failed with error:')
      console.error(insertError)
      console.error('')

      // Try with explicit username = NULL
      console.log('🔄 Retrying with explicit username = NULL...')
      const sqlWithUsername = `
        INSERT INTO users (name, email, password_hash, role, username)
        VALUES ($1, $2, $3, $4, NULL)
        RETURNING id, name, email, role, created_at, updated_at
      `

      try {
        const result = await client.query(sqlWithUsername, [
          'Test User',
          testEmail,
          hashedPassword,
          'ADMIN'
        ])

        console.log('✅ User created successfully with explicit username=NULL!')
        console.log('')
        console.log('Created user:')
        console.log(result.rows[0])
        console.log('')

        // Clean up
        await client.query('DELETE FROM users WHERE email = $1', [testEmail])
        console.log('🧹 Test user cleaned up')
        console.log('')

        console.log('💡 SOLUTION: Need to explicitly set username=NULL in INSERT query')
        console.log('')

      } catch (retryError) {
        console.error('❌ Retry also failed:')
        console.error(retryError)
        console.error('')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  testUserCreation()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { testUserCreation }
