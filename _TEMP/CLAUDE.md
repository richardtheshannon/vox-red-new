# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: October 19, 2025

**Important**: DO NOT CREATE A NUL FILE

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm run db:init          # Initialize PostgreSQL schema
npm run db:seed          # Seed sample data
npm run db:slides:init   # Initialize slide tables
npm run db:slides:seed   # Seed slide content
```

**URLs**:
- Frontend: http://localhost:3000/
- Admin: http://localhost:3000/admin
- Health: http://localhost:3000/api/test-db

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v3, Material Symbols Icons
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **UI**: Swiper.js 12.0.2, Tiptap (rich text), @dnd-kit (drag-drop)
- **Audio**: Native HTML5 Audio Player

---

## Architecture

### Frontend (/)
- **50px Icon Border Layout**: Fixed header/footer/sidebars with gradient backgrounds
- **Multi-Level Navigation**: Vertical Swiper (slide rows) + Horizontal Swiper (slides)
- **Dynamic Content**: Background images, YouTube videos (cover/contained modes)
- **Per-Slide Themes**: Light/dark text with semi-transparent backgrounds (0-1 opacity)
- **Audio**: Native HTML5 audio player on all slides
- **Quick Slides**: Modal-based quick note creation

### Admin (/admin)
- **Slide Management**: Full CRUD interface for slide rows and slides
- **Rich Text Editor**: Tiptap WYSIWYG with live preview
- **Drag-and-Drop**: Slide reordering with position auto-calculation
- **File Upload**: Audio (MP3/WAV/OGG), Images (JPG/PNG/WebP)
- **Theme Settings**: Per-slide light/dark override + text background opacity

---

## Database Schema

### Core Tables
1. **users**: Role-based access (Admin, Moderator, User)
2. **audio_files**: MP3 metadata
3. **playlists** + **playlist_items**: Playlist management
4. **categories**: Content categories
5. **service_commitments**: Daily prompts
6. **bug_reports** + **documentation**: Admin tools

### Slide System
1. **slide_rows**: Collections of slides
   - `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set`, `theme_color`, `slide_count`
   - **row_type**: 'ROUTINE' | 'COURSE' | 'TEACHING' | 'CUSTOM' | 'QUICKSLIDE'

2. **slides**: Individual slide content
   - Core: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type`
   - Media: `audio_url`, `image_url`, `video_url`
   - Display: `content_theme` ('light'|'dark'), `title_bg_opacity` (0-1), `body_bg_opacity` (0-1), `icon_set` (TEXT/JSON)
   - Publishing: `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (TEXT/JSON), `temp_unpublish_until` (TIMESTAMP)
   - Meta: `view_count`, `completion_count`, `created_at`, `updated_at`

3. **slide_icons**: Optional custom icons per slide

**Features**: Auto-updating `slide_count` trigger, cascading deletes, unique position constraint, server-side position auto-calculation

---

## API Endpoints

### Slide Rows
- `GET /api/slides/rows` (query: `?published=true`)
- `POST /api/slides/rows`
- `GET /api/slides/rows/[id]`
- `PATCH /api/slides/rows/[id]`
- `DELETE /api/slides/rows/[id]`

### Slides
- `GET /api/slides/rows/[id]/slides`
- `POST /api/slides/rows/[id]/slides`
- `GET /api/slides/rows/[id]/slides/[slideId]`
- `PATCH /api/slides/rows/[id]/slides/[slideId]`
- `DELETE /api/slides/rows/[id]/slides/[slideId]`
- `POST /api/slides/rows/[id]/slides/reorder`

### Utilities
- `GET /api/slides/upload`
- `POST /api/slides/upload`
- `POST /api/slides/quick-slide` - Create quick slide (title + body only)
- `POST /api/slides/bulk-publish` - Bulk update publish status
- `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish` - Temporarily unpublish slide until 1am
- `POST /api/slides/fix-quickslides` - Fix Quick Slides row_type to QUICKSLIDE (utility)
- `GET /api/slides/debug` - Debug endpoint for Quick Slides status
- `GET /api/test-db`

---

## Critical Files

### Database
- `src/lib/db.ts` - Connection utility (lazy pool initialization)
- `src/lib/queries/slideRows.ts` - Row queries
- `src/lib/queries/slides.ts` - Slide queries
- `scripts/init-db.ts` - Schema initialization
- `scripts/init-slide-tables.ts` - Slide table creation
- `scripts/railway-init.ts` - Railway startup script (runs all migrations)
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering logic

### Frontend Core
- `src/app/page.tsx` - Main page (Swiper navigation + background/video state + Quick Slide modal + unpublish dialog)
- `src/components/MainContent.tsx` - Dynamic slide rendering (lazy loading, caching, row filtering, unpublish icon detection)
- `src/components/YouTubeEmbed.tsx` - YouTube player (cover/contained modes)
- `src/components/QuickSlideModal.tsx` - Quick slide creation modal
- `src/components/ConfirmDialog.tsx` - Reusable confirmation dialog
- `src/contexts/SwiperContext.tsx` - Multi-level navigation context
- `src/contexts/ThemeContext.tsx` - Global theme state

### Icon Borders
- `src/components/TopIconBar.tsx` - Header (z-20)
- `src/components/BottomIconBar.tsx` - Footer (z-20, comment icon for Quick Slides)
- `src/components/LeftIconBar.tsx` - Left sidebar (z-10)
- `src/components/RightIconBar.tsx` - Right sidebar (z-10, atr toggle for Quick Slide mode, videocam toggle)

### Admin
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor + theme settings UI + icon picker
- `src/components/admin/slides/SlideManager.tsx` - Drag-drop reordering
- `src/components/admin/slides/IconPicker.tsx` - Material Symbol icon selection (up to 3 icons)
- `src/components/admin/AdminQuickActions.tsx` - Reusable quick actions sidebar

---

## Key Features

### Media Layering (Z-Index)
- Background image: z-0
- YouTube video: z-10
- Sidebars: z-10
- Content: z-20
- Header/Footer: z-20

### Performance
- **Lazy Loading**: Slides loaded on-demand (90%+ improvement)
- **Client Caching**: `slidesCache` prevents redundant API calls
- **Preloading**: First 2 rows on mount, adjacent rows on navigation
- **Memoization**: Icon sets cached with `useMemo`

### Per-Slide Theme Settings
- **content_theme**: Override global theme ('light' = white text, 'dark' = black text)
- **title_bg_opacity**: Semi-transparent background behind title (0-1)
- **body_bg_opacity**: Semi-transparent background behind body (0-1)
- **Logic**: Light theme uses dark backgrounds (rgba(0,0,0,opacity)), dark theme uses light backgrounds (rgba(255,255,255,opacity))

### Dynamic Slide Scheduling
- **publish_time_start/end**: Time window publishing (supports overnight ranges)
- **publish_days**: Day-of-week publishing (0=Sunday, 6=Saturday)
- **Client-Side Filtering**: Uses visitor's browser timezone
- **Logic**: All conditions must be true for visibility

### Quick Slide Feature
- **Modal Interface**: Click "comment" icon (bottom left) to open
- **Immediate Publishing**: All quick slides published automatically
- **Dedicated Row**: Stored in "Quick Slides" row (row_type: 'QUICKSLIDE')
- **Quick Slide Mode Toggle**: Click "atr" icon (right sidebar) to isolate Quick Slide row
  - Normal Mode: Shows all rows EXCEPT Quick Slides
  - Quick Slide Mode: Shows ONLY Quick Slide row
  - Visual feedback: Icon opacity 60% inactive, 100% active

### Frontend Slide Unpublish (Permanent)
- **Icon-Based**: Admin sets `select_check_box` icon → users can click to unpublish permanently
- **Visual Indicator**: Red color (#ef4444) signals destructive action
- **Confirmation Dialog**: "Hide This Slide?" prevents accidental clicks
- **Smart Navigation**: Smooth navigation to next available slide (no page reload)
  - If slides remain: Navigate to next slide (or previous if last)
  - If no slides remain: Navigate to first row (app start)
  - Maintains context in Quick Slide mode

### Temporary Slide Unpublish (Until 1am)
- **Icon-Based**: Admin sets `check_circle_unread` icon → users can click to temporarily unpublish
- **Visual Indicator**: Green color (#22c55e) signals temporary action
- **No Confirmation**: Instant unpublish, different UX from permanent unpublish
- **Auto-Republish**: Slide automatically reappears at 1am (next occurrence)
  - If before 1am today → republishes at 1am today
  - If after 1am today → republishes at 1am tomorrow
- **Client-Side Filtering**: Uses visitor's browser timezone, same as schedule filtering
- **Smart Navigation**: Same navigation behavior as permanent unpublish
- **Database Column**: `temp_unpublish_until` TIMESTAMP stores republish time

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw video IDs
- **Cover Mode**: Full-screen like `background-size: cover` (default)
- **Contained Mode**: 60px padding, 16:9 aspect ratio, fits viewport
- Toggle via videocam icon in right sidebar (only visible when video present)
- **Interactivity**: MainContent uses `pointer-events: none` when video present to allow clicks through to iframe

### Row-Level and Slide-Level Icons
- **Row Icons**: Set in slide row settings, apply to ALL slides in that row by default
- **Slide Icons**: Set on individual slides, override row icons when present
- **Fallback Logic**: `slideIcons = slide.icon_set ? parseIconSet(slide.icon_set) : rowIcons`
- **Storage**: Both stored as JSON arrays in `icon_set` column, returned as arrays by API
- **Icon Picker**: Material Symbols component allows up to 3 icons per row/slide
- **Special Icons**:
  - `select_check_box` - Red colored (#ef4444), enables permanent frontend unpublish (with confirmation dialog)
  - `check_circle_unread` - Green colored (#22c55e), enables temporary unpublish until 1am (no dialog)
  - All others display normally with theme colors
- **Performance**: Row icons cached with `useMemo` to avoid repeated parsing

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
npx tsc --noEmit        # TypeScript validation (0 errors required)
npm run lint            # ESLint (0 errors, warnings OK)
npm run build           # Production build test
```

