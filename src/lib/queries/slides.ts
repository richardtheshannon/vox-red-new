import { query, queryOne, transaction } from '@/lib/db'
import { PoolClient } from 'pg'

// TypeScript interfaces
export interface Slide {
  id: string
  slide_row_id: string
  title: string
  subtitle?: string
  body_content: string
  audio_url?: string
  image_url?: string
  video_url?: string
  position: number
  layout_type: 'STANDARD' | 'OVERFLOW' | 'MINIMAL'
  content_theme?: 'light' | 'dark'
  title_bg_opacity?: number
  body_bg_opacity?: number
  view_count: number
  completion_count: number
  created_at: Date
  updated_at: Date
}

export interface CreateSlideData {
  slide_row_id: string
  title: string
  subtitle?: string
  body_content: string
  audio_url?: string
  image_url?: string
  video_url?: string
  position: number
  layout_type?: 'STANDARD' | 'OVERFLOW' | 'MINIMAL'
  content_theme?: 'light' | 'dark'
  title_bg_opacity?: number
  body_bg_opacity?: number
}

export interface UpdateSlideData {
  title?: string
  subtitle?: string
  body_content?: string
  audio_url?: string
  image_url?: string
  video_url?: string | null
  position?: number
  layout_type?: 'STANDARD' | 'OVERFLOW' | 'MINIMAL'
  content_theme?: 'light' | 'dark'
  title_bg_opacity?: number
  body_bg_opacity?: number
}

// Get all slides for a specific row
export async function getSlidesForRow(rowId: string): Promise<Slide[]> {
  return await query<Slide>(
    'SELECT * FROM slides WHERE slide_row_id = $1 ORDER BY position',
    [rowId]
  )
}

// Get slide by ID
export async function getSlideById(slideId: string): Promise<Slide | null> {
  return await queryOne<Slide>('SELECT * FROM slides WHERE id = $1', [slideId])
}

// Create new slide
export async function createSlide(data: CreateSlideData): Promise<Slide> {
  const sql = `
    INSERT INTO slides (slide_row_id, title, subtitle, body_content, audio_url, image_url, video_url, position, layout_type, content_theme, title_bg_opacity, body_bg_opacity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `

  const slide = await queryOne<Slide>(sql, [
    data.slide_row_id,
    data.title,
    data.subtitle || null,
    data.body_content,
    data.audio_url || null,
    data.image_url || null,
    data.video_url || null,
    data.position,
    data.layout_type || 'STANDARD',
    data.content_theme || null,
    data.title_bg_opacity !== undefined ? data.title_bg_opacity : null,
    data.body_bg_opacity !== undefined ? data.body_bg_opacity : null,
  ])

  if (!slide) throw new Error('Failed to create slide')

  return slide
}

// Update slide
export async function updateSlide(slideId: string, data: UpdateSlideData): Promise<Slide | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  // Build dynamic SET clause
  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`)
    values.push(data.title)
  }
  if (data.subtitle !== undefined) {
    fields.push(`subtitle = $${paramCount++}`)
    values.push(data.subtitle)
  }
  if (data.body_content !== undefined) {
    fields.push(`body_content = $${paramCount++}`)
    values.push(data.body_content)
  }
  if (data.audio_url !== undefined) {
    fields.push(`audio_url = $${paramCount++}`)
    values.push(data.audio_url)
  }
  if (data.image_url !== undefined) {
    fields.push(`image_url = $${paramCount++}`)
    values.push(data.image_url)
  }
  if (data.video_url !== undefined) {
    fields.push(`video_url = $${paramCount++}`)
    values.push(data.video_url)
  }
  if (data.position !== undefined) {
    fields.push(`position = $${paramCount++}`)
    values.push(data.position)
  }
  if (data.layout_type !== undefined) {
    fields.push(`layout_type = $${paramCount++}`)
    values.push(data.layout_type)
  }
  if (data.content_theme !== undefined) {
    fields.push(`content_theme = $${paramCount++}`)
    values.push(data.content_theme)
  }
  if (data.title_bg_opacity !== undefined) {
    fields.push(`title_bg_opacity = $${paramCount++}`)
    values.push(data.title_bg_opacity)
  }
  if (data.body_bg_opacity !== undefined) {
    fields.push(`body_bg_opacity = $${paramCount++}`)
    values.push(data.body_bg_opacity)
  }

  if (fields.length === 0) {
    return getSlideById(slideId) // No updates, return existing slide
  }

  const sql = `UPDATE slides SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`
  values.push(slideId)

  return await queryOne<Slide>(sql, values)
}

// Delete slide
export async function deleteSlide(slideId: string): Promise<void> {
  await query('DELETE FROM slides WHERE id = $1', [slideId])
}

// Reorder slides (update positions atomically)
export async function reorderSlides(slideIds: string[]): Promise<void> {
  await transaction(async (client: PoolClient) => {
    for (let i = 0; i < slideIds.length; i++) {
      await client.query(
        'UPDATE slides SET position = $1 WHERE id = $2',
        [i + 1, slideIds[i]]
      )
    }
  })
}

// Increment view count
export async function incrementViewCount(slideId: string): Promise<void> {
  await query('UPDATE slides SET view_count = view_count + 1 WHERE id = $1', [slideId])
}

// Increment completion count
export async function incrementCompletionCount(slideId: string): Promise<void> {
  await query('UPDATE slides SET completion_count = completion_count + 1 WHERE id = $1', [slideId])
}

// Get next available position in a row
export async function getNextPosition(rowId: string): Promise<number> {
  const result = await queryOne<{ max: number | null }>(
    'SELECT MAX(position) as max FROM slides WHERE slide_row_id = $1',
    [rowId]
  )
  return (result?.max ?? 0) + 1
}
