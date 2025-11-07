# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 3, 2025

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
- **UI**: Swiper.js 12.0.2, Tiptap (rich text)
- **Audio**: Native HTML5 Audio Player

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border Layout**: Fixed header/footer/sidebars with gradient backgrounds
- **Multi-Level Navigation**: Vertical Swiper (slide rows) + Horizontal Swiper (slides)
- **Dynamic Content**: Background images, YouTube videos (cover/contained modes), per-slide themes
- **Quick Slides**: Modal-based quick note creation (comment icon, bottom-left)
- **Spa Mode**: Background ambient music with scheduling/randomization (spa icon, top-left)

### Admin (/admin)
- **Slide Management**: Full CRUD for slide rows and slides
- **Rich Text Editor**: Tiptap WYSIWYG with theme settings + icon picker
- **Reordering**: Chevron buttons for rows and slides (drag-free)
- **Spa Mode Management**: Background music CRUD at `/admin/spa`
- **Schedule Display**: Visible in slide list (e.g., "Title | All Days - 8:00 AM - 11:00 AM")

---

## Database Schema

### Core Tables
1. **slide_rows**: Collections of slides
   - `id`, `title`, `description`, `row_type` ('ROUTINE'|'COURSE'|'TEACHING'|'CUSTOM'|'QUICKSLIDE'), `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `slide_count`

2. **slides**: Individual slide content
   - Core: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL')
   - Media: `audio_url`, `image_url`, `video_url`
   - Display: `content_theme` ('light'|'dark'), `title_bg_opacity` (0-1), `body_bg_opacity` (0-1), `icon_set` (JSON)
   - Publishing: `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON [0-6]), `temp_unpublish_until`
   - Meta: `view_count`, `completion_count`, `created_at`, `updated_at`

3. **spa_tracks**: Background music tracks
   - `id`, `title`, `audio_url`, `is_published`, `display_order`, `is_random`, `volume` (0-100), `publish_time_start`, `publish_time_end`, `publish_days` (JSON)

**Features**: Auto-updating `slide_count` trigger, cascading deletes, server-side position auto-calculation

---

## API Endpoints

### Slide Rows
- `GET /api/slides/rows?published=true`
- `POST /api/slides/rows`, `GET/PATCH/DELETE /api/slides/rows/[id]`
- `POST /api/slides/rows/reorder` - Reorder slide rows

### Slides
- `GET /api/slides/rows/[id]/slides?published=true`
- `POST /api/slides/rows/[id]/slides`, `GET/PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]`
- `POST /api/slides/rows/[id]/slides/reorder` - Reorder slides
- `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish` - Temp unpublish until 1am
- `POST /api/slides/quick-slide` - Create quick slide
- `POST /api/slides/bulk-publish` - Bulk publish/unpublish

### Spa Mode
- `GET /api/spa/tracks?published=true`
- `POST /api/spa/tracks`, `GET/PATCH/DELETE /api/spa/tracks/[id]`
- `GET /api/spa/tracks/active` - Get active track (server-side scheduling + randomization)

---

## Critical Files

### Database & Queries
- `src/lib/db.ts` - Connection utility
- `src/lib/queries/slideRows.ts`, `src/lib/queries/slides.ts`, `src/lib/queries/spaTracks.ts`
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering
- `scripts/railway-init.ts` - Railway startup (runs all migrations)

### Frontend Core
- `src/app/page.tsx` - Main page (Swiper navigation, Quick Slide modal, Spa Mode)
- `src/components/MainContent.tsx` - Slide rendering (lazy loading, caching, unpublish icons)
- `src/components/YouTubeEmbed.tsx`, `src/components/QuickSlideModal.tsx`, `src/components/SpaAudioPlayer.tsx`
- `src/contexts/SwiperContext.tsx`, `src/contexts/ThemeContext.tsx`

### Icon Borders (50px all sides, z-10 sides / z-20 top/bottom)
- `src/components/TopIconBar.tsx` - spa icon
- `src/components/BottomIconBar.tsx` - comment icon
- `src/components/RightIconBar.tsx` - atr toggle, videocam toggle

