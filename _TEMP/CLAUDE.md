# Claude Development Reference

**Project**: Icon Border Template - Spiritual Content Platform
**Platform**: Windows | **Branch**: master | **Status**: Phase 5 Complete

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

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v3, Material Symbols Icons
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **UI Libraries**: Swiper.js 12.0.2, Tiptap (rich text), @dnd-kit (drag-drop)
- **Audio**: Essential Audio Player (custom red theme)

---

## Application Architecture

### Frontend (/)
- **Icon Border Layout**: 50px padding, fixed header/footer/sidebars
- **Dynamic Slides**: Multi-level Swiper navigation (vertical rows + horizontal slides)
- **Background Images**: Full-browser slide backgrounds via `image_url` field
- **YouTube Videos**: Full-browser embedded videos via `video_url` field with cover/contained toggle
- **Video Display Modes**: Toggle between cover (full-screen) and contained (60px padding) views
- **Theme System**: Light/dark mode with session persistence
- **4-Direction Navigation**: Footer arrows (prev/next slide, scroll up/down)
- **Audio Playback**: Essential Audio Player integrated on all slides

### Admin Interface (/admin)
- **Slide Management** (`/admin/slides`): CRUD interface for dynamic content
- **Rich Text Editor**: Tiptap WYSIWYG with live preview
- **Drag-and-Drop**: @dnd-kit for slide reordering
- **File Upload**: Audio (MP3/WAV/OGG), Images (JPG/PNG/WebP)
- **YouTube Video Integration**: Add YouTube URLs to slides via `video_url` field
- **Same Layout**: Identical 50px border structure as frontend

---

## Database Schema

### Core Tables (8)
1. **users**: Role-based access (Admin, Moderator, User)
2. **audio_files**: MP3 metadata (artist, album, duration, bitrate)
3. **playlists** + **playlist_items**: User playlist management
4. **categories**: Meditation, Yoga, Courses, Mantras
5. **service_commitments**: Daily prompts repository
6. **bug_reports** + **documentation**: Admin tools

### Slide System Tables (3) - Phase 1
1. **slide_rows**: Collections of slides (ROUTINE/COURSE/TEACHING/CUSTOM)
   - `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set`, `theme_color`, `slide_count`
