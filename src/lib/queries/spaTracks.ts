import { query, queryOne } from '@/lib/db'

// TypeScript interfaces
export interface SpaTrack {
  id: string
  title: string
  audio_url: string
  is_published: boolean
  display_order: number
  is_random: boolean
  publish_time_start?: string | null
  publish_time_end?: string | null
  publish_days?: string | null // JSON array of day numbers [0-6]
  created_at: Date
  updated_at: Date
}

export interface CreateSpaTrackData {
  title: string
  audio_url: string
  is_published?: boolean
  display_order?: number
  is_random?: boolean
  publish_time_start?: string | null
  publish_time_end?: string | null
  publish_days?: string | null
}

export interface UpdateSpaTrackData {
  title?: string
  audio_url?: string
  is_published?: boolean
  display_order?: number
  is_random?: boolean
  publish_time_start?: string | null
  publish_time_end?: string | null
  publish_days?: string | null
}

// Get all spa tracks
export async function getAllSpaTracks(publishedOnly: boolean = false): Promise<SpaTrack[]> {
  const sql = publishedOnly
    ? 'SELECT * FROM spa_tracks WHERE is_published = true ORDER BY display_order, created_at'
    : 'SELECT * FROM spa_tracks ORDER BY display_order, created_at'

  return await query<SpaTrack>(sql, [])
}

// Get spa track by ID
export async function getSpaTrackById(trackId: string): Promise<SpaTrack | null> {
  return await queryOne<SpaTrack>('SELECT * FROM spa_tracks WHERE id = $1', [trackId])
}

// Create new spa track
export async function createSpaTrack(data: CreateSpaTrackData): Promise<SpaTrack> {
  const sql = `
    INSERT INTO spa_tracks (title, audio_url, is_published, display_order, is_random, publish_time_start, publish_time_end, publish_days)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `

  const track = await queryOne<SpaTrack>(sql, [
    data.title,
    data.audio_url,
    data.is_published !== undefined ? data.is_published : true,
    data.display_order || 0,
    data.is_random || false,
    data.publish_time_start || null,
    data.publish_time_end || null,
    data.publish_days || null,
  ])

  if (!track) throw new Error('Failed to create spa track')

  return track
}

// Update spa track
export async function updateSpaTrack(trackId: string, data: UpdateSpaTrackData): Promise<SpaTrack | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  // Build dynamic SET clause
  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`)
    values.push(data.title)
  }
  if (data.audio_url !== undefined) {
    fields.push(`audio_url = $${paramCount++}`)
    values.push(data.audio_url)
  }
  if (data.is_published !== undefined) {
    fields.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }
  if (data.display_order !== undefined) {
    fields.push(`display_order = $${paramCount++}`)
    values.push(data.display_order)
  }
  if (data.is_random !== undefined) {
    fields.push(`is_random = $${paramCount++}`)
    values.push(data.is_random)
  }
  if (data.publish_time_start !== undefined) {
    fields.push(`publish_time_start = $${paramCount++}`)
    values.push(data.publish_time_start)
  }
  if (data.publish_time_end !== undefined) {
    fields.push(`publish_time_end = $${paramCount++}`)
    values.push(data.publish_time_end)
  }
  if (data.publish_days !== undefined) {
    fields.push(`publish_days = $${paramCount++}`)
    values.push(data.publish_days)
  }

  if (fields.length === 0) {
    return getSpaTrackById(trackId) // No updates, return existing track
  }

  const sql = `UPDATE spa_tracks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`
  values.push(trackId)

  return await queryOne<SpaTrack>(sql, values)
}

// Delete spa track
export async function deleteSpaTrack(trackId: string): Promise<void> {
  await query('DELETE FROM spa_tracks WHERE id = $1', [trackId])
}

// Get next available display order
export async function getNextDisplayOrder(): Promise<number> {
  const result = await queryOne<{ max: number | null }>(
    'SELECT MAX(display_order) as max FROM spa_tracks',
    []
  )
  return (result?.max ?? 0) + 1
}
