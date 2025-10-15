import { NextRequest, NextResponse } from 'next/server';
import { getSlidesForRow, createSlide } from '@/lib/queries/slides';
import { getSlideRowById } from '@/lib/queries/slideRows';

/**
 * GET /api/slides/rows/[id]/slides
 * Returns all slides for a specific slide row, ordered by position
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const slides = await getSlidesForRow(id);

    return NextResponse.json({
      status: 'success',
      slides: slides || [],
      row_id: id,
      row_title: row.title,
    });
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch slides',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/slides/rows/[id]/slides
 * Body: { title, subtitle, body_content, audio_url, image_url, position, layout_type }
 * Creates a new slide in the specified row
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

    // Validate layout_type if provided
    if (body.layout_type) {
      const validLayoutTypes = ['STANDARD', 'OVERFLOW', 'MINIMAL'];
      if (!validLayoutTypes.includes(body.layout_type)) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Invalid layout_type. Must be one of: ${validLayoutTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // If position not provided, get the next available position
    let position = body.position;
    if (!position) {
      const existingSlides = await getSlidesForRow(id);
      position = existingSlides.length + 1;
    }

    const newSlide = await createSlide({
      slide_row_id: id,
      title: body.title,
      subtitle: body.subtitle,
      body_content: body.body_content,
      audio_url: body.audio_url,
      image_url: body.image_url,
      position,
      layout_type: body.layout_type || 'STANDARD',
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Slide created successfully',
        slide: newSlide,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating slide:', error);

    // Check for PostgreSQL unique constraint violation (duplicate position)
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('slide_row_id') && error.message.includes('position')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'A slide already exists at this position. The position has been auto-assigned to avoid conflicts.',
            error: 'DUPLICATE_POSITION',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
