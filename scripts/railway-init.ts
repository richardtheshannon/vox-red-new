/**
 * Railway initialization script
 * This script runs on Railway deployment to set up the database
 */

import { initializeDatabase } from './init-db'
import { seedData } from './seed-db'

async function railwayInit() {
  try {
    console.log('🚂 Starting Railway database initialization...')

    // Initialize database schema
    await initializeDatabase()

    // Seed with initial data
    await seedData()

    console.log('🎉 Railway database initialization completed successfully!')
  } catch (error) {
    console.error('❌ Railway database initialization failed:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  railwayInit()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { railwayInit }