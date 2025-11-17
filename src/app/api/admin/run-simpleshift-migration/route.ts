/**
 * API endpoint to run SIMPLESHIFT migration
 * Access: http://localhost:3000/api/admin/run-simpleshift-migration
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin();

    console.log('Starting SIMPLESHIFT migration...');

    // Drop the existing check constraint
    console.log('Dropping old check constraint...');
    await query(`ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check`);

    // Add new check constraint with SIMPLESHIFT included
    console.log('Adding new check constraint with SIMPLESHIFT...');
    await query(`
      ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
      CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT'))
    `);

    console.log('Migration complete!');

    return NextResponse.json({
      status: 'success',
      message: 'SIMPLESHIFT migration completed successfully. You can now visit /api/admin/update-simple-shift-type to update your row.',
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}
