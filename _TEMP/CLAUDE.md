# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 15, 2025

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npx tsc --noEmit         # TypeScript validation
```

**URLs**: http://localhost:3000/ | /admin | /api/test-db

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols
- **Audio**: HTML5 Audio Player

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border Layout**: Fixed header/footer/sidebars (z-20)
- **Multi-Level Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme-responsive overlay (z-0/z-1)
- **Dynamic Content**: Per-slide backgrounds, YouTube videos, themes, audio
- **Quick Slides**: Modal-based notes (comment icon)
- **Spa Mode**: Background music (spa icon)

### Admin (/admin)
- **Slide Management**: Full CRUD, Tiptap editor, icon picker, overlay controls
- **Reordering**: Chevron buttons (no drag-drop)
- **Spa Tracks**: Background music CRUD at `/admin/spa`

---

## Database Schema

### slide_rows
- `id`, `title`, `description`, `row_type`, `is_published`, `display_order`
- `icon_set` (JSON), `theme_color`, `slide_count`, `playlist_delay_seconds`

### slides
- **Core**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`
- **Layout**: `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL')
- **Media**: `audio_url`, `image_url`, `video_url`
- **Display**: `content_theme` ('light'|'dark'|null), `title_bg_opacity` (0-1), `icon_set` (JSON)
- **Publishing**: `is_published`, `publish_time_start/end`, `publish_days` (JSON [0-6])
- **Temp Unpublish**: `temp_unpublish_until` (ISO timestamp)

### spa_tracks
- `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume` (0-100)
- `publish_time_start/end`, `publish_days` (JSON)

---

## Key API Endpoints

### Slide Rows
- `GET /api/slides/rows?published=true`
- `POST /api/slides/rows` | `GET/PATCH/DELETE /api/slides/rows/[id]`
- `POST /api/slides/rows/reorder`

### Slides
- `GET /api/slides/rows/[id]/slides?published=true`
- `POST /api/slides/rows/[id]/slides` | `GET/PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]`
- `POST /api/slides/rows/[id]/slides/reorder`
- `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish`
- `POST /api/slides/quick-slide` | `POST /api/slides/bulk-publish`

### Spa Mode
- `GET /api/spa/tracks?published=true` | `GET /api/spa/tracks/active`
- `POST /api/spa/tracks` | `GET/PATCH/DELETE /api/spa/tracks/[id]`

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Critical Files

### Frontend Core
- `src/app/page.tsx` - Main page, background state, OverlayLayer component
- `src/components/MainContent.tsx` - Slide rendering, caching, navigation handlers
- `src/components/EssentialAudioPlayer.tsx` - HTML5 audio with error handling
- `src/contexts/ThemeContext.tsx` - Global theme (light/dark)
- `src/contexts/SwiperContext.tsx` - Swiper navigation context
- `src/contexts/PlaylistContext.tsx` - Playlist playback management

### Icon Borders (50px all sides)
- `TopIconBar.tsx` - spa, settings icons (z-20)
- `BottomIconBar.tsx` - comment, navigation arrows (z-20)
- `RightIconBar.tsx` - atr, videocam, contrast (z-10)
- `LeftIconBar.tsx` - home (z-10)

### Admin
- `src/app/admin/slides/[id]/page.tsx` - Row management
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap, overlay controls
- `src/components/admin/slides/SlideManager.tsx` - Slide list, schedules
- `src/components/admin/slides/SlidePreview.tsx` - Live preview

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slides.ts` - Slide CRUD
- `src/lib/queries/slideRows.ts` - Row CRUD
- `src/lib/queries/spaTracks.ts` - Spa track CRUD
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering

---

## Key Features

### Background System
- **Full-viewport backgrounds**: Individual per slide via `image_url` field
- **Overlay**: Theme-responsive (white/black), 0.00-1.00 opacity slider
- **Per-slide theme override**: `content_theme` = 'light'|'dark'|null
- **Z-Stack**: Background (z-0) → Overlay (z-1) → Video (z-10) → Content (z-20)
- **Isolation**: `initialBackgroundSetRef` prevents useEffect from overwriting slide changes

### Layout Types
- **STANDARD**: Centered content (`justify-center`)
- **OVERFLOW**: Top-aligned scrollable (`justify-start`)
- **MINIMAL**: Title + audio only

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight)
- Day restrictions: `publish_days` JSON [0=Sun, 6=Sat]
- Client-side filtering: `filterVisibleSlides()`

### Quick Slides
- Comment icon → modal → stored in QUICKSLIDE row
- ATR icon: Toggle all rows / Quick Slides only

