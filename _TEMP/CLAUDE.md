# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: January 17, 2025

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npx tsc --noEmit         # TypeScript validation
npm run db:validate      # Check pending migrations
```

**URLs**: http://localhost:3000/ | /admin | /login | /setup

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **Authentication**: NextAuth.js 4.24.13 (JWT, 30-day sessions)
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols

---

## Architecture

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20), square UI
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme overlay
- **User-Specific Content**: Private rows visible only to assigned users
- **Auth-Gated Icons**: Private features hidden unless authenticated
- **Slide Counter**: Top bar displays current/total slides (e.g., "3/12")

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)

---

## Database Schema

**users**: `id`, `name`, `email`, `password_hash`, `role` ('ADMIN'|'USER'|'MODERATOR')

**slide_rows**: `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id` (nullable - private row owner)

**slides**: `id`, `slide_row_id`, `title` (nullable), `subtitle`, `body_content` (nullable), `position`, `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL'), `audio_url`, `image_url`, `video_url`, `content_theme` ('light'|'dark'|null), `title_bg_opacity`, `is_published`, `publish_time_start/end`, `publish_days` (JSON), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start/end`, `publish_days` (JSON)

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend, state management, slide counter
- `src/components/MainContent.tsx` - Slide rendering, user filtering, swiper callbacks
- `src/components/TopIconBar.tsx` - Top icon bar with slide counter display
- `src/components/Providers.tsx` - SessionProvider + ThemeProvider

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slideRows.ts` - Row CRUD + user filtering
- `src/lib/queries/slides.ts` - Slide CRUD + `getNextPosition()`
- `src/lib/queries/users.ts` - User management

### Admin Components
- `src/components/admin/slides/SlideEditor.tsx` - Slide editor
- `src/components/admin/slides/SlideRowForm.tsx` - Row editor + user assignment

---

## Environment Variables

```env
# Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mp3_manager"
DB_USER="postgres"
DB_PASSWORD="your-password"

# Authentication (CRITICAL)
NEXTAUTH_SECRET="<strong-32-char-secret>"  # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"       # Production: https://your-app.railway.app
```

---

## Key Features

### User-Specific Private Rows
- **Public rows** (`user_id = null`): Visible to everyone
- **Private rows** (`user_id = [UUID]`): Visible only to assigned user
- **Admin view**: See ALL rows
- **Implementation**: Server-side filtering in `getAllSlideRows()`

### Authentication Patterns
```typescript
// Server-side
import { requireAuth, requireAdmin } from '@/lib/auth'
const session = await requireAuth()    // Any user
const session = await requireAdmin()   // Admin only

// Client-side
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
{session && <PrivateContent />}
```

### Theme System
```typescript
import { useTheme } from '@/contexts/ThemeContext'
const { theme, toggleTheme } = useTheme()  // 'light' | 'dark'
```
**CSS Variables**: `--text-color`, `--bg-color`, `--card-bg`, `--border-color`, `--icon-color`

### Slide Counter
- **Location**: Top icon bar, next to playlist_play icon
- **Format**: "1/12" (current/total)
- **Updates**: Automatically when scrolling rows or slides
- **State Flow**: MainContent → page.tsx → TopIconBar

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight)
- Day restrictions: `publish_days` [0=Sun, 6=Sat]
- Temporary unpublish: `temp_unpublish_until`

---

## API Routes

### Authentication
```
POST /api/auth/signin     - Login
GET  /api/auth/session    - Current session
POST /api/setup           - Create first admin
```

### Slide Rows
```
GET/POST   /api/slides/rows           - List/create (user-filtered)
PATCH/DELETE /api/slides/rows/[id]    - Update/delete
```

### Slides
```
GET/POST   /api/slides/rows/[id]/slides              - List/create
PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]  - Update/delete
```

### Users (Admin)
```
GET/POST   /api/users        - List/create
PATCH/DELETE /api/users/[id] - Update/delete
```

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Important Rules

- **50px Border**: All pages have fixed 50px border at z-20
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL for performance
- **Position Auto-Calc**: Server uses `getNextPosition()` - never send position on create
- **Optional Fields**: `title`, `body_content`, `subtitle` - always use `|| ''` fallback
- **Roles**: Uppercase ('ADMIN', 'USER', 'MODERATOR')
- **Passwords**: bcrypt hashed, min 8 chars

---

## Railway Deployment

### Pre-Deploy
```bash
npx tsc --noEmit        # 0 TypeScript errors
npm run build           # Pass ESLint
git push origin master  # Auto-deploys to Railway
```

### Environment (Railway)
```env
DATABASE_URL=postgresql://...              # Auto-provided
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>
```

### Database Scripts
```bash
npm run db:seed:admin              # Create admin user
railway run npm run [script]       # Run on Railway DB
```

---

## Recent Updates

### Slide Counter (January 17, 2025)
**Feature**: Visual slide position indicator in top icon bar
**Display**: Shows "1/12" format (current slide / total slides)
**Location**: Top icon bar, right of playlist_play icon
**Behavior**:
- Updates when scrolling slides (horizontal navigation)
- Resets to 1 when switching rows (vertical navigation)
- Always visible when slides are loaded

**Implementation**:
- State management in `page.tsx` (`currentSlideIndex`, `totalSlides`)
- Callback system: MainContent calls `updateSlideCounter(index, total)`
- Display component: `TopIconBar.tsx` with minimal styling
- Uses `var(--icon-color)` for theme consistency

**Files Modified**: 3 files
- `src/app/page.tsx` - State and callback
- `src/components/MainContent.tsx` - Swiper change handlers
- `src/components/TopIconBar.tsx` - Counter display

**Impact**: Users always see their position in the current slide row, improving navigation awareness.

### Optional Slide Title (January 17, 2025)
**Feature**: Slides can be created without titles (image-only slides)
**Changes**: Made `title` nullable, removed validation, conditional rendering
**Files**: 6 files (database, queries, API, admin UI, MainContent)
**Impact**: Slides with just images, audio, video, or body content

### User-Specific Private Rows (January 17, 2025)
**Feature**: Assign slide rows to specific users for personalized content
**Changes**: Added `user_id` column to `slide_rows`, server-side filtering
**Impact**: Users see public rows + assigned private rows. Admins see all.

### Slide Position Auto-Calc (January 17, 2025)
**Fix**: Uses `getNextPosition()` with `MAX(position) + 1`
**Impact**: Reliable slide creation regardless of position gaps

---

## Troubleshooting

**Sessions Not Persisting**: Generate strong `NEXTAUTH_SECRET` with `openssl rand -base64 32`

**Icons Not Showing/Hiding**: All icon bars use `{session && <Icon />}` pattern

**Cannot Access /setup**: Users exist. Use `npm run db:seed:admin` instead

**Deployment Failed (ESLint)**: Run `npx eslint [file]` locally before pushing

**Slide Counter Not Updating**: Check swiper callbacks in MainContent.tsx call `updateSlideCounter()`

---

**Status**: Production Ready | **Last Updated**: January 17, 2025
