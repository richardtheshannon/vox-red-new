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

**URLs**: Frontend: http://localhost:3000/ | Admin: http://localhost:3000/admin | Health: http://localhost:3000/api/test-db

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v3, Material Symbols Icons
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **UI**: Swiper.js 12.0.2, Tiptap (rich text editor)
- **Audio**: Native HTML5 Audio Player

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border Layout**: Fixed header/footer/sidebars with gradient backgrounds
- **Multi-Level Navigation**: Vertical Swiper (slide rows) + Horizontal Swiper (slides within rows)
- **Background Overlay System**: Full-viewport overlay with theme-responsive opacity (Nov 15, 2025)
- **Dynamic Content**: Background images, YouTube videos (cover/contained modes), per-slide themes
- **Quick Slides**: Modal-based quick note creation (comment icon, bottom-left)
- **Spa Mode**: Background ambient music with scheduling/randomization (spa icon, top-left)

### Admin (/admin)
- **Slide Management**: Full CRUD for slide rows and slides
- **Rich Text Editor**: Tiptap WYSIWYG with theme settings, icon picker, overlay controls
- **Reordering**: Chevron buttons for rows and slides (drag-free)
- **Spa Mode Management**: Background music CRUD at `/admin/spa`
- **Schedule Display**: Visible in slide list (e.g., "Title | All Days - 8:00 AM - 11:00 AM")

---

## Database Schema

### Core Tables

**slide_rows**: Collections of slides
- `id`, `title`, `description`, `row_type` ('ROUTINE'|'COURSE'|'TEACHING'|'CUSTOM'|'QUICKSLIDE')
- `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `slide_count`, `playlist_delay_seconds`

**slides**: Individual slide content
- **Core**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`
- **Layout**: `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL')
- **Media**: `audio_url`, `image_url`, `video_url`
- **Display**: `content_theme` ('light'|'dark'|null), `title_bg_opacity` (0-1), `body_bg_opacity` (0-1), `icon_set` (JSON)
- **Publishing**: `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON [0-6]), `temp_unpublish_until`
- **Meta**: `view_count`, `completion_count`, `created_at`, `updated_at`

**spa_tracks**: Background music tracks
- `id`, `title`, `audio_url`, `is_published`, `display_order`, `is_random`, `volume` (0-100)
- `publish_time_start`, `publish_time_end`, `publish_days` (JSON)

**Features**: Auto-updating `slide_count` trigger, cascading deletes, server-side position auto-calculation

---

## API Endpoints

### Slide Rows
- `GET /api/slides/rows?published=true`
- `POST /api/slides/rows`, `GET/PATCH/DELETE /api/slides/rows/[id]`
- `POST /api/slides/rows/reorder`

### Slides
- `GET /api/slides/rows/[id]/slides?published=true`
- `POST /api/slides/rows/[id]/slides`, `GET/PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]`
- `POST /api/slides/rows/[id]/slides/reorder`
- `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish`
- `POST /api/slides/quick-slide`
- `POST /api/slides/bulk-publish`

### Spa Mode
- `GET /api/spa/tracks?published=true`
- `POST /api/spa/tracks`, `GET/PATCH/DELETE /api/spa/tracks/[id]`
- `GET /api/spa/tracks/active`

---

## Critical Files

### Frontend Core
- `src/app/page.tsx` - Main page, OverlayLayer component, background state management
- `src/components/MainContent.tsx` - Slide rendering, lazy loading, caching, overlay data sync
- `src/contexts/ThemeContext.tsx` - Global theme provider (light/dark toggle)
- `src/contexts/SwiperContext.tsx` - Swiper navigation context

### Icon Borders (50px all sides)
- `src/components/TopIconBar.tsx` - spa icon, z-20
- `src/components/BottomIconBar.tsx` - comment icon, z-20
- `src/components/RightIconBar.tsx` - atr toggle, videocam toggle, z-10
- `src/components/LeftIconBar.tsx` - z-10

### Admin Components
- `src/app/admin/slides/[id]/page.tsx` - Slide row management
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor, overlay opacity slider
- `src/components/admin/slides/SlideManager.tsx` - Slide list with schedule display
- `src/components/admin/slides/SlidePreview.tsx` - Live preview with overlay