### Unpublish Features
- **Permanent**: Red `select_check_box` → confirmation dialog
- **Temporary**: Green `check_circle_unread` → unpublish until 1am

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw IDs
- Modes: Cover (full-screen) | Contained (60px padding, 16:9)
- Toggle: videocam icon (right sidebar)

### Spa Mode
- Background ambient music with scheduling
- Volume control (0-100%), randomization
- Admin: `/admin/spa`

### Audio Error Handling
- Error codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=NOT_SUPPORTED
- Detailed console logs with URLs, slide/row IDs
- Enhanced UI: error type, full URL, console reminder

---

## Navigation Icons

**Main App**: home (/) | spa (music) | settings (/admin) | contrast (theme) | atr (Quick Slides) | comment (new Quick Slide) | videocam (video mode) | arrows (navigation)

**Admin**: dashboard | description (/admin/slides) | spa (/admin/spa) | media (external) | logout (/) | contrast

---

## Common Code Patterns

### Schedule Filtering
```typescript
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter'
const visibleSlides = filterVisibleSlides(allSlides)
```

### Update Active Slide Data
```typescript
const updateActiveSlideData = (slide: Slide | null) => {
  if (slide) {
    setActiveSlideImageUrl(slide.image_url ? slide.image_url : null);
    setActiveSlideVideoUrl(slide.video_url ? slide.video_url : null);
    setActiveSlideOverlayOpacity(Number(slide.title_bg_opacity) || 0);
    setActiveSlideContentTheme(slide.content_theme || null);
  } else {
    // Clear all media
  }
}
```

### Horizontal Swiper Registration
```typescript
onSwiper={(swiper) => setHorizontalSwiper(row.id, swiper)}
onSlideChange={(swiper) => {
  const currentSlide = slides[swiper.activeIndex];
  updateActiveSlideData(currentSlide || null);
}}
```

---

## Environment Variables

### Local (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mp3_manager
DB_USER=postgres
DB_PASSWORD=your_password
```

### Railway
```env
DATABASE_URL=postgresql://...  # Auto-provided
```

---

## Deployment (Railway)

### Pre-Deploy Checks
```bash
npx tsc --noEmit        # Must have 0 errors
npm run lint            # 0 errors (warnings OK)
npm run build           # Test production build
```

### Pipeline
1. Git push → Railway webhook
2. Nixpacks detects Node.js 18
3. `npm ci` → `npm run build` → `npm run start`
4. `railway-init.ts` runs (idempotent migrations)
5. Health check: `/api/test-db`

---

## Recent Critical Fixes (Nov 15, 2025)

### Background Image Isolation
**Issue**: Backgrounds persisted across all slides
**Cause**: useEffect resetting to first slide on `slidesCache` changes
**Fix**: Added `initialBackgroundSetRef` guard to run effect only once
**Files**: `MainContent.tsx:57-58, 179-204`

### Content Theme NULL Handling
**Issue**: "Use Global Theme" not saving
**Fix**: Changed type to allow `null`, use `'content_theme' in data` check
**Files**: `SlideEditor.tsx`, `slides.ts`, API routes

### Audio Error Logging
**Fix**: Detailed console logs with error codes, URLs, slide IDs
**Files**: `EssentialAudioPlayer.tsx`

---

## Important Notes

- **50px Border**: All pages, no exceptions
- **Icons**: 24px, weight 100, `var(--icon-color)`
- **Media Storage**: `/public/media/`, `/public/media/slides/[row-id]/`
- **No ORM**: Direct PostgreSQL for performance
- **Position**: Server auto-calculates (don't send on create)
- **Square UI**: No rounded corners
- **Null vs Undefined**: Use `null` for "use global theme", check with `'field' in data`
- **Audio URLs**: Must be audio formats (.mp3, .wav, .ogg) - NOT images
- **Background Isolation**: useEffect guard prevents race conditions

---

## Troubleshooting

### Background Images Persisting
**Check**: Look for "Skipping initial background set" in console
**Fix**: Ensure `initialBackgroundSetRef` is working (MainContent.tsx:181-183)

### Audio Errors
**Check**: Console shows error code (4 = not found/wrong format)
**Fix**: Verify `audio_url` is valid audio file, not image
**SQL**: `UPDATE slides SET audio_url = NULL WHERE id = 'slide-id';`

### Theme Not Saving
**Check**: Ensure sending `null` not `undefined`
**Fix**: Use latest code with `'content_theme' in data` check

---

**Lines**: ~360 | **Status**: Production Ready | **Last Updated**: November 15, 2025
