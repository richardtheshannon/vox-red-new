# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: January 2025

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npx tsc --noEmit         # TypeScript validation
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
- **50px Icon Border**: Fixed header/footer/sidebars (z-20)
- **Auth-Gated Icons**: Private features hidden unless authenticated
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme overlay
- **User-Specific Content**: Private rows visible only to assigned users

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
role (VARCHAR) - 'ADMIN', 'USER', 'MODERATOR'
created_at, updated_at
```

### slide_rows
```sql
id, title, description, row_type, is_published, display_order
icon_set (JSON), theme_color, slide_count, playlist_delay_seconds
user_id (UUID, nullable) - Owner of private row (null = public)
created_by (UUID, nullable), created_at, updated_at
```

### slides
```sql
id, slide_row_id, title, subtitle, body_content (OPTIONAL), position
layout_type ('STANDARD'|'OVERFLOW'|'MINIMAL')
audio_url, image_url, video_url
content_theme ('light'|'dark'|null), title_bg_opacity (0-1)
is_published, publish_time_start/end, publish_days (JSON [0-6])
temp_unpublish_until (timestamp), icon_set (JSON, nullable)
```

### spa_tracks
```sql
id, title, audio_url, is_published, display_order
volume (0-100), publish_time_start/end, publish_days (JSON)
```

---

## Key Files

### Core
- `src/app/layout.tsx` - Root layout with Providers
- `src/app/page.tsx` - Main frontend page
- `src/components/MainContent.tsx` - Slide rendering + user filtering
- `src/components/Providers.tsx` - SessionProvider + ThemeProvider

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config
- `src/app/login/page.tsx` - Login page
- `src/app/setup/page.tsx` - First admin setup

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/slideRows.ts` - Slide row CRUD + user filtering
- `src/lib/queries/slides.ts` - Slide CRUD operations
- `src/lib/queries/users.ts` - User management
- `src/lib/queries/spaTracks.ts` - Spa track CRUD

### Admin UI
- `src/components/admin/slides/SlideRowForm.tsx` - Row editor (includes user assignment)
- `src/components/admin/slides/SlideEditor.tsx` - Slide editor with Tiptap
- `src/components/admin/slides/SlideRowList.tsx` - Row management

### Contexts
- `src/contexts/ThemeContext.tsx` - Persistent theme (localStorage)
- `src/contexts/SwiperContext.tsx` - Navigation context
- `src/contexts/PlaylistContext.tsx` - Playlist state

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

