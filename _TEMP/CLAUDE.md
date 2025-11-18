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
- **Special Modes**: Quick Slides (atr icon), Simple Shifts (move_up icon)

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)
- **Randomization Controls**: Enable, set count, select interval (hourly/daily/weekly)

---

## Database Schema (Essential)

**users**: `id`, `name`, `email`, `password_hash`, `role` ('ADMIN'|'USER'|'MODERATOR')

**slide_rows**: `id`, `title`, `description`, `row_type` ('ROUTINE'|'COURSE'|'TEACHING'|'CUSTOM'|'QUICKSLIDE'|'SIMPLESHIFT'), `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id` (nullable), `randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`

**slides**: `id`, `slide_row_id`, `title` (nullable), `subtitle`, `body_content` (nullable), `position`, `layout_type`, `audio_url`, `image_url`, `video_url`, `content_theme`, `title_bg_opacity`, `is_published`, `publish_time_start/end`, `publish_days` (JSON), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start/end`, `publish_days` (JSON)

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend, state management, mode toggles
- `src/components/MainContent.tsx` - Slide rendering, filtering (Quick Slides, Simple Shifts)
- `src/components/RightIconBar.tsx` - Mode toggle icons (atr, move_up)

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slideRows.ts` - Row CRUD + user filtering + randomization
- `src/lib/queries/slides.ts` - Slide CRUD + `getNextPosition()`

### Utilities
- `src/lib/utils/scheduleFilter.ts` - Time/day-based slide filtering
- `src/lib/utils/slideRandomizer.ts` - Seeded random slide selection

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

### Special Row Modes (Nov 2025)
**Quick Slides** (row_type: 'QUICKSLIDE')
- Icon: "atr" (top right sidebar)
- Behavior: Shows ONLY Quick Slide rows when active
- Use case: Temporary one-off slides for users

**Simple Shifts** (row_type: 'SIMPLESHIFT')
- Icon: "move_up" (top right, below atr)
- Behavior: Shows ONLY Simple Shift rows when active
- Use case: Daily shift/practice content

**Normal Mode** (default)
- Shows all rows EXCEPT Quick Slides and Simple Shifts
- Standard content browsing

### Row Filtering Logic (MainContent.tsx)
```typescript
if (isSimpleShiftMode) {
  rows = slideRows.filter(row => row.row_type === 'SIMPLESHIFT')
} else if (isQuickSlideMode) {
  rows = slideRows.filter(row => row.row_type === 'QUICKSLIDE')
} else {
  rows = slideRows.filter(row =>
    row.row_type !== 'QUICKSLIDE' && row.row_type !== 'SIMPLESHIFT'
  )
}
```

### Slide Randomization (Jan 2025)
- **Admin Control**: Enable per-row with count and interval
- **Intervals**: Hourly, daily, or weekly re-randomization
- **Deterministic**: Same slides within time window (seeded random)
- **Implementation**: `slideRandomizer.ts` - Fisher-Yates shuffle

### User-Specific Private Rows
- **Public rows** (`user_id = null`): Visible to everyone
- **Private rows** (`user_id = [UUID]`): Visible only to assigned user
- **Admin view**: See ALL rows
- **Auto-Refresh**: MainContent refetches on login/logout

### Dynamic Scheduling
- **Time windows**: `publish_time_start/end` (supports overnight)
- **Day restrictions**: `publish_days` [0=Sun, 6=Sat]
- **Temporary unpublish**: `temp_unpublish_until`

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

---

## API Routes

Format: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

### Authentication
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Current session
- `POST /api/setup` - Create first admin

### Slide Rows
- `GET/POST /api/slides/rows` - List/create (user-filtered)
- `PATCH/DELETE /api/slides/rows/[id]` - Update/delete

### Slides
- `GET/POST /api/slides/rows/[id]/slides` - List/create
- `PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]` - Update/delete

---

## Important Rules

- **50px Border**: All pages have fixed 50px border at z-20
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL for performance
- **Position Auto-Calc**: Server uses `getNextPosition()` - never send position on create
- **Optional Fields**: `title`, `body_content`, `subtitle` - use `|| ''` fallback
- **Roles**: Uppercase ('ADMIN', 'USER', 'MODERATOR')
- **Row Types**: 'ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT'

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
- Manual run: `railway run npm run railway:init`

