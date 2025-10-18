# Claude Development Reference

**Project**: Icon Border Template - Spiritual Content Platform
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: October 18, 2025

Imortant: DO NOT CREATE A NUL FILE
---

## Quick Start

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run db:init          # Initialize PostgreSQL schema
npm run db:seed          # Seed sample data
npm run db:slides:init   # Initialize slide tables
npm run db:slides:seed   # Seed slide content
```

**URLs**:
- Frontend: http://localhost:3000/
- Admin: http://localhost:3000/admin
- Slides: http://localhost:3000/admin/slides
- Health: http://localhost:3000/api/test-db

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v3, Material Symbols Icons
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **UI**: Swiper.js 12.0.2, Tiptap (rich text), @dnd-kit (drag-drop)
- **Audio**: Native HTML5 Audio Player

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border Layout**: Fixed header/footer/sidebars with gradient backgrounds
- **Multi-Level Navigation**: Vertical Swiper (slide rows) + Horizontal Swiper (slides)
- **Dynamic Content**: Background images, YouTube videos (cover/contained modes)
- **Per-Slide Themes**: Light/dark text with semi-transparent backgrounds (0-1 opacity)
- **Global Theme**: Light/dark mode with session persistence
- **Audio**: Native HTML5 audio player on all slides

### Admin (/admin)
- **Slide Management**: Full CRUD interface for slide rows and slides
- **Rich Text Editor**: Tiptap WYSIWYG with live preview
- **Drag-and-Drop**: Slide reordering with position auto-calculation
- **File Upload**: Audio (MP3/WAV/OGG), Images (JPG/PNG/WebP)
- **Media Integration**: YouTube videos + background images per slide
- **Theme Settings**: Per-slide light/dark override + text background opacity

---

## Database Schema

### Core Tables (8)
1. **users**: Role-based access (Admin, Moderator, User)
2. **audio_files**: MP3 metadata
3. **playlists** + **playlist_items**: Playlist management
4. **categories**: Content categories
5. **service_commitments**: Daily prompts
6. **bug_reports** + **documentation**: Admin tools

### Slide System (3 tables)
1. **slide_rows**: Collections of slides
   - `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set`, `theme_color`, `slide_count`

2. **slides**: Individual slide content
   - Core: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type`
   - Media: `audio_url`, `image_url`, `video_url`
   - Display: `content_theme` ('light'|'dark'), `title_bg_opacity` (0-1), `body_bg_opacity` (0-1)
   - Meta: `view_count`, `completion_count`, `created_at`, `updated_at`

3. **slide_icons**: Optional custom icons per slide

**Features**:
- Auto-updating `slide_count` trigger
- Cascading deletes (row deletion removes all slides)
- Unique position constraint per row
- Server-side position auto-calculation

---

## API Endpoints (14)

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
- `GET /api/test-db`

**Validation**: All routes validate content_theme ('light'|'dark'), opacity values (0-1), and layout types.

---

## Critical Files

### Database
- `src/lib/db.ts` - Connection utility (lazy pool initialization)
- `src/lib/queries/slideRows.ts` - Row queries
- `src/lib/queries/slides.ts` - Slide queries
- `scripts/init-db.ts` - Schema initialization
- `scripts/init-slide-tables.ts` - Slide table creation
- `scripts/railway-init.ts` - Railway startup script (runs all migrations)
- `scripts/add-slide-theme-settings.ts` - Theme settings migration

### Frontend Core
- `src/app/page.tsx` - Main page (Swiper navigation + background/video state)
- `src/components/MainContent.tsx` - Dynamic slide rendering (lazy loading, caching)
- `src/components/YouTubeEmbed.tsx` - YouTube player (cover/contained modes)
- `src/contexts/SwiperContext.tsx` - Multi-level navigation context
- `src/contexts/ThemeContext.tsx` - Global theme state

### Icon Borders
- `src/components/TopIconBar.tsx` - Header (z-20)
- `src/components/BottomIconBar.tsx` - Footer (z-20)
- `src/components/LeftIconBar.tsx` - Left sidebar (z-10)
- `src/components/RightIconBar.tsx` - Right sidebar (z-10, videocam toggle)

