import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/slides/fix-quickslides
 * Fix Quick Slides row_type from ROUTINE to QUICKSLIDE
 */
export async function POST() {
  try {
    console.log('Checking for Quick Slides row with incorrect row_type...');

    // Find the Quick Slides row
    const rows = await query<{ id: string; title: string; row_type: string }>(
      "SELECT id, title, row_type FROM slide_rows WHERE title = 'Quick Slides'"
    );

    if (rows.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No "Quick Slides" row found'
      }, { status: 404 });
    }

    const quickSlidesRow = rows[0];
    console.log(`Found row: ${quickSlidesRow.title} (${quickSlidesRow.row_type})`);

    if (quickSlidesRow.row_type === 'QUICKSLIDE') {
      return NextResponse.json({
        status: 'success',
        message: 'Row type is already correct (QUICKSLIDE)',
        row: quickSlidesRow
      });
    }

    // Update the row_type to QUICKSLIDE
    console.log(`Updating row type from ${quickSlidesRow.row_type} to QUICKSLIDE...`);
    await query(
      "UPDATE slide_rows SET row_type = 'QUICKSLIDE' WHERE id = $1",
      [quickSlidesRow.id]
    );

    // Verify the update
    const updatedRows = await query<{ id: string; title: string; row_type: string }>(
      "SELECT id, title, row_type FROM slide_rows WHERE id = $1",
      [quickSlidesRow.id]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Successfully updated Quick Slides row_type to QUICKSLIDE',
      before: quickSlidesRow.row_type,
      after: updatedRows[0]?.row_type,
      row: updatedRows[0]
    });

  } catch (error) {
    console.error('Error fixing Quick Slides row type:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fix Quick Slides row type',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
