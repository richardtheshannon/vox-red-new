import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdatePublishStatus } from '@/lib/queries/slides'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slide_ids, is_published } = body

    // Validate required fields
    if (!Array.isArray(slide_ids) || slide_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'slide_ids array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (typeof is_published !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'is_published must be a boolean value' },
        { status: 400 }
      )
    }

    // Bulk update publish status
    await bulkUpdatePublishStatus(slide_ids, is_published)

    return NextResponse.json({
      success: true,
      message: `Successfully ${is_published ? 'published' : 'unpublished'} ${slide_ids.length} slide(s)`,
      updated_count: slide_ids.length,
    })
  } catch (error) {
    console.error('Error in bulk publish:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