### Admin Components
- `src/app/admin/slides/[id]/page.tsx` - Slide row management page
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor page
- `src/app/admin/spa/page.tsx` - Spa Mode management
- `src/components/admin/slides/SlideManager.tsx` - Slide list with schedule display
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor + theme settings
- `src/components/admin/slides/SlideRowList.tsx` - Row list with reordering
- `src/components/admin/slides/IconPicker.tsx` - Material Symbol icon selection (max 3)
- `src/components/admin/spa/SpaTrackForm.tsx`, `src/components/admin/spa/SpaTrackList.tsx`

---

## Key Features

### Layout Types
- **STANDARD**: Centered content (`justify-center`)
- **OVERFLOW**: Top-aligned scrollable content (`justify-start`) - fixed Nov 3, 2025
- **MINIMAL**: Minimal layout

### Media & Z-Index
- Background image: z-0 | YouTube video: z-10 | Sidebars: z-10 | Content: z-20 | Header/Footer: z-20

### Performance
- **Lazy Loading**: Slides loaded on-demand
- **Client Caching**: `slidesCache` prevents redundant API calls
- **Preloading**: First 2 rows on mount, adjacent rows on navigation

### Per-Slide Theme Settings
- `content_theme`: 'light' (white text) or 'dark' (black text) - overrides global theme
- `title_bg_opacity`, `body_bg_opacity`: 0-1 semi-transparent backgrounds
- Light theme → dark backgrounds (rgba(0,0,0,opacity)), Dark theme → light backgrounds (rgba(255,255,255,opacity))

### Dynamic Scheduling
- `publish_time_start/end`: Time window (supports overnight ranges)
- `publish_days`: JSON array [0=Sunday, 6=Saturday]
- Client-side filtering using visitor's browser timezone
- Admin display format: "Title | All Days - 8:00 AM - 11:00 AM" (added Nov 3, 2025)

### Quick Slide Feature
- Click "comment" icon (bottom-left) to create quick notes
- Stored in "Quick Slides" row (row_type: 'QUICKSLIDE')
- Click "atr" icon (right sidebar) to toggle Quick Slide mode
  - Normal: Shows all rows EXCEPT Quick Slides
  - Quick Slide Mode: Shows ONLY Quick Slides
  - Visual feedback: 60% opacity inactive, 100% active

