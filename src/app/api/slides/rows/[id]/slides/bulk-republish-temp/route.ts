import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

/**
 * POST /api/slides/rows/[id]/slides/bulk-republish-temp
 * Clears temp_unpublish_until for all slides in a row (republishes them)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rowId } = await params

  if (!rowId) {
    return NextResponse.json(
      { status: 'error', message: 'Missing rowId' },
      { status: 400 }
    )
  }

  try {
    const client = await pool.connect()

    try {
      // Clear temp_unpublish_until for all slides in this row
      const result = await client.query(
        `UPDATE slides
         SET temp_unpublish_until = NULL, updated_at = NOW()
         WHERE slide_row_id = $1 AND temp_unpublish_until IS NOT NULL
         RETURNING id, title`,
        [rowId]
      )

      return NextResponse.json({
        status: 'success',
        message: `Republished ${result.rows.length} slide(s)`,
        count: result.rows.length,
        slides: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in bulk-republish-temp:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to republish slides' },
      { status: 500 }
    )
  }
}
