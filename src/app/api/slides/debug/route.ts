import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/slides/debug
 * Debug endpoint to check Quick Slides status
 */
export async function GET() {
  try {
    // Check Quick Slides row
    const rows = await query<{
      id: string;
      title: string;
      row_type: string;
      is_published: boolean;
      slide_count: number;
    }>('SELECT id, title, row_type, is_published, slide_count FROM slide_rows WHERE row_type = $1', ['QUICKSLIDE']);

    if (rows.length === 0) {
      return NextResponse.json({
        status: 'info',
        message: 'No Quick Slides row found',
        quick_slide_row: null,
        slides: []
      });
    }

    const quickSlideRow = rows[0];

    // Check slides in Quick Slides row
    const slides = await query<{
      id: string;
      title: string;
      is_published: boolean;
      position: number;
    }>('SELECT id, title, is_published, position FROM slides WHERE slide_row_id = $1 ORDER BY position', [quickSlideRow.id]);

    return NextResponse.json({
      status: 'success',
      quick_slide_row: quickSlideRow,
      slides: slides,
      summary: {
        row_published: quickSlideRow.is_published,
        slide_count: quickSlideRow.slide_count,
        actual_slides: slides.length,
        published_slides: slides.filter(s => s.is_published).length
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch debug info',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
