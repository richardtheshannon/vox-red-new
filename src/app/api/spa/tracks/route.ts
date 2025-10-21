import { NextRequest, NextResponse } from 'next/server'
import { getAllSpaTracks, createSpaTrack, CreateSpaTrackData } from '@/lib/queries/spaTracks'

// GET /api/spa/tracks - Get all spa tracks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('published') === 'true'

    const tracks = await getAllSpaTracks(publishedOnly)

    return NextResponse.json({
      status: 'success',
      data: tracks,
    })
  } catch (error) {
    console.error('Error fetching spa tracks:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch spa tracks',
      },
      { status: 500 }
    )
  }
}

// POST /api/spa/tracks - Create new spa track
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.audio_url) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Title and audio_url are required',
        },
        { status: 400 }
      )
    }

    const trackData: CreateSpaTrackData = {
      title: body.title,
      audio_url: body.audio_url,
      is_published: body.is_published !== undefined ? body.is_published : true,
      display_order: body.display_order || 0,
      is_random: body.is_random || false,
      publish_time_start: body.publish_time_start || null,
      publish_time_end: body.publish_time_end || null,
      publish_days: body.publish_days || null,
    }

    const newTrack = await createSpaTrack(trackData)

    return NextResponse.json({
      status: 'success',
      data: newTrack,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating spa track:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create spa track',
      },
      { status: 500 }
    )
  }
}
