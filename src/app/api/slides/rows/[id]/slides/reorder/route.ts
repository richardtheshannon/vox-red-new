import { NextRequest, NextResponse } from 'next/server';
import { reorderSlides } from '@/lib/queries/slides';
import { getSlideRowById } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/rows/[id]/slides/reorder
 * Body: { slide_ids: string[] }
 * Reorders slides within a row based on the provided array of slide IDs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify the slide row exists
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

    // Validate slide_ids array
    if (!body.slide_ids || !Array.isArray(body.slide_ids)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid request: slide_ids must be an array',
        },
        { status: 400 }
      );
    }

    if (body.slide_ids.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid request: slide_ids array cannot be empty',
        },
        { status: 400 }
      );
    }

    // Reorder slides
    await reorderSlides(body.slide_ids);

    return NextResponse.json({
      status: 'success',
      message: 'Slides reordered successfully',
      slide_ids: body.slide_ids,
    });
  } catch (error) {
    console.error('Error reordering slides:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to reorder slides',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
