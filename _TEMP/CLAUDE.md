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
- **PWA**: Service Worker, Cache API, Web App Manifest (offline support)
- **Deployment**: Railway (auto-deploy on push to master)

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20), square UI everywhere
- **Dual Swiper Navigation**: Vertical (rows) + Horizontal (slides)
- **Background System**: Full-viewport images with theme overlay
- **6 Special Modes**: Quick Slides, Goals, Simple Shifts, Service, Image Slides, Normal (mutually exclusive)
- **Quick-Add Feature**: Comment icon appears contextually in Quick Slides, Goals, Simple Shifts, and Service modes
- **User-Specific Content**: Private rows visible only to assigned users
- **Offline PWA**: Logged-in users can download content for offline use (click refresh icon)

### Admin (/admin)
- **Protected**: Authentication + admin role required
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Row Overrides**: Background images and layout types at row level
- **Randomization**: Per-row with hourly/daily/weekly intervals

---

## Database Schema

**users**: `id`, `name`, `email`, `password_hash`, `role` (ADMIN|USER|MODERATOR)

**slide_rows**: `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id`, `randomize_*`, `row_background_image_url`, `row_layout_type`
- **row_type**: ROUTINE | COURSE | TEACHING | CUSTOM | QUICKSLIDE | SIMPLESHIFT | IMGSLIDES | SERVICE | GOALS

**slides**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type` (STANDARD|OVERFLOW|MINIMAL), `audio_url`, `image_url`, `video_url`, `content_theme` (light|dark), `title_bg_opacity`, `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON [0-6]), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_*`, `publish_days` (JSON [0-6])

---

## Key Files

**Frontend**: `page.tsx` (state/modes), `MainContent.tsx` (rendering/filtering/offline), `RightIconBar.tsx` (mode icons), `BottomIconBar.tsx` (refresh/offline), `[Name]Modal.tsx` (Quick/Goal/SimpleShift/Service), `OfflineProgress.tsx` (download UI)

**Backend**: `lib/db.ts` (connection), `lib/auth.ts` + `lib/authOptions.ts` (auth), `lib/queries/slideRows.ts` (row CRUD), `lib/queries/slides.ts` (slide CRUD), `lib/utils/scheduleFilter.ts` (time filtering), `lib/utils/slideRandomizer.ts` (randomization), `lib/offlineManager.ts` (offline cache)

**PWA**: `public/manifest.json`, `public/service-worker.js` (caching/offline)

**API Quick-Add Routes**: `/api/slides/{quick-slide,goal-slide,simple-shift-slide,service-slide}/route.ts`

**Admin**: `components/admin/slides/SlideRowForm.tsx` (row edit with overrides)

**Deployment**: `scripts/railway-init.ts` (auto-migrations), `scripts/validate-migrations.ts`, `scripts/download-production-db-simple.ts`

---

## Environment Variables

```env
# Local Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mp3_manager"              # Use "mp3_manager_backup" for production testing
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

**Quick-Add Pattern**: When mode is active, `comment` icon appears below mode icon → opens modal → creates slide in that row type

---

## Core Features

**Offline PWA (Logged-In Users Only)**:
- Click refresh icon (bottom-left) → downloads all visible content → green badge when ready
- Caches: slide text, images, audio, scheduling metadata (videos excluded - too large)
- Offline scheduling logic: time-based visibility rules work offline
- Auto-fallback: network fetch fails → uses cached data
- Storage: localStorage (slide data) + Cache API (media assets)
- Toggle: first click = download, subsequent = update

**Quick-Add**: Click mode icon → comment icon appears → modal opens → submit → API finds/creates row → creates slide → reload
- Pattern: `[Name]Modal.tsx`, `/api/slides/[name]-slide/route.ts`, state in `page.tsx`, prop to `RightIconBar.tsx`

**Row-Level Overrides**: `row_background_image_url`, `row_layout_type` override slide settings (Priority: Row → Slide → Default)

