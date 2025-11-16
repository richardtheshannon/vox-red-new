# Claude Development Reference

**Project**: Spiritual Content Platform with Slide-Based Navigation
**Platform**: Windows | **Branch**: master | **Status**: Production Ready
**Last Updated**: November 16, 2025

---

## Quick Start

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm run build:verify     # Verify auth routes in build
npx tsc --noEmit         # TypeScript validation
```

**URLs**: http://localhost:3000/ | /admin | /login | /setup | /api/health-auth

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **Authentication**: NextAuth.js 4.24.13, bcrypt 6.0.0
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols
- **Audio**: HTML5 Audio Player

---

## Architecture

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20)
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background**: Full-viewport images with theme overlay (z-0/z-1)
- **Content**: Per-slide backgrounds, YouTube videos, themes, audio
- **Quick Slides**: Modal-based notes
- **Spa Mode**: Background music

### Admin (/admin)
- **Slides**: Full CRUD with Tiptap editor
- **Spa Tracks**: Background music CRUD
- **Users**: Full CRUD (admin only)
- **Auth**: Protected routes, requires login

---

## Database Schema

### users
```
id (UUID), name, email (unique), password_hash (bcrypt)
role (VARCHAR) - 'ADMIN', 'USER', 'MODERATOR' (uppercase in production)
created_at, updated_at
```
⚠️ **Production uses UPPERCASE roles** ('ADMIN', 'USER') - code handles both cases

### slide_rows
```
id, title, description, row_type, is_published, display_order
icon_set (JSON), theme_color, slide_count, playlist_delay_seconds
```

### slides
```
id, slide_row_id, title, subtitle, body_content (OPTIONAL), position
layout_type ('STANDARD'|'OVERFLOW'|'MINIMAL')
audio_url, image_url, video_url
content_theme ('light'|'dark'|null), title_bg_opacity (0-1), icon_set (JSON)
is_published, publish_time_start/end, publish_days (JSON [0-6])
temp_unpublish_until (timestamp)
```

### spa_tracks
```
id, title, audio_url, is_published, display_order
volume (0-100), publish_time_start/end, publish_days (JSON)
```

---

## Key API Endpoints

**Auth**: `POST /api/auth/signin`, `GET /api/auth/session`, `POST /api/setup`, `GET /api/health-auth`
**Users**: `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/[id]`, `POST /api/users/[id]/password`
**Slides**: `GET/POST /api/slides/rows/[id]/slides`, `GET/PATCH/DELETE /api/slides/rows/[id]/slides/[slideId]`
**Spa**: `GET/POST /api/spa/tracks`, `GET /api/spa/tracks/active`

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Critical Files

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()` (case-insensitive role checks)
- `src/lib/authOptions.ts` - NextAuth config (JWT, 30-day sessions)
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/login/page.tsx` - Login page
- `src/app/setup/page.tsx` - First-time admin setup

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/users.ts` - User CRUD
- `src/lib/queries/slides.ts` - Slide CRUD
- `src/lib/queries/slideRows.ts` - Row CRUD
- `src/lib/queries/spaTracks.ts` - Spa track CRUD

### Admin Pages
- `src/app/admin/layout.tsx` - Route protection
- `src/app/admin/users/page.tsx` - User list
- `src/app/admin/users/new/page.tsx` - Create user
- `src/app/admin/users/[id]/page.tsx` - Edit user

### Frontend Core
- `src/app/page.tsx` - Main page with background state
- `src/components/MainContent.tsx` - Slide rendering, caching
- `src/contexts/ThemeContext.tsx` - Global theme
- `src/contexts/SwiperContext.tsx` - Navigation context

---

## Production Deployment

### Environment Variables (Railway)
```env
DATABASE_URL=postgresql://...        # Auto-provided by Railway
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>      # Generate: openssl rand -base64 32
```

### Pre-Deploy Checklist
```bash
npx tsc --noEmit        # 0 errors
npm run build:verify    # Verify auth routes exist
git add . && git commit -m "..." && git push origin master
```

### Railway Pipeline
1. Git push → Railway webhook
2. `npm ci` → `npm run build` → `npm run start`
3. `railway-init.ts` runs migrations (idempotent)
4. Health check: `/api/test-db`

### Production Admin Tools

**Create Admin User** (bypasses /setup):
```bash
set DATABASE_URL=postgresql://...
npm run db:seed:admin
```

**Reset Admin Password**:
```bash
npm run db:reset:password
```

**Check Database Schema**:
```bash
npm run db:check
```

**Fix Schema Mismatch**:
```bash
npm run db:fix:schema
```

---

## Authentication & Security

### Setup Flow
1. **First Time**: Visit `/setup` to create first admin (only when 0 users)
2. **Login**: `/login` with email/password → redirects to `/admin`
3. **Session**: JWT-based, 30-day expiration, HttpOnly cookies

