import { NextRequest, NextResponse } from 'next/server';
import { createSlide, getNextPosition } from '@/lib/queries/slides';
import { getSlideRowsByType, createSlideRow } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/goal-slide
 * Body: { title, body_content }
 * Creates a new slide in the "Goals" row (or creates the row if it doesn't exist)
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

    // Find or create the Goals row
    const goalRows = await getSlideRowsByType('GOALS', false);
    let goalRow = goalRows.length > 0 ? goalRows[0] : null;

    // If Goals row doesn't exist, create it
    if (!goalRow) {
      goalRow = await createSlideRow({
        title: 'Goals',
        description: 'My goals and commitments',
        row_type: 'GOALS',
        is_published: true,
        display_order: 998,
        icon_set: ['flag', 'target', 'trophy'],
        theme_color: '#10B981',
      });
    }

    // Get next position for the new slide
    const position = await getNextPosition(goalRow.id);

    // Create the goal slide with immediate publishing
    const newSlide = await createSlide({
      slide_row_id: goalRow.id,
      title: body.title.trim(),
      body_content: body.body_content.trim(),
      position,
      layout_type: 'STANDARD',
      is_published: true, // Always publish immediately
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Goal created successfully',
        slide: newSlide,
        row_id: goalRow.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating goal:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create goal',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
