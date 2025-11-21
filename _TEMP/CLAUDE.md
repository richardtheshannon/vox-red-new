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
- **Special Modes**: 6 exclusive toggle modes (Quick Slides, Goals, Simple Shifts, Service, Image Slides, Normal)

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)
- **Row Overrides**: Set row-level background images and layout types that override individual slides
- **Randomization Controls**: Enable, set count, select interval (hourly/daily/weekly)

---

## Database Schema (Essential)

**users**: `id`, `name`, `email`, `password_hash`, `role` ('ADMIN'|'USER'|'MODERATOR')

**slide_rows**: `id`, `title`, `description`, `row_type` ('ROUTINE'|'COURSE'|'TEACHING'|'CUSTOM'|'QUICKSLIDE'|'SIMPLESHIFT'|'IMGSLIDES'|'SERVICE'|'GOALS'), `is_published`, `display_order`, `icon_set` (JSON), `theme_color`, `playlist_delay_seconds`, `user_id` (nullable), `randomize_enabled`, `randomize_count`, `randomize_interval`, `randomize_seed`, `row_background_image_url`, `row_layout_type`

**slides**: `id`, `slide_row_id`, `title` (nullable), `subtitle`, `body_content` (nullable), `position`, `layout_type` ('STANDARD'|'OVERFLOW'|'MINIMAL'), `audio_url`, `image_url`, `video_url`, `content_theme` ('light'|'dark'), `title_bg_opacity`, `is_published`, `publish_time_start/end`, `publish_days` (JSON), `temp_unpublish_until`, `icon_set` (JSON)

**spa_tracks**: `id`, `title`, `audio_url`, `is_published`, `display_order`, `volume`, `publish_time_start/end`, `publish_days` (JSON)

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend, state management, mode toggles
- `src/components/MainContent.tsx` - Slide rendering, mode filtering, row overrides
- `src/components/RightIconBar.tsx` - Mode toggle icons

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slideRows.ts` - Row CRUD + user filtering + randomization + overrides
- `src/lib/queries/slides.ts` - Slide CRUD + `getNextPosition()`

### Utilities
- `src/lib/utils/scheduleFilter.ts` - Time/day-based slide filtering
- `src/lib/utils/slideRandomizer.ts` - Seeded random slide selection

### Admin
- `src/components/admin/slides/SlideRowForm.tsx` - Row edit form with override controls

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
| **Goals** | `things_to_do` | 'GOALS' | Right sidebar, 2nd | Goal tracking & commitments |
| **Simple Shifts** | `move_up` | 'SIMPLESHIFT' | Right sidebar, 3rd | Daily shift/practice content |
| **Service** | `room_service` | 'SERVICE' | Right sidebar, 4th | Service commitments |
| **Image Slides** | `web_stories` | 'IMGSLIDES' | Right sidebar, bottom | Image-focused content |
| **Normal Mode** | (default) | All others | No icon | Shows all rows EXCEPT special modes |

**Filter Priority**: Goals > Service > Image > Simple > Quick > Normal

---

## Core Features

### Row-Level Overrides (NEW - Nov 2025)
**Background Image Override** (`row_background_image_url`):
- When set, overrides ALL individual slide `image_url` values in the row
- Priority: `row.row_background_image_url` → `slide.image_url` → `null`
- Set via Admin > Edit Row > "Row Background Image" field

**Layout Type Override** (`row_layout_type`):
- When set, overrides ALL individual slide `layout_type` values in the row
- Options: 'STANDARD' (centered), 'OVERFLOW' (scrollable), 'MINIMAL' (title+audio only)
- Priority: `row.row_layout_type` → `slide.layout_type` → `'STANDARD'`
- Set via Admin > Edit Row > "Row Layout Type" dropdown

**Implementation** (MainContent.tsx):
```typescript
// Background override
const imageUrl = (row?.row_background_image_url) || slide.image_url || null

