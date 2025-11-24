import { NextRequest, NextResponse } from 'next/server';
import { createSlide, getNextPosition } from '@/lib/queries/slides';
import { getSlideRowsByType, createSlideRow } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/simple-shift-slide
 * Body: { title, body_content }
 * Creates a new slide in the "Simple Shifts" row (or creates the row if it doesn't exist)
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

    // Find or create the Simple Shifts row
    const simpleShiftRows = await getSlideRowsByType('SIMPLESHIFT', false);
    let simpleShiftRow = simpleShiftRows.length > 0 ? simpleShiftRows[0] : null;

    // If Simple Shifts row doesn't exist, create it
    if (!simpleShiftRow) {
      simpleShiftRow = await createSlideRow({
        title: 'Simple Shifts',
        description: 'Daily practices and mindful shifts',
        row_type: 'SIMPLESHIFT',
        is_published: true,
        display_order: 997,
        icon_set: ['move_up', 'trending_up', 'arrow_upward'],
        theme_color: '#8B5CF6',
      });
    }

    // Get next position for the new slide
    const position = await getNextPosition(simpleShiftRow.id);

    // Create the simple shift slide with immediate publishing
    const newSlide = await createSlide({
      slide_row_id: simpleShiftRow.id,
      title: body.title.trim(),
      body_content: body.body_content.trim(),
      position,
      layout_type: 'STANDARD',
      is_published: true, // Always publish immediately
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Simple shift slide created successfully',
        slide: newSlide,
        row_id: simpleShiftRow.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating simple shift slide:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create simple shift slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
