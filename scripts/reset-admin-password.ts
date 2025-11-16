/**
 * Reset Admin Password Script
 *
 * This script resets the password for an existing admin user.
 * Use this when you know the email but forgot the password.
 *
 * Usage:
 * 1. Set DATABASE_URL environment variable to production database
 * 2. Run: tsx scripts/reset-admin-password.ts
 * 3. Enter the admin email and new password
 */

import { config } from 'dotenv'
import { pool, closeDatabase } from '../src/lib/db'
import bcrypt from 'bcrypt'
import * as readline from 'readline'

// Load environment variables
config()

const SALT_ROUNDS = 10

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

async function resetAdminPassword() {
  console.log('🔑 Reset Admin Password Script')
  console.log('='.repeat(50))
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

  const client = await pool.connect()

  try {
    // Show existing users
    console.log('👥 Existing Admin Users:')
    console.log('-'.repeat(50))
    const usersResult = await client.query(`
      SELECT id, name, email, role
      FROM users
      WHERE role = 'ADMIN'
      ORDER BY created_at DESC;
    `)

    if (usersResult.rows.length === 0) {
      console.log('❌ No admin users found in database!')
      console.log('')
      rl.close()
      client.release()
      await closeDatabase()
      process.exit(1)
    }

    usersResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.name}`)
      console.log(`     Email: ${row.email}`)
      console.log(`     Role: ${row.role}`)
      console.log('')
    })

    // Get email to reset
    const email = await question('Enter the email of the admin user to reset: ')
    if (!email.trim()) {
      throw new Error('Email is required')
    }

    // Check if user exists
    const userCheck = await client.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    )

    if (userCheck.rows.length === 0) {
      throw new Error(`No user found with email: ${email}`)
    }

    const user = userCheck.rows[0]

    console.log('')
    console.log('Found user:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log('')

    // Get new password
    const newPassword = await question('Enter new password (min 8 characters): ')
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    const confirmPassword = await question('Confirm new password: ')
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    console.log('')
    console.log('Resetting password...')
    console.log('')

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    // Update password in database
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, user.id]
    )

    console.log('✅ SUCCESS! Password has been reset')
    console.log('')
    console.log('Login Details:')
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: [the password you just entered]`)
    console.log('')
    console.log('🎉 You can now login at: https://vox-red-production.up.railway.app/login')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Error resetting password:')
    console.error(error instanceof Error ? error.message : 'Unknown error')
    console.error('')

    rl.close()
    client.release()
    await closeDatabase()
    process.exit(1)
  }

  rl.close()
  client.release()
  await closeDatabase()
  process.exit(0)
}

// Run the script
if (require.main === module) {
  resetAdminPassword().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { resetAdminPassword }
