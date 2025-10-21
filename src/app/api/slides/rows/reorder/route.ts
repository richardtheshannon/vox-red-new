import { NextRequest, NextResponse } from 'next/server';
import { reorderSlideRows } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/rows/reorder
 * Body: { row_ids: string[] }
 * Reorders slide rows based on the provided array of row IDs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate row_ids array
    if (!body.row_ids || !Array.isArray(body.row_ids)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid request: row_ids must be an array',
        },
        { status: 400 }
      );
    }

    if (body.row_ids.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid request: row_ids array cannot be empty',
        },
        { status: 400 }
      );
    }

    // Reorder slide rows
    await reorderSlideRows(body.row_ids);

    return NextResponse.json({
      status: 'success',
      message: 'Slide rows reordered successfully',
      row_ids: body.row_ids,
    });
  } catch (error) {
    console.error('Error reordering slide rows:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to reorder slide rows',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
