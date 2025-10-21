import { NextRequest, NextResponse } from 'next/server'
import { getSpaTrackById, updateSpaTrack, deleteSpaTrack, UpdateSpaTrackData } from '@/lib/queries/spaTracks'

// GET /api/spa/tracks/[id] - Get spa track by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const track = await getSpaTrackById(id)

    if (!track) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Spa track not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: track,
    })
  } catch (error) {
    console.error('Error fetching spa track:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch spa track',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/spa/tracks/[id] - Update spa track
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: UpdateSpaTrackData = {
      title: body.title,
      audio_url: body.audio_url,
      is_published: body.is_published,
      display_order: body.display_order,
      is_random: body.is_random,
      publish_time_start: body.publish_time_start,
      publish_time_end: body.publish_time_end,
      publish_days: body.publish_days,
    }

    const updatedTrack = await updateSpaTrack(id, updateData)

    if (!updatedTrack) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Spa track not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: updatedTrack,
    })
  } catch (error) {
    console.error('Error updating spa track:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update spa track',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/spa/tracks/[id] - Delete spa track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteSpaTrack(id)

    return NextResponse.json({
      status: 'success',
      message: 'Spa track deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting spa track:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete spa track',
      },
      { status: 500 }
    )
  }
}
