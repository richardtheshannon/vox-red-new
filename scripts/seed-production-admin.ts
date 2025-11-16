/**
 * Production Admin Seed Script
 *
 * This script creates an admin user directly in the production database.
 * Use this when the /setup page is not working on production.
 *
 * IMPORTANT SECURITY NOTES:
 * - Only run this when you need to create the first admin user
 * - Store credentials securely after creation
 * - Consider deleting this script after use or keeping credentials out of git
 *
 * Usage:
 * 1. Set DATABASE_URL environment variable to production database
 * 2. Run: tsx scripts/seed-production-admin.ts
 * 3. Follow the prompts to create admin user
 */

import { config } from 'dotenv'
import { createUser, getUserCount } from '../src/lib/queries/users'
import { closeDatabase } from '../src/lib/db'
import * as readline from 'readline'

// Load environment variables
config()

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Promisify readline question
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function seedProductionAdmin() {
  console.log('🔐 Production Admin Seed Script')
  console.log('=' .repeat(50))
  console.log('')

  // Verify database connection
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set')
    console.log('')
    console.log('Set your production database URL:')
    console.log('  Windows: set DATABASE_URL=postgresql://...')
    console.log('  Mac/Linux: export DATABASE_URL=postgresql://...')
    console.log('')
    process.exit(1)
  }

  console.log('✅ Connected to database')
  console.log(`   Database: ${dbUrl.split('@')[1]?.split('/')[1] || 'unknown'}`)
  console.log('')

  try {
    // Check if users already exist
    const userCount = await getUserCount()
    console.log(`📊 Current user count: ${userCount}`)
    console.log('')

    if (userCount > 0) {
      console.log('⚠️  WARNING: Users already exist in the database!')
      console.log('   This script is intended for creating the FIRST admin user.')
      console.log('')

      const proceed = await question('Do you want to create another admin user anyway? (yes/no): ')

      if (proceed.toLowerCase() !== 'yes') {
        console.log('')
        console.log('✋ Cancelled by user')
        rl.close()
        await closeDatabase()
        process.exit(0)
      }
      console.log('')
    }

    // Collect admin details
    console.log('Please enter the admin user details:')
    console.log('')

    const name = await question('Name: ')
    if (!name.trim()) {
      throw new Error('Name is required')
    }

    const email = await question('Email: ')
    if (!email.trim()) {
      throw new Error('Email is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    const password = await question('Password (min 8 characters): ')
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    const confirmPassword = await question('Confirm Password: ')
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    console.log('')
    console.log('Creating admin user...')
    console.log('')

    // Create the admin user
    // Note: Use uppercase 'ADMIN' for production database compatibility
    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'ADMIN' as any, // Production DB uses uppercase roles
    })

    console.log('✅ SUCCESS! Admin user created')
    console.log('')
    console.log('User Details:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Created: ${user.created_at}`)
    console.log('')
    console.log('🎉 You can now login at: https://your-domain.railway.app/login')
    console.log('')
    console.log('IMPORTANT: Store these credentials securely!')
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: [the password you just entered]`)
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Error creating admin user:')
    console.error(error instanceof Error ? error.message : 'Unknown error')
    console.error('')

    if (error instanceof Error && error.message.includes('unique')) {
      console.error('💡 Hint: This email address is already in use.')
      console.error('   Try a different email or check existing users.')
    }

    rl.close()
    await closeDatabase()
    process.exit(1)
  }

  rl.close()
  await closeDatabase()
  process.exit(0)
}

// Run the script
if (require.main === module) {
  seedProductionAdmin().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { seedProductionAdmin }