// Layout override
const effectiveLayoutType = row.row_layout_type || slide.layout_type
```

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
- Validation: `row_type`, `row_layout_type`, `playlist_delay_seconds`, randomization fields

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
- **Layout Types**: 'STANDARD', 'OVERFLOW', 'MINIMAL'

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

**Recent Migrations**:
- `add-goals-type.ts` - GOALS row_type
- `add-row-background-image.ts` - row_background_image_url column
- `add-row-layout-type.ts` - row_layout_type column with CHECK constraint

---

## Development Workflow

### Adding New Special Row Mode
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

### Adding Row-Level Override Field
1. **Migration**: Create `scripts/add-row-[field].ts` with column + constraint
2. **Register**: Add to `railway-init.ts` and `validate-migrations.ts`
3. **Types**: Update `slideRows.ts` interfaces (SlideRow, CreateSlideRowData, UpdateSlideRowData)
4. **SQL**: Update `createSlideRow()` INSERT and `updateSlideRow()` dynamic UPDATE
5. **API**: Add validation in `/api/slides/rows/[id]/route.ts`
6. **Admin UI**: Add field to `SlideRowForm.tsx` (interface + state + form section)
7. **Edit Page**: Update interface in `/admin/slides/[id]/edit/page.tsx`
8. **Frontend**: Update `MainContent.tsx` SlideRow interface + override logic
9. **Validate**: Run `npx tsc --noEmit`

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

### Row-Level Overrides (November 20, 2025)
**What**: Added row-level background image and layout type overrides
**Features**:
- `row_background_image_url` - Overrides all slide backgrounds in row
- `row_layout_type` - Overrides all slide layouts in row (STANDARD/OVERFLOW/MINIMAL)
**Files Modified**:
- `scripts/add-row-background-image.ts` - Background image column migration
- `scripts/add-row-layout-type.ts` - Layout type column migration with CHECK constraint
- `slideRows.ts` - Updated interfaces and CRUD functions
- `SlideRowForm.tsx` - Added text input (background) + dropdown (layout)
- `MainContent.tsx` - Added override logic in `updateActiveSlideData()` and `renderSlideContent()`
- `/api/slides/rows/[id]/route.ts` - Added validation for layout type
**Database**: Added 2 columns with constraints
**Migrations**: Registered in `railway-init.ts` and `validate-migrations.ts`

### Goals Mode Toggle (November 20, 2025)
**What**: Toggle to display only Goals rows (sixth special mode)
**Icon**: "things_to_do" in right sidebar (2nd position)
**Files Modified**: `page.tsx`, `RightIconBar.tsx`, `MainContent.tsx`, `slideRows.ts`
**Migration**: `scripts/add-goals-type.ts`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not persisting | Generate strong `NEXTAUTH_SECRET` with `openssl rand -base64 32` |
| Private rows not appearing | MainContent auto-refetches on session change |
| Cannot access /setup | Users exist. Use `npm run db:seed:admin` instead |
| Deployment failed (ESLint) | Run `npx eslint [file]` locally before pushing |
| Mode rows not showing | Ensure row has correct `row_type` value |
| Constraint violation | Migration didn't run - check Railway logs or run `railway run npm run railway:init` |
| Row overrides not working | Check migration status with `npm run db:validate` |

---

## Code Patterns

### Override Priority Pattern
```typescript
// Background image override (MainContent.tsx:87)
const imageUrl = (row?.row_background_image_url) || slide.image_url || null
setActiveSlideImageUrl(imageUrl)

// Layout type override (MainContent.tsx:527)
const effectiveLayoutType = row.row_layout_type || slide.layout_type
const containerClass = effectiveLayoutType === 'OVERFLOW' ? '...' : '...'
```

### User Filtering
```typescript
// Server-side (slideRows.ts)
const rows = await getAllSlideRows(publishedOnly, userId, isAdmin)
// Returns public rows + user's private rows (or all if admin)
```

### Dynamic SQL Updates
```typescript
// slideRows.ts:209 - Example of adding new field to update
if (data.row_layout_type !== undefined) {
  fields.push(`row_layout_type = $${paramCount++}`)
  values.push(data.row_layout_type)
}
```

---

**Status**: Production Ready | **Lines**: 372/500 ✅ | **Last Updated**: November 20, 2025