**Slide Randomization**: Per-row enable/disable, count limit, hourly/daily/weekly intervals, deterministic (same seed = same slides)

**User-Specific Rows**: Public (`user_id = null`) visible to all, Private (`user_id = UUID`) visible to user + admins, auto-refresh on login/logout

**Dynamic Scheduling**: `publish_time_start/end` (overnight support), `publish_days` [0-6], `temp_unpublish_until`

---

## API Routes

All return: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

**Auth**: `POST /api/auth/signin`, `GET /api/auth/session`, `POST /api/setup` (first admin only)
**Rows**: `GET/POST /api/slides/rows`, `PATCH/DELETE /api/slides/rows/[id]`
**Slides**: `GET/POST /api/slides/rows/[id]/slides`, `PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]`
**Quick-Add**: `POST /api/slides/{quick-slide,goal-slide,simple-shift-slide,service-slide}` (auto-finds/creates row)

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

---

## Railway Deployment

**Pre-Deploy**: `npm run db:validate && npx tsc --noEmit && npm run build` → `git push origin master`
**Migrations**: Auto-run via `railway-init.ts`, use `IF NOT EXISTS`, register in `validate-migrations.ts`

---

## Common Workflows

### Adding Quick-Add to New Mode
1. Create `[Name]Modal.tsx` (clone existing) + `/api/slides/[name]-slide/route.ts`
2. Update `page.tsx`: Import, add state `is[Name]ModalOpen`, handlers, prop to RightIconBar, JSX
3. Update `RightIconBar.tsx`: Add prop, contextual icon `{is[Name]Mode && <span>comment</span>}`

### Adding New Special Row Mode
1. Create migration + register in `validate-migrations.ts`
2. Update `slideRows.ts` row_type union, `page.tsx` state/handler, `RightIconBar.tsx` icon
3. Add filter in `MainContent.tsx`, update Normal mode exclusion
4. Validate: `npm run db:validate && npx tsc --noEmit`

### Testing with Production Data
1. Get PUBLIC_URL from Railway → `npm run db:download-prod-simple`
2. Set `.env`: `DB_NAME="mp3_manager_backup"` → restart → test → revert

---

## Recent Updates

**Nov 24, 2025**: **Offline PWA Support** - Service worker, manifest.json, offlineManager.ts, OfflineProgress modal, cache fallback in MainContent, refresh icon handler in BottomIconBar (logged-in users only)
**Dec 24, 2025**: Service quick-add (ServiceSlideModal, /api/slides/service-slide, page.tsx, RightIconBar)
**Nov 24, 2025**: Simple Shift quick-add, Production DB download (`npm run db:download-prod-simple`), Contextual comment icons
**Nov 20, 2025**: Row-level overrides (`row_background_image_url`, `row_layout_type`), Goals mode

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32` |
| Private rows missing | Check `user_id` - MainContent auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Mode rows not showing | Verify correct `row_type` value in database |
| Row overrides not working | Run `npm run db:validate` to check migrations |
| Database download fails | Use PUBLIC_URL from Railway, not PRIVATE_URL |
| Offline content not loading | Check browser console for SW registration, verify localStorage has data |
| Service worker not updating | Unregister old SW in DevTools → Application → Service Workers |

---

## Code Patterns

**Offline Cache Check** (MainContent.tsx):
```typescript
if (!isOnline()) {
  const cachedRows = getCachedSlideRows();
  // Use cached data, apply scheduling filters client-side
}
```

**Offline Download** (page.tsx):
```typescript
await downloadContentForOffline((progress) => {
  setOfflineProgress(progress); // Update UI with progress
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
```

**Row Override Logic** (MainContent.tsx):
```typescript
const effectiveImageUrl = row.row_background_image_url || slide.image_url;
const effectiveLayout = row.row_layout_type || slide.layout_type || 'STANDARD';
```

---

**Status**: Production Ready + PWA | **Last Updated**: November 24, 2025 | **Lines**: 243
