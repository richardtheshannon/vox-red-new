/**
 * Test which role values work with the current constraint
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function testRoleValues() {
  console.log('🧪 Testing Role Values')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()
  const testRoles = ['admin', 'ADMIN', 'user', 'USER', 'Admin', 'User']

  try {
    for (const testRole of testRoles) {
      const testEmail = `test-${testRole}-${Date.now()}@example.com`
      const hashedPassword = await bcrypt.hash('TestPassword123', SALT_ROUNDS)

      console.log(`Testing role: "${testRole}"`)

      const sql = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
      `

      try {
        const result = await client.query(sql, [
          `Test ${testRole}`,
          testEmail,
          hashedPassword,
          testRole
        ])

        console.log(`  ✅ SUCCESS - Created user with role="${result.rows[0].role}"`)

        // Clean up
        await client.query('DELETE FROM users WHERE id = $1', [result.rows[0].id])
      } catch (error) {
        if (error instanceof Error) {
          console.log(`  ❌ FAILED - ${error.message}`)
        } else {
          console.log(`  ❌ FAILED - Unknown error`)
        }
      }

      console.log('')
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
  testRoleValues()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { testRoleValues }
