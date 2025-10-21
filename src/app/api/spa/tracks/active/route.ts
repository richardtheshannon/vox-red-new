import { NextResponse } from 'next/server'
import { getAllSpaTracks } from '@/lib/queries/spaTracks'

/**
 * GET /api/spa/tracks/active
 * Returns the currently active spa track based on scheduling rules
 * - Filters by publish status
 * - Applies time-of-day and day-of-week filters (client will do final filtering)
 * - Handles random selection if is_random is true
 * - Returns first track by display_order if not random
 */
export async function GET() {
  try {
    // Get all published tracks
    const tracks = await getAllSpaTracks(true)

    if (tracks.length === 0) {
      return NextResponse.json({
        status: 'success',
        data: null,
        message: 'No spa tracks available',
      })
    }

    // Check if we should use random selection
    const randomTracks = tracks.filter(track => track.is_random)

    let selectedTrack
    if (randomTracks.length > 0) {
      // Pick a random track from the random pool
      const randomIndex = Math.floor(Math.random() * randomTracks.length)
      selectedTrack = randomTracks[randomIndex]
    } else {
      // Use first track by display_order (tracks are already ordered by display_order)
      selectedTrack = tracks[0]
    }

    return NextResponse.json({
      status: 'success',
      data: selectedTrack,
    })
  } catch (error) {
    console.error('Error fetching active spa track:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch active spa track',
      },
      { status: 500 }
    )
  }
}
