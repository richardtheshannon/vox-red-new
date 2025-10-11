import { NextResponse } from 'next/server'
import { queryCount, healthCheck } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const isHealthy = await healthCheck()
    if (!isHealthy) {
      throw new Error('Database health check failed')
    }

    // Get table counts
    const userCount = await queryCount('SELECT COUNT(*) FROM users')
    const categoryCount = await queryCount('SELECT COUNT(*) FROM categories')
    const serviceCommitmentCount = await queryCount('SELECT COUNT(*) FROM service_commitments')

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        users: userCount,
        categories: categoryCount,
        serviceCommitments: serviceCommitmentCount,
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}