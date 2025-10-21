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
  created_by?: string
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
  created_by?: string
}

export interface UpdateSlideRowData {
  title?: string
  description?: string
  row_type?: 'ROUTINE' | 'COURSE' | 'TEACHING' | 'CUSTOM' | 'QUICKSLIDE'
  icon_set?: string[]
  theme_color?: string
  display_order?: number
  is_published?: boolean
}

// Get all slide rows
export async function getAllSlideRows(publishedOnly = false): Promise<SlideRow[]> {
  const sql = publishedOnly
    ? 'SELECT * FROM slide_rows WHERE is_published = true ORDER BY display_order, created_at DESC'
    : 'SELECT * FROM slide_rows ORDER BY display_order, created_at DESC'

  const rows = await query<SlideRow>(sql)

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
    INSERT INTO slide_rows (title, description, row_type, icon_set, theme_color, display_order, is_published, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    data.created_by || null,
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
