import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, getUserByEmail } from '@/lib/queries/users';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/users
 * Returns all users (excludes password_hash for security)
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const users = await getAllUsers();

    return NextResponse.json({
      status: 'success',
      users: users || [],
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Body: { name, email, password, role }
 * Creates a new user
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: name, email, password, and role are required',
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(body.email.toLowerCase().trim());
    if (existingUser) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Email already exists',
        },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: body.name,
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: body.role,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'User created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
