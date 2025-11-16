# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 16, 2025

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npx tsc --noEmit         # TypeScript validation
npm run db:validate      # Check migrations
```

**URLs**: http://localhost:3000/ | /admin | /login | /setup | /api/test-db

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **Authentication**: NextAuth.js 4.24.13, bcrypt 6.0.0
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
- **User Management**: Full CRUD at `/admin/users` (admin only)
- **Authentication**: Protected by admin layout, requires login

---

## Database Schema

### slide_rows
`id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `slide_count`, `playlist_delay_seconds`

### slides
- **Core**: `id`, `slide_row_id`, `title`, `subtitle`, `body_content` (OPTIONAL), `position`
- **Layout**: `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL')
- **Media**: `audio_url`, `image_url`, `video_url`
- **Display**: `content_theme` ('light'|'dark'|null), `title_bg_opacity` (0-1), `icon_set` (JSON)
- **Publishing**: `is_published`, `publish_time_start/end`, `publish_days` (JSON [0-6])
- **Temp Unpublish**: `temp_unpublish_until` (ISO timestamp)

### spa_tracks
`id`, `title`, `audio_url`, `is_published`, `display_order`, `volume` (0-100), `publish_time_start/end`, `publish_days` (JSON)

### users
- **Core**: `id` (UUID), `name`, `email` (unique), `password_hash` (bcrypt), `role` ('admin'|'user')
- **Timestamps**: `created_at`, `updated_at`
- **Indexes**: `idx_users_email`, `idx_users_role`

---

## Key API Endpoints

**Slide Rows**: `GET/POST /api/slides/rows` | `GET/PATCH/DELETE /api/slides/rows/[id]` | `POST /api/slides/rows/reorder`

**Slides**: `GET/POST /api/slides/rows/[id]/slides` | `GET/PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]` | `POST /api/slides/rows/[id]/slides/reorder` | `POST /api/slides/rows/[id]/slides/[slideId]/temp-unpublish` | `POST /api/slides/quick-slide` | `POST /api/slides/bulk-publish`

**Spa Mode**: `GET/POST /api/spa/tracks` | `GET/PATCH/DELETE /api/spa/tracks/[id]` | `GET /api/spa/tracks/active`

**User Management**: `GET/POST /api/users` | `GET/PATCH/DELETE /api/users/[id]` | `POST /api/users/[id]/password`

**Authentication**: `POST /api/auth/signin` | `GET /api/auth/signout` | `GET /api/auth/session` | `POST /api/setup`

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

**Protection**: All `/admin/*` routes require authentication. User management endpoints require admin role.

---

## Critical Files

### Frontend Core
- `src/app/page.tsx` - Main page, background state, OverlayLayer
- `src/components/MainContent.tsx` - Slide rendering, caching, navigation
- `src/components/EssentialAudioPlayer.tsx` - HTML5 audio with error handling
- `src/contexts/ThemeContext.tsx` - Global theme (light/dark)
- `src/contexts/SwiperContext.tsx` - Swiper navigation context
- `src/contexts/PlaylistContext.tsx` - Playlist playback management

### Icon Borders (50px all sides)
`TopIconBar.tsx`, `BottomIconBar.tsx`, `RightIconBar.tsx`, `LeftIconBar.tsx`

### Admin Pages
- `src/app/admin/slides/[id]/slide/[slideId]/page.tsx` - Slide editor
- `src/components/admin/slides/SlideEditor.tsx` - Tiptap editor, overlay controls
- `src/components/admin/slides/SlideManager.tsx` - Slide list, schedules, preview
- `src/app/admin/users/page.tsx` - User list
- `src/app/admin/users/new/page.tsx` - Create user
- `src/app/admin/users/[id]/page.tsx` - Edit user + password change

### Database Queries
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slides.ts` - Slide CRUD
- `src/lib/queries/slideRows.ts` - Row CRUD
- `src/lib/queries/spaTracks.ts` - Spa track CRUD
- `src/lib/queries/users.ts` - User CRUD (getAllUsers, createUser, updateUser, deleteUser, updateUserPassword)
- `src/lib/utils/scheduleFilter.ts` - Client-side schedule filtering

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`, `getCurrentUserId()`
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js config (JWT, 30-day sessions)
- `src/types/next-auth.d.ts` - TypeScript augmentation for session with role
- `src/app/login/page.tsx` - Login page
- `src/app/setup/page.tsx` - First-time admin setup
- `src/app/admin/layout.tsx` - Admin route protection

### API Routes
- `src/app/api/slides/rows/[id]/slides/route.ts` - POST/GET slides
- `src/app/api/slides/rows/[id]/slides/[slideId]/route.ts` - GET/PATCH/DELETE slide
- `src/app/api/users/route.ts` - GET/POST users (admin only)
- `src/app/api/users/[id]/route.ts` - GET/PATCH/DELETE user (admin only)
- `src/app/api/users/[id]/password/route.ts` - POST password change (admin only)
- `src/app/api/setup/route.ts` - First-time admin setup

---

## Key Features & Patterns

### Background System
- Full-viewport backgrounds via `image_url` field
- Theme-responsive overlay (white/black), opacity 0-1
- Per-slide theme: `content_theme` = 'light'|'dark'|null (null = use global)
- Z-Stack: Background (z-0) → Overlay (z-1) → Video (z-10) → Content (z-20)
- **Critical**: `initialBackgroundSetRef` prevents race conditions in MainContent.tsx

### Layout Types
- **STANDARD**: Centered content
- **OVERFLOW**: Top-aligned scrollable
- **MINIMAL**: Title + audio only (body_content hidden)

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight)
- Day restrictions: `publish_days` JSON [0=Sun, 6=Sat]
- Client-side filtering: `filterVisibleSlides()` from scheduleFilter.ts

### Authentication & Security
- **Setup**: Visit `/setup` to create first admin (only when 0 users)
- **Login**: `/login` with email/password, redirects to `/admin`
- **Session**: JWT-based, 30-day expiration, HttpOnly cookies
- **Protection**: All `/admin/*` require auth, user management requires admin role
- **Password**: bcrypt (SALT_ROUNDS=10), min 8 chars, never stored plain text
- **Self-Protection**: Cannot delete/demote own account
- **Last Admin**: Cannot delete/demote last admin user

### Quick Slides & Spa Mode
- **Quick Slides**: Comment icon → modal → stored in QUICKSLIDE row
- **ATR Icon**: Toggle all rows / Quick Slides only
- **Spa Mode**: Background music with scheduling, volume control

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw IDs
- Modes: Cover (full-screen) | Contained (60px padding, 16:9)
- Toggle: videocam icon (right sidebar)

---

## Common Code Patterns

### Authentication (Server-Side)
```typescript
import { requireAuth, requireAdmin, getCurrentUserId } from '@/lib/auth'

const session = await requireAuth()        // Any authenticated user
const session = await requireAdmin()       // Admin role only
const userId = await getCurrentUserId()    // Current user's ID
```

### User CRUD
```typescript
import { getAllUsers, createUser, updateUserPassword } from '@/lib/queries/users'

const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Auto-hashed
  role: 'admin'
})

await updateUserPassword(userId, newPassword)  // Auto-hashed
```

### Schedule Filtering
```typescript
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter'
const visibleSlides = filterVisibleSlides(allSlides)
```

### Update Active Slide
```typescript
const updateActiveSlideData = (slide: Slide | null) => {
  if (slide) {
    setActiveSlideImageUrl(slide.image_url || null);
    setActiveSlideVideoUrl(slide.video_url || null);
    setActiveSlideOverlayOpacity(Number(slide.title_bg_opacity) || 0);
    setActiveSlideContentTheme(slide.content_theme || null);
  }
}
```

### Safe Body Content Rendering
```typescript
dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}  // ALWAYS use fallback
```

### Swiper Registration
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

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here  # Generate: openssl rand -base64 32
```

### Railway (Production)
```env
DATABASE_URL=postgresql://...  # Auto-provided
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your_production_secret  # Different from dev!
```

---

## Deployment (Railway)

### Pre-Deploy Checklist
```bash
npm run db:validate     # Check migrations
npx tsc --noEmit        # 0 TypeScript errors
npm run build           # Test production build (stop dev server first)
npm run lint            # 0 errors (warnings OK)
```

### Pipeline
1. Git push → Railway webhook
2. Nixpacks detects Node.js 18
3. `npm ci` → `npm run build` → `npm run start`
4. `railway-init.ts` runs migrations (idempotent)
5. Health check: `/api/test-db`

---

## Recent Updates

### User Authentication System (Nov 16, 2025)
**Change**: Complete user account and authentication system
**Features**: NextAuth.js JWT auth, first-time setup `/setup`, login `/login`, admin route protection, user management `/admin/users`, bcrypt passwords, self-protection, last admin protection
**Impact**: Main app public, admin requires login, 19 files created, 6 modified, zero breaking changes

### Optional Body Content (Nov 15, 2025)
**Change**: `body_content` now optional for slides
**Why**: Enable slides with just title + media (useful for MINIMAL layout)
**Critical**: ALWAYS use `|| ''` fallback when rendering: `slide.body_content || ''`

### Publishing Settings on Slide Creation (Nov 15, 2025)
**Fix**: Schedule fields now included in POST `/api/slides/rows/[id]/slides`

### Background Image Isolation (Nov 15, 2025)
**Fix**: `initialBackgroundSetRef` prevents backgrounds persisting across slides

### Content Theme NULL Handling (Nov 15, 2025)
**Fix**: "Use Global Theme" now saves correctly (null vs undefined handling)

---

## Important Notes

- **50px Border**: All pages, no exceptions (z-20)
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px, weight 100, `var(--icon-color)`
- **Media Storage**: `/public/media/`, `/public/media/slides/[row-id]/`
- **No ORM**: Direct PostgreSQL for performance
- **Position**: Server auto-calculates (don't send on create)
- **Null vs Undefined**: Use `null` for "use global theme", check with `'field' in data`
- **Body Content**: Optional - ALWAYS use `|| ''` fallback when rendering
- **Audio URLs**: Must be audio formats (.mp3, .wav, .ogg) - NOT images
- **Background Isolation**: `initialBackgroundSetRef` prevents race conditions
- **Authentication**: Main (`/`) is public, `/admin/*` requires login
- **Passwords**: Never plain text, bcrypt hashed, min 8 chars
- **First Setup**: Visit `/setup` when database has zero users

---

## Troubleshooting

### Login Not Working
- Check: NEXTAUTH_SECRET in `.env`
- Check: User exists: `SELECT * FROM users WHERE email = 'your@email.com';`
- Fix: Use `/setup` if no users exist
- Debug: Browser console + server logs

### Cannot Access Admin Panel
- Expected: `/admin` → `/login` when not authenticated
- Check: Session: `GET /api/auth/session`
- Check: Role is 'admin' not 'user'

### Cannot Delete/Demote User
- Expected: Cannot delete/demote self or last admin
- Fix: Create another admin first

### Background Images Persisting
- Check: Console for "Skipping initial background set"
- Fix: Verify `initialBackgroundSetRef` in MainContent.tsx:181-183

### Audio Errors
- Codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=NOT_SUPPORTED
- Check: Console shows error with URL, slide ID
- Fix: Verify `audio_url` is valid audio file, not image
- SQL: `UPDATE slides SET audio_url = NULL WHERE id = 'slide-id';`

### Body Content Missing/Empty
- Expected: Slides can have empty body_content
- Fix: Ensure using `|| ''` fallback: `slide.body_content || ''`

---

## Navigation Icons

**Main App**: home (/) | spa (music) | settings (/login) | contrast (theme) | atr (Quick Slides) | comment (new Quick Slide) | videocam (video mode) | arrows (navigation)

**Admin**: dashboard (/) | description (/admin/slides) | spa (/admin/spa) | group (/admin/users) | media (external) | logout (sign out) | contrast (theme)

---

**Status**: Production Ready | **Last Updated**: November 16, 2025 | **Lines**: 340