### User-Specific Private Rows (January 2025)
**Visibility Rules**:
- **Public rows** (`user_id = null`): Visible to everyone
- **Private rows** (`user_id = [UUID]`): Visible only to assigned user when logged in
- **Admin view**: Admins see ALL rows (public + everyone's private rows)

**Implementation**:
```typescript
// Server-side filtering in getAllSlideRows()
// src/lib/queries/slideRows.ts
- Not logged in: Only public published rows
- Logged in user: Public rows + their private rows
- Admin: ALL rows
```

**Admin UI**: `/admin/slides` → Create/Edit Row → "Row Visibility" dropdown

### Authentication & Authorization
```typescript
// Server-side protection
import { requireAuth, requireAdmin } from '@/lib/auth'
const session = await requireAuth()    // Any authenticated user
const session = await requireAdmin()   // Admin role only

// Client-side auth-gating
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

### Background System
- Full-viewport backgrounds via `image_url`
- Theme-responsive overlay (white/black), opacity 0-1
- Per-slide theme override: `content_theme`
- Z-Stack: Background (z-0) → Overlay (z-1) → Video (z-10) → Content (z-20)

### Layout Types
- **STANDARD**: Centered content
- **OVERFLOW**: Top-aligned scrollable
- **MINIMAL**: Title + audio only

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight spans)
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
POST   /api/slides/rows                - Create row (supports user_id)
GET    /api/slides/rows/[id]           - Get single row
PATCH  /api/slides/rows/[id]           - Update row (supports user_id)
DELETE /api/slides/rows/[id]           - Delete row
```

### Slides
```
GET    /api/slides/rows/[id]/slides          - List slides
POST   /api/slides/rows/[id]/slides          - Create slide
PATCH  /api/slides/rows/[id]/slides/[slideId] - Update slide
DELETE /api/slides/rows/[id]/slides/[slideId] - Delete slide
```

### Users (Admin Only)
```
GET    /api/users              - List users
POST   /api/users              - Create user
PATCH  /api/users/[id]         - Update user
DELETE /api/users/[id]         - Delete user
POST   /api/users/[id]/password - Update password
```

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Code Patterns

### Safe Body Content Rendering
```typescript
dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}
```

### User Creation
```typescript
import { createUser, updateUserPassword } from '@/lib/queries/users'

const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Auto-hashed
  role: 'ADMIN'             // Uppercase for production
})
```

### User-Specific Row Creation
```typescript
import { createSlideRow } from '@/lib/queries/slideRows'

const row = await createSlideRow({
  title: 'Personal Meditation',
  row_type: 'ROUTINE',
  is_published: true,
  user_id: 'user-uuid-here'  // null for public
})
```

---

## Important Rules

- **50px Border**: All pages have fixed 50px border at z-20
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL for performance
- **Position**: Server auto-calculates (don't send on create)
- **Body Content**: Optional - use `|| ''` fallback
- **Roles**: Uppercase in production, code is case-insensitive
- **Passwords**: bcrypt hashed, min 8 chars

---

## Railway Deployment

### Pre-Deploy
```bash
npx tsc --noEmit        # 0 TypeScript errors
git add . && git commit -m "..." && git push origin master
```

### Auto-Deploy Process
1. Push to GitHub → Railway auto-deploys
2. Runs `npm run build` (must pass TypeScript + ESLint)
3. Runs `npm start` → executes `railway:init`
4. Migrations run automatically (safe - uses `IF NOT EXISTS`)
5. App starts

### Environment Variables (Railway)
```env
DATABASE_URL=postgresql://...              # Auto-provided by Railway
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>            # openssl rand -base64 32
```

### Database Scripts
```bash
npm run db:seed:admin              # Create admin user
npm run db:reset:password          # Reset admin password
npm run db:migrate:user-ownership  # Run user ownership migration manually
railway run npm run [script]       # Run any script on Railway DB
```

---

## Recent Updates

### User-Specific Private Rows (January 17, 2025)
**Feature**: Assign slide rows to specific users for personalized content

**Changes**:
- Added `user_id` column to `slide_rows` table (nullable, foreign key to `users.id`)
- Server-side filtering in `getAllSlideRows()` based on user ownership and role
- Admin UI: "Row Visibility" dropdown in SlideRowForm (Public or assign to user)
- Backward compatible: All existing rows are public (`user_id = null`)

**Files Modified**: 7 files
- `scripts/migrations/add-user-ownership.sql` - Database migration
- `scripts/railway-init.ts` - Auto-migration on deployment
- `src/lib/queries/slideRows.ts` - User filtering logic
- `src/app/api/slides/rows/route.ts` - Session-based API filtering
- `src/components/admin/slides/SlideRowForm.tsx` - User assignment UI
- `package.json` - Added migration script

**Impact**: Users only see public rows + their assigned private rows. Admins see all rows.

### Authentication-Based Icon Visibility (January 2025)
- Frontend icons now auth-gated using `useSession()`
- Public icons always visible (navigation, theme, login)
- Private icons require authentication (settings, admin features)

### Persistent Theme + Session (January 2025)
- Theme uses localStorage (was sessionStorage)
- 30-day session persistence
- Login auto-redirects if authenticated

---

## Troubleshooting

### Sessions Not Persisting
**Fix**: Generate strong NEXTAUTH_SECRET: `openssl rand -base64 32`

### Icons Not Showing/Hiding
**Verify**: Check browser console for session state
**Pattern**: All icon bars use `{session && <Icon />}`

### Cannot Access /setup
**Cause**: Users already exist
**Fix**: Use `npm run db:seed:admin` instead

### Deployment Failed (ESLint)
**Common**: Check for `any` types, unused variables
**Fix**: `npx eslint [file]` locally before pushing

---

**Status**: Production Ready | **Last Updated**: January 17, 2025
