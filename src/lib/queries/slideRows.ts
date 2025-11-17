import { query, queryOne, transaction } from '@/lib/db'
import { PoolClient } from 'pg'

// TypeScript interfaces
export interface SlideRow {
  id: string
  title: string
  description?: string
  row_type: 'ROUTINE' | 'COURSE' | 'TEACHING' | 'CUSTOM' | 'QUICKSLIDE'
  is_published: boolean
  display_order: number
  icon_set?: string[] // Parsed from JSON
  theme_color?: string
  slide_count: number
  playlist_delay_seconds: number
  created_by?: string
  user_id?: string | null // User who owns this row (null = public)
  randomize_enabled: boolean
  randomize_count?: number | null
  randomize_interval?: 'hourly' | 'daily' | 'weekly' | null
  randomize_seed?: number | null
  created_at: Date
  updated_at: Date
}

export interface CreateSlideRowData {
  title: string
  description?: string
  row_type: 'ROUTINE' | 'COURSE' | 'TEACHING' | 'CUSTOM' | 'QUICKSLIDE'
  icon_set?: string[]
  theme_color?: string
  display_order?: number
  is_published?: boolean
  playlist_delay_seconds?: number
  created_by?: string
  user_id?: string | null
  randomize_enabled?: boolean
  randomize_count?: number | null
  randomize_interval?: 'hourly' | 'daily' | 'weekly' | null
  randomize_seed?: number | null
}

export interface UpdateSlideRowData {
  title?: string
  description?: string
  row_type?: 'ROUTINE' | 'COURSE' | 'TEACHING' | 'CUSTOM' | 'QUICKSLIDE'
  icon_set?: string[]
  theme_color?: string
  display_order?: number
  is_published?: boolean
  playlist_delay_seconds?: number
  user_id?: string | null
  randomize_enabled?: boolean
  randomize_count?: number | null
  randomize_interval?: 'hourly' | 'daily' | 'weekly' | null
  randomize_seed?: number | null
}

// Get all slide rows
export async function getAllSlideRows(publishedOnly = false, userId?: string | null, isAdmin = false): Promise<SlideRow[]> {
  let sql: string
  let params: string[] = []

  if (publishedOnly && userId && !isAdmin) {
    // User view: published rows that are either public OR owned by this user
    sql = 'SELECT * FROM slide_rows WHERE is_published = true AND (user_id IS NULL OR user_id = $1) ORDER BY display_order, created_at DESC'
    params = [userId]
  } else if (publishedOnly && !userId) {
    // Not logged in: only public published rows
    sql = 'SELECT * FROM slide_rows WHERE is_published = true AND user_id IS NULL ORDER BY display_order, created_at DESC'
  } else if (!publishedOnly && userId && !isAdmin) {
    // User admin view: all rows that are public OR owned by this user
    sql = 'SELECT * FROM slide_rows WHERE user_id IS NULL OR user_id = $1 ORDER BY display_order, created_at DESC'
    params = [userId]
  } else {
    // Admin view OR no user: all rows
    sql = publishedOnly
      ? 'SELECT * FROM slide_rows WHERE is_published = true ORDER BY display_order, created_at DESC'
      : 'SELECT * FROM slide_rows ORDER BY display_order, created_at DESC'
  }

  const rows = await query<SlideRow>(sql, params)

  // Parse icon_set JSON strings to arrays
  return rows.map(row => ({
    ...row,
    icon_set: row.icon_set ? JSON.parse(row.icon_set as unknown as string) : []
  }))
}

// Get slide row by ID
export async function getSlideRowById(id: string): Promise<SlideRow | null> {
  const row = await queryOne<SlideRow>('SELECT * FROM slide_rows WHERE id = $1', [id])

  if (!row) return null

  // Parse icon_set JSON string to array
  return {
    ...row,
    icon_set: row.icon_set ? JSON.parse(row.icon_set as unknown as string) : []
  }
}