### Role System
- **Code Accepts**: Both `'admin'` and `'ADMIN'` (case-insensitive)
- **Production DB Uses**: Uppercase roles (`'ADMIN'`, `'USER'`, `'MODERATOR'`)
- **Dev DB May Use**: Lowercase roles (`'admin'`, `'user'`)

### Security Features
- bcrypt password hashing (SALT_ROUNDS=10), min 8 chars
- Self-protection (cannot delete/demote own account)
- Last admin protection (cannot delete/demote last admin)
- All `/admin/*` routes require authentication
- User management requires admin role

---

## Key Features

### Background System
- Full-viewport backgrounds via `image_url`
- Theme-responsive overlay (white/black), opacity 0-1
- Per-slide theme: `content_theme` = 'light'|'dark'|null
- Z-Stack: Background (z-0) → Overlay (z-1) → Video (z-10) → Content (z-20)
- **Critical**: `initialBackgroundSetRef` prevents race conditions

### Layout Types
- **STANDARD**: Centered content
- **OVERFLOW**: Top-aligned scrollable
- **MINIMAL**: Title + audio only (body_content hidden)

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight)
- Day restrictions: `publish_days` JSON [0=Sun, 6=Sat]
- Client-side filtering: `filterVisibleSlides()`

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw IDs
- Modes: Cover (full-screen) | Contained (60px padding, 16:9)

---

## Code Patterns

### Authentication (Server-Side)
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth'

const session = await requireAuth()    // Any authenticated user
const session = await requireAdmin()   // Admin role only (case-insensitive)
```

### User CRUD
```typescript
import { createUser, updateUserPassword } from '@/lib/queries/users'

const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Auto-hashed
  role: 'ADMIN'  // Use uppercase for production compatibility
})

await updateUserPassword(userId, newPassword)  // Auto-hashed
```

### Safe Body Content
```typescript
dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}  // ALWAYS use fallback
```

---

## Important Notes

- **50px Border**: All pages (z-20), no exceptions
- **Square UI**: No rounded corners
- **Icons**: 24px, weight 100, `var(--icon-color)`
- **No ORM**: Direct PostgreSQL for performance
- **Position**: Server auto-calculates (don't send on create)
- **Body Content**: Optional - ALWAYS use `|| ''` fallback
- **Role Compatibility**: Code handles both uppercase and lowercase roles
- **Production DB**: Uses uppercase roles ('ADMIN', 'USER', 'MODERATOR')
- **Passwords**: Never plain text, bcrypt hashed, min 8 chars

---

## Troubleshooting

### Auth Routes Not Found (404)
- **Issue**: `/api/users`, `/api/setup` return 404 on production
- **Cause**: Auth routes not included in build
- **Fix**: Run `npm run build:verify` locally, then redeploy to Railway

### Role Check Failures
- **Issue**: 500 errors on `/api/users` despite being logged in as admin
- **Cause**: Production DB uses uppercase roles ('ADMIN'), code expected lowercase
- **Fix**: Already handled - code now case-insensitive (as of Nov 16, 2025)

### Cannot Access /setup
- **Issue**: `/setup` redirects to `/login`
- **Cause**: Users already exist in database
- **Fix**: Use `npm run db:seed:admin` to create admin directly

### Database Schema Mismatch
- **Issue**: "null value in column 'username' violates not-null constraint"
- **Cause**: Production DB has old schema with `username` column
- **Fix**: Run `npm run db:fix:schema` to make column nullable

---

## Recent Updates

### Production Admin Tools & Role Compatibility (Nov 16, 2025)
**Change**: Added production deployment tools and case-insensitive role handling
**New Tools**: `db:seed:admin`, `db:reset:password`, `db:check`, `db:fix:schema`, `build:verify`
**Fix**: Auth system now handles both uppercase ('ADMIN') and lowercase ('admin') roles
**Why**: Production DB uses uppercase roles, dev may use lowercase
**Impact**: Zero breaking changes, improved production deployment experience

### User Authentication System (Nov 16, 2025)
**Change**: Complete user account and authentication system
**Features**: NextAuth.js JWT auth, `/setup`, `/login`, user management, bcrypt passwords
**Impact**: Main app public, admin requires login, 19 files created

### Optional Body Content (Nov 15, 2025)
**Change**: `body_content` now optional for slides
**Critical**: ALWAYS use `|| ''` fallback when rendering

---

## Navigation Icons

**Main App**: home | spa | settings | contrast | atr | comment | videocam | arrows
**Admin**: dashboard | description | spa | group | media | logout | contrast

---

**Status**: Production Ready | **Last Updated**: November 16, 2025
