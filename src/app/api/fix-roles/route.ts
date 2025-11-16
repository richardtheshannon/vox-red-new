import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Fix User Roles API
 * Converts all UPPERCASE roles to lowercase
 * This is a one-time fix for the ADMIN vs admin issue
 */
export async function POST() {
  try {
    console.log('Fixing user roles to lowercase...');

    // Check current state
    const beforeUpdate = await query<any>(
      'SELECT id, name, email, role FROM users ORDER BY created_at'
    );

    console.log('Before update:', beforeUpdate);

    // Update all roles to lowercase
    const result = await query<any>(
      'UPDATE users SET role = LOWER(role) RETURNING id, name, email, role'
    );

    console.log('After update:', result);

    return NextResponse.json({
      status: 'success',
      message: 'User roles updated to lowercase',
      before: beforeUpdate,
      after: result,
      updated: result.length,
    });
  } catch (error) {
    console.error('Error fixing user roles:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fix user roles',
      },
      { status: 500 }
    );
  }
}

/**
 * Check current roles without making changes
 */
export async function GET() {
  try {
    const users = await query<any>(
      'SELECT id, name, email, role FROM users ORDER BY created_at'
    );

    const needsFix = users.some((u: any) => u.role !== u.role.toLowerCase());

    return NextResponse.json({
      status: 'success',
      users,
      needsFix,
      message: needsFix
        ? 'Some roles need to be converted to lowercase'
        : 'All roles are already lowercase',
    });
  } catch (error) {
    console.error('Error checking user roles:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check user roles',
      },
      { status: 500 }
    );
  }
}
