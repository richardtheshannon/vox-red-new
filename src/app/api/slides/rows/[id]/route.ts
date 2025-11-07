import { NextRequest, NextResponse } from 'next/server';
import { getSlideRowById, updateSlideRow, deleteSlideRow } from '@/lib/queries/slideRows';

/**
 * GET /api/slides/rows/[id]
 * Returns a single slide row by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await getSlideRowById(id);

    if (!row) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide row not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      row,
    });
  } catch (error) {
    console.error('Error fetching slide row:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch slide row',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/slides/rows/[id]
 * Body: Partial<SlideRow> - any fields to update
 * Updates a slide row
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rowId } = await params;
    const body = await request.json();

    // Validate row_type if provided
    if (body.row_type) {
      const validRowTypes = ['ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE'];
      if (!validRowTypes.includes(body.row_type)) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Invalid row_type. Must be one of: ${validRowTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate playlist_delay_seconds if provided
    if (body.playlist_delay_seconds !== undefined) {
      const delay = Number(body.playlist_delay_seconds);
      if (isNaN(delay) || delay < 0 || delay > 45) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Invalid playlist_delay_seconds. Must be a number between 0 and 45',
          },
          { status: 400 }
        );
      }
    }

    // Remove fields that shouldn't be updated directly
    const { id, created_at, slide_count, ...updateData } = body;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No valid fields to update',
        },
        { status: 400 }
      );
    }

    const updatedRow = await updateSlideRow(rowId, updateData);

    if (!updatedRow) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide row not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Slide row updated successfully',
      row: updatedRow,
    });
  } catch (error) {
    console.error('Error updating slide row:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update slide row',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/slides/rows/[id]
 * Deletes a slide row and all associated slides (cascade)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rowId } = await params;
    // Check if row exists first
    const row = await getSlideRowById(rowId);
    if (!row) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide row not found',
        },
        { status: 404 }
      );
    }

    await deleteSlideRow(rowId);

    return NextResponse.json({
      status: 'success',
      message: 'Slide row deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting slide row:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete slide row',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
