import { NextRequest, NextResponse } from 'next/server';
import { getSlideById, updateSlide, deleteSlide } from '@/lib/queries/slides';

/**
 * GET /api/slides/rows/[id]/slides/[slideId]
 * Returns a single slide by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  try {
    const { id, slideId } = await params;
    const slide = await getSlideById(slideId);

    if (!slide) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide not found',
        },
        { status: 404 }
      );
    }

    // Verify the slide belongs to the specified row
    if (slide.slide_row_id !== id) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide does not belong to the specified row',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      slide,
    });
  } catch (error) {
    console.error('Error fetching slide:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/slides/rows/[id]/slides/[slideId]
 * Body: Partial<Slide> - any fields to update
 * Updates a slide
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  try {
    const { id: rowId, slideId } = await params;
    const body = await request.json();

    // Verify slide exists and belongs to the row
    const existingSlide = await getSlideById(slideId);
    if (!existingSlide) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide not found',
        },
        { status: 404 }
      );
    }

    if (existingSlide.slide_row_id !== rowId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide does not belong to the specified row',
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

    // Validate content_theme if provided (allow null to clear the field)
    if (body.content_theme !== undefined && body.content_theme !== null) {
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(body.content_theme)) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Invalid content_theme. Must be one of: ${validThemes.join(', ')}, or null`,
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

    // Remove fields that shouldn't be updated directly
    const { id, slide_row_id, created_at, view_count, completion_count, ...updateData } = body;

    // Allow image_url to be set to null or empty string to remove it
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null;
    }

    // Allow video_url to be set to null or empty string to remove it
    if (body.video_url !== undefined) {
      updateData.video_url = body.video_url || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No valid fields to update',
        },
        { status: 400 }
      );
    }

    const updatedSlide = await updateSlide(slideId, updateData);

    return NextResponse.json({
      status: 'success',
      message: 'Slide updated successfully',
      slide: updatedSlide,
    });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/slides/rows/[id]/slides/[slideId]
 * Deletes a slide
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  try {
    const { id: rowId, slideId } = await params;
    // Verify slide exists and belongs to the row
    const slide = await getSlideById(slideId);
    if (!slide) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide not found',
        },
        { status: 404 }
      );
    }

    if (slide.slide_row_id !== rowId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Slide does not belong to the specified row',
        },
        { status: 400 }
      );
    }

    await deleteSlide(slideId);

    return NextResponse.json({
      status: 'success',
      message: 'Slide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete slide',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
