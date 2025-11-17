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

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, slide rows, spa tracks, users
- **Tiptap Editor**: Rich text editing for slide content
- **User Assignment**: Assign rows to specific users (private rows)

---

## Database Schema

### users
```sql
id (UUID), name, email (unique), password_hash (bcrypt)
role ('ADMIN'|'USER'|'MODERATOR'), created_at, updated_at
```

### slide_rows
```sql
id, title, description, row_type, is_published, display_order
icon_set (JSON), theme_color, slide_count, playlist_delay_seconds
user_id (UUID, nullable) - Private row owner (null = public)
```

### slides
```sql
id, slide_row_id, title (OPTIONAL), subtitle, body_content (OPTIONAL), position
layout_type ('STANDARD'|'OVERFLOW'|'MINIMAL')
audio_url, image_url, video_url
content_theme ('light'|'dark'|null), title_bg_opacity (0-1)
is_published, publish_time_start/end, publish_days (JSON [0-6])
temp_unpublish_until (timestamp), icon_set (JSON)
```

### spa_tracks
```sql
id, title, audio_url, is_published, display_order
volume (0-100), publish_time_start/end, publish_days (JSON)
```

---

## Key Files

### Core
- `src/app/page.tsx` - Main frontend page
- `src/components/MainContent.tsx` - Slide rendering + user filtering
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

### API Routes
- `src/app/api/slides/rows/route.ts` - Row CRUD API
- `src/app/api/slides/rows/[id]/slides/route.ts` - Slide CRUD API
- `src/app/api/users/route.ts` - User management API

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
**Visibility Rules**:
- **Public rows** (`user_id = null`): Visible to everyone
- **Private rows** (`user_id = [UUID]`): Visible only to assigned user
- **Admin view**: See ALL rows

**Implementation**: Server-side filtering in `getAllSlideRows()`

### Authentication
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

### Background & Layout
- Full-viewport backgrounds via `image_url`
- Theme-responsive overlay (opacity 0-1)
- Per-slide theme override: `content_theme`
- **Layout Types**: STANDARD (centered), OVERFLOW (scrollable), MINIMAL (title + audio)

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight)
- Day restrictions: `publish_days` [0=Sun, 6=Sat]
- Temporary unpublish: `temp_unpublish_until`

---

## API Endpoints

### Authentication
```
POST /api/auth/signin     - Login
GET  /api/auth/session    - Current session
POST /api/setup           - Create first admin
```

### Slide Rows (User-Filtered)
```
GET    /api/slides/rows                - List rows (user-filtered)
POST   /api/slides/rows                - Create row
PATCH  /api/slides/rows/[id]           - Update row
DELETE /api/slides/rows/[id]           - Delete row
POST   /api/slides/rows/reorder        - Reorder rows
```

### Slides
```
GET    /api/slides/rows/[id]/slides              - List slides
POST   /api/slides/rows/[id]/slides              - Create slide (auto-position)
PATCH  /api/slides/rows/[id]/slides/[slideId]    - Update slide
DELETE /api/slides/rows/[id]/slides/[slideId]    - Delete slide
POST   /api/slides/rows/[id]/slides/reorder      - Reorder slides
```

### Users (Admin Only)
```
GET    /api/users              - List users
POST   /api/users              - Create user
PATCH  /api/users/[id]         - Update user
DELETE /api/users/[id]         - Delete user
```

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Code Patterns

### Position Auto-Calculation
```typescript
import { getNextPosition } from '@/lib/queries/slides'
const position = await getNextPosition(rowId)  // MAX(position) + 1
```

### Safe Content Rendering
```typescript
dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}
```

### User Creation
```typescript
import { createUser } from '@/lib/queries/users'
const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Auto-hashed
  role: 'ADMIN'             // Uppercase
})
```

### Optional Title Slides
```typescript
// Create slide without title (image-only)
const slide = await createSlide({
  slide_row_id: rowId,
  title: undefined,  // Optional
  image_url: '/media/background.jpg',
  layout_type: 'STANDARD'
})
```

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

### Pre-Deploy Checklist
```bash
npm run db:validate     # Check migrations
npx tsc --noEmit        # 0 TypeScript errors
npm run build           # Pass ESLint
git add . && git commit -m "..." && git push origin master
```

### Auto-Deploy Process
1. Push to GitHub → Railway auto-deploys
2. Runs `npm run build` (TypeScript + ESLint)
3. Runs `npm start` → executes `railway:init`
4. Migrations run automatically (safe - uses `IF NOT EXISTS`)
5. App starts

### Environment Variables (Railway)
```env
DATABASE_URL=postgresql://...              # Auto-provided
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>
```

### Database Scripts
```bash
npm run db:seed:admin              # Create admin user
npm run db:reset:password          # Reset admin password
railway run npm run [script]       # Run any script on Railway DB
```

---

## Recent Updates

### Optional Slide Title (January 17, 2025)
**Feature**: Slides can now be created without titles (for image-only slides)
**Changes**:
- Made `title` column nullable in database
- Updated TypeScript interfaces: `title?: string`
- Removed title validation in API and UI
- Added conditional rendering in MainContent

**Files Modified**: 6 files
- `scripts/make-title-optional.ts` - Database migration
- `scripts/railway-init.ts` - Auto-migration on deployment
- `src/lib/queries/slides.ts` - TypeScript interfaces
- `src/app/api/slides/rows/[id]/slides/route.ts` - Removed validation
- `src/components/admin/slides/SlideEditor.tsx` - UI updates
- `src/components/MainContent.tsx` - Conditional title rendering

**Impact**: Users can create slides with just background images, audio, video, or body content without requiring a title.

### Slide Position Fix (January 17, 2025)
**Fix**: Uses `getNextPosition()` which calculates `MAX(position) + 1`
**Impact**: Slide creation works reliably regardless of gaps in position sequence

### User-Specific Private Rows (January 17, 2025)
**Feature**: Assign slide rows to specific users for personalized content
**Changes**: Added `user_id` column to `slide_rows`, server-side filtering
**Impact**: Users only see public rows + their assigned private rows. Admins see all.

### Authentication & Theme (January 2025)
- Frontend icons auth-gated using `useSession()`
- Theme uses localStorage for persistence
- 30-day session persistence

---

## Troubleshooting

### Slide Creation Fails
**Status**: FIXED - Uses `getNextPosition()` for auto-positioning

### Sessions Not Persisting
**Fix**: Generate strong NEXTAUTH_SECRET: `openssl rand -base64 32`

### Icons Not Showing/Hiding
**Pattern**: All icon bars use `{session && <Icon />}`

### Cannot Access /setup
**Cause**: Users already exist
**Fix**: Use `npm run db:seed:admin`

### Deployment Failed (ESLint)
**Fix**: Run `npx eslint [file]` locally before pushing

---

**Status**: Production Ready | **Last Updated**: January 17, 2025
