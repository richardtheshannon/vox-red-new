import { NextRequest, NextResponse } from 'next/server';
import { createSlide, getNextPosition } from '@/lib/queries/slides';
import { getSlideRowsByType, createSlideRow } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/quick-slide
 * Body: { title, body_content }
 * Creates a new slide in the "Quick Slides" row (or creates the row if it doesn't exist)
 * Always publishes immediately with is_published: true
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.body_content) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: title and body_content are required',
        },
        { status: 400 }
      );
    }

    // Find or create the Quick Slides row
    const quickSlideRows = await getSlideRowsByType('QUICKSLIDE', false);
    let quickSlideRow = quickSlideRows.length > 0 ? quickSlideRows[0] : null;

    // If Quick Slides row doesn't exist, create it
    if (!quickSlideRow) {
      quickSlideRow = await createSlideRow({
        title: 'Quick Slides',
        description: 'Quick thoughts and notes',
        row_type: 'QUICKSLIDE',
        is_published: true,
        display_order: 999,
        icon_set: ['chat', 'note', 'edit'],
        theme_color: '#4F46E5',
      });
    }

    // Get next position for the new slide
    const position = await getNextPosition(quickSlideRow.id);

    // Create the quick slide with immediate publishing
    const newSlide = await createSlide({
      slide_row_id: quickSlideRow.id,
      title: body.title.trim(),
      body_content: body.body_content.trim(),
      position,
      layout_type: 'STANDARD',
      is_published: true, // Always publish immediately
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Quick slide created successfully',
        slide: newSlide,
        row_id: quickSlideRow.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quick slide:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create quick slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