### Railway Pipeline
1. Git push triggers deployment
2. Nixpacks v1.38.0 detects Node.js 18
3. Build: `npm ci` → `npm run build` → `npm run start`
4. `railway-init.ts` runs automatically (initializes schema, runs migrations, seeds data)
5. Database health check at `/api/test-db`

### Migration Safety
- All migrations use `IF NOT EXISTS` (idempotent)
- Theme settings migration wrapped in try/catch
- Seed scripts check for existing data (no duplicates)

---

## Common Issues

### Row-Level Icons Not Displaying
**Status**: FIXED (Oct 20, 2025)
**Solution**: Fixed type mismatch - API returns `icon_set` as array, not string
**Prevention**: Interface updated to `icon_set: string[]`, removed JSON parsing
**Note**: Refresh page after editing row settings to see updated icons

### Quick Slides Row Type Reverting to ROUTINE
**Status**: FIXED (Oct 20, 2025)
**Solution**: Made QUICKSLIDE row_type read-only in edit form
**Recovery**: Use `POST /api/slides/fix-quickslides` to repair if needed
**Prevention**: QUICKSLIDE rows now show "(System-managed)" label and cannot be changed

### Audio Player Not Showing/Playing
**Status**: FIXED (Oct 18, 2025)
**Solution**: Now using native HTML5 `<audio>` element
**Check**: Browser console for CORS errors, audio URL accessibility, file format support (MP3, WAV, OGG)

