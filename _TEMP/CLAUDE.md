# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation (PWA)
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 25, 2025

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
- **Authentication**: NextAuth.js 4.24.13 (JWT, 30-day sessions) + Offline Auth (PBKDF2)
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols
- **PWA**: Service Worker v2, Cache API, Web App Manifest, Offline Login
- **Deployment**: Railway (auto-deploy on push to master)

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20), square UI everywhere
- **Dual Swiper Navigation**: Vertical (rows) + Horizontal (slides)
- **Background System**: Full-viewport images with theme overlay
- **6 Special Modes**: Quick Slides, Goals, Simple Shifts, Service, Image Slides, Normal
- **User-Specific Content**: Private rows visible only to assigned users
- **Offline PWA**: Content + authentication work completely offline

### Admin (/admin)
- **Protected**: Authentication + admin role required
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Row Overrides**: Background images and layout types at row level
- **Randomization**: Per-row with hourly/daily/weekly intervals

---

## Database Schema

**users**: `id`, `name`, `email`, `password_hash`, `role` (ADMIN|USER|MODERATOR)

**slide_rows**: `id`, `title`, `row_type`, `is_published`, `display_order`, `playlist_delay_seconds`, `user_id`, `randomize_enabled`, `randomize_count`, `randomize_interval`, `row_background_image_url`, `row_layout_type`
- **row_type**: ROUTINE | COURSE | TEACHING | CUSTOM | QUICKSLIDE | SIMPLESHIFT | IMGSLIDES | SERVICE | GOALS

**slides**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content`, `position`, `layout_type` (STANDARD|OVERFLOW|MINIMAL), `audio_url`, `image_url`, `video_url`, `content_theme`, `is_published`, `publish_time_start`, `publish_time_end`, `publish_days` (JSON), `temp_unpublish_until`

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start`, `publish_time_end`, `publish_days`

---

## Key Files

**Authentication**:
- `lib/authOptions.ts` - NextAuth configuration (JWT sessions)
- `lib/offlineAuth.ts` - Offline credential caching (PBKDF2, Web Crypto API)
- `components/LoginModal.tsx` - Dual-mode login (online/offline)
- `components/LogoutModal.tsx` - Clears offline auth cache
- `components/Providers.tsx` - Auto-caches credentials after online login

**Frontend**:
- `page.tsx` - State management, mode handling
- `MainContent.tsx` - Rendering, filtering, offline cache fallback
- `RightIconBar.tsx` - Mode icons, quick-add triggers
- `BottomIconBar.tsx` - Refresh/offline download icon

**Backend**:
- `lib/db.ts` - Database connection
- `lib/queries/slideRows.ts` - Row CRUD operations
- `lib/queries/slides.ts` - Slide CRUD, type definitions
- `lib/offlineManager.ts` - Offline content cache (localStorage + Cache API)

**PWA**:
- `public/service-worker.js` - Service worker v2 (caching, offline fallback)
- `public/manifest.json` - PWA manifest

**API Routes**:
- `/api/slides/rows` - Row CRUD
- `/api/slides/rows/[id]/slides` - Slide CRUD
- `/api/slides/{quick-slide,goal-slide,simple-shift-slide,service-slide}` - Quick-add

---

## Special Row Modes

All modes are **mutually exclusive** - only one active at a time.

| Mode | Icon | row_type | Quick-Add | Use Case |
|------|------|----------|-----------|----------|
| Quick Slides | `atr` | 'QUICKSLIDE' | ✅ | Temporary one-off slides |
| Goals | `things_to_do` | 'GOALS' | ✅ | Goal tracking |
| Simple Shifts | `move_up` | 'SIMPLESHIFT' | ✅ | Daily practices |
| Service | `room_service` | 'SERVICE' | ✅ | Service commitments |
| Image Slides | `web_stories` | 'IMGSLIDES' | ❌ | Image content |
| Normal | (default) | All others | ❌ | Default view |

