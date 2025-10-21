# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: October 21, 2025

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
- **Spa Mode**: Background ambient music with dynamic scheduling and randomization

### Admin (/admin)
- **Slide Management**: Full CRUD interface for slide rows and slides
- **Rich Text Editor**: Tiptap WYSIWYG with live preview
- **Drag-and-Drop**: Slide reordering with position auto-calculation
- **File Upload**: Audio (MP3/WAV/OGG), Images (JPG/PNG/WebP)
- **Theme Settings**: Per-slide light/dark override + text background opacity
- **Spa Mode Management**: CRUD interface for background music tracks with scheduling

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

### Spa Mode System
1. **spa_tracks**: Background music tracks
   - `id`, `title`, `audio_url`, `is_published`, `display_order`, `is_random`, `volume` (INTEGER 0-100)
   - Scheduling: `publish_time_start`, `publish_time_end`, `publish_days` (TEXT/JSON)
   - Meta: `created_at`, `updated_at`

**Features**: Dynamic scheduling (time/day filtering), randomization support, sequential playback order, per-track volume control

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
- `POST /api/slides/rows/[id]/slides/reorder` - Reorder slides within a row
- `POST /api/slides/rows/reorder` - Reorder slide rows

### Utilities
- `GET /api/slides/upload`
- `POST /api/slides/upload`
- `POST /api/slides/quick-slide` - Create quick slide (title + body only)
- `POST /api/slides/bulk-publish` - Bulk update publish status
- `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish` - Temporarily unpublish slide until 1am
- `POST /api/slides/fix-quickslides` - Fix Quick Slides row_type to QUICKSLIDE (utility)
- `GET /api/slides/debug` - Debug endpoint for Quick Slides status
- `GET /api/test-db`

### Spa Mode Tracks
- `GET /api/spa/tracks` (query: `?published=true`)
- `POST /api/spa/tracks`
- `GET /api/spa/tracks/[id]`
- `PATCH /api/spa/tracks/[id]`
- `DELETE /api/spa/tracks/[id]`
- `GET /api/spa/tracks/active` - Get currently active track based on schedule/randomization

---

## Critical Files

### Database
- `src/lib/db.ts` - Connection utility (lazy pool initialization)
- `src/lib/queries/slideRows.ts` - Row queries
- `src/lib/queries/slides.ts` - Slide queries
- `src/lib/queries/spaTracks.ts` - Spa track queries
- `scripts/init-db.ts` - Schema initialization
- `scripts/init-slide-tables.ts` - Slide table creation
- `scripts/init-spa-tables.ts` - Spa tracks table creation
- `scripts/railway-init.ts` - Railway startup script (runs all migrations)
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering logic

### Frontend Core
- `src/app/page.tsx` - Main page (Swiper navigation + background/video state + Quick Slide modal + unpublish dialog + Spa Mode)
- `src/components/MainContent.tsx` - Dynamic slide rendering (lazy loading, caching, row filtering, unpublish icon detection)
- `src/components/YouTubeEmbed.tsx` - YouTube player (cover/contained modes)
- `src/components/QuickSlideModal.tsx` - Quick slide creation modal
- `src/components/ConfirmDialog.tsx` - Reusable confirmation dialog
- `src/components/SpaAudioPlayer.tsx` - Background music player with scheduling
- `src/contexts/SwiperContext.tsx` - Multi-level navigation context
- `src/contexts/ThemeContext.tsx` - Global theme state

### Icon Borders
- `src/components/TopIconBar.tsx` - Header (z-20, spa icon for background music)
- `src/components/BottomIconBar.tsx` - Footer (z-20, comment icon for Quick Slides)
- `src/components/LeftIconBar.tsx` - Left sidebar (z-10)
- `src/components/RightIconBar.tsx` - Right sidebar (z-10, atr toggle for Quick Slide mode, videocam toggle)

