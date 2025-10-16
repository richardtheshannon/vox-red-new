import { NextRequest, NextResponse } from 'next/server'
import { transaction } from '@/lib/db'
import { createSlideRow } from '@/lib/queries/slideRows'
import { parseMarkdownCourse, getCourseTitle } from '@/lib/parseMarkdownCourse'
import { PoolClient } from 'pg'

/**
 * Generate audio URL for a slide based on base URL and slide index
 * @param baseUrl - Base URL for audio files
 * @param slideIndex - Zero-based index of the slide
 * @returns Full audio URL with zero-padded 3-digit number (e.g., https://example.com/001.mp3)
 */
function generateAudioUrl(baseUrl: string, slideIndex: number): string {
  // Zero-pad to 3 digits (001, 002, ..., 999)
  const paddedNumber = String(slideIndex + 1).padStart(3, '0')

  // Ensure base URL doesn't end with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')

  return `${cleanBaseUrl}/${paddedNumber}.mp3`
}

/**
 * Validate audio base URL format
 * @param url - URL to validate
 * @returns true if valid, false otherwise
 */
function isValidAudioBaseUrl(url: string): boolean {
  if (!url || url.trim() === '') return true // Empty is valid (optional field)
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * POST /api/slides/import
 *
 * Import markdown file and create slide row + slides
 *
 * Request body:
 * {
 *   markdown: string,
 *   filename: string,
 *   audioBaseUrl?: string (optional)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   slideRowId: string,
 *   slideCount: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { markdown, filename, audioBaseUrl } = body

    // Validate required fields
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Markdown content is required' },
        { status: 400 }
      )
    }

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Validate audio base URL format if provided
    if (audioBaseUrl && !isValidAudioBaseUrl(audioBaseUrl)) {
      return NextResponse.json(
        { success: false, error: 'Audio base URL must start with http:// or https://' },
        { status: 400 }
      )
    }

    // Parse markdown into slides
    const parseResult = parseMarkdownCourse(markdown)

    if (parseResult.error) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 400 }
      )
    }

    if (parseResult.slides.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No slides found in markdown' },
        { status: 400 }
      )
    }

    // Get course title from filename
    const courseTitle = getCourseTitle(filename)

    // Create slide row and all slides in a transaction
    const result = await transaction(async (client: PoolClient) => {
      // Step 1: Create slide row
      const slideRowSql = `
        INSERT INTO slide_rows (title, row_type, is_published, display_order)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `
      const slideRowResult = await client.query(slideRowSql, [
        courseTitle,
        'COURSE',
        false, // Not published by default
        0
      ])

      const slideRow = slideRowResult.rows[0]
      const slideRowId = slideRow.id

      // Step 2: Create all slides
      const slideSql = `
        INSERT INTO slides (
          slide_row_id,
          title,
          body_content,
          position,
          layout_type,
          content_theme,
          title_bg_opacity,
          body_bg_opacity,
          audio_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `

      const createdSlides = []
      for (let i = 0; i < parseResult.slides.length; i++) {
        const slide = parseResult.slides[i]

        // Generate audio URL if base URL provided
        const audioUrl = audioBaseUrl
          ? generateAudioUrl(audioBaseUrl, i)
          : null

        const slideResult = await client.query(slideSql, [
          slideRowId,
          slide.title,
          slide.body,
          i + 1, // Position is 1-indexed
          'STANDARD',
          'light',
          0, // No title background opacity
          0, // No body background opacity
          audioUrl
        ])

        createdSlides.push(slideResult.rows[0])
      }

      return {
        slideRowId,
        slideCount: createdSlides.length
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      slideRowId: result.slideRowId,
      slideCount: result.slideCount
    })

  } catch (error) {
    console.error('Course import error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import course'
      },
      { status: 500 }
    )
  }
}