2. **slides**: Individual slide content
   - `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `audio_url`, `image_url`, `video_url`, `position`, `layout_type`
3. **slide_icons**: Optional custom icons per slide

**Key Features**:
- Auto-updating `slide_count` trigger
- Cascading deletes (delete row → deletes all slides)
- Unique position constraint per row

---

## API Endpoints (14 total) - Phase 2

### Slide Rows
- `GET /api/slides/rows` - List all rows (`?published=true` for frontend)
- `POST /api/slides/rows` - Create row
- `GET /api/slides/rows/[id]` - Get single row
- `PATCH /api/slides/rows/[id]` - Update row
- `DELETE /api/slides/rows/[id]` - Delete row

### Slides
- `GET /api/slides/rows/[id]/slides` - Get slides for row
- `POST /api/slides/rows/[id]/slides` - Create slide
- `GET /api/slides/rows/[id]/slides/[slideId]` - Get single slide
- `PATCH /api/slides/rows/[id]/slides/[slideId]` - Update slide
- `DELETE /api/slides/rows/[id]/slides/[slideId]` - Delete slide
- `POST /api/slides/rows/[id]/slides/reorder` - Reorder slides

### Utilities
- `GET /api/slides/upload` - Get upload config
- `POST /api/slides/upload` - Upload audio/image files
- `GET /api/test-db` - Database health check

---

## Key Components

### Frontend
- **MainContent.tsx**: Dynamic slides with API integration, lazy loading, caching
- **YouTubeEmbed.tsx**: Full-browser YouTube video player component with cover/contained display modes
- **RightIconBar.tsx**: Right sidebar with conditional videocam toggle icon
- **SwiperContext.tsx**: Multi-level navigation (vertical rows + horizontal slides)
- **ThemeContext.tsx**: Light/dark mode state management
- **EssentialAudioPlayer.tsx**: MP3 player wrapper (SSR-safe)

### Admin
- **SlideRowList.tsx**: Card-based list with filtering/sorting
- **SlideRowForm.tsx**: Create/edit row with validation
- **SlideManager.tsx**: Drag-and-drop slide reordering
- **SlideEditor.tsx**: Tiptap rich text editor + live preview
- **AudioUploader.tsx**: File upload with progress
- **IconPicker.tsx**: Material Symbols icon selector

---

## Development Phases

### ✅ Completed (Phases 1-5)
1. **Database Foundation**: Slide tables, triggers, query functions
2. **API Endpoints**: 14 REST endpoints with validation
3. **Admin UI - List & Forms**: Slide row CRUD interface
4. **Admin UI - Editor**: Rich text editor, drag-drop, uploads
5. **Frontend Integration**: Dynamic slides, multi-level navigation, performance optimization

### 🔄 Current Phase (Phase 6)
**Polish & Deployment** - Estimated 1-2 weeks
- View tracking (increment `view_count`)
- Admin analytics dashboard
- Search functionality
- Bulk operations
- Database optimization (indexes)
- Security audit (SQL injection, XSS)
- User documentation
- Railway production deployment

---

## Performance Optimizations

### Frontend (Phase 5)
- **Lazy Loading**: Slides loaded on-demand (90%+ API improvement)
- **Client Caching**: `slidesCache` prevents redundant API calls
- **Preloading**: First 2 rows on mount, adjacent rows on navigation
- **Memoization**: Icon parsing cached with `useMemo`
- **Server Caching**: `next: { revalidate: 60 }` on fetch calls

### Results
- Initial API: 473ms → Cached: 39-45ms (90%+ faster)
- Instant navigation between cached rows
- Zero layout shift during loading

---

## Critical File Locations

### Database
- `src/lib/db.ts` - PostgreSQL connection utility
- `src/lib/queries/slideRows.ts` - Slide row queries
- `src/lib/queries/slides.ts` - Slide queries (includes video_url support)
- `scripts/init-db.ts` - Schema initialization
- `scripts/seed-db.ts` - Sample data seeding
- `scripts/add-video-url-column.ts` - Migration to add video_url field

### Frontend
- `src/app/page.tsx` - Main page with Swiper navigation logic + YouTube embed layer + video mode state
- `src/components/MainContent.tsx` - Dynamic slide rendering (405+ lines)
- `src/components/YouTubeEmbed.tsx` - YouTube video player with cover/contained modes
- `src/components/RightIconBar.tsx` - Right sidebar with conditional videocam icon
- `src/contexts/SwiperContext.tsx` - Navigation context
- `src/contexts/ThemeContext.tsx` - Theme state

### Admin
- `src/app/admin/slides/page.tsx` - Slide row list
- `src/app/admin/slides/[id]/page.tsx` - Slide manager
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/slides/*.tsx` - All admin slide components

### Styling
- `src/app/globals.css` - Theme system, Essential Audio Player overrides, YouTube embed styling (cover + contained modes)
- `tailwind.config.js` - Tailwind v3 configuration

---

## Database Connection

### Local Development
```env
# .env.local
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mp3_manager
DB_PORT=5432
```

### Railway Production
```env
# Automatically provided by Railway
DATABASE_URL=postgresql://...
```

**Health Check**: http://localhost:3000/api/test-db

---

## Common Issues & Fixes

### Tiptap SSR Hydration Error
**Error**: "SSR has been detected, please set `immediatelyRender` explicitly"
**Fix**: Add `immediatelyRender: false` to `useEditor()` config

### Nested Scrollbars
**Issue**: Multiple scrollbars on page
**Fix**: Remove `overflow-y-auto` from containers, use single page-level scroll

### Material Icons Not Loading
**Fix**: Icons load via CSS `@import` in `globals.css`, font-weight: 100

