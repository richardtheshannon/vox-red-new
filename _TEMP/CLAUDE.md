# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 17, 2025

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

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20), square UI
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme overlay
- **User-Specific Content**: Private rows visible only to assigned users
- **Slide Counter**: Top bar displays current/total slides (e.g., "3/12")
- **Randomization**: Time-based random slide selection per row

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)
- **Randomization Controls**: Enable, set count, select interval (hourly/daily/weekly)

---

## Database Schema (Essential)

**users**: `id`, `name`, `email`, `password_hash`, `role` ('ADMIN'|'USER'|'MODERATOR')

**slide_rows**: `id`, `title`, `description`, `row_type`, `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id` (nullable), `randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`

**slides**: `id`, `slide_row_id`, `title` (nullable), `subtitle`, `body_content` (nullable), `position`, `layout_type`, `audio_url`, `image_url`, `video_url`, `content_theme`, `title_bg_opacity`, `is_published`, `publish_time_start/end`, `publish_days` (JSON), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start/end`, `publish_days` (JSON)

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend, state management
- `src/components/MainContent.tsx` - Slide rendering, randomization, filtering
- `src/components/Providers.tsx` - SessionProvider + ThemeProvider

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slideRows.ts` - Row CRUD + user filtering + randomization fields
- `src/lib/queries/slides.ts` - Slide CRUD + `getNextPosition()`
- `src/lib/queries/users.ts` - User management

### Utilities
- `src/lib/utils/scheduleFilter.ts` - Time/day-based slide filtering
- `src/lib/utils/slideRandomizer.ts` - Seeded random slide selection

### Admin Components
- `src/components/admin/slides/SlideEditor.tsx` - Slide editor
- `src/components/admin/slides/SlideRowForm.tsx` - Row editor + randomization controls

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

### Slide Randomization (NEW - Jan 17, 2025)
- **Admin Control**: Enable per-row randomization with count and interval
- **Intervals**: Hourly, daily, or weekly re-randomization
- **Deterministic**: Same slides within time window (uses seeded random)
- **Integration**: Works seamlessly with schedule filtering
- **Implementation**: `slideRandomizer.ts` - Fisher-Yates shuffle with time-based seed

```typescript
// In MainContent.tsx
const slides = getSlidesForRow(rowId) // Applies schedule filter + randomization
// Uses applyRandomization(slides, enabled, count, interval) internally
```

### User-Specific Private Rows
- **Public rows** (`user_id = null`): Visible to everyone
- **Private rows** (`user_id = [UUID]`): Visible only to assigned user
- **Admin view**: See ALL rows
- **Implementation**: Server-side filtering in `getAllSlideRows()`
- **Auto-Refresh**: MainContent monitors `sessionStatus` and auto-refetches rows on login/logout

### Dynamic Scheduling
- **Time windows**: `publish_time_start/end` (supports overnight)
- **Day restrictions**: `publish_days` [0=Sun, 6=Sat]
- **Temporary unpublish**: `temp_unpublish_until`
- **Filter**: `filterVisibleSlides()` in `scheduleFilter.ts`

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

---

## API Routes (Response Format)

`{ status: 'success'|'error', data?: {...}, message?: '...' }`

### Authentication
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Current session
- `POST /api/setup` - Create first admin

### Slide Rows
- `GET/POST /api/slides/rows` - List/create (user-filtered)
- `PATCH/DELETE /api/slides/rows/[id]` - Update/delete (includes randomization fields)

### Slides
- `GET/POST /api/slides/rows/[id]/slides` - List/create
- `PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]` - Update/delete

### Users (Admin)
- `GET/POST /api/users` - List/create
- `PATCH/DELETE /api/users/[id]` - Update/delete

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
- **Randomization**: Count must be >= 1, interval must be 'hourly'|'daily'|'weekly'

---

## Railway Deployment

### Pre-Deploy Validation
```bash
npm run db:validate     # Must show "Ready to deploy to Railway!"
npx tsc --noEmit        # Must show 0 TypeScript errors
npm run build           # Must pass ESLint
git push origin master  # Auto-deploys to Railway
```

### Environment (Railway)
```env
DATABASE_URL=postgresql://...              # Auto-provided
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>
```

### Migration System
- All migrations auto-run via `railway-init.ts`
- Migrations use `IF NOT EXISTS` for safety
- Registered in `validate-migrations.ts` for verification
- Manual run: `railway run npm run db:seed:admin` (creates admin user)

---

## Recent Updates

### Session Auto-Refresh on Login (November 17, 2025)
**What**: User-assigned rows appear immediately after login (no hard refresh needed)
**Why**: Fix UX issue where users had to manually refresh to see private rows after logging in
**How**: MainContent monitors `sessionStatus` from NextAuth, refetches rows when status changes
**Files Modified**: `MainContent.tsx` (added `useSession` hook, sessionStatus dependency in fetch effect)
**Impact**: Improved UX - seamless transition from public to personalized content upon authentication

### Slide Randomization (January 17, 2025)
**What**: Per-row randomization with time-based intervals (hourly/daily/weekly)
**Files**: `slideRandomizer.ts`, `SlideRowForm.tsx`, `MainContent.tsx`
**Database**: 4 new columns (`randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`)

### User-Specific Private Rows (January 17, 2025)
**What**: Assign rows to specific users for personalized content
**How**: `user_id` column on `slide_rows`, server-side filtering in `getAllSlideRows()`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET` with `openssl rand -base64 32` |
| Private rows not appearing after login | Fixed (Nov 17, 2025) - MainContent now auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Deployment failed (ESLint) | Run `npx eslint [file]` locally before pushing |
| Randomization not working | Verify `randomize_enabled=true`, count >= 1, valid interval |

---

## Development Workflow

### Adding New Feature
1. **Database**: Create migration in `scripts/migrations/`
2. **Runner**: Create runner script like `run-[feature]-migration.ts`
3. **Register**: Add to `railway-init.ts` and `validate-migrations.ts`
4. **Types**: Update interfaces in `src/lib/queries/`
5. **API**: Add validation in API routes
6. **UI**: Update admin forms and frontend components
7. **Validate**: Run `npm run db:validate` and `npx tsc --noEmit`

### Before Deployment
```bash
npm run db:validate     # ✅ All migrations up to date
npx tsc --noEmit        # ✅ 0 TypeScript errors
npm run build           # ✅ Pass ESLint
# Update this CLAUDE.md file if significant changes
git add . && git commit -m "Description" && git push
```

---

## Code Patterns

### Randomization Usage
```typescript
// Admin Form (SlideRowForm.tsx)
const [formData, setFormData] = useState({
  randomize_enabled: false,
  randomize_count: null,
  randomize_interval: null,
})

// Frontend (MainContent.tsx)
import { applyRandomization } from '@/lib/utils/slideRandomizer'
const visibleSlides = filterVisibleSlides(allSlides)
const finalSlides = applyRandomization(
  visibleSlides,
  row.randomize_enabled,
  row.randomize_count,
  row.randomize_interval
)
```

### Schedule Filtering
```typescript
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter'
const visibleSlides = filterVisibleSlides(allSlides) // Filters by time/day
```

### User Filtering
```typescript
// Server-side
const rows = await getAllSlideRows(publishedOnly, userId, isAdmin)
// Returns public rows + user's private rows (or all if admin)
```

---

**Status**: Production Ready | **Lines**: 236/500 ✅ | **Last Updated**: November 17, 2025