### Tiptap SSR Hydration
**Fix**: Add `immediatelyRender: false` to `useEditor()` config

### Background Images Not Showing
**Fix**: Ensure `.no-gradient` class applied to icon bars when `hasBackgroundImage={true}`

### Position Constraint Violation
**Fix**: Don't send position for new slides (server auto-calculates)

---

## Navigation

### Main App Icons (/)
- **Home**: Navigate to /
- **Settings**: Navigate to /admin
- **Theme Toggle**: Light/dark mode
- **ATR** (right sidebar): Toggle Quick Slide mode
- **Comment** (bottom left): Open Quick Slide creation modal
- **Videocam** (conditional): Toggle video cover/contained
- **Footer Arrows**: Prev/next slide, up/down row

### Admin Icons (/admin)
- **Dashboard**: Navigate to /admin
- **Description**: Navigate to /admin/slides
- **Exit**: Navigate to /
- **Theme Toggle**: Same as main app

---

## Important Notes

- **50px Border**: All pages maintain 50px padding for icon layout
- **Icon Specs**: 24px size, weight 100, `var(--icon-color)`
- **Audio**: Stored in `/public/media/`
- **Slide Media**: Stored in `/public/media/slides/[row-id]/`
- **No ORM**: Direct PostgreSQL queries for performance
- **SSR**: Some components use `'use client'` directive
- **Transparent Containers**: Main/Swiper containers use transparent backgrounds
- **Gradients**: Conditionally hidden when background images present
- **Position Auto-Assignment**: Server calculates position for new slides
- **Railway Safe**: All migrations idempotent, wrapped in error handling

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
npm run build
npx tsc --noEmit
npm run lint
```

---

## Recent Critical Updates (October 2025)

### Temporary Unpublish Feature (Oct 20 - Morning)
- **Feature**: New temporary unpublish functionality using `check_circle_unread` icon
- **Icon Color**: Green (#22c55e) in both admin and frontend to indicate temporary action
- **Behavior**: Click icon → slide unpublished until 1am (next occurrence) → auto-republishes
- **Database**: New `temp_unpublish_until` TIMESTAMP column added to slides table
- **Filtering**: Client-side filtering via `scheduleFilter.ts` (same pattern as schedule filtering)
- **Navigation**: Smooth navigation to next slide after unpublish (no page reload)
- **UX**: No confirmation dialog (instant action, different from permanent unpublish)
- **API**: New endpoint `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish`
- **Files**: `scripts/add-temp-unpublish.ts`, `scripts/railway-init.ts`, `src/lib/queries/slides.ts`, `src/lib/utils/scheduleFilter.ts`, `src/components/MainContent.tsx`, `src/components/admin/slides/IconPicker.tsx`, `src/app/api/slides/rows/[id]/slides/[slideId]/temp-unpublish/route.ts`
- **Migration**: Idempotent, Railway-safe, TypeScript validated

### Row-Level Icons Fix (Oct 20 - Early Morning)
- **Issue**: Row-level icons not displaying on slides despite being set in admin
- **Root Cause**: Type mismatch - API returns `icon_set` as array, but code expected string and tried to JSON.parse()
- **Fix**: Updated `SlideRow` interface to `icon_set: string[]` and removed unnecessary parsing
- **Impact**: Row-level icons now properly display on all slides in that row, with individual slide overrides working
- **Files**: `src/components/MainContent.tsx`

### Quick Slides Row Type Protection (Oct 20 - Early Morning)
- **Issue**: Editing Quick Slides row settings would overwrite `row_type` from QUICKSLIDE to ROUTINE
- **Root Cause**: SlideRowForm dropdown only included ['ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM'], missing QUICKSLIDE
- **Fix**: Made QUICKSLIDE row_type read-only in edit form with explanatory text
- **Protection**: Prevents accidental modification of system-managed Quick Slides row type
- **Files**: `src/components/admin/slides/SlideRowForm.tsx`
- **Utility**: Created `/api/slides/fix-quickslides` endpoint to repair row_type if needed

### Smart Unpublish Navigation (Oct 19 - Late Night)
- Click unpublish icon → Slide removed → Smooth navigation to next available slide
- Stays in current row if slides remain, jumps to app start only if all slides removed
- Works in Quick Slide mode, maintains context
- Zero page reload, pure client-side navigation using Swiper
- Architecture: Callback ref pattern between page.tsx and MainContent.tsx

### Frontend Slide Unpublish (Oct 19 - Night)
- Admin sets `select_check_box` icon → appears red on frontend
- Click icon → Confirmation dialog: "Hide This Slide?"
- On confirm → Slide unpublished via API → Slide disappears with smart navigation
- Safety: Confirmation dialog prevents accidental clicks

### Quick Slide Mode Toggle (Oct 19 - Evening)
- Click "atr" icon in right sidebar to isolate Quick Slide row
- Toggle between normal view (all rows except Quick Slides) and Quick Slide-only view
- Visual feedback: Icon opacity changes (60% inactive, 100% active)
- Zero database changes, purely frontend filtering

### Quick Slide Feature (Oct 19 - Morning)
- Frontend modal for creating quick notes (title + body only)
- Click "comment" icon in bottom left to open modal
- All quick slides published automatically to "Quick Slides" row (row_type: 'QUICKSLIDE')
- Page reloads after creation to show new slide immediately

### Per-Slide Icons (Oct 19 - Morning)
- Admin can set up to 3 Material Symbol icons per slide
- Icons display above title on frontend
- Stored as JSON array in `icon_set` column (e.g., `["home", "star", "favorite"]`)
- Falls back to row-level icons if not set

### Dynamic Slide Scheduling (Oct 19 - Morning)
- Time-of-day and day-of-week publishing controls per slide
- `publish_time_start`, `publish_time_end` (TIME) - Time window visibility
- `publish_days` (TEXT/JSON) - Day-of-week array [0=Sunday, 6=Saturday]
- Client-side filtering using visitor's browser timezone
- Supports overnight ranges (e.g., 22:00 - 06:00)

### Slide Publishing Controls (Oct 19 - Morning)
- Individual slide publishing with bulk actions
- Checkboxes for selecting multiple slides
- Bulk publish/unpublish actions
- "Unpublished" badge on unpublished slides
- Frontend filtering with `?published=true` query param

### Audio Player Fixed (Oct 18)
- Migrated from Essential Audio Player to native HTML5 `<audio>` element
- Resolved initialization issues and React compatibility
- Zero initialization required, works immediately
- Better accessibility and mobile support

---

**Lines**: ~430 | **Status**: Production Ready | **Railway**: Deployment Safe | **Last Validated**: Oct 20, 2025
