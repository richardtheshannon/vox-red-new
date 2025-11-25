# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation (PWA)
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 24, 2025

---

## Quick Start

```bash
npm run dev                      # Dev server (http://localhost:3000)
npm run build                    # Production build
npx tsc --noEmit                 # TypeScript validation
npm run db:validate              # Check pending migrations
npm run db:download-prod-simple  # Download production DB for local testing
```

**Key URLs**: http://localhost:3000/ | /admin | /login | /setup

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **Authentication**: NextAuth.js 4.24.13 (JWT, 30-day sessions)
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols
- **PWA**: Service Worker v2, Cache API, Web App Manifest (offline support)
- **Deployment**: Railway (auto-deploy on push to master)

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20), square UI everywhere
- **Dual Swiper Navigation**: Vertical (rows) + Horizontal (slides)
- **Background System**: Full-viewport images with theme overlay
- **6 Special Modes**: Quick Slides, Goals, Simple Shifts, Service, Image Slides, Normal (mutually exclusive)
- **Quick-Add Feature**: Comment icon appears contextually in special modes
- **User-Specific Content**: Private rows visible only to assigned users
- **Offline PWA**: Logged-in users download content for offline use (refresh icon)

### Admin (/admin)
- **Protected**: Authentication + admin role required
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Row Overrides**: Background images and layout types at row level
- **Randomization**: Per-row with hourly/daily/weekly intervals

---

## Database Schema

**users**: `id`, `name`, `email`, `password_hash`, `role` (ADMIN|USER|MODERATOR)

**slide_rows**: `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id`, `randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`, `row_background_image_url`, `row_layout_type`
- **row_type**: ROUTINE | COURSE | TEACHING | CUSTOM | QUICKSLIDE | SIMPLESHIFT | IMGSLIDES | SERVICE | GOALS

**slides**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type` (STANDARD|OVERFLOW|MINIMAL), `audio_url`, `image_url`, `video_url`, `content_theme` (light|dark), `title_bg_opacity`, `body_bg_opacity`, `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON [0-6]), `temp_unpublish_until`, `icon_set` (JSON), `view_count`, `completion_count`

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON [0-6])

---

## Key Files

**Frontend**:
- `page.tsx` - State management, mode handling
- `MainContent.tsx` - Rendering, filtering, offline cache fallback
- `RightIconBar.tsx` - Mode icons, quick-add triggers
- `BottomIconBar.tsx` - Refresh/offline download icon
- `[Name]Modal.tsx` - Quick-add modals (Quick/Goal/SimpleShift/Service)
- `OfflineProgress.tsx` - Download progress UI

**Backend**:
- `lib/db.ts` - Database connection
- `lib/auth.ts` + `lib/authOptions.ts` - Authentication
- `lib/queries/slideRows.ts` - Row CRUD operations
- `lib/queries/slides.ts` - Slide CRUD, type definitions
- `lib/utils/scheduleFilter.ts` - Time-based filtering
- `lib/utils/slideRandomizer.ts` - Deterministic randomization
- `lib/offlineManager.ts` - Offline cache management (localStorage + Cache API)

**PWA**:
- `public/manifest.json` - PWA manifest
- `public/service-worker.js` - Service worker v2 (caching, offline fallback)

**API Routes**:
- `/api/slides/rows` - Row CRUD
- `/api/slides/rows/[id]/slides` - Slide CRUD
- `/api/slides/{quick-slide,goal-slide,simple-shift-slide,service-slide}` - Quick-add endpoints

**Admin**:
- `components/admin/slides/SlideRowForm.tsx` - Row form with overrides

**Deployment**:
- `scripts/railway-init.ts` - Auto-run migrations on deploy
- `scripts/validate-migrations.ts` - Validate schema before push
- `scripts/download-production-db-simple.ts` - Download prod DB for testing

---

## Environment Variables

