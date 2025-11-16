import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserPassword } from '@/lib/queries/users';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/users/[id]/password
 * Body: { password }
 * Updates a user's password
 * Requires admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id: userId } = await params;
    const body = await request.json();

    // Validate required field
    if (!body.password) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required field: password',
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

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Update password (will be hashed by updateUserPassword function)
    await updateUserPassword(userId, body.password);

    return NextResponse.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update password',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