### Database & Queries
- `src/lib/db.ts` - PostgreSQL connection utility
- `src/lib/queries/slides.ts` - Slide CRUD operations
- `src/lib/queries/slideRows.ts` - Slide row CRUD operations
- `src/lib/queries/spaTracks.ts` - Spa track CRUD operations
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering

---

## Key Features

### Background Overlay System (Nov 15, 2025)
**Purpose**: Full-viewport overlay over background images to improve text readability

**How It Works**:
- Overlay covers entire browser viewport (including 50px icon borders)
- Opacity controlled via "Background Overlay Opacity" slider (0.00-1.00) in admin
- Color responds to theme:
  - **Light theme** → White overlay `rgba(255,255,255,opacity)`
  - **Dark theme** → Black overlay `rgba(0,0,0,opacity)`
- Per-slide override: Set `content_theme` to force light/dark, or leave null to follow global theme
- Live updates when user toggles global theme (contrast icon)

**Implementation**:
- **Page Level** (`page.tsx`): `OverlayLayer` component with `useTheme()` hook, z-index: 1
- **Data Sync** (`MainContent.tsx`): `updateActiveSlideData()` syncs overlay opacity and theme on slide change
- **Database**: `title_bg_opacity` field stores overlay value (0-1), `content_theme` stores theme override
- **Admin** (`SlideEditor.tsx`): Slider sends `null` (not `undefined`) when "Use Global Theme" selected

**Z-Index Stack**:
```
Background Image (z-0)
  ↓
Overlay Layer (z-1) ← Full viewport coverage
  ↓
YouTube Video (z-10)
  ↓
Left/Right Sidebars (z-10)
  ↓
Top/Bottom Bars (z-20)
  ↓
Main Content (z-20)
```

### Layout Types
- **STANDARD**: Centered content (`justify-center`)
- **OVERFLOW**: Top-aligned scrollable content (`justify-start`)
- **MINIMAL**: Minimal layout (title + audio only)

### Dynamic Scheduling
- `publish_time_start/end`: Time window (supports overnight ranges)
- `publish_days`: JSON array [0=Sunday, 6=Saturday]
- Client-side filtering using visitor's browser timezone
- Admin display: "All Days - 8:00 AM - 11:00 AM" | "Weekdays - 6:00 PM - 9:00 PM"

### Quick Slide Feature
- Click "comment" icon (bottom-left) → create quick notes
- Stored in "Quick Slides" row (row_type: 'QUICKSLIDE')
- Toggle with "atr" icon (right sidebar): Show all rows OR only Quick Slides

### Frontend Unpublish Icons
- **Permanent**: `select_check_box` icon (red) → confirmation dialog → unpublish
- **Temporary**: `check_circle_unread` icon (green) → unpublish until 1am → auto-republish
- Smart navigation to next slide after unpublish

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw video IDs
- **Cover Mode**: Full-screen (default)
- **Contained Mode**: 60px padding, 16:9 aspect ratio
- Toggle via videocam icon (right sidebar)

### Spa Mode (Background Music)
- Click "spa" icon (top-left) to toggle playback
- Dynamic scheduling (time/day filters)
- Randomization support (shuffle or sequential)
- Per-track volume control (0-100%)
- Admin management at `/admin/spa`

---

## Navigation Icons

### Main App (/)
- **home**: Navigate to /
- **spa**: Toggle background music
- **settings**: Navigate to /admin
- **contrast**: Light/dark theme toggle (affects overlay color)
- **atr**: Toggle Quick Slide mode
- **comment**: Open Quick Slide modal
- **videocam**: Toggle video cover/contained
- **Footer arrows**: Prev/next slide, up/down row

### Admin (/admin)
- **dashboard**: /admin
- **description**: /admin/slides
- **spa**: /admin/spa
- **media**: External link to media.lilde.com
- **logout**: Navigate to /
- **contrast**: Theme toggle

---

## Common Patterns

### API Response Format
```json
{ "status": "success", "data": {...} }
{ "status": "error", "message": "..." }
```

