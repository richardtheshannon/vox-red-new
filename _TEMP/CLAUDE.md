# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 20, 2025

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
- **Special Modes**: 6 exclusive toggle modes (see below)

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)
- **Randomization Controls**: Enable, set count, select interval (hourly/daily/weekly)

---

## Database Schema (Essential)

**users**: `id`, `name`, `email`, `password_hash`, `role` ('ADMIN'|'USER'|'MODERATOR')

**slide_rows**: `id`, `title`, `description`, `row_type` ('ROUTINE'|'COURSE'|'TEACHING'|'CUSTOM'|'QUICKSLIDE'|'SIMPLESHIFT'|'IMGSLIDES'|'SERVICE'|'GOALS'), `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id` (nullable), `randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`

**slides**: `id`, `slide_row_id`, `title` (nullable), `subtitle`, `body_content` (nullable), `position`, `layout_type`, `audio_url`, `image_url`, `video_url`, `content_theme`, `title_bg_opacity`, `is_published`, `publish_time_start/end`, `publish_days` (JSON), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start/end`, `publish_days` (JSON)

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend, state management, mode toggles
- `src/components/MainContent.tsx` - Slide rendering, mode filtering
- `src/components/RightIconBar.tsx` - Mode toggle icons

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

### Deployment
- `scripts/railway-init.ts` - Auto-runs all migrations on Railway deploy
- `scripts/validate-migrations.ts` - Pre-deployment validation

---

## Environment Variables

```env
# Database (Local)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mp3_manager"
DB_USER="postgres"
DB_PASSWORD="your-password"

# Database (Railway - auto-provided)
DATABASE_URL="postgresql://..."

# Authentication (CRITICAL)
NEXTAUTH_SECRET="<strong-32-char-secret>"  # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"       # Production: https://your-app.railway.app
```

---

## Special Row Modes (6 Exclusive Toggles)

All modes are **mutually exclusive** - only one can be active at a time. Each mode filters to show ONLY that row type.

| Mode | Icon | row_type | Icon Position | Use Case |
|------|------|----------|---------------|----------|
| **Quick Slides** | `atr` | 'QUICKSLIDE' | Right sidebar, top | Temporary one-off slides |
| **Goals** | `things_to_do` | 'GOALS' | Right sidebar, under atr | Goal tracking & commitments |
| **Simple Shifts** | `move_up` | 'SIMPLESHIFT' | Right sidebar, under things_to_do | Daily shift/practice content |
| **Service** | `room_service` | 'SERVICE' | Right sidebar, under move_up | Service commitments |
| **Image Slides** | `web_stories` | 'IMGSLIDES' | Right sidebar, bottom section | Image-focused content |
| **Normal Mode** | (default) | All others | No icon | Shows all rows EXCEPT special modes |

### Row Filtering Priority (MainContent.tsx)
```typescript
if (isGoalsMode) {
  rows = slideRows.filter(row => row.row_type === 'GOALS')
} else if (isServiceMode) {
  rows = slideRows.filter(row => row.row_type === 'SERVICE')
} else if (isImageSlideMode) {
  rows = slideRows.filter(row => row.row_type === 'IMGSLIDES')
} else if (isSimpleShiftMode) {
  rows = slideRows.filter(row => row.row_type === 'SIMPLESHIFT')
} else if (isQuickSlideMode) {
  rows = slideRows.filter(row => row.row_type === 'QUICKSLIDE')
} else {
  // Normal mode: exclude ALL special types
  rows = slideRows.filter(row =>
    row.row_type !== 'QUICKSLIDE' &&
    row.row_type !== 'SIMPLESHIFT' &&
    row.row_type !== 'IMGSLIDES' &&
    row.row_type !== 'SERVICE' &&
    row.row_type !== 'GOALS'
  )
}
```

---

## Core Features

### Slide Randomization
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
- **Row Types**: 'ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT', 'IMGSLIDES', 'SERVICE', 'GOALS'

---

## Railway Deployment

### Pre-Deploy Validation
```bash
npm run db:validate     # Must show "Ready to deploy to Railway!"
npx tsc --noEmit        # Must show 0 TypeScript errors
npm run build           # Must pass ESLint
git push origin master  # Auto-deploys to Railway
```

### Migration System
- All migrations auto-run via `railway-init.ts`
- Migrations use `IF NOT EXISTS` for safety
- Registered in `validate-migrations.ts` for verification
- Manual run: `railway run npm run railway:init`

---

## Development Workflow

### Adding New Special Row Mode (Pattern)
1. **Migration**: Create `scripts/add-[name]-type.ts`
2. **Register**: Add to `railway-init.ts` (import + execution block)
3. **Update**: Add to `validate-migrations.ts` constraint description
4. **Types**: Update `slideRows.ts` row_type union (3 places)
5. **State**: Add `is[Name]Mode` state in `page.tsx`
6. **Handler**: Add `toggle[Name]Mode` handler in `page.tsx`
7. **Icon**: Add icon to `RightIconBar.tsx` (props + interface + JSX)
8. **Filter**: Add filter logic to `MainContent.tsx` (props + interface + useMemo + useEffect)
9. **Normal Mode**: Update normal mode filter to exclude new type
10. **Validate**: Run `npm run db:validate` and `npx tsc --noEmit`

### Before Deployment
```bash
npm run db:validate     # ✅ All migrations up to date
npx tsc --noEmit        # ✅ 0 TypeScript errors
npm run build           # ✅ Pass ESLint
# Update CLAUDE.md if significant changes
git add . && git commit -m "Description" && git push
```

---

## Recent Updates

### Goals Mode Toggle (November 20, 2025)
**What**: Toggle to display only Goals rows (sixth special mode)
**Icon**: "things_to_do" in right sidebar (under "atr")
**Behavior**: Exclusive display mode - shows ONLY GOALS rows when active
**Files Modified**:
- `page.tsx` - Added isGoalsMode state and toggle handler
- `RightIconBar.tsx` - Added things_to_do icon (positioned between atr and move_up)
- `MainContent.tsx` - Updated filtering logic (priority: Goals > Service > Image > Simple > Quick > Normal)
- `slideRows.ts` - Added GOALS to row_type union types (3 places)
**Database**: Added GOALS to row_type check constraint
**Migration**: `scripts/add-goals-type.ts`
**Railway**: Registered in `railway-init.ts` and `validate-migrations.ts`

### Service Mode Toggle (November 18, 2025)
**What**: Toggle to display only Service rows (fifth special mode)
**Icon**: "room_service" in right sidebar
**Migration**: `scripts/add-service-type.ts`

### Image Slides Toggle (November 18, 2025)
**What**: Toggle to display only Image Slide rows (fourth special mode)
**Icon**: "web_stories" in right sidebar
**Migration**: `scripts/add-imgslides-type.ts`

### Simple Shifts Toggle (November 17, 2025)
**What**: Toggle to display only Simple Shift rows (third special mode)
**Icon**: "move_up" in right sidebar
**Migration**: `scripts/add-simpleshift-type.ts`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET` with `openssl rand -base64 32` |
| Private rows not appearing | MainContent auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Deployment failed (ESLint) | Run `npx eslint [file]` locally before pushing |
| Mode rows not showing | Ensure row has correct `row_type` value |
| Constraint violation on Railway | Migration didn't run - check Railway logs or manually run `railway run npm run railway:init` |
| Local migration auth failed | Password issue - run SQL manually or wait for Railway deploy |

