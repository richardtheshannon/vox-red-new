# Course Import Feature Documentation

**Feature**: Import markdown files as slide courses on `/admin/slides`
**Created**: October 16, 2025
**Status**: Planning Phase

---

## Overview

Allow admins to import markdown files and automatically convert them into slide rows with individual slides. Each H1 heading in the markdown becomes a slide title, with the content below it becoming the slide body.

---

## Example Markdown Format

```markdown
# Excepteur sint occaecat

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

# consectetur adipiscing

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

**Result**: 2 slides created

---

## UI/UX Specifications

### Import Trigger
- **Location**: `/admin/slides` page, main content area
- **Placement**: To the right of the "+ Create New Slide Row" button
- **Button Text**: "Import Course" or similar

### File Upload Flow
- **Method**: File input dialog (choose from computer)
- **File Type**: `.md` or `.markdown` files
- **No textarea option**: Upload only, no paste functionality

### MP3 Audio URL Auto-Population
- **Optional Field**: "Audio Base URL" text input
- **Format**: User provides base URL (e.g., `https://lilde.com/media/mp3s/new-course`)
- **Auto-Generation**: System automatically appends sequential numbers for each slide:
  - Slide 1: `https://lilde.com/media/mp3s/new-course/001.mp3`
  - Slide 2: `https://lilde.com/media/mp3s/new-course/002.mp3`
  - Slide 3: `https://lilde.com/media/mp3s/new-course/003.mp3`
  - etc.
- **Padding**: 3-digit zero-padded numbers (001, 002, ..., 999)
- **Field Behavior**:
  - If field is empty, slides have no audio URL (null)
  - If field is provided, all slides get sequential audio URLs
