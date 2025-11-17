import { config } from 'dotenv'
config()

import { pool, closeDatabase } from '../src/lib/db'

async function checkUsernames() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT username, email, name, COUNT(*) OVER (PARTITION BY username) as duplicate_count
      FROM users
      ORDER BY username NULLS FIRST
    `)
    console.log('Users and usernames:')
    console.table(result.rows)
  } finally {
    client.release()
    await closeDatabase()
  }
}

checkUsernames()
