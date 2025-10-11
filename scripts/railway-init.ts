/**
 * Railway initialization script
 * This script runs on Railway deployment to set up the database
 */

import { initializeDatabase } from './init-db'
import { seedData } from './seed-db'

async function railwayInit() {
  try {
    console.log('🚂 Starting Railway database initialization...')

    // Initialize database schema (safe to run multiple times)
    try {
      await initializeDatabase()
      console.log('✅ Database schema initialized')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Database schema already exists, skipping initialization')
      } else {
        console.error('❌ Database initialization failed:', error)
        throw error
      }
    }

    // Seed with initial data (safe to run multiple times)
    try {
      await seedData()
      console.log('✅ Database seeded with initial data')
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('ℹ️ Database already seeded, skipping seed data')
      } else {
        console.error('❌ Database seeding failed:', error)
        throw error
      }
    }

    console.log('🎉 Railway database initialization completed successfully!')
  } catch (error) {
    console.error('❌ Railway database initialization failed:', error)
    console.log('⚠️ Continuing startup anyway - database may already be initialized')
    // Don't throw error to allow startup to continue
  }
}

// Run if executed directly
if (require.main === module) {
  railwayInit()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { railwayInit }