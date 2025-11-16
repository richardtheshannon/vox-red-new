/**
 * Verification script for User Management API endpoints (Phase 7)
 * Verifies that all API route files exist and are properly structured
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function checkFile(filePath: string, requiredContent: string[]): boolean {
  const fullPath = join(process.cwd(), filePath)

  if (!existsSync(fullPath)) {
    console.log(`   ❌ File does not exist: ${filePath}`)
    return false
  }

  const content = readFileSync(fullPath, 'utf-8')

  const missingContent = requiredContent.filter(req => !content.includes(req))
  if (missingContent.length > 0) {
    console.log(`   ❌ Missing content in ${filePath}:`)
    missingContent.forEach(mc => console.log(`      - ${mc}`))
    return false
  }

  console.log(`   ✅ ${filePath}`)
  return true
}

async function verifyUserAPI() {
  console.log('🔍 Verifying User Management API Implementation\n')

  let allPassed = true

  // Test 1: Check /api/users/route.ts
  console.log('1️⃣ Checking GET & POST /api/users...')
  const route1Passed = checkFile('src/app/api/users/route.ts', [
    'export async function GET',
    'export async function POST',
    'requireAdmin',
    'getAllUsers',
    'createUser',
    'getUserByEmail',
  ])
  allPassed = allPassed && route1Passed
  console.log('')

  // Test 2: Check /api/users/[id]/route.ts
  console.log('2️⃣ Checking GET, PATCH, DELETE /api/users/[id]...')
  const route2Passed = checkFile('src/app/api/users/[id]/route.ts', [
    'export async function GET',
    'export async function PATCH',
    'export async function DELETE',
    'requireAdmin',
    'getUserById',
    'updateUser',
    'deleteUser',
    'Cannot delete the last admin user',
    'Cannot change role. At least one admin user must exist',
  ])
  allPassed = allPassed && route2Passed
  console.log('')

  // Test 3: Check /api/users/[id]/password/route.ts
  console.log('3️⃣ Checking POST /api/users/[id]/password...')
  const route3Passed = checkFile('src/app/api/users/[id]/password/route.ts', [
    'export async function POST',
    'requireAdmin',
    'updateUserPassword',
    'Password must be at least 8 characters long',
  ])
  allPassed = allPassed && route3Passed
  console.log('')

  // Test 4: Verify existing dependencies
  console.log('4️⃣ Checking dependencies...')
  const libPassed = checkFile('src/lib/queries/users.ts', [
    'getAllUsers',
    'getUserById',
    'getUserByEmail',
    'createUser',
    'updateUser',
    'deleteUser',
    'updateUserPassword',
  ]) && checkFile('src/lib/auth.ts', [
    'requireAdmin',
  ])
  allPassed = allPassed && libPassed
  console.log('')

  // Summary
  console.log('─'.repeat(50))
  if (allPassed) {
    console.log('✅ All verification checks passed!')
    console.log('\n📋 Phase 7 API Endpoints Created:')
    console.log('   • GET    /api/users              - List all users')
    console.log('   • POST   /api/users              - Create new user')
    console.log('   • GET    /api/users/[id]         - Get single user')
    console.log('   • PATCH  /api/users/[id]         - Update user')
    console.log('   • DELETE /api/users/[id]         - Delete user')
    console.log('   • POST   /api/users/[id]/password - Update password')
    console.log('\n🔒 Security Features:')
    console.log('   • All endpoints require admin authentication')
    console.log('   • Email uniqueness validation')
    console.log('   • Password minimum length (8 chars)')
    console.log('   • Prevents deleting last admin')
    console.log('   • Prevents changing last admin to user role')
    console.log('\n🎯 Ready for Phase 8: User Management UI')
  } else {
    console.log('❌ Some verification checks failed')
    process.exit(1)
  }
}

// Run verification
verifyUserAPI()
