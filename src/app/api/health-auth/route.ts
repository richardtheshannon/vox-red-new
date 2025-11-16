import { NextResponse } from 'next/server'
import { getUserCount } from '@/lib/queries/users'

/**
 * GET /api/health-auth
 *
 * Health check endpoint for authentication system.
 * Returns the status of all auth-related components.
 *
 * This endpoint is useful for debugging production deployments
 * and verifying that all auth routes are working correctly.
 *
 * Response includes:
 * - Database connectivity
 * - User table status
 * - NextAuth configuration
 * - Environment variables status
 */
export async function GET() {
  const healthStatus: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    checks: {
      database: { status: string; details?: string }
      users_table: { status: string; user_count?: number; details?: string }
      nextauth_secret: { status: string; configured: boolean }
      nextauth_url: { status: string; configured: boolean; value?: string }
      setup_available: { status: string; can_setup: boolean }
    }
    routes: {
      setup: string
      login: string
      auth: string
    }
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown' },
      users_table: { status: 'unknown' },
      nextauth_secret: { status: 'unknown', configured: false },
      nextauth_url: { status: 'unknown', configured: false },
      setup_available: { status: 'unknown', can_setup: false },
    },
    routes: {
      setup: '/setup',
      login: '/login',
      auth: '/api/auth/signin',
    },
  }

  // Check NextAuth environment variables
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL

  if (nextAuthSecret) {
    healthStatus.checks.nextauth_secret.status = 'ok'
    healthStatus.checks.nextauth_secret.configured = true
  } else {
    healthStatus.checks.nextauth_secret.status = 'error'
    healthStatus.checks.nextauth_secret.configured = false
    healthStatus.status = 'unhealthy'
  }

  if (nextAuthUrl) {
    healthStatus.checks.nextauth_url.status = 'ok'
    healthStatus.checks.nextauth_url.configured = true
    healthStatus.checks.nextauth_url.value = nextAuthUrl
  } else {
    healthStatus.checks.nextauth_url.status = 'warning'
    healthStatus.checks.nextauth_url.configured = false
    healthStatus.status = healthStatus.status === 'healthy' ? 'degraded' : 'unhealthy'
  }

  // Check database connectivity and user count
  try {
    const userCount = await getUserCount()

    healthStatus.checks.database.status = 'ok'
    healthStatus.checks.database.details = 'Connected successfully'

    healthStatus.checks.users_table.status = 'ok'
    healthStatus.checks.users_table.user_count = userCount

    if (userCount === 0) {
      healthStatus.checks.setup_available.status = 'ok'
      healthStatus.checks.setup_available.can_setup = true
    } else {
      healthStatus.checks.setup_available.status = 'ok'
      healthStatus.checks.setup_available.can_setup = false
    }
  } catch (error) {
    healthStatus.checks.database.status = 'error'
    healthStatus.checks.database.details =
      error instanceof Error ? error.message : 'Unknown database error'

    healthStatus.checks.users_table.status = 'error'
    healthStatus.checks.users_table.details =
      error instanceof Error ? error.message : 'Failed to query users table'

    healthStatus.status = 'unhealthy'
  }

  // Determine overall status
  const hasErrors = Object.values(healthStatus.checks).some((check) => check.status === 'error')
  const hasWarnings = Object.values(healthStatus.checks).some((check) => check.status === 'warning')

  if (hasErrors) {
    healthStatus.status = 'unhealthy'
  } else if (hasWarnings) {
    healthStatus.status = 'degraded'
  } else {
    healthStatus.status = 'healthy'
  }

  // Return appropriate HTTP status code
  const httpStatus = healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}