---

## Recent Updates

### Simple Shifts Toggle (November 17, 2025)
**What**: Toggle to display only Simple Shift rows (similar to Quick Slides)
**Icon**: "move_up" in right sidebar (below "atr")
**Behavior**: Exclusive display mode - shows ONLY SIMPLESHIFT rows when active
**Files Modified**:
- `page.tsx` - Added isSimpleShiftMode state and toggle handler
- `RightIconBar.tsx` - Added move_up icon
- `MainContent.tsx` - Updated filtering logic for Simple Shift mode
- `slideRows.ts` - Added SIMPLESHIFT to row_type union types
**Database**: Added SIMPLESHIFT to row_type check constraint
**Migration**: `scripts/add-simpleshift-type.ts`

### Session Auto-Refresh on Login (November 17, 2025)
**What**: User-assigned rows appear immediately after login (no refresh needed)
**How**: MainContent monitors `sessionStatus` from NextAuth, refetches on change
**Files Modified**: `MainContent.tsx` (added sessionStatus dependency)

### Slide Randomization (January 17, 2025)
**What**: Per-row randomization with time-based intervals (hourly/daily/weekly)
**Files**: `slideRandomizer.ts`, `SlideRowForm.tsx`, `MainContent.tsx`
**Database**: 4 columns (`randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`)

### User-Specific Private Rows (January 17, 2025)
**What**: Assign rows to specific users for personalized content
**How**: `user_id` column on `slide_rows`, server-side filtering

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET` with `openssl rand -base64 32` |
| Private rows not appearing after login | Fixed (Nov 17) - MainContent auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Deployment failed (ESLint) | Run `npx eslint [file]` locally before pushing |
| Simple Shifts not showing | Ensure row has `row_type = 'SIMPLESHIFT'` (not 'CUSTOM') |
| Constraint violation on SIMPLESHIFT | Migration didn't run - check Railway logs or run `npm run railway:init` |

---

## Development Workflow

### Adding New Feature
1. **Database**: Create migration in `scripts/` (e.g., `add-feature.ts`)
2. **Register**: Add to `railway-init.ts` and `validate-migrations.ts`
3. **Types**: Update interfaces in `src/lib/queries/`
4. **API**: Add validation in API routes
5. **UI**: Update admin forms and frontend components
6. **Validate**: Run `npm run db:validate` and `npx tsc --noEmit`

### Before Deployment
```bash
npm run db:validate     # ✅ All migrations up to date
npx tsc --noEmit        # ✅ 0 TypeScript errors
npm run build           # ✅ Pass ESLint
# Update this CLAUDE.md if significant changes
git add . && git commit -m "Description" && git push
```

---

## Code Patterns

### Mode Toggle Pattern (Quick Slides / Simple Shifts)
```typescript
// page.tsx - State
const [isQuickSlideMode, setIsQuickSlideMode] = useState(false)
const [isSimpleShiftMode, setIsSimpleShiftMode] = useState(false)

// page.tsx - Handler
const toggleSimpleShiftMode = () => setIsSimpleShiftMode(prev => !prev)

// MainContent.tsx - Filtering
if (isSimpleShiftMode) {
  rows = slideRows.filter(row => row.row_type === 'SIMPLESHIFT')
} else if (isQuickSlideMode) {
  rows = slideRows.filter(row => row.row_type === 'QUICKSLIDE')
} else {
  rows = slideRows.filter(row =>
    row.row_type !== 'QUICKSLIDE' && row.row_type !== 'SIMPLESHIFT'
  )
}
```

### Randomization
```typescript
import { applyRandomization } from '@/lib/utils/slideRandomizer'
const visibleSlides = filterVisibleSlides(allSlides)
const finalSlides = applyRandomization(
  visibleSlides,
  row.randomize_enabled,
  row.randomize_count,
  row.randomize_interval
)
```

### User Filtering
```typescript
// Server-side
const rows = await getAllSlideRows(publishedOnly, userId, isAdmin)
// Returns public rows + user's private rows (or all if admin)
```

---

**Status**: Production Ready | **Lines**: 340/500 ✅ | **Last Updated**: November 17, 2025
