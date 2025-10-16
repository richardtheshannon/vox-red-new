/**
 * Markdown Course Parser
 *
 * Parses markdown files for course import feature.
 * Splits content by H1 headings and extracts title + body for each slide.
 */

export interface ParsedSlide {
  title: string;
  body: string;
}

export interface ParseResult {
  slides: ParsedSlide[];
  error: string | null;
}

/**
 * Parse markdown content into slides
 * Each H1 heading becomes a slide title
 * Content between H1s becomes the slide body
 */
export function parseMarkdownCourse(markdown: string): ParseResult {
  // Remove carriage returns for consistent line handling
  const cleanMarkdown = markdown.replace(/\r\n/g, '\n').trim();

  if (!cleanMarkdown) {
    return {
      slides: [],
      error: 'Markdown file is empty'
    };
  }

  // Split by H1 headings (# Title)
  // Use regex to split while preserving the heading text
  const sections = cleanMarkdown.split(/^# /gm);

  // Remove first empty element if markdown starts with H1
  const validSections = sections.filter(section => section.trim().length > 0);

  if (validSections.length === 0) {
    return {
      slides: [],
      error: 'No H1 headings found in markdown. Please use "# Title" format for slide titles.'
    };
  }

  const slides: ParsedSlide[] = [];

  for (const section of validSections) {
    // Split section into lines
    const lines = section.split('\n');

    // First line is the title (after the # was removed by split)
    const title = lines[0].trim();

    // Rest is the body content
    const bodyLines = lines.slice(1);
    const body = bodyLines.join('\n').trim();

    // Add slide even if body is empty (spec allows empty bodies)
    slides.push({
      title,
      body
    });
  }

  return {
    slides,
    error: null
  };
}

/**
 * Get course title from filename
 * Removes extension and converts to title case
 */
export function getCourseTitle(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(md|markdown)$/i, '');

  // Replace hyphens and underscores with spaces
  const withSpaces = nameWithoutExt.replace(/[-_]/g, ' ');

  // Return as-is (preserve original casing)
  return withSpaces.trim();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}