### Schedule Filtering (Client-Side)
```typescript
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter'
const visibleSlides = filterVisibleSlides(allSlides)
```

### Overlay Data Sync (MainContent.tsx)
```typescript
const updateActiveSlideData = (slide: Slide | null) => {
  if (slide) {
    setActiveSlideImageUrl(slide.image_url || null);
    setActiveSlideVideoUrl(slide.video_url || null);
    setActiveSlideOverlayOpacity(Number(slide.title_bg_opacity) || 0);
    setActiveSlideContentTheme(
      slide.content_theme && slide.content_theme !== ''
        ? slide.content_theme
        : null
    );
  }
}
```

### Overlay Rendering (page.tsx)
```typescript
function OverlayLayer({ activeSlideContentTheme, activeSlideOverlayOpacity, activeSlideImageUrl }) {
  const { theme: globalTheme } = useTheme();
  const effectiveTheme = activeSlideContentTheme || globalTheme;
  const overlayColor = effectiveTheme === 'light'
    ? `rgba(255, 255, 255, ${activeSlideOverlayOpacity})`
    : `rgba(0, 0, 0, ${activeSlideOverlayOpacity})`;

  return <div style={{ position: 'fixed', inset: 0, backgroundColor: overlayColor, zIndex: 1 }} />;
}
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

### Railway (Auto-provided)
```env
DATABASE_URL=postgresql://...
```

---

## Deployment (Railway)

### Pre-Deployment Checks
```bash
npx tsc --noEmit        # 0 errors required
npm run lint            # 0 errors, warnings OK
npm run build           # Production build test
```

### Railway Pipeline
1. Git push triggers deployment
2. Nixpacks detects Node.js 18
3. Build: `npm ci` → `npm run build` → `npm run start`
4. `railway-init.ts` runs automatically (idempotent migrations)
5. Health check: `/api/test-db`

---

## Recent Updates (November 2025)

### Background Overlay System (Nov 15)
**Feature**: Full-viewport overlay over background images
- **Overlay Coverage**: Entire browser viewport (including 50px icon borders)
- **Theme Integration**: White overlay in light mode, black overlay in dark mode
- **Per-Slide Override**: `content_theme` field allows forcing light/dark theme per slide
- **Admin Control**: "Background Overlay Opacity" slider (0.00-1.00)
- **Live Updates**: Overlay color changes instantly when user toggles global theme
- **Files Modified**:
  - `page.tsx` - Added `OverlayLayer` component, overlay state management
  - `MainContent.tsx` - Added `updateActiveSlideData()` helper for overlay sync
  - `SlideEditor.tsx` - Fixed `content_theme` saving (`null` instead of `undefined`)
  - `SlidePreview.tsx` - Added overlay preview rendering
- **Impact**: Improved text readability on busy background images, responsive to theme changes

### Slide Schedule Display in Admin (Nov 3)
- Publishing schedule visible in slide list
- Smart formatting: "All Days", "Weekdays", "Weekend", or individual days
- Example: "On Awakening | All Days - 8:00 AM - 11:00 AM"
- Files Modified: `SlideManager.tsx`

### OVERFLOW Layout Fix (Nov 3)
- Fixed titles hidden on desktop with OVERFLOW layout
- Changed desktop to `justify-start` to match mobile behavior
- Files Modified: `MainContent.tsx:395`

---

## Important Notes

- **50px Border**: All pages maintain 50px padding for icon layout
- **Icon Specs**: 24px size, weight 100, `var(--icon-color)`
- **Media Storage**: `/public/media/` for audio, `/public/media/slides/[row-id]/` for slide media
- **No ORM**: Direct PostgreSQL queries for performance
- **Position Auto-Assignment**: Server calculates position for new slides (don't send position field)
- **Railway Safe**: All migrations idempotent, wrapped in error handling
- **Square UI**: No rounded corners anywhere
- **Overlay System**: Always use `null` (not `undefined`) for "Use Global Theme" to ensure database updates
- **Theme Context**: `OverlayLayer` must be inside `ThemeProvider` to access global theme via `useTheme()` hook

---

**Lines**: ~400 | **Status**: Production Ready | **Last Updated**: November 15, 2025
