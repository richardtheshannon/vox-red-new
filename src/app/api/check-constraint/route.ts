import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Check Database Constraints
 * Shows what constraints exist on the users table
 */
export async function GET() {
  try {
    // Check table constraints
    const constraints = await query<any>(`
      SELECT
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
    `);

    // Get table structure
    const columns = await query<any>(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      status: 'success',
      constraints,
      columns,
    });
  } catch (error) {
    console.error('Error checking constraints:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check constraints',
      },
      { status: 500 }
    );
  }
}
