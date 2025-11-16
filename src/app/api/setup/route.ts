import { NextRequest, NextResponse } from 'next/server'
import { getUserCount, createUser } from '@/lib/queries/users'

/**
 * GET /api/setup
 * Check if users exist in the database
 * Returns { hasUsers: boolean }
 */
export async function GET() {
  try {
    const userCount = await getUserCount()

    return NextResponse.json({
      status: 'success',
      hasUsers: userCount > 0,
    })
  } catch (error) {
    console.error('Error checking user count:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check user count',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup
 * Create the first admin user (only works when no users exist)
 * Body: { name, email, password }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if users already exist
    const userCount = await getUserCount()

    if (userCount > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Setup already completed. Users already exist.',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: name, email, and password are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      )
    }

    // Create first admin user
    const user = await createUser({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      role: 'admin',
    })

    return NextResponse.json(
      {
        status: 'success',
        message: 'Admin user created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create admin user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