```env
# Local Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mp3_manager"              # Use "mp3_manager_backup" for prod testing
DB_USER="postgres"
DB_PASSWORD="your-password"

# Railway Database (auto-provided)
DATABASE_URL="postgresql://..."

# Authentication (REQUIRED)
NEXTAUTH_SECRET="<32-char-secret>"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

---

## Special Row Modes

All modes are **mutually exclusive** - only one active at a time.

| Mode | Icon | row_type | Position | Quick-Add | Use Case |
|------|------|----------|----------|-----------|----------|
| Quick Slides | `atr` | 'QUICKSLIDE' | Right 1st | ✅ | Temporary one-off slides |
| Goals | `things_to_do` | 'GOALS' | Right 2nd | ✅ | Goal tracking |
| Simple Shifts | `move_up` | 'SIMPLESHIFT' | Right 3rd | ✅ | Daily practices |
| Service | `room_service` | 'SERVICE' | Right 4th | ✅ | Service commitments |
| Image Slides | `web_stories` | 'IMGSLIDES' | Right bottom | ❌ | Image content |
| Normal | (default) | All others | N/A | ❌ | Default view |

---

## Core Features

### Offline PWA (Logged-In Users Only)
- Click refresh icon (bottom-left) → downloads all visible content → green badge when ready
- **Storage**: localStorage (slide metadata) + Cache API (images/audio via service worker)
- **Caching**: Slide text, images, audio, scheduling metadata (videos excluded - too large)
- **Offline Logic**: Service worker serves cached `/` page → React app loads → MainContent detects offline → loads from localStorage
- **Scheduling**: Time-based visibility rules work offline using cached schedule data
- **Updates**: Subsequent clicks update cache with latest content

### Service Worker v2 (Fixed Offline Mode)
- **Cache Strategy**: Network-first with cache fallback
- **Offline Handling**: Serves cached root page when network fails (allows React app to load)
- **No Offline Page**: Removed non-existent `/offline` route (was causing browser offline page)
- **Cache Storage**: App shell, content (JSON), media (images/audio) in separate caches
- **Version**: v2 (bumped to force client updates after offline fix)

### Quick-Add Pattern
- Click mode icon → comment icon appears → modal opens → submit
- API finds/creates row for mode → creates slide with auto-position → reload
- **Files**: `[Name]Modal.tsx`, `/api/slides/[name]-slide/route.ts`, state in `page.tsx`, prop to `RightIconBar.tsx`

### Row-Level Overrides
- `row_background_image_url` - Override slide images for entire row
- `row_layout_type` - Override slide layouts for entire row
- **Priority**: Row → Slide → Default

### Slide Randomization
- Per-row enable/disable with `randomize_enabled`
- Count limit with `randomize_count` (null = all slides)
- Intervals: hourly, daily, weekly
- Deterministic: Same seed = same slides per interval

### User-Specific Rows
- Public (`user_id = null`) - Visible to all users
- Private (`user_id = UUID`) - Visible to owner + admins only
- Auto-refresh on login/logout

### Dynamic Scheduling
- `publish_time_start/end` - Time ranges (supports overnight: 22:00-02:00)
- `publish_days` - JSON array [0-6] (Sunday=0)
- `temp_unpublish_until` - Temporary unpublish with auto-restore

---

## Development Rules

- **50px Border**: Fixed border at z-20 on all pages
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px size, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL queries for performance
- **Auto Position**: Server calculates using `getNextPosition()` - never send on create
- **Optional Fields**: `title`, `body_content`, `subtitle` - use `|| ''` fallback
- **Case Sensitive**: Roles/types are UPPERCASE strings
- **Layout Types**: 'STANDARD' (centered), 'OVERFLOW' (scrollable), 'MINIMAL' (title+audio only)
- **Type Safety**: Offline cache mapping requires explicit type conversions (see MainContent.tsx lines 222-239)

---

## Railway Deployment

**Pre-Deploy Checklist**:
```bash
npm run db:validate    # Verify no pending migrations
npx tsc --noEmit       # TypeScript validation
npm run build          # Test production build
git push origin master # Deploy
```

**Migrations**:
- Auto-run via `railway-init.ts` on deployment
- Use `IF NOT EXISTS` for all schema changes
- Register in `validate-migrations.ts` for validation

**Git Ignore**:
- `_TEMP/` directory excluded (contains MP3s and project files)
- `.env*` files excluded
- Media files NOT deployed (referenced via URLs in database)

---

## API Routes

All routes return: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

**Auth**:
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session
- `POST /api/setup` - Create first admin (one-time only)

**Rows**:
- `GET /api/slides/rows?published=true` - Fetch published rows
- `POST /api/slides/rows` - Create row
- `PATCH /api/slides/rows/[id]` - Update row
- `DELETE /api/slides/rows/[id]` - Delete row

**Slides**:
- `GET /api/slides/rows/[id]/slides?published=true` - Fetch row slides
- `POST /api/slides/rows/[id]/slides` - Create slide
- `PATCH /api/slides/rows/[id]/slides/[slideId]` - Update slide
- `DELETE /api/slides/rows/[id]/slides/[slideId]` - Delete slide

**Quick-Add**:
- `POST /api/slides/quick-slide` - Create quick slide
- `POST /api/slides/goal-slide` - Create goal slide
- `POST /api/slides/simple-shift-slide` - Create simple shift slide
- `POST /api/slides/service-slide` - Create service slide

---

## Common Workflows

### Adding Quick-Add to New Mode
1. Create `[Name]Modal.tsx` (clone existing modal)
2. Create `/api/slides/[name]-slide/route.ts` (clone existing API)
3. Update `page.tsx`: Import modal, add state `is[Name]ModalOpen`, handlers, props
4. Update `RightIconBar.tsx`: Add prop, contextual icon `{is[Name]Mode && <span>comment</span>}`
5. Test: Mode icon → comment icon → modal → submit → slide created

### Adding New Special Row Mode
1. Create migration adding new row_type to enum
2. Register migration in `validate-migrations.ts`
3. Update `slideRows.ts` row_type union type
4. Update `page.tsx`: Add mode state, handler, pass to RightIconBar
5. Update `RightIconBar.tsx`: Add icon with click handler
6. Update `MainContent.tsx`: Add filter logic, update Normal mode exclusion
7. Validate: `npm run db:validate && npx tsc --noEmit`

### Testing with Production Data
1. Get PUBLIC_URL from Railway dashboard
2. Run `npm run db:download-prod-simple` and provide URL
3. Update `.env`: `DB_NAME="mp3_manager_backup"`
4. Restart dev server
5. Test locally with production data
6. Revert `.env`: `DB_NAME="mp3_manager"`

### Fixing Offline Mode Issues
1. Check service worker registration in browser console
2. Verify localStorage has data: `localStorage.getItem('offline-slide-data')`
3. Check Cache API: DevTools → Application → Cache Storage
4. Unregister old service worker: DevTools → Application → Service Workers → Unregister
5. Hard refresh: Ctrl+Shift+R or Cmd+Shift+R

---

## Recent Updates

**Nov 24, 2025 (Latest)**:
- **Offline PWA Fix** - Service worker v2: Removed non-existent `/offline` page, now serves cached `/` when offline, allows React app to load and detect offline state
- **TypeScript Fixes** - Fixed offline cache type mismatches in MainContent.tsx: Added `view_count`, `completion_count`, proper type conversions for `subtitle`, `layout_type`, `publish_days`, date objects
- **Repository Cleanup** - Added `_TEMP/` to `.gitignore` to prevent MP3 files from being committed

**Nov 24, 2025**:
- **Offline PWA Support** - Service worker, manifest.json, offlineManager.ts, OfflineProgress modal, cache fallback in MainContent, refresh icon handler in BottomIconBar (logged-in users only)
- **Service Quick-Add** - ServiceSlideModal, /api/slides/service-slide, page.tsx, RightIconBar
- **Simple Shift Quick-Add** - SimpleShiftModal, contextual comment icons
- **Production DB Download** - `npm run db:download-prod-simple` script

**Nov 20, 2025**:
- **Row-Level Overrides** - `row_background_image_url`, `row_layout_type` columns
- **Goals Mode** - Goals quick-add functionality

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32` |
| Private rows missing | Check `user_id` - MainContent auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Mode rows not showing | Verify correct `row_type` value (UPPERCASE) in database |
| Row overrides not working | Run `npm run db:validate` to check migrations |
| Database download fails | Use PUBLIC_URL from Railway, not PRIVATE_URL |
| Offline content not loading | User must be logged in. Click refresh icon to download. Check browser console for SW errors. |
| Service worker not updating | Unregister old SW in DevTools → Application → Service Workers → Unregister. Hard refresh. |
| Browser shows offline page | Service worker v2 fixes this. Clear cache, unregister SW, hard refresh. |
| TypeScript errors in MainContent | Offline cache needs explicit type conversions. See lines 222-239 for pattern. |