---

## Code Patterns

### Mode Toggle Pattern (Full Example)
```typescript
// 1. page.tsx - State (line ~64)
const [isGoalsMode, setIsGoalsMode] = useState(false)

// 2. page.tsx - Handler (line ~196)
const toggleGoalsMode = () => setIsGoalsMode(prev => !prev)

// 3. page.tsx - Pass to RightIconBar (line ~355)
<RightIconBar
  isGoalsMode={isGoalsMode}
  onGoalsClick={toggleGoalsMode}
  // ... other props
/>

// 4. page.tsx - Pass to MainContent (line ~376)
<MainContentWithRef
  isGoalsMode={isGoalsMode}
  // ... other props
/>

// 5. RightIconBar.tsx - Interface (line ~18)
interface RightIconBarProps {
  isGoalsMode?: boolean
  onGoalsClick?: () => void
  // ... other props
}

// 6. RightIconBar.tsx - Icon JSX (line ~49)
<span
  className="material-symbols-outlined"
  title={isGoalsMode ? 'Exit Goals Mode' : 'Goals Mode'}
  onClick={onGoalsClick}
  style={{
    cursor: 'pointer',
    opacity: isGoalsMode ? 1 : 0.6,
    transition: 'opacity 0.3s ease'
  }}
>
  things_to_do
</span>

// 7. MainContent.tsx - Interface (line ~30)
interface MainContentProps {
  isGoalsMode: boolean
  // ... other props
}

// 8. MainContent.tsx - Filter Logic (line ~106)
if (isGoalsMode) {
  rows = slideRows.filter(row => row.row_type === 'GOALS')
} else if (isServiceMode) {
  // ... other modes
} else {
  // Normal mode - exclude GOALS
  rows = slideRows.filter(row => row.row_type !== 'GOALS' && ...)
}
```

### User Filtering
```typescript
// Server-side
const rows = await getAllSlideRows(publishedOnly, userId, isAdmin)
// Returns public rows + user's private rows (or all if admin)
```

---

**Status**: Production Ready | **Lines**: 362/500 ✅ | **Last Updated**: November 20, 2025