// Create new slide row
export async function createSlideRow(data: CreateSlideRowData): Promise<SlideRow> {
  const sql = `
    INSERT INTO slide_rows (title, description, row_type, icon_set, theme_color, display_order, is_published, playlist_delay_seconds, created_by, user_id, randomize_enabled, randomize_count, randomize_interval, randomize_seed)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `

  const row = await queryOne<SlideRow>(sql, [
    data.title,
    data.description || null,
    data.row_type,
    data.icon_set ? JSON.stringify(data.icon_set) : null,
    data.theme_color || null,
    data.display_order ?? 0,
    data.is_published ?? false,
    data.playlist_delay_seconds ?? 0,
    data.created_by || null,
    data.user_id || null,
    data.randomize_enabled ?? false,
    data.randomize_count || null,
    data.randomize_interval || null,
    data.randomize_seed || null,
  ])

  if (!row) throw new Error('Failed to create slide row')

  // Parse icon_set JSON string to array
  return {
    ...row,
    icon_set: row.icon_set ? JSON.parse(row.icon_set as unknown as string) : []
  }
}

// Update slide row
export async function updateSlideRow(id: string, data: UpdateSlideRowData): Promise<SlideRow | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  // Build dynamic SET clause
  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`)
    values.push(data.title)
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`)
    values.push(data.description)
  }
  if (data.row_type !== undefined) {
    fields.push(`row_type = $${paramCount++}`)
    values.push(data.row_type)
  }
  if (data.icon_set !== undefined) {
    fields.push(`icon_set = $${paramCount++}`)
    values.push(JSON.stringify(data.icon_set))
  }
  if (data.theme_color !== undefined) {
    fields.push(`theme_color = $${paramCount++}`)
    values.push(data.theme_color)
  }
  if (data.display_order !== undefined) {
    fields.push(`display_order = $${paramCount++}`)
    values.push(data.display_order)
  }
  if (data.is_published !== undefined) {
    fields.push(`is_published = $${paramCount++}`)
    values.push(data.is_published)
  }
  if (data.playlist_delay_seconds !== undefined) {
    fields.push(`playlist_delay_seconds = $${paramCount++}`)
    values.push(data.playlist_delay_seconds)
  }
  if (data.user_id !== undefined) {
    fields.push(`user_id = $${paramCount++}`)
    values.push(data.user_id)
  }
  if (data.randomize_enabled !== undefined) {
    fields.push(`randomize_enabled = $${paramCount++}`)
    values.push(data.randomize_enabled)
  }
  if (data.randomize_count !== undefined) {
    fields.push(`randomize_count = $${paramCount++}`)
    values.push(data.randomize_count)
  }
  if (data.randomize_interval !== undefined) {
    fields.push(`randomize_interval = $${paramCount++}`)
    values.push(data.randomize_interval)
  }
  if (data.randomize_seed !== undefined) {
    fields.push(`randomize_seed = $${paramCount++}`)
    values.push(data.randomize_seed)
  }

  if (fields.length === 0) {
    return getSlideRowById(id) // No updates, return existing row
  }

  const sql = `UPDATE slide_rows SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`
  values.push(id)

  const row = await queryOne<SlideRow>(sql, values)

  if (!row) return null

  // Parse icon_set JSON string to array
  return {
    ...row,
    icon_set: row.icon_set ? JSON.parse(row.icon_set as unknown as string) : []
  }
}

// Delete slide row (cascades to slides)
export async function deleteSlideRow(id: string): Promise<void> {
  await query('DELETE FROM slide_rows WHERE id = $1', [id])
}

// Get slide rows by type
export async function getSlideRowsByType(rowType: string, publishedOnly = false): Promise<SlideRow[]> {
  const sql = publishedOnly
    ? 'SELECT * FROM slide_rows WHERE row_type = $1 AND is_published = true ORDER BY display_order, created_at DESC'
    : 'SELECT * FROM slide_rows WHERE row_type = $1 ORDER BY display_order, created_at DESC'

  const rows = await query<SlideRow>(sql, [rowType])

  // Parse icon_set JSON strings to arrays
  return rows.map(row => ({
    ...row,
    icon_set: row.icon_set ? JSON.parse(row.icon_set as unknown as string) : []
  }))
}

// Reorder slide rows (update display_order atomically)
export async function reorderSlideRows(rowIds: string[]): Promise<void> {
  await transaction(async (client: PoolClient) => {
    // Step 1: Set all rows to temporary negative display_order to avoid unique constraint violations
    for (let i = 0; i < rowIds.length; i++) {
      await client.query(
        'UPDATE slide_rows SET display_order = $1 WHERE id = $2',
        [-(i + 1), rowIds[i]]
      )
    }

    // Step 2: Update to final positive display_order
    for (let i = 0; i < rowIds.length; i++) {
      await client.query(
        'UPDATE slide_rows SET display_order = $1 WHERE id = $2',
        [i + 1, rowIds[i]]
      )
    }
  })
}
