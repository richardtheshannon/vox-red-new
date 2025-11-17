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
- **State**: ThemeContext (localStorage), SwiperContext, PlaylistContext, SessionProvider

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20) on all pages
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme overlay (z-0/z-1)
- **Content**: Per-slide backgrounds, YouTube videos, themes, audio
- **Spa Mode**: Background music player

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Slides**: Full CRUD with Tiptap editor
- **Spa Tracks**: Background music management
- **Users**: User management (admin only)

---

## Database Schema

### users
```
id (UUID), name, email (unique), password_hash (bcrypt)
role (VARCHAR) - 'ADMIN', 'USER', 'MODERATOR' (uppercase in production)
created_at, updated_at
```

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
content_theme ('light'|'dark'|null), title_bg_opacity (0-1)
is_published, publish_time_start/end, publish_days (JSON [0-6])
temp_unpublish_until (timestamp)
```

### spa_tracks
```
id, title, audio_url, is_published, display_order
volume (0-100), publish_time_start/end, publish_days (JSON)
```

---

## Key Files

### Core Application
- `src/app/layout.tsx` - Root layout with Providers (SessionProvider + ThemeProvider)
- `src/components/Providers.tsx` - Root-level providers wrapper
- `src/app/page.tsx` - Main frontend page
- `src/components/MainContent.tsx` - Slide rendering with caching

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()` (case-insensitive)
- `src/lib/authOptions.ts` - NextAuth config (JWT, 30-day sessions)
- `src/app/login/page.tsx` - Server component with auto-redirect
- `src/app/login/LoginForm.tsx` - Client component login form
- `src/app/setup/page.tsx` - First-time admin setup
- `src/app/admin/layout.tsx` - Admin route protection (client-side)

### Contexts (Global State)
- `src/contexts/ThemeContext.tsx` - Theme state (localStorage, root-level)
- `src/contexts/SwiperContext.tsx` - Navigation context
- `src/contexts/PlaylistContext.tsx` - Playlist state

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/users.ts` - User CRUD
- `src/lib/queries/slides.ts` - Slide CRUD
- `src/lib/queries/slideRows.ts` - Row CRUD
- `src/lib/queries/spaTracks.ts` - Spa track CRUD

---

## Environment Variables

```env
# Database (Railway auto-provides DATABASE_URL)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mp3_manager"
DB_USER="postgres"
DB_PASSWORD="your-password"