- **Validation**: Basic URL format validation (starts with http:// or https://)

### Slide Row Creation
- **Automatic Creation**: New slide row created automatically
- **Title Source**: Derived from filename (or first H1 as fallback)
- **Row Type**: Set to 'course' or appropriate type
- **Preview**: Show preview before final import for user confirmation
- **No Manual Metadata**: Skip modal/form for row metadata entry
- **No Existing Row Selection**: Only create NEW courses, do not append to existing rows

### Preview Step
**Must Show**:
- Slide row title (from filename)
- Audio Base URL field (optional text input)
- Total slide count
- List of slides with:
  - Slide title (H1 heading)
  - Body excerpt (~100 characters)
  - Audio URL (if base URL provided, show generated URL for each slide)

**Does NOT Include**:
- Edit/remove slide functionality
- Metadata customization

### Slide Default Settings
- **content_theme**: `'light'`
- **title_bg_opacity**: `0`
- **body_bg_opacity**: `0`
- **layout_type**: `'standard'` (Centered Content)
- **position**: Auto-calculated by server
- **audio_url**: Generated from base URL + sequential number (001.mp3, 002.mp3, etc.) if provided, otherwise null

### Error Handling

| Scenario | Behavior |
|----------|----------|
| No H1 headings found | Do not import, show warning message |
| H1 with no body text | Create slide with only the heading (empty body) |
| Multiple H1s before body text | Create multiple slides with only headings |
| Invalid audio base URL format | Show validation error (must start with http:// or https://) |
| Database/API error | Show error message, no partial imports (transaction rollback) |

### Progress Feedback
- **During Upload**: No loading spinner
- **During Import**: Progress indicator showing "Importing slide X of Y..."
- **After Completion**: Success message with count: "Successfully imported X slides!"
- **Post-Import Action**: Option to "View Slide Row" (navigate to `/admin/slides/[id]`)

---

## Technical Architecture

### Parsing Strategy: **Hybrid Approach**

**Client-Side Parse (Preview)**:
- Parse markdown immediately after file selection
- Show instant preview without server round-trip
- Validate markdown structure (check for H1s)
- Fast user feedback

**Server-Side Parse (Import)**:
- Re-parse and validate on server before database insertion
- Security: Never trust client-side data alone
- Transaction safety: All-or-nothing import
- Consistent parsing logic for future features

**Flow**:
1. User selects markdown file → Client parses → Shows preview
2. User optionally enters audio base URL → Preview shows generated URLs for each slide
3. User clicks "Confirm Import" → Sends raw markdown + audio base URL to API
4. Server re-parses, validates, creates slide row + all slides in transaction (with audio URLs if provided)
5. Returns success with slide row ID and slide count

**Benefits**:
- Fast preview (no server delay)
- Secure import (server validation)
- Transaction safety (rollback on error)
- Reusable server logic

---

## Implementation Phases

### **Phase 1: Client-Side Markdown Parser & Preview UI** (~1 hour)

**Goal**: File upload → Parse → Show basic preview (markdown only, no audio yet)

**Tasks**:
1. Create markdown parsing utility
   - File: `src/lib/parseMarkdownCourse.ts`
   - Split by H1 headers (`# Title`)
   - Extract title + body content per section
   - Handle edge cases (no H1s, empty bodies, multiple H1s)
   - Return array of slide objects: `{ title: string, body: string }`

2. Update `/admin/slides` page UI
   - Add "Import Course" button next to "+ Create New Slide Row"
   - Hidden file input + trigger button
   - Preview modal/section showing:
     - Slide row title (from filename or first H1)
     - Slide count
     - List of slides (title + body excerpt ~100 chars)

3. Basic validation warnings
   - "No H1 headings found" error message
   - Show parsed slides in preview

**Files to Create/Modify**:
- `src/app/admin/slides/page.tsx` (modify)
- `src/lib/parseMarkdownCourse.ts` (new)

**Notes**:
- No API changes yet - purely client-side
- No database interaction
- **Audio URL feature deferred to Phase 1.5**

---

### **Phase 1.5: Audio URL Auto-Population** (~30 minutes)

**Goal**: Add audio base URL field and auto-generate sequential URLs for preview

**Why Phase 1.5**:
- Build on working markdown preview from Phase 1
- Add audio feature before server integration
- Test audio URL generation in preview before committing to database

**Tasks**:
1. Create audio URL generation utility
   - File: `src/lib/generateAudioUrls.ts` (new)
   - Function: `generateAudioUrl(baseUrl: string, slideIndex: number): string`
   - Zero-padded 3-digit numbers (001, 002, 003, etc.)
   - Appends `/XXX.mp3` to base URL
   - Example: `https://lilde.com/media/mp3s/new-course` + index 1 → `https://lilde.com/media/mp3s/new-course/001.mp3`

2. Update preview UI in `/admin/slides` page
   - Add "Audio Base URL" text input field (optional, below file upload)
   - Validate URL format on input (must start with http:// or https://)
   - Update preview to show generated audio URL for each slide
   - Display format: `🔊 Audio: https://lilde.com/media/mp3s/new-course/001.mp3`

3. State management
   - Add `audioBaseUrl` state variable
   - Update preview component to accept `audioBaseUrl` prop
   - Generate audio URLs dynamically in preview when base URL changes

**Files to Create/Modify**:
- `src/lib/generateAudioUrls.ts` (new)
- `src/app/admin/slides/page.tsx` (modify - add audio input field and preview)

**Validation**:
- Empty field = valid (optional feature)
- Must start with `http://` or `https://` if provided
- Show inline error if invalid format

**Notes**:
- Still no API changes - purely client-side enhancement
- Preview shows exactly what will be created in Phase 2

---

### **Phase 2: Server-Side Import API** (~1 hour)

**Goal**: API endpoint to create slide row + slides from markdown (with optional audio URLs)

**Tasks**:
1. Create API route: `POST /api/slides/import`
   - Accept request body: `{ markdown: string, filename: string, audioBaseUrl?: string }`
   - Validate audio base URL format if provided (starts with http:// or https://)
   - Server-side markdown parsing (reuse/adapt Phase 1 logic)
   - Create slide row:
     - Title from filename
     - `row_type: 'course'`
     - `is_published: false` (default)
   - Generate audio URLs if base URL provided (001.mp3, 002.mp3, etc.)
   - Create all slides in database transaction:
     - `content_theme: 'light'`
     - `title_bg_opacity: 0`
     - `body_bg_opacity: 0`
     - `layout_type: 'standard'`
     - `audio_url`: Generated URL or null
     - `position`: Auto-calculated by server
   - Return: `{ success: true, slideRowId: number, slideCount: number }`

2. Error handling:
   - Rollback transaction on any failure
   - Return validation errors (no H1s, invalid audio base URL, database errors)
   - Proper HTTP status codes

**Files to Create/Modify**:
- `src/app/api/slides/import/route.ts` (new)
- `src/lib/parseMarkdownCourse.ts` (adapt for server-side if needed)

**Database**:
- Uses existing `slide_rows` and `slides` tables
- No migrations needed
- Auto-updating `slide_count` trigger handles count

---

### **Phase 3: Connect Preview to Import + Progress Feedback** (~1 hour)

**Goal**: Wire up frontend → API, show progress, handle results

**Tasks**:
1. "Confirm Import" button in preview
   - Sends markdown + filename + audioBaseUrl to `/api/slides/import`
   - Shows progress indicator: "Importing slide X of Y..."
   - Handles API response (success/error)

2. Success state:
   - Display message: "Successfully imported X slides!"
   - Show "View Slide Row" button (navigate to `/admin/slides/[id]`)
   - Refresh slide row list automatically

3. Error handling:
   - Display API error messages to user
   - Allow retry or cancel
   - Clear state on error

4. Close/reset flow:
   - Clear file input
   - Reset preview state
   - Close modal/preview

**Files to Modify**:
- `src/app/admin/slides/page.tsx`

**Testing Scenarios**:
- Import valid markdown → verify slides created in database
- Import invalid markdown (no H1s) → verify error message shown
- Import markdown with edge cases (empty bodies, multiple H1s) → verify correct handling
- Import with audio base URL → verify all slides have sequential audio URLs (001.mp3, 002.mp3, etc.)
- Import without audio base URL → verify all slides have null audio_url
- Invalid audio base URL format → verify validation error shown
- Check new slide row appears in list
- Navigate to new slide row → verify all slides present with correct order
- Verify `slide_count` trigger updates correctly
- Play audio on imported slide → verify URL works correctly

---

## Summary

**Total Implementation Time**: ~3.5 hours

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | ~1 hour | Client markdown parser + basic preview UI |
| Phase 1.5 | ~30 min | Audio URL auto-population + preview enhancement |
| Phase 2 | ~1 hour | Server API + database insertion (with audio URLs) |
| Phase 3 | ~1 hour | Integration + progress + error handling |

**Key Features**:
- Simple file upload workflow
- Optional MP3 audio URL auto-population with sequential numbering
- Instant preview with validation (including generated audio URLs)
- Secure server-side import
- Transaction safety (all-or-nothing)
- Progress feedback during import
- Error handling at all stages

**Technical Highlights**:
- Hybrid parsing strategy (client preview + server validation)
- Uses existing database schema (no migrations)
- Leverages auto-position calculation
- Follows existing admin UI patterns

---

**Status**: Ready for Phase 1 implementation