### Admin
- `src/app/admin/page.tsx` - Admin dashboard main page
- `src/app/admin/slides/page.tsx` - Slide row list
- `src/app/admin/slides/new/page.tsx` - Create row
- `src/app/admin/slides/[id]/edit/page.tsx` - Edit row metadata
- `src/app/admin/slides/[id]/page.tsx` - Slide manager (reorder slides)
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/AdminQuickActions.tsx` - Reusable quick actions sidebar (all admin pages)
- `src/components/admin/AdminMainContent.tsx` - Admin dashboard content
- `src/components/admin/AdminTopIconBar.tsx` - Admin header (z-10, theme-based background)
- `src/components/admin/AdminBottomIconBar.tsx` - Admin footer (z-10, theme-based background)
- `src/components/admin/AdminLeftIconBar.tsx` - Admin left sidebar (z-10, theme-based background)
- `src/components/admin/AdminRightIconBar.tsx` - Admin right sidebar (z-10, expandable)
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor + theme settings UI
- `src/components/admin/slides/SlideManager.tsx` - Drag-drop reordering

### Styling
- `src/app/globals.css` - Theme system, gradients, YouTube styling

---

## Key Features & Behavior

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

### Per-Slide Theme Settings (Oct 15, 2025)
- **content_theme**: Override global theme ('light' = white text, 'dark' = black text)
- **title_bg_opacity**: Semi-transparent background behind title (0-1)
- **body_bg_opacity**: Semi-transparent background behind body (0-1)
- **Logic**: Light theme uses dark backgrounds (rgba(0,0,0,opacity)), dark theme uses light backgrounds (rgba(255,255,255,opacity))
- **Rendering**: Only applies when opacity > 0, uses inline styles

### Icon Border Gradients
- Conditional display: Transparent when background image present, gradients when absent
- `.no-gradient` class applied via `hasBackgroundImage` prop
- Smooth 500ms transitions between slides

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw video IDs
- **Cover Mode**: Full-screen like `background-size: cover` (default)
- **Contained Mode**: 60px padding, 16:9 aspect ratio, fits viewport
- Toggle via videocam icon in right sidebar (only visible when video present)
- **Interactivity Fix**: MainContent passes `activeSlideVideoUrl` prop for conditional pointer-events handling
- When video present: Swiper containers use `pointer-events: none` to allow video interaction
- YouTube iframe at z-10 receives clicks through MainContent at z-20

### Admin Interface
- **50px Icon Border Layout**: All admin pages maintain consistent border layout
- **Solid Theme Backgrounds**: All admin icon bars use `var(--bg-color)` (light/dark adaptive)
- **Admin Quick Actions Sidebar**: Consistent left column (12.5% width, 150-200px range) on all pages
  - Links: "Admin Dashboard" → `/admin`, "View Live Site" → `/`, "Manage Articles" → `/admin/slides`
  - Component: `AdminQuickActions.tsx` (reusable across all admin pages)

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
4. `railway-init.ts` runs automatically:
   - Initializes database schema
   - Initializes slide tables
   - Runs theme settings migration (IF NOT EXISTS)
   - Seeds initial data
5. Database health check at `/api/test-db`

### Migration Safety
- All migrations use `IF NOT EXISTS` (idempotent)
- Theme settings migration wrapped in try/catch (non-critical)
- Seed scripts check for existing data (no duplicates)
- Railway auto-seeding disabled for slide data

---

## Common Issues

### Tiptap SSR Hydration
**Fix**: Add `immediatelyRender: false` to `useEditor()` config

### Background Images Not Showing
**Fix**: Ensure `.no-gradient` class applied to icon bars when `hasBackgroundImage={true}`

### Material Icons Not Loading
**Fix**: Icons load via `@import` in `globals.css`, requires font-weight: 100

### Position Constraint Violation
**Fix**: Don't send position for new slides (server auto-calculates)

### Seed Script Duplicates
**Fix**: Scripts check for existing data, Railway auto-seeding disabled

---

## Navigation

### Main App Icons (/)
- **Home**: Navigate to /
- **Settings**: Navigate to /admin
- **Theme Toggle**: Light/dark mode
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

## Recent Critical Updates

### HTML5 Audio Player Migration (Oct 18, 2025)
Replaced Essential Audio Player library with native HTML5 audio player to resolve initialization issues and improve React compatibility.

**Problem:**
- Essential Audio Player designed for static HTML, incompatible with React's dynamic rendering
- Destructive `init()` method caused race conditions and registry wipes
- Window resize handler errors: `Cannot read properties of undefined (reading 'zo')`
- Players added after DOMContentLoaded were never detected by the library

**Solution:**
- Migrated to native HTML5 `<audio>` element with built-in controls
- Removed all Essential Audio initialization code
- Simplified component to 87 lines (vs 123 lines previously)

**Benefits:**
- ✅ Zero initialization required - works immediately
- ✅ No race conditions or registry management issues
- ✅ Better accessibility (screen reader compatible)
- ✅ Mobile-optimized native controls
- ✅ Universal browser support
- ✅ Simpler codebase and easier maintenance

**Files Modified:**
- `src/components/EssentialAudioPlayer.tsx` - Complete rewrite using HTML5 audio

**Note:** Essential Audio library files remain in `/public/essential-audio-player/` but are no longer loaded or used. Can be safely removed if desired.

### Subtitle and Row Type Pills (Oct 17, 2025)
Redesigned subtitle display as compact pill badges alongside row type indicators beneath the MP3 player.

**Changes**:
- **Subtitle Display**: Removed large h2 subtitle heading, now displays as first pill in horizontal row
- **Row Type Badge**: Added row type (ROUTINE/COURSE/TEACHING/CUSTOM) as second pill
- **Styling**: Theme-aware semi-transparent pills (30% opacity), 12px font, 8px gap between pills
- **Layout**: Flexbox row with wrap support, appears 8px below audio player
- **Conditional**: Only displays when audio player exists (maintains existing logic)
- **Formatting**: Row type capitalized (e.g., "Course"), subtitle displays as-is

**Files Modified**:
- `src/components/MainContent.tsx` - Updated `renderSlideContent()` signature, removed subtitle h2 section, added pill row for both video and non-video slides

**Benefits**:
- Cleaner, more compact slide layout
- Consistent metadata display pattern
- Better visual hierarchy (title remains prominent, subtitle becomes supporting detail)
- Theme-aware styling matches existing per-slide theme system

### YouTube Video Interactivity Fix (Oct 16, 2025)
Fixed YouTube video click-through issue. Added `activeSlideVideoUrl` prop to MainContent component, passed from page.tsx. When video present, Swiper containers apply `pointer-events: none` to allow clicks to reach YouTube iframe at z-10. Audio player remains interactive with explicit `pointer-events: auto`. Icon bars at z-20 remain visible and functional.

**Files Modified**:
- `src/components/MainContent.tsx` - Added prop, conditional pointer-events on desktop/mobile wrappers
- `src/app/page.tsx` - Pass activeSlideVideoUrl to MainContentWithRef

### Admin Interface Consistency Updates (Oct 16, 2025)
Standardized admin interface with theme-aware backgrounds and consistent quick actions sidebar across all pages.

**Changes**:
1. **Solid Theme Backgrounds**: All admin icon bars now use `var(--bg-color)` for light/dark theme adaptation
   - Files: `AdminTopIconBar.tsx`, `AdminBottomIconBar.tsx`, `AdminLeftIconBar.tsx`, `AdminRightIconBar.tsx`
2. **Admin Quick Actions Component**: Created reusable sidebar component with consistent width (12.5%, 150-200px)
   - Component: `src/components/admin/AdminQuickActions.tsx`
   - Links: "Admin Dashboard", "View Live Site", "Manage Articles"
   - Applied to all 6 admin pages for consistent navigation

**Admin Pages Updated**:
- `/admin` (main dashboard)
- `/admin/slides` (slide list)
- `/admin/slides/new` (create row)
- `/admin/slides/[id]` (slide manager)
- `/admin/slides/[id]/edit` (edit row)
- `/admin/slides/[id]/slide/[slideId]` (slide editor)

### Per-Slide Theme Settings (Oct 15, 2025)
Added `content_theme`, `title_bg_opacity`, `body_bg_opacity` columns to slides table. Admin UI includes dropdown + sliders. Frontend applies theme-aware semi-transparent backgrounds. Migration runs automatically on Railway via `railway-init.ts`.

### Position Constraint Fix (Oct 15, 2025)
Fixed slide creation errors. Server now auto-calculates position. SlideEditor no longer sends position for new slides.

### Seed Script Duplicate Prevention (Oct 15, 2025)
Added existence checks to seed scripts. Disabled Railway auto-seeding for slides. Prevents deleted rows from resurrecting.

### Background Image Gradient Fix (Oct 15, 2025)
Icon borders conditionally transparent when background images present. `.no-gradient` class applied via `hasBackgroundImage` prop.

---

**Lines**: ~570 | **Status**: Production Ready | **Railway**: Deployment Safe
