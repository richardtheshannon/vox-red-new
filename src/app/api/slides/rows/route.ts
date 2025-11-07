import { NextRequest, NextResponse } from 'next/server';
import { getAllSlideRows, createSlideRow } from '@/lib/queries/slideRows';

/**
 * GET /api/slides/rows
 * Query params: ?published=true (optional)
 * Returns all slide rows, optionally filtered by published status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    const rows = await getAllSlideRows(publishedOnly);

    return NextResponse.json({
      status: 'success',
      rows: rows || [],
    });
  } catch (error) {
    console.error('Error fetching slide rows:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch slide rows',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/slides/rows
 * Body: { title, description, row_type, icon_set, theme_color, display_order, is_published, created_by }
 * Creates a new slide row
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.row_type) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: title and row_type are required',
        },
        { status: 400 }
      );
    }

    // Validate row_type
    const validRowTypes = ['ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM'];
    if (!validRowTypes.includes(body.row_type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Invalid row_type. Must be one of: ${validRowTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newRow = await createSlideRow({
      title: body.title,
      description: body.description,
      row_type: body.row_type,
      icon_set: body.icon_set,
      theme_color: body.theme_color,
      display_order: body.display_order,
      is_published: body.is_published,
      playlist_delay_seconds: body.playlist_delay_seconds,
      created_by: body.created_by,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Slide row created successfully',
        row: newRow,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating slide row:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create slide row',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
