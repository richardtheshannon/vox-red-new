import { NextResponse } from 'next/server'
import { queryCount, healthCheck } from '@/lib/db'

// Retry helper function
async function retryHealthCheck(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Health check attempt ${attempt}/${maxRetries}`)
    const isHealthy = await healthCheck()
    if (isHealthy) {
      return true
    }
    if (attempt < maxRetries) {
      console.log(`Attempt ${attempt} failed, waiting 2 seconds before retry...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  return false
}

export async function GET() {
  try {
    console.log('=== Database Health Check API Called ===')

    // Test database connection with retry
    const isHealthy = await retryHealthCheck(3)
    if (!isHealthy) {
      throw new Error('Database health check failed after 3 attempts')
    }

    // Get table counts
    const userCount = await queryCount('SELECT COUNT(*) FROM users')
    const categoryCount = await queryCount('SELECT COUNT(*) FROM categories')
    const serviceCommitmentCount = await queryCount('SELECT COUNT(*) FROM service_commitments')

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      data: {
        users: userCount,
        categories: categoryCount,
        serviceCommitments: serviceCommitmentCount,
      }
    })
  } catch (error) {
    console.error('=== Database Health Check Failed ===')
    console.error('Error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}