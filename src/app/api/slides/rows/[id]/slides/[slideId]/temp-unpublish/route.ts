import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

/**
 * POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish
 * Temporarily unpublish a slide until 1am (next occurrence)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  const { id: rowId, slideId } = await params

  if (!rowId || !slideId) {
    return NextResponse.json(
      { status: 'error', message: 'Missing rowId or slideId' },
      { status: 400 }
    )
  }

  try {
    const client = await pool.connect()

    try {
      // Calculate next 1am timestamp
      const now = new Date()
      const next1am = new Date(now)

      // Set to 1am today
      next1am.setHours(1, 0, 0, 0)

      // If it's already past 1am today, set to 1am tomorrow
      if (now.getTime() >= next1am.getTime()) {
        next1am.setDate(next1am.getDate() + 1)
      }

      // Update the slide with temp_unpublish_until timestamp
      const result = await client.query(
        `UPDATE slides
         SET temp_unpublish_until = $1, updated_at = NOW()
         WHERE id = $2 AND slide_row_id = $3
         RETURNING id, title, temp_unpublish_until`,
        [next1am.toISOString(), slideId, rowId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { status: 'error', message: 'Slide not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        status: 'success',
        message: 'Slide temporarily unpublished until 1am',
        slide: result.rows[0],
        unpublishUntil: next1am.toISOString()
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in temp-unpublish:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to temporarily unpublish slide' },
      { status: 500 }
    )
  }
}