# Authentication (CRITICAL: Set strong secret)
NEXTAUTH_SECRET="<strong-32-char-secret>"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"       # Production: https://your-app.railway.app
```

---

## Authentication & Sessions

### Setup Flow
1. **First Time**: Visit `/setup` to create first admin (only when 0 users exist)
2. **Login**: `/login` with email/password → auto-redirects to `/admin` if already logged in
3. **Session**: JWT-based, 30-day expiration, HttpOnly cookies, persists across browser sessions

### Security Features
- bcrypt password hashing (SALT_ROUNDS=10), min 8 chars
- Strong NEXTAUTH_SECRET required for session persistence
- Self-protection (cannot delete/demote own account)
- Last admin protection (cannot delete/demote last admin)
- All `/admin/*` routes require authentication
- Role checks are case-insensitive ('admin' = 'ADMIN')

### Server-Side Auth
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth'

const session = await requireAuth()    // Any authenticated user
const session = await requireAdmin()   // Admin role only
```

---

## Theme System (Persistent)

### Architecture
- **Root-Level**: ThemeProvider in `src/components/Providers.tsx`
- **Storage**: localStorage (persists across browser sessions)
- **Global Access**: Available on all pages via `useTheme()` hook
- **Toggles**: Work on both frontend and admin pages

### Usage
```typescript
import { useTheme } from '@/contexts/ThemeContext'

const { theme, toggleTheme } = useTheme()
// theme: 'light' | 'dark'
// toggleTheme(): switches theme and saves to localStorage
```

### CSS Variables
- `var(--text-color)` - Main text color
- `var(--bg-color)` - Background color
- `var(--card-bg)` - Card background
- `var(--border-color)` - Border color
- `var(--secondary-text)` - Secondary text
- `var(--icon-color)` - Icon color

---

## Key Features

### Background System
- Full-viewport backgrounds via slide `image_url`
- Theme-responsive overlay (white/black), opacity 0-1
- Per-slide theme override: `content_theme` = 'light'|'dark'|null
- Z-Stack: Background (z-0) → Overlay (z-1) → Video (z-10) → Content (z-20)

### Layout Types
- **STANDARD**: Centered content
- **OVERFLOW**: Top-aligned scrollable
- **MINIMAL**: Title + audio only (body_content hidden)

### Dynamic Scheduling
- Time windows: `publish_time_start/end` (supports overnight spans)
- Day restrictions: `publish_days` JSON array [0=Sun, 6=Sat]
- Client-side filtering: `filterVisibleSlides()`

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw IDs
- Modes: Cover (full-screen) | Contained (60px padding, 16:9)

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - NextAuth login
- `GET /api/auth/session` - Get current session
- `POST /api/setup` - Create first admin
- `GET /api/health-auth` - Health check

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `POST /api/users/[id]/password` - Update password

### Slides
- `GET /api/slides/rows` - List all slide rows
- `GET /api/slides/rows/[id]/slides` - List slides in row
- `POST /api/slides/rows/[id]/slides` - Create slide
- `PATCH /api/slides/rows/[id]/slides/[slideId]` - Update slide
- `DELETE /api/slides/rows/[id]/slides/[slideId]` - Delete slide

### Spa Tracks
- `GET /api/spa/tracks` - List all spa tracks
- `GET /api/spa/tracks/active` - Get currently active tracks
- `POST /api/spa/tracks` - Create track
- `PATCH /api/spa/tracks/[id]` - Update track
- `DELETE /api/spa/tracks/[id]` - Delete track

**Response Format**: `{ status: 'success'|'error', data?: {...}, message?: '...' }`

---

## Code Patterns

### Safe Body Content Rendering
```typescript
// ALWAYS use fallback for optional body_content
dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}
```

### User Creation
```typescript
import { createUser, updateUserPassword } from '@/lib/queries/users'

const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Auto-hashed with bcrypt
  role: 'ADMIN'  // Use uppercase for production compatibility
})

await updateUserPassword(userId, newPassword)  // Auto-hashed
```

---

## Important Rules

- **50px Border**: All pages must have 50px border (header/footer/sidebars at z-20)
- **Square UI**: No rounded corners anywhere
- **Icons**: 24px size, weight 100, use `var(--icon-color)`
- **No ORM**: Direct PostgreSQL queries for performance
- **Position**: Server auto-calculates slide position (don't send on create)
- **Body Content**: Optional - ALWAYS use `|| ''` fallback
- **Roles**: Production uses uppercase ('ADMIN'), code handles both cases
- **Passwords**: Never plain text, bcrypt hashed, min 8 chars

---

## Production Deployment (Railway)

### Pre-Deploy Checklist
```bash
npx tsc --noEmit        # Must have 0 errors
npm run build           # Must succeed
git add . && git commit -m "..." && git push origin master
```

### Environment Variables
```env
DATABASE_URL=postgresql://...        # Auto-provided by Railway
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>      # Generate: openssl rand -base64 32
```

### Admin Tools (Production)
```bash
# Create admin user (bypasses /setup)
set DATABASE_URL=postgresql://...
npm run db:seed:admin

# Reset admin password
npm run db:reset:password

# Check database schema
npm run db:check

# Fix schema mismatch
npm run db:fix:schema
```

---

## Troubleshooting

### Sessions Not Persisting
- **Cause**: Weak or missing NEXTAUTH_SECRET
- **Fix**: Generate strong secret: `openssl rand -base64 32`, restart dev server
- **Note**: Theme uses localStorage (separate from session)

### Theme Resets on Navigation
- **Cause**: Multiple ThemeProvider instances (fixed as of Jan 2025)
- **Fix**: Already resolved - single root-level ThemeProvider
- **Verify**: Check `src/components/Providers.tsx` wraps children with ThemeProvider

### Login Page Shows Form When Already Logged In
- **Cause**: Server-side session check not working
- **Fix**: `/login/page.tsx` is server component that checks session before rendering form

### Cannot Access /setup
- **Cause**: Users already exist in database
- **Fix**: Use `npm run db:seed:admin` to create admin directly

### Role Check Failures (500 errors)
- **Cause**: Case mismatch between DB roles and code
- **Fix**: Already resolved - code is case-insensitive (as of Nov 16, 2025)

---

## Recent Updates

### Persistent Theme + Session (January 2025)
**Changes**:
- Theme now uses localStorage (was sessionStorage)
- Single root-level ThemeProvider (was per-page instances)
- Sessions persist properly with strong NEXTAUTH_SECRET
- Login page auto-redirects if already authenticated

**Impact**:
- Theme persists across page navigation and browser sessions
- Login sessions persist for 30 days (no repeated logins)
- Zero breaking changes to existing functionality

**Files Changed**: 19 files
- `src/contexts/ThemeContext.tsx` - localStorage + root-level
- `src/components/Providers.tsx` - Added ThemeProvider wrapper
- `src/app/login/page.tsx` - Server component with session check
- All admin pages - Removed duplicate ThemeProvider instances

### Production Admin Tools (November 2025)
**Changes**: Added production deployment tools and case-insensitive role handling
**New Tools**: `db:seed:admin`, `db:reset:password`, `db:check`, `db:fix:schema`
**Impact**: Improved production deployment experience

---

## Navigation Icons

**Frontend**: home | spa | playlist_play | settings | dark_mode/light_mode | menu
**Admin**: dashboard | description | spa | group | perm_media | logout | dark_mode/light_mode

---

**Status**: Production Ready | **Last Updated**: January 2025