### Background Images Not Displaying ✅ FIXED (Oct 15, 2025)
**Issue**: Background images set via admin `image_url` field not showing on frontend
**Root Cause**: Opaque `background-color: var(--content-bg)` on main containers blocked parent background image
**Fix**: Changed `globals.css` lines 64-67 to use `transparent` instead of `var(--content-bg)`
**Files Modified**:
- `src/app/globals.css` - Made main/swiper containers transparent
- `src/app/page.tsx` - Added fallback background color for slides without images

---

## Navigation Structure

### Main App (/)
- **Home Icon**: Navigate to main page
- **Settings Icon**: Navigate to /admin
- **Theme Toggle**: Switch light/dark mode
- **Videocam Icon** (conditional): Toggle video display mode (only visible when slide has video)
- **Footer Arrows**: Prev/next slide, scroll up/down

### Admin (/admin)
- **Exit Icon**: Navigate back to /
- **Slide Management Icon**: Navigate to /admin/slides
- **Theme Toggle**: Same as main app

---

## Testing Commands

```bash
# Database
psql -U postgres -d mp3_manager -c "SELECT * FROM slide_rows;"
curl http://localhost:3000/api/test-db

# API Endpoints
curl http://localhost:3000/api/slides/rows?published=true
curl http://localhost:3000/api/slides/rows/[id]/slides

# Build Validation
npm run build
npx tsc --noEmit
npm run lint
```

---

## Deployment Checklist

### Pre-deployment
- ✅ All TypeScript errors resolved
- ✅ Database schema initialized
- ✅ Sample data seeded
- ✅ API endpoints tested
- ✅ Responsive design verified
- ✅ Theme system working
- ✅ Audio player functional

### Railway Deployment
1. Push to Git repository
2. Connect Railway to repo
3. Set `DATABASE_URL` environment variable (auto-provided)
4. Deploy with `railway up`
5. Monitor with `/api/test-db` endpoint

---

## Project Status

**Current State**: Production-ready with dynamic slide management
**Last Major Update**: Phase 5 Frontend Integration (Complete)
**Next Milestone**: Phase 6 - Polish & Deployment

### Key Achievements
- ✅ Zero code deployments for content changes
- ✅ 90%+ performance improvement (caching)
- ✅ Complete admin interface
- ✅ Multi-level navigation system
- ✅ Responsive design (desktop/mobile)
- ✅ Light/dark theme system
- ✅ Full-browser background images per slide
- ✅ Full-browser YouTube video embeds per slide
- ✅ Interactive video display mode toggle (cover/contained)

---

## Important Notes

- **50px Padding**: All pages have 50px border for icon layout
- **Icon Specifications**: 24px size, weight 100, `var(--icon-color)` for theming
- **Audio Files**: Stored in `/public/media/` directory
- **Slide Images**: Stored in `/public/media/slides/[row-id]/`
- **Background Images**: Set via `image_url` field in slides table, covers entire browser with `background-size: cover`
- **YouTube Videos**: Set via `video_url` field in slides table, supports multiple URL formats (youtube.com, youtu.be, video ID)
- **Video Display Modes**: Toggle between 'cover' (full-screen) and 'contained' (60px padding) via videocam icon in right sidebar
- **Media Layering**: Background image (z-0) → YouTube video (z-10) → Content (z-20) → Icon borders (z-30)
- **Transparent Containers**: Main/swiper containers use `transparent` backgrounds to allow background images/videos to show through
- **No ORM**: Direct PostgreSQL queries for performance
- **SSR Considerations**: Some components need client-side rendering (`'use client'`)

---

## Quick Reference URLs

- **Frontend**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin
- **Slide Management**: http://localhost:3000/admin/slides
- **Database Health**: http://localhost:3000/api/test-db

---

## Documentation Files

- **PHASE_5_COMPLETION_SUMMARY.md**: 650+ line detailed implementation guide
- **SLIDE_ROW_MANAGEMENT_SPEC.md**: Original 6-phase development plan
- **ERROR.md**: Current errors/issues to address

