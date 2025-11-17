/**
 * API endpoint to update "Simple Shift" row type from CUSTOM to SIMPLESHIFT
 * Access: http://localhost:3000/api/admin/update-simple-shift-type
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin();

    // Find rows with title "Simple Shift" or similar
    const findResult = await query<{ id: string; title: string; row_type: string }>(
      `SELECT id, title, row_type FROM slide_rows WHERE LOWER(title) LIKE '%simple%shift%'`
    );

    console.log(`Found ${findResult.length} row(s) matching "Simple Shift"`);

    if (findResult.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No rows found with "Simple Shift" in the title.',
        found: [],
      });
    }

    // Update the row type to SIMPLESHIFT
    const updateResult = await query<{ id: string; title: string; row_type: string }>(
      `UPDATE slide_rows
       SET row_type = 'SIMPLESHIFT'
       WHERE LOWER(title) LIKE '%simple%shift%'
       RETURNING id, title, row_type`
    );

    console.log(`Updated ${updateResult.length} row(s) to SIMPLESHIFT`);

    return NextResponse.json({
      status: 'success',
      message: `Updated ${updateResult.length} row(s) to SIMPLESHIFT`,
      updated: updateResult,
    });

  } catch (error) {
    console.error('Error updating Simple Shift type:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update row type',
      },
      { status: 500 }
    );
  }
}
