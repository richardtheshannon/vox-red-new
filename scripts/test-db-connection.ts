import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { query, healthCheck } from '../src/lib/db'

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')

    // Test basic health check
    const isHealthy = await healthCheck()
    console.log('Health check result:', isHealthy ? '✅ PASS' : '❌ FAIL')

    if (isHealthy) {
      // Test actual query
      const result = await query('SELECT COUNT(*) as count FROM users')
      console.log('✅ Database query successful')
      console.log(`📊 Users in database: ${result[0]?.count || 0}`)

      // Test categories
      const categories = await query('SELECT name FROM categories')
      console.log(`📊 Categories: ${categories.map(c => c.name).join(', ')}`)
    }

    console.log('🎉 Database connection test completed!')
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    process.exit(1)
  }
}

testConnection()