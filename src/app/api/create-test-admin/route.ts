import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/queries/users';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

/**
 * Create Test Admin User Endpoint
 * POST /api/create-test-admin
 *
 * Creates a test admin user with known credentials
 * Email: test@admin.com
 * Password: admin123
 */
export async function POST() {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail('test@admin.com');

    if (existingUser) {
      return NextResponse.json({
        status: 'error',
        message: 'User test@admin.com already exists',
        credentials: {
          email: 'test@admin.com',
          password: 'admin123',
          note: 'Try logging in with these credentials',
        },
      }, { status: 400 });
    }

    // Create new admin user using direct SQL to handle original schema
    const password_hash = await bcrypt.hash('admin123', 10);

    const rows = await query(
      `INSERT INTO users (name, email, username, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, username, role, created_at`,
      ['Test Admin', 'test@admin.com', 'testadmin', password_hash, 'ADMIN']
    );

    const newUser = rows[0];

    return NextResponse.json({
      status: 'success',
      message: 'Test admin user created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      credentials: {
        email: 'test@admin.com',
        password: 'admin123',
      },
      loginUrl: 'http://localhost:3000/login',
    });
  } catch (error: any) {
    console.error('Error creating test admin:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to create test admin user',
    }, { status: 500 });
  }
}

/**
 * GET endpoint shows instructions
 */
export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: 'Send a POST request to this endpoint to create a test admin user',
    credentials: {
      email: 'test@admin.com',
      password: 'admin123',
    },
    instructions: 'Run: curl -X POST http://localhost:3000/api/create-test-admin',
  });
}
