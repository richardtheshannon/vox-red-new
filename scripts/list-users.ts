/**
 * List all users in the database
 */

import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function listUsers() {
  console.log('👥 Listing All Users')
  console.log('='.repeat(50))
  console.log('')

  const client = await pool.connect()

  try {
    const result = await client.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    console.log(`Found ${result.rows.length} user(s):`)
    console.log('')

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.created_at}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error listing users:', error)
    throw error
  } finally {
    client.release()
    await closeDatabase()
  }
}

if (require.main === module) {
  listUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { listUsers }