---

---

## Recent Updates

### October 15, 2025 - YouTube Video Display Mode Toggle
**Feature**: Interactive toggle between 'cover' and 'contained' video display modes
**Implementation**: Added conditional videocam icon with click-to-toggle functionality
- Updated `YouTubeEmbed.tsx` to accept `displayMode` prop ('cover' | 'contained')
- Added contained mode CSS classes to `globals.css`:
  - `.youtube-contained`: 60px padding for icon borders, flexbox centering
  - `.youtube-iframe-contained`: Responsive 16:9 aspect ratio, fits within viewport
- Updated `RightIconBar.tsx` to conditionally show videocam icon:
  - Only visible when slide has `video_url` present
  - Clickable with hover cursor
  - Dynamic tooltip based on current mode
  - Accepts `hasVideo`, `onVideoToggle`, `videoMode` props
- State management already existed in `page.tsx` (no new state needed)

**Files Modified**: 3 files (~60 lines total)
- `src/components/YouTubeEmbed.tsx` - Display mode prop support
- `src/app/globals.css` - Contained mode styling (lines 451-486)
- `src/components/RightIconBar.tsx` - Conditional icon rendering

**User Experience**:
- **No Video**: Videocam icon hidden
- **Video Present**: Videocam icon appears in right sidebar
- **Cover Mode** (default): Video fills entire browser like `background-size: cover`
- **Contained Mode**: Video fits within viewport with 60px padding, maintains 16:9 aspect ratio
- **Toggle**: Click videocam icon to switch modes instantly

**Impact**: Users can now choose between cinematic full-screen (cover) or contained video viewing while maintaining icon border visibility

### October 15, 2025 - YouTube Video Integration (with Cover Behavior)
**Feature**: Full-browser YouTube video embeds for slides with background cover behavior
**Implementation**: Added `video_url` field to slides table with complete frontend/admin support
- Added `video_url VARCHAR` column to `slides` table via migration script
- Created `YouTubeEmbed.tsx` component with URL parsing for multiple YouTube formats
- Updated admin `SlideEditor.tsx` with YouTube URL input field
- Integrated video layer in `page.tsx` with proper z-index layering
- Updated `MainContent.tsx` to propagate video URLs on slide changes
- Added YouTube iframe CSS styling to `globals.css` with responsive cover behavior
- Videos layer between background images and content (z-index: 10)
- **Cover Styling**: Videos behave like `background-size: cover`, filling entire viewport while maintaining aspect ratio
- Responsive media queries ensure proper coverage on all screen sizes (16:9 aspect ratio handling)
- Center-positioned with `transform: translate(-50%, -50%)` for optimal display
- Smooth transitions between videos on slide navigation
- Supports: `youtube.com/watch?v=`, `youtu.be/`, and raw video IDs

**Files Modified**: 9 files modified, 2 files created (~220 lines total)
**Migration**: `npx tsx scripts/add-video-url-column.ts` (successfully executed)
**CSS Enhancement**: Updated `.youtube-embed-iframe` with absolute positioning, min-width/height constraints, and responsive aspect ratio media queries
**Impact**: Slides can now have full-browser YouTube videos that cover the entire background, independent of background images, with proper cropping like CSS `background-size: cover`

### October 15, 2025 - Background Image Fix
**Issue**: Background images not displaying on frontend despite being set in admin
**Solution**: Fixed CSS transparency layer issue
- Changed `globals.css` main containers from opaque `var(--content-bg)` to `transparent`
- Added fallback background color in `page.tsx` for slides without images
- Background images now properly cover entire browser window
- Smooth 500ms transition between slide backgrounds
- Theme system preserved (text/icon colors still respect light/dark mode)

**Impact**: Slides with `image_url` now display full-browser backgrounds as intended

---

**Last Updated**: YouTube Video Display Mode Toggle - October 15, 2025
**Total Lines**: 545
