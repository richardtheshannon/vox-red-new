import { NextRequest, NextResponse } from 'next/server';
import { getSlidesForRow, createSlide } from '@/lib/queries/slides';
import { getSlideRowById } from '@/lib/queries/slideRows';

/**
 * GET /api/slides/rows/[id]/slides?published=true
 * Returns all slides for a specific slide row, ordered by position
 * Query params:
 *   - published: if 'true', only return published slides (for frontend)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

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

    const slides = await getSlidesForRow(id, publishedOnly);

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
 * Body: { title, subtitle, body_content, audio_url, image_url, video_url, position, layout_type, content_theme, title_bg_opacity, body_bg_opacity, publish_time_start, publish_time_end, publish_days, icon_set }
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
    if (!body.title) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required field: title is required',
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

    // Validate content_theme if provided
    if (body.content_theme) {
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(body.content_theme)) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Invalid content_theme. Must be one of: ${validThemes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate opacity values if provided
    if (body.title_bg_opacity !== undefined && (body.title_bg_opacity < 0 || body.title_bg_opacity > 1)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid title_bg_opacity. Must be between 0 and 1',
        },
        { status: 400 }
      );
    }

    if (body.body_bg_opacity !== undefined && (body.body_bg_opacity < 0 || body.body_bg_opacity > 1)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid body_bg_opacity. Must be between 0 and 1',
        },
        { status: 400 }
      );
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
      video_url: body.video_url,
      position,
      layout_type: body.layout_type || 'STANDARD',
      content_theme: body.content_theme,
      title_bg_opacity: body.title_bg_opacity,
      body_bg_opacity: body.body_bg_opacity,
      publish_time_start: body.publish_time_start,
      publish_time_end: body.publish_time_end,
      publish_days: body.publish_days,
      icon_set: body.icon_set,
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
