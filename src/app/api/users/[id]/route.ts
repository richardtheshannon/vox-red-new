import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, getAllUsers } from '@/lib/queries/users';
import { requireAdmin, getCurrentUserId } from '@/lib/auth';

/**
 * GET /api/users/[id]
 * Returns a single user by ID (excludes password_hash)
 * Requires admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Body: Partial<User> - any fields to update (name, email, role)
 * Updates a user
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id: userId } = await params;
    const body = await request.json();

    // Prevent self-demotion (changing own role)
    if (body.role) {
      const currentUserId = await getCurrentUserId();
      if (currentUserId === userId) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Cannot change your own role',
          },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (body.role) {
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

      // Check if trying to change last admin to user
      const currentUser = await getUserById(userId);
      if (currentUser && currentUser.role === 'admin' && body.role === 'user') {
        // Count admin users
        const allUsers = await getAllUsers();
        const adminCount = allUsers.filter(u => u.role === 'admin').length;

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              status: 'error',
              message: 'Cannot change role. At least one admin user must exist.',
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate email format if provided
    if (body.email) {
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
    }

    // Remove fields that shouldn't be updated directly
    const { id, password, password_hash, created_at, updated_at, ...updateData } = body;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No valid fields to update',
        },
        { status: 400 }
      );
    }

    // Normalize email if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes a user
 * Prevents deleting the last admin user
 * Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id: userId } = await params;

    // Prevent self-deletion
    const currentUserId = await getCurrentUserId();
    if (currentUserId === userId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Cannot delete your own account',
        },
        { status: 400 }
      );
    }

    // Check if user exists first
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

    // Prevent deleting last admin user
    if (user.role === 'admin') {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter(u => u.role === 'admin').length;

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Cannot delete the last admin user',
          },
          { status: 400 }
        );
      }
    }

    await deleteUser(userId);

    return NextResponse.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