---

## Core Features

### Offline Authentication (NEW - Nov 25, 2025)
- **Online Login**: Credentials cached using PBKDF2 (100k iterations) + random salt
- **Offline Login**: Verify against cached hash, create synthetic NextAuth session
- **Storage**: localStorage (`offline-auth-data`) with user session data
- **Security**: No plain passwords stored, only salted hashes
- **Expiration**: 30-day TTL (matches NextAuth session duration)
- **Auto-Clear**: Removed on logout or expiration
- **Flow**:
  1. Online login → NextAuth verifies → cache credentials
  2. Offline login → verify cached hash → restore session
  3. Access private content offline with full authentication

### Offline PWA (Content Caching)
- Click refresh icon → downloads all visible content → green badge when ready
- **Storage**: localStorage (metadata) + Cache API (images/audio)
- **Caching**: Slide text, images, audio, scheduling metadata (videos excluded)
- **Service Worker**: Serves cached `/` page when network fails
- **Scheduling**: Time-based visibility rules work offline

### Row-Level Overrides
- `row_background_image_url` - Override slide images for entire row
- `row_layout_type` - Override slide layouts for entire row
- **Priority**: Row → Slide → Default

### Dynamic Scheduling
- `publish_time_start/end` - Time ranges (supports overnight: 22:00-02:00)
- `publish_days` - JSON array [0-6] (Sunday=0)
- `temp_unpublish_until` - Temporary unpublish with auto-restore

### User-Specific Rows
- Public (`user_id = null`) - Visible to all users
- Private (`user_id = UUID`) - Visible to owner + admins only
- Auto-refresh on login/logout

---

## Development Rules

- **50px Border**: Fixed border at z-20 on all pages
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px size, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL queries for performance
- **Auto Position**: Server calculates using `getNextPosition()` - never send on create
- **Case Sensitive**: Roles/types are UPPERCASE strings
- **Layout Types**: 'STANDARD' (centered), 'OVERFLOW' (scrollable), 'MINIMAL' (title+audio only)

---

## Railway Deployment

**Pre-Deploy Checklist**:
```bash
npm run db:validate    # Verify no pending migrations
npx tsc --noEmit       # TypeScript validation
npm run build          # Test production build (skip if dev server running)
git push origin master # Deploy
```

**Migrations**:
- Auto-run via `railway-init.ts` on deployment
- Use `IF NOT EXISTS` for all schema changes
- Register in `validate-migrations.ts` for validation

**Git Ignore**:
- `_TEMP/` directory excluded
- `.env*` files excluded
- Media files NOT deployed (URLs in database)

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

## Common Workflows

### Testing Offline Authentication
1. **Online Login**: Login at http://localhost:3000/ → credentials cached
2. **Verify Cache**: DevTools → Application → localStorage → `offline-auth-data`
3. **Go Offline**: DevTools → Network → Offline
4. **Logout**: Click logout → cache cleared
5. **Login Offline**: Should fail (no cached credentials)
6. **Go Online**: Login again → cache refreshed
7. **Go Offline Again**: Login should work with cached credentials
8. **Access Private Content**: User-specific rows should be visible offline

### Adding Quick-Add to New Mode
1. Create `[Name]Modal.tsx` (clone existing modal)
2. Create `/api/slides/[name]-slide/route.ts` (clone existing API)
3. Update `page.tsx`: Import modal, add state, handlers, props
4. Update `RightIconBar.tsx`: Add contextual icon with click handler
5. Test: Mode icon → comment icon → modal → submit → slide created

### Testing with Production Data
1. Get PUBLIC_URL from Railway dashboard
2. Run `npm run db:download-prod-simple` and provide URL
3. Update `.env`: `DB_NAME="mp3_manager_backup"`
4. Restart dev server
5. Test locally with production data
6. Revert `.env`: `DB_NAME="mp3_manager"`

---

## API Routes

All routes return: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

