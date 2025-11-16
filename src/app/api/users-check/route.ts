import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/queries/users';

/**
 * Temporary endpoint to check existing users
 * GET /api/users-check
 */
export async function GET() {
  try {
    const users = await getAllUsers();

    return NextResponse.json({
      status: 'success',
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