### Admin
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/app/admin/spa/page.tsx` - Spa Mode management page
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor + theme settings UI + icon picker
- `src/components/admin/slides/SlideManager.tsx` - Slide reordering within rows (chevron buttons)
- `src/components/admin/slides/SlideRowList.tsx` - Row management with reordering (chevron buttons)
- `src/components/admin/slides/IconPicker.tsx` - Material Symbol icon selection (up to 3 icons)
- `src/components/admin/spa/SpaTrackForm.tsx` - Spa track add/edit form
- `src/components/admin/spa/SpaTrackList.tsx` - Spa track table with scheduling display
- `src/components/admin/AdminQuickActions.tsx` - Reusable quick actions sidebar
- `src/components/admin/AdminTopIconBar.tsx` - Admin header with spa navigation link

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

### Spa Mode (Background Music)
- **Icon-Based Toggle**: Click "spa" icon (top left, between home and play_circle) to start/stop
- **Visual Feedback**: Icon opacity changes (60% inactive, 100% active when playing)
- **Dynamic Scheduling**: Time-of-day and day-of-week filters (same pattern as slides)
- **Server-Side + Client-Side Filtering**: Server filters before random selection, client validates in timezone
- **Randomization**: Supports random shuffle or sequential playback by display order
- **Volume Control**: Per-track volume setting (0-100%), applied before playback
- **Auto-Looping**: Tracks loop continuously while spa mode is active
- **Admin Management**: Full CRUD at `/admin/spa` with scheduling controls and volume slider
- **Database Table**: `spa_tracks` with `is_random`, `display_order`, `volume`, `publish_time_start/end`, `publish_days`
- **API Endpoint**: `GET /api/spa/tracks/active` returns currently active track (with server-side schedule filtering)
- **Audio Player**: Native HTML5 `<audio>` element, hidden, auto-plays when enabled

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
- **Spa**: Toggle background music playback
- **Play Circle**: (Placeholder)
- **Playlist Play**: (Placeholder)
- **Settings**: Navigate to /admin
- **Theme Toggle**: Light/dark mode
- **ATR** (right sidebar): Toggle Quick Slide mode
- **Comment** (bottom left): Open Quick Slide creation modal
- **Videocam** (conditional): Toggle video cover/contained
- **Footer Arrows**: Prev/next slide, up/down row

### Admin Icons (/admin)
- **Dashboard**: Navigate to /admin
- **Description**: Navigate to /admin/slides
- **Spa**: Navigate to /admin/spa (Spa Mode management)
- **Media**: External link to media.lilde.com
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

### Slide Editor Bug Fixes (Oct 21 - Night)
- **Bug Fix #1**: Background image removal and opacity changes not saving in slide editor
  - **Issue**: When clearing background image URL or setting opacity to 0, changes didn't persist to database
  - **Root Cause**: Frontend sent `undefined` for empty/zero values, backend/query layer skipped undefined fields
  - **Solution**:
    - Frontend: Changed `image_url: imageUrl || undefined` → `image_url: imageUrl || null`
    - Frontend: Changed opacity from conditional to always include value (even when 0)
    - Backend: Added explicit null handling for `image_url` (matching existing `video_url` pattern)
  - **Files Modified**: `SlideEditor.tsx` (3 lines), `route.ts` (4 lines added)
  - **Impact**: Admins can now clear background images and set fully transparent text backgrounds (opacity = 0)
- **Bug Fix #2**: Row reordering chevron buttons not working
  - **Issue**: Clicking chevron buttons to reorder rows had no effect
  - **Root Cause**: Component swapped rows in filtered/sorted array instead of full dataset
  - **Solution**:
    - Disabled chevron buttons when not in "Display Order" sort mode
    - Fixed button disabled logic to check position in `localRows` (full dataset) not `sortedRows` (filtered view)
    - Always send complete list of ALL row IDs to API for reordering
  - **Files Modified**: `SlideRowList.tsx` (disabled conditions, tooltips)
  - **Impact**: Row reordering now works correctly, prevented incorrect reordering in filtered/sorted views
- **Bug Fix #3**: Row reordering required hard refresh to see changes
  - **Issue**: Rows reordered in database but UI didn't update until hard refresh
  - **Root Cause**: Array positions swapped but `display_order` field values unchanged → sort re-ordered back to original
  - **Solution**: After swapping array positions, update each row's `display_order` field to match new index
  - **Files Modified**: `SlideRowList.tsx` (added `forEach` loop in both `handleMoveUp` and `handleMoveDown`)
  - **Impact**: Live immediate UI updates when reordering rows, no refresh needed
- **Pattern**: All fixes followed "minimal and surgical" approach, reused existing patterns
- **TypeScript**: 0 errors, fully validated
- **Testing**: All three issues verified fixed, changes persist correctly

### Row Reordering Feature (Oct 21 - Late Evening)
- **Feature**: Complete row reordering functionality with chevron up/down buttons
- **UI**: Chevron buttons (expand_less/expand_more) on left side of each row card in admin
  - First row: up button disabled
  - Last row: down button disabled
  - Smooth reordering without page reload
- **Backend**: New `reorderSlideRows()` query function using transaction pattern
  - Atomic updates to `display_order` field
  - Two-step update (negative temp values → positive final values) prevents constraint violations
- **API Route**: `POST /api/slides/rows/reorder` accepts `{ row_ids: string[] }`
- **Frontend Persistence**: Rows now sorted by `display_order` field (ascending)
  - Default sort: "Sort by Display Order" (respects manual arrangement)
  - Alternative sorts: Date, Title, Slide Count (still available)
  - Dynamic help text: "Use chevron buttons to reorder" (Display Order mode)
- **Bug Fix**: Fixed critical display issue where rows sorted by `created_at` instead of `display_order`
  - Added missing `display_order` field to `SlideRow` interface
  - Changed default sort from `'created'` to `'order'`
  - Reordering now persists on page refresh
- **Database**: Uses existing `display_order` INTEGER column on `slide_rows` table
- **Pattern**: Mirrors existing slide reordering UX (same chevron buttons, same swap logic)
- **Files Modified**: 2 files (SlideRowList.tsx, page.tsx - added display_order field)
- **Files Created**: 2 files (route.ts for API, reorderSlideRows in slideRows.ts)
- **TypeScript**: 0 errors, fully validated
- **Testing**: Verified row reordering persists on refresh, frontend respects backend order

### Spa Mode Volume Control + Schedule Bug Fix (Oct 21 - Evening)
- **Feature**: Per-track volume control for spa background music
- **Admin Interface**: Volume slider (0-100%) in spa track form between audio URL and publish toggle
  - Display: "Volume: 50%" with range input and 0%/50%/100% labels
  - Default value: 50% for existing tracks
- **Database**: New `volume` INTEGER column (0-100 with CHECK constraint)
- **Frontend**: Volume applied before playback in `SpaAudioPlayer.tsx` (converts percentage to 0.0-1.0 decimal)
- **Migration**: `scripts/add-spa-volume.ts` added to `railway-init.ts` for deployment
- **Bug Fix**: Server-side schedule filtering missing from `/api/spa/tracks/active`
  - **Issue**: API randomly selected from ALL tracks without checking schedule restrictions
  - **Impact**: Client rejected tracks not scheduled for current day → no audio played
  - **Fix**: Added `isTrackVisibleNow()` server-side filtering BEFORE random selection
  - **Result**: Spa mode now only returns tracks valid for current day/time
- **Bug Fix**: Volume application timing race condition
  - **Issue**: Volume set in separate `useEffect`, potentially AFTER play command
  - **Fix**: Merged volume setting INTO play/pause effect, applied BEFORE `.play()`
- **Files Modified**: 3 files (spaTracks.ts, SpaTrackForm.tsx, SpaAudioPlayer.tsx, spa/tracks/active/route.ts)
- **Files Created**: 1 migration (add-spa-volume.ts)
- **TypeScript**: 0 errors, fully validated
- **Testing**: Volume control working, schedule filtering now server-side + client-side

### Spa Mode - Background Music System (Oct 21 - Morning)
- **Feature**: Complete background ambient music system with dynamic scheduling
- **Frontend**: "spa" icon in TopIconBar (between home and play_circle) toggles playback
- **Visual Feedback**: Icon opacity 60% inactive, 100% active (same pattern as Quick Slide mode)
- **Audio Player**: Native HTML5 `<audio>` with loop, hidden from view, auto-plays when enabled
- **Scheduling**: Time-of-day and day-of-week filters using client-side timezone (same logic as slides)
- **Randomization**: Toggle per-track for shuffle mode vs sequential playback by display_order
- **Admin Page**: New `/admin/spa` page with full CRUD interface
  - Form: Title, audio URL, publish status, display order, random toggle, time/day scheduling
  - Table: Lists all tracks with schedule summary, status badges, edit/delete actions
- **Database**: New `spa_tracks` table with scheduling columns matching slides pattern
- **API Routes**:
  - `GET/POST /api/spa/tracks` - List/create tracks
  - `GET/PATCH/DELETE /api/spa/tracks/[id]` - Individual track operations
  - `GET /api/spa/tracks/active` - Returns currently active track (handles randomization + server-side schedule filtering)
- **Query Layer**: `src/lib/queries/spaTracks.ts` with full CRUD operations
- **Components**:
  - `SpaAudioPlayer.tsx` - Frontend audio player with client-side schedule filtering
  - `SpaTrackForm.tsx` - Admin form with scheduling UI (time/day pickers)
  - `SpaTrackList.tsx` - Admin table with status/schedule display
- **Migration**: `scripts/init-spa-tables.ts` added to `railway-init.ts` for deployment
- **Files Created**: 13 new files (1 migration, 1 query layer, 3 API routes, 3 admin components, 1 page, 1 player)
- **Files Modified**: 4 files (TopIconBar, page.tsx, railway-init.ts, AdminTopIconBar)
- **TypeScript**: 0 errors, fully type-safe with Next.js 15 async params
- **Testing**: Database initialized successfully, ready for production use

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

## Recent Critical Updates (October 2025) - Continued

### UI Border Radius Removal (Oct 20 - Afternoon)
- **Change**: Removed all rounded borders (`border-radius`) from entire application
- **Scope**: 80+ instances across 11 files removed
- **Files Modified**:
  - Frontend components: ConfirmDialog, QuickSlideModal, MainContent (6 pill badges)
  - Admin components: SlideEditor (30+ instances), SlideManager (15+ instances), SlideRowForm
  - Admin pages: slides/page.tsx (15+ instances, including spinner), media/page.tsx
  - Utilities: SlidePreview, AdminQuickActions, AdminMainContent
  - Styles: globals.css (4 audio player styles)
- **Impact**: All UI elements now display with square/sharp corners instead of rounded edges
- **Visual Changes**:
  - Modals: Square corners instead of rounded
  - Buttons: Square edges throughout
  - Input fields: No rounded corners
  - Cards/containers: Sharp rectangular edges
  - Pills/badges: Square inline badges (row descriptions, subtitles, row types)
  - Audio player: Square play button and progress elements
  - Position badges: Square instead of circular
- **Classes Removed**: `rounded`, `rounded-lg`, `rounded-full`, `rounded-t`
- **Inline Styles Removed**: `borderRadius`, `border-radius` CSS properties
- **Third-party**: Essential Audio Player library files unchanged (external dependency)
- **Testing**: Visual inspection recommended to verify sharp edges across all pages

---

**Lines**: ~580 | **Status**: Production Ready | **Railway**: Deployment Safe | **Last Validated**: Oct 21, 2025