**Auth**:
- `POST /api/auth/signin` - User login (online only, triggers offline cache)
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

## Recent Updates

**Nov 25, 2025 (Latest)**:
- ✅ **Offline Authentication** - PBKDF2-based credential caching (100k iterations)
  - Added `lib/offlineAuth.ts` - Secure credential hashing with Web Crypto API
  - Updated `LoginModal.tsx` - Dual-mode login (online/offline detection)
  - Updated `Providers.tsx` - Auto-cache credentials after online login
  - Updated `LogoutModal.tsx` - Clear auth cache on logout
  - 30-day expiration matching NextAuth session duration
  - Users can now login and access private content completely offline

**Nov 24, 2025**:
- **Offline PWA Fix** - Service worker v2: Serves cached `/` when offline
- **TypeScript Fixes** - Fixed offline cache type mismatches in MainContent.tsx
- **Repository Cleanup** - Added `_TEMP/` to `.gitignore`
- **Offline PWA Support** - Service worker, manifest.json, offlineManager.ts
- **Service Quick-Add** - ServiceSlideModal, /api/slides/service-slide
- **Simple Shift Quick-Add** - SimpleShiftModal, contextual comment icons

**Nov 20, 2025**:
- **Row-Level Overrides** - `row_background_image_url`, `row_layout_type` columns
- **Goals Mode** - Goals quick-add functionality

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32` |
| Cannot login offline | Must login online first to cache credentials. Check localStorage for `offline-auth-data` |
| Offline login fails | Verify credentials cached. Check DevTools console for `[OfflineAuth]` logs |
| Cached credentials expired | 30-day limit. Login online again to refresh cache |
| Private rows missing offline | User must download content while logged in (refresh icon) |
| Service worker not updating | Unregister old SW in DevTools → Service Workers → Unregister. Hard refresh |
| Database download fails | Use PUBLIC_URL from Railway, not PRIVATE_URL |
| TypeScript errors | Run `npx tsc --noEmit` to check. See MainContent.tsx:222-239 for offline cache type pattern |

---

## Code Patterns

### Offline Authentication Flow (offlineAuth.ts)
```typescript
// Store credentials after online login
await storeOfflineAuthData(userId, name, email, role, password);
// PBKDF2 hash with 100k iterations + random salt stored in localStorage

// Verify offline login
const session = await verifyOfflineCredentials(email, password);
// Returns synthetic NextAuth session if hash matches

// Clear on logout
clearOfflineAuthData();
```

### Offline Content Loading (MainContent.tsx)
```typescript
if (!isOnline()) {
  const cachedRows = getCachedSlideRows();
  if (cachedRows.length > 0) {
    // Convert cached rows to SlideRow format
    setSlideRows(rows);
    setSlidesCache(newSlidesCache);
  }
}
```

### Dual-Mode Login (LoginModal.tsx)
```typescript
const online = isOnline();

if (!online) {
  // Offline: Verify against cached credentials
  const offlineSession = await verifyOfflineCredentials(email, password);
  if (offlineSession) {
    await update(offlineSession); // Update NextAuth session
    window.location.reload();
  }
} else {
  // Online: Standard NextAuth flow
  const result = await signIn('credentials', { email, password });
  if (result?.ok) {
    // Queue credential caching via sessionStorage
    sessionStorage.setItem('pending-offline-cache', JSON.stringify({ email, password }));
    window.location.reload();
  }
}
```

### Auto-Cache After Login (Providers.tsx)
```typescript
useEffect(() => {
  const pendingCache = sessionStorage.getItem('pending-offline-cache');
  if (pendingCache && session?.user) {
    const { email, password } = JSON.parse(pendingCache);
    await storeOfflineAuthData(session.user.id, session.user.name, email, session.user.role, password);
    sessionStorage.removeItem('pending-offline-cache');
  }
}, [session]);
```

---

**Status**: Production Ready + Offline Auth | **Last Updated**: November 25, 2025 | **Lines**: 370