### Frontend Unpublish Icons
- **Permanent Unpublish**: `select_check_box` icon (red #ef4444) → confirmation dialog → unpublish
- **Temporary Unpublish**: `check_circle_unread` icon (green #22c55e) → instant unpublish until 1am → auto-republish
- Smart navigation to next slide after unpublish (no reload)

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw video IDs
- **Cover Mode**: Full-screen (default) | **Contained Mode**: 60px padding, 16:9 aspect ratio
- Toggle via videocam icon (right sidebar, only visible when video present)

### Row-Level & Slide-Level Icons
- **Row Icons**: Set in slide row, apply to ALL slides by default
- **Slide Icons**: Set on individual slides, override row icons
- Stored as JSON arrays, up to 3 icons per row/slide
- Special icons: `select_check_box` (red, permanent unpublish), `check_circle_unread` (green, temp unpublish)

### Spa Mode (Background Music)
- Click "spa" icon (top-left) to toggle playback
- Dynamic scheduling (time/day filters)
- Randomization support (shuffle or sequential by display_order)
- Per-track volume control (0-100%)
- Server-side + client-side filtering
- Admin management at `/admin/spa`

---

## Navigation Icons

### Main App (/)
- **home**: Navigate to /
- **spa**: Toggle background music
- **settings**: Navigate to /admin
- **contrast**: Light/dark theme toggle
- **atr**: Toggle Quick Slide mode
- **comment**: Open Quick Slide modal
- **videocam**: Toggle video cover/contained (conditional)
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

### Schedule Display (Admin)
```typescript
// Example from SlideManager.tsx
formatSchedule(slide) → "All Days - 8:00 AM - 11:00 AM"
formatSchedule(slide) → "Weekdays - 6:00 PM - 9:00 PM"
formatSchedule(slide) → "Mon, Wed, Fri - from 5:00 AM"
```

### Reordering Pattern
```typescript
// Swap array positions, update display_order/position field, call API with full ID list
const newItems = [...items]
[newItems[i], newItems[i+1]] = [newItems[i+1], newItems[i]]
newItems.forEach((item, index) => item.display_order = index + 1)
await fetch('/api/.../reorder', { body: JSON.stringify({ ids: newItems.map(i => i.id) }) })
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

## Testing Commands

```bash
# Database
psql -U postgres -d mp3_manager -c "SELECT * FROM slide_rows;"
curl http://localhost:3000/api/test-db

# API
curl http://localhost:3000/api/slides/rows?published=true
curl http://localhost:3000/api/slides/rows/[id]/slides

# Validation
npm run build && npx tsc --noEmit && npm run lint
```

---

## Recent Updates (November 2025)

### Slide Schedule Display in Admin (Nov 3)
- **Feature**: Publishing schedule now visible in slide list
- **Display**: "On Awakening | All Days - 8:00 AM - 11:00 AM" next to slide title
- **Smart Formatting**:
  - All 7 days → "All Days"
  - Mon-Fri → "Weekdays"
  - Sat-Sun → "Weekend"
  - Individual days → "Mon, Wed, Fri"
  - Time ranges → "8:00 AM - 11:00 AM"
- **Files Modified**: `SlideManager.tsx` (added helper functions + display logic)
- **Impact**: Admins can see scheduling at a glance without opening each slide

### OVERFLOW Layout Fix (Nov 3)
- **Issue**: Titles hidden on desktop with OVERFLOW layout (but visible on mobile)
- **Root Cause**: Desktop used `justify-center`, mobile used `justify-start`
- **Fix**: Changed desktop to `justify-start` to match mobile behavior
- **Files Modified**: `MainContent.tsx:395`
- **Impact**: Titles now visible at top on all devices with OVERFLOW layout

---

## Recent Updates (October 2025)

### Slide Editor Bug Fixes (Oct 21)
- Background image removal not saving (changed `undefined` → `null`)
- Row reordering buttons not working (disabled when not in Display Order sort)
- Row reordering required refresh (update `display_order` field after swap)

### Row Reordering Feature (Oct 21)
- Chevron buttons for reordering slide rows
- Default sort by `display_order` (manual arrangement persists)
- Transaction-based atomic updates

### Spa Mode Volume Control (Oct 21)
- Per-track volume slider (0-100%)
- Server-side schedule filtering added to `/api/spa/tracks/active`

### Spa Mode System (Oct 21)
- Background music with scheduling/randomization
- Admin page at `/admin/spa`
- Native HTML5 audio with loop

### Temporary Unpublish (Oct 20)
- Green `check_circle_unread` icon for temp unpublish until 1am
- Auto-republish at next 1am occurrence

### UI Changes (Oct 20)
- Removed all rounded borders (square edges throughout)
- Row-level icons fixed (type mismatch resolved)
- QUICKSLIDE row_type protection (read-only in edit form)

### Frontend Unpublish & Quick Slides (Oct 19)
- Red `select_check_box` icon for permanent unpublish (with confirmation)
- Quick Slide mode toggle (atr icon)
- Quick Slide creation modal (comment icon)

### Dynamic Scheduling & Per-Slide Icons (Oct 19)
- Time/day publishing controls per slide
- Up to 3 Material Symbol icons per slide
- Bulk publish/unpublish actions

---

## Important Notes

- **50px Border**: All pages maintain 50px padding for icon layout
- **Icon Specs**: 24px size, weight 100, `var(--icon-color)`
- **Media Storage**: `/public/media/` for audio, `/public/media/slides/[row-id]/` for slide media
- **No ORM**: Direct PostgreSQL queries for performance
- **Position Auto-Assignment**: Server calculates position for new slides (don't send position field)
- **Railway Safe**: All migrations idempotent, wrapped in error handling
- **Square UI**: No rounded corners anywhere (border-radius removed Oct 20)

---

**Lines**: ~365 | **Status**: Production Ready | **Last Updated**: November 3, 2025
