import { NextRequest, NextResponse } from 'next/server';
import { createSlide, getNextPosition } from '@/lib/queries/slides';
import { getSlideRowsByType, createSlideRow } from '@/lib/queries/slideRows';

/**
 * POST /api/slides/service-slide
 * Body: { title, body_content }
 * Creates a new slide in the "Service" row (or creates the row if it doesn't exist)
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

    // Find or create the Service row
    const serviceRows = await getSlideRowsByType('SERVICE', false);
    let serviceRow = serviceRows.length > 0 ? serviceRows[0] : null;

    // If Service row doesn't exist, create it
    if (!serviceRow) {
      serviceRow = await createSlideRow({
        title: 'Service',
        description: 'Service commitments and dedications',
        row_type: 'SERVICE',
        is_published: true,
        display_order: 998,
        icon_set: ['room_service', 'volunteer_activism', 'favorite'],
        theme_color: '#10B981',
      });
    }

    // Get next position for the new slide
    const position = await getNextPosition(serviceRow.id);

    // Create the service slide with immediate publishing
    const newSlide = await createSlide({
      slide_row_id: serviceRow.id,
      title: body.title.trim(),
      body_content: body.body_content.trim(),
      position,
      layout_type: 'STANDARD',
      is_published: true, // Always publish immediately
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Service slide created successfully',
        slide: newSlide,
        row_id: serviceRow.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service slide:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create service slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