---

## Code Patterns

**Offline Cache Check** (MainContent.tsx:189-249):
```typescript
if (!isOnline()) {
  const cachedRows = getCachedSlideRows();
  if (cachedRows.length > 0) {
    // Convert cached rows to SlideRow format with proper types
    const rows: SlideRow[] = cachedRows.map(row => ({...}));
    setSlideRows(rows);

    // Pre-populate slides cache with type conversions
    const newSlidesCache: Record<string, Slide[]> = {};
    cachedRows.forEach(row => {
      newSlidesCache[row.id] = row.slides.map(slide => ({
        ...slide,
        subtitle: slide.subtitle || undefined,
        layout_type: (slide.layout_type as 'STANDARD' | 'OVERFLOW' | 'MINIMAL') || 'STANDARD',
        publish_days: slide.publish_days ? JSON.stringify(slide.publish_days) : null,
        view_count: 0,
        completion_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }));
    });
    setSlidesCache(newSlidesCache);
  }
}
```

**Offline Download** (page.tsx):
```typescript
await downloadContentForOffline((progress) => {
  setOfflineProgress(progress); // Update UI with progress
});
```

**Service Worker Offline Handling** (service-worker.js:105-118):
```javascript
.catch(() => {
  // Serve cached root page when network fails
  if (url.pathname === '/') {
    return caches.match('/').then((rootResponse) => {
      return rootResponse || new Response('Offline', { status: 503 });
    });
  }
  return new Response('Offline', { status: 503 });
});
```

**Contextual Icon Display** (RightIconBar.tsx):
```typescript
{isServiceMode && <span onClick={onServiceSlideClick}>comment</span>}
```

**Quick-Add API Pattern**:
```typescript
const rows = await getSlideRowsByType('SERVICE', false);
let row = rows[0] || await createSlideRow({ row_type: 'SERVICE', ... });
const position = await getNextPosition(row.id);
const slide = await createSlide({ slide_row_id: row.id, position, ... });
return { status: 'success', data: { slide } };
```

**Row Override Logic** (MainContent.tsx):
```typescript
const effectiveImageUrl = row.row_background_image_url || slide.image_url;
const effectiveLayout = row.row_layout_type || slide.layout_type || 'STANDARD';
```

---

**Status**: Production Ready + PWA (Offline Fixed) | **Last Updated**: November 24, 2025 | **Lines**: 398
