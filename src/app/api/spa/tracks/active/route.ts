import { NextResponse } from 'next/server'
import { getAllSpaTracks, SpaTrack } from '@/lib/queries/spaTracks'

/**
 * Server-side schedule filtering
 * Checks if track should be visible based on time/day settings
 */
function isTrackVisibleNow(track: SpaTrack): boolean {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes() // Minutes since midnight

  // Check day-of-week restrictions
  if (track.publish_days) {
    try {
      const allowedDays: number[] = JSON.parse(track.publish_days)

      if (allowedDays.length > 0 && !allowedDays.includes(currentDay)) {
        return false
      }
    } catch (error) {
      console.error('Error parsing publish_days:', error)
    }
  }

  // Check time-of-day restrictions
  const hasTimeStart = track.publish_time_start !== null && track.publish_time_start !== undefined
  const hasTimeEnd = track.publish_time_end !== null && track.publish_time_end !== undefined

  if (hasTimeStart || hasTimeEnd) {
    const startMinutes = hasTimeStart ? parseTimeToMinutes(track.publish_time_start!) : 0
    const endMinutes = hasTimeEnd ? parseTimeToMinutes(track.publish_time_end!) : 1439 // 23:59

    // Handle overnight time ranges (e.g., 22:00 - 03:00)
    if (startMinutes > endMinutes) {
      // Overnight: visible if EITHER after start OR before end
      if (currentTime < startMinutes && currentTime >= endMinutes) {
        return false
      }
    } else {
      // Normal range: visible if between start and end
      if (currentTime < startMinutes || currentTime >= endMinutes) {
        return false
      }
    }
  }

  return true
}

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  return hours * 60 + minutes
}

/**
 * GET /api/spa/tracks/active
 * Returns the currently active spa track based on scheduling rules
 * - Filters by publish status
 * - Applies server-side schedule filtering BEFORE random selection
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

    // Apply server-side schedule filtering BEFORE random selection
    const scheduledTracks = tracks.filter(track => isTrackVisibleNow(track))

    if (scheduledTracks.length === 0) {
      return NextResponse.json({
        status: 'success',
        data: null,
        message: 'No spa tracks available at this time',
      })
    }

    // Check if we should use random selection
    const randomTracks = scheduledTracks.filter(track => track.is_random)

    let selectedTrack
    if (randomTracks.length > 0) {
      // Pick a random track from the random pool (already filtered by schedule)
      const randomIndex = Math.floor(Math.random() * randomTracks.length)
      selectedTrack = randomTracks[randomIndex]
    } else {
      // Use first track by display_order (tracks are already ordered by display_order)
      selectedTrack = scheduledTracks[0]
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
