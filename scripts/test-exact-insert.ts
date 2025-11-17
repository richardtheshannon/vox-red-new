/**
 * Test the exact insert that's failing
 */

import { config } from 'dotenv'
config()

import { createUser } from '../src/lib/queries/users'
import { closeDatabase } from '../src/lib/db'

async function testExactInsert() {
  console.log('🧪 Testing Exact User Creation')
  console.log('='.repeat(50))
  console.log('')

  try {
    console.log('Creating user with:')
    console.log('  name: "Richard Shannon"')
    console.log('  email: "richard@salesfield.net"')
    console.log('  password: "Superculture1@"')
    console.log('  role: "admin"')
    console.log('')

    const user = await createUser({
      name: 'Richard Shannon',
      email: 'richard@salesfield.net',
      password: 'Superculture1@',
      role: 'admin'
    })

    console.log('✅ SUCCESS!')
    console.log('')
    console.log('Created user:')
    console.log(user)
    console.log('')

  } catch (error) {
    console.error('❌ FAILED!')
    console.error('')
    console.error('Error:', error)
    console.error('')

    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  } finally {
    await closeDatabase()
  }
}

if (require.main === module) {
  testExactInsert()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { testExactInsert }
