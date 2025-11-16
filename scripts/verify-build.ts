/**
 * Build Verification Script
 *
 * This script verifies that all critical API routes are present in the build output.
 * It should be run after `next build` to ensure the deployment will work correctly.
 *
 * Critical routes checked:
 * - /api/auth/[...nextauth] - NextAuth.js authentication
 * - /api/setup - First-time admin setup
 * - /api/users - User management
 * - /api/test-db - Database health check
 *
 * Usage:
 * - Run after build: npm run build && tsx scripts/verify-build.ts
 * - Or as part of CI/CD pipeline
 */

import * as fs from 'fs'
import * as path from 'path'

// Critical API routes that must exist in the build
const CRITICAL_ROUTES = [
  {
    path: '.next/server/app/api/auth/[...nextauth]/route.js',
    name: 'NextAuth.js Authentication',
    description: 'Required for login/logout functionality',
  },
  {
    path: '.next/server/app/api/setup/route.js',
    name: 'Setup Page API',
    description: 'Required for first-time admin creation',
  },
  {
    path: '.next/server/app/api/users/route.js',
    name: 'User Management API',
    description: 'Required for user CRUD operations',
  },
  {
    path: '.next/server/app/api/test-db/route.js',
    name: 'Database Health Check',
    description: 'Railway healthcheck endpoint',
  },
  {
    path: '.next/server/app/api/slides/rows/route.js',
    name: 'Slide Rows API',
    description: 'Core functionality for slide management',
  },
]

// Important page routes that should exist
const IMPORTANT_PAGES = [
  {
    path: '.next/server/app/setup/page.js',
    name: 'Setup Page',
    description: 'First-time setup UI',
  },
  {
    path: '.next/server/app/login/page.js',
    name: 'Login Page',
    description: 'User login UI',
  },
  {
    path: '.next/server/app/admin/users/page.js',
    name: 'User Management Page',
    description: 'Admin user management UI',
  },
]

function checkFileExists(filePath: string): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  return fs.existsSync(fullPath)
}

function verifyBuild(): boolean {
  console.log('🔍 Verifying Next.js Build Output')
  console.log('='.repeat(60))
  console.log('')

  // Check if .next directory exists
  if (!fs.existsSync('.next')) {
    console.error('❌ ERROR: .next directory not found!')
    console.error('   Please run "npm run build" first.')
    console.error('')
    return false
  }

  console.log('✅ Build directory found')
  console.log('')

  let hasErrors = false
  let hasWarnings = false

  // Check critical API routes
  console.log('📡 Checking Critical API Routes:')
  console.log('-'.repeat(60))

  for (const route of CRITICAL_ROUTES) {
    const exists = checkFileExists(route.path)

    if (exists) {
      console.log(`✅ ${route.name}`)
      console.log(`   ${route.path}`)
    } else {
      console.log(`❌ MISSING: ${route.name}`)
      console.log(`   Expected: ${route.path}`)
      console.log(`   Description: ${route.description}`)
      hasErrors = true
    }
    console.log('')
  }

  // Check important pages
  console.log('📄 Checking Important Pages:')
  console.log('-'.repeat(60))

  for (const page of IMPORTANT_PAGES) {
    const exists = checkFileExists(page.path)

    if (exists) {
      console.log(`✅ ${page.name}`)
      console.log(`   ${page.path}`)
    } else {
      console.log(`⚠️  WARNING: ${page.name}`)
      console.log(`   Expected: ${page.path}`)
      console.log(`   Description: ${page.description}`)
      hasWarnings = true
    }
    console.log('')
  }

  // Check for lib files in build
  console.log('📚 Checking Server-Side Libraries:')
  console.log('-'.repeat(60))

  const libChunks = path.join(process.cwd(), '.next/server/chunks')
  if (fs.existsSync(libChunks)) {
    const files = fs.readdirSync(libChunks)
    console.log(`✅ Found ${files.length} server chunks`)
    console.log(`   ${libChunks}`)
  } else {
    console.log('⚠️  WARNING: Server chunks directory not found')
    hasWarnings = true
  }
  console.log('')

  // Summary
  console.log('='.repeat(60))
  console.log('📊 Verification Summary:')
  console.log('')

  if (hasErrors) {
    console.log('❌ BUILD VERIFICATION FAILED')
    console.log('')
    console.log('Critical routes are missing from the build output.')
    console.log('This deployment will NOT work correctly.')
    console.log('')
    console.log('Possible causes:')
    console.log('1. TypeScript compilation errors (run: npx tsc --noEmit)')
    console.log('2. Missing dependencies (run: npm install)')
    console.log('3. Build cache issues (delete .next and rebuild)')
    console.log('4. Incorrect tsconfig.json exclude patterns')
    console.log('')
    return false
  }

  if (hasWarnings) {
    console.log('⚠️  BUILD VERIFICATION PASSED WITH WARNINGS')
    console.log('')
    console.log('Some non-critical routes are missing.')
    console.log('Review warnings above to ensure expected functionality.')
    console.log('')
  } else {
    console.log('✅ BUILD VERIFICATION PASSED')
    console.log('')
    console.log('All critical routes are present in the build.')
    console.log('Deployment should work correctly.')
    console.log('')
  }

  return true
}

// Run verification
if (require.main === module) {
  const success = verifyBuild()
  process.exit(success ? 0 : 1)
}

export { verifyBuild }
