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
npm run db:validate      # Validate database migrations
```

**URLs**: http://localhost:3000/ | /admin | /login | /setup

---

## Tech Stack

- **Framework**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Database**: PostgreSQL (direct `pg` client, no ORM)
- **Authentication**: NextAuth.js 4.24.13 (JWT, 30-day sessions)
- **UI**: Swiper.js 12.0.2, Tiptap editor, Tailwind CSS, Material Symbols
- **State**: ThemeContext (localStorage), SwiperContext, PlaylistContext

---

## Architecture Overview

### Frontend (/)
- **50px Icon Border**: Fixed header/footer/sidebars (z-20) on all pages
- **Auth-Gated Icons**: Private features hidden unless authenticated
- **Navigation**: Vertical Swiper (rows) + Horizontal Swiper (slides)
- **Background System**: Full-viewport images with theme overlay
- **Spa Mode**: Background music player with playlist support

### Admin (/admin)
- **Protected**: Requires authentication + admin role
- **Full CRUD**: Slides, spa tracks, users (admin only)
- **Tiptap Editor**: Rich text editing for slide content

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
```

### slides
```sql
id, slide_row_id, title, subtitle, body_content (OPTIONAL), position
layout_type ('STANDARD'|'OVERFLOW'|'MINIMAL')
audio_url, image_url, video_url
content_theme ('light'|'dark'|null), title_bg_opacity (0-1)
is_published, publish_time_start/end, publish_days (JSON [0-6])
temp_unpublish_until (timestamp)
```

### spa_tracks
```sql
id, title, audio_url, is_published, display_order
volume (0-100), publish_time_start/end, publish_days (JSON)
```

---

## Key Files

### Core Application
- `src/app/layout.tsx` - Root layout with Providers
- `src/components/Providers.tsx` - SessionProvider + ThemeProvider
- `src/app/page.tsx` - Main frontend page
- `src/components/MainContent.tsx` - Slide rendering

### Icon Bars (Auth-Gated)
- `src/components/TopIconBar.tsx` - Header icons
- `src/components/BottomIconBar.tsx` - Footer icons
- `src/components/LeftIconBar.tsx` - Left sidebar icons
- `src/components/RightIconBar.tsx` - Right sidebar icons

### Authentication
- `src/lib/auth.ts` - `requireAuth()`, `requireAdmin()`
- `src/lib/authOptions.ts` - NextAuth config
- `src/app/login/page.tsx` - Login page (server component)
- `src/app/setup/page.tsx` - First admin setup

### Contexts
- `src/contexts/ThemeContext.tsx` - Persistent theme (localStorage)
- `src/contexts/SwiperContext.tsx` - Navigation context
- `src/contexts/PlaylistContext.tsx` - Playlist state

### Database
- `src/lib/db.ts` - PostgreSQL connection
- `src/lib/queries/*.ts` - CRUD operations (users, slides, slideRows, spaTracks)

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

## Authentication & Icon Visibility

### Public Icons (Always Visible)
```
home, spa, playlist_play, light_mode/dark_mode, menu, group
arrow_circle_up, arrow_circle_down, arrow_circle_left, arrow_circle_right
```

### Private Icons (Auth Required)
```
settings, refresh, comment, bottom_panel_open, open_with
atr, credit_card, payment, tag, analytics, photo_library, videocam
```

### Implementation Pattern
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()

// Conditional rendering
{session && <PrivateIcon />}
```

### Server-Side Auth
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth'

const session = await requireAuth()    // Any authenticated user
const session = await requireAdmin()   // Admin role only
```

---

## Theme System

### Usage
```typescript
import { useTheme } from '@/contexts/ThemeContext'

const { theme, toggleTheme } = useTheme()
// theme: 'light' | 'dark'
```

### CSS Variables
```css
var(--text-color)       /* Main text */
var(--bg-color)         /* Background */
var(--card-bg)          /* Cards */
var(--border-color)     /* Borders */
var(--icon-color)       /* Icons */
```

---

## Key Features

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
- Client-side filtering in MainContent

### YouTube Videos
- Supports: `youtube.com/watch?v=`, `youtu.be/`, raw IDs
- Modes: Cover (full-screen) | Contained (60px padding)

---

## API Endpoints

### Authentication
```
POST /api/auth/signin          - Login
GET  /api/auth/session         - Current session
POST /api/setup                - Create first admin
```

### Users (Admin Only)
```
GET    /api/users              - List users
POST   /api/users              - Create user
PATCH  /api/users/[id]         - Update user
DELETE /api/users/[id]         - Delete user
POST   /api/users/[id]/password - Update password
```

### Slides
```
GET    /api/slides/rows                      - List rows
GET    /api/slides/rows/[id]/slides          - List slides
POST   /api/slides/rows/[id]/slides          - Create slide
PATCH  /api/slides/rows/[id]/slides/[slideId] - Update slide
DELETE /api/slides/rows/[id]/slides/[slideId] - Delete slide
```

### Spa Tracks
```
GET    /api/spa/tracks         - List tracks
GET    /api/spa/tracks/active  - Active tracks
POST   /api/spa/tracks         - Create track
PATCH  /api/spa/tracks/[id]    - Update track
DELETE /api/spa/tracks/[id]    - Delete track
```

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
  password: 'password123',  // Auto-hashed
  role: 'ADMIN'             // Uppercase for production
})

await updateUserPassword(userId, newPassword)  // Auto-hashed
```

### Auth-Gated Components
```typescript
import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session } = useSession()

  return (
    <>
      <PublicContent />
      {session && <PrivateContent />}
    </>
  )
}
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

## Production Deployment (Railway)

### Pre-Deploy Checklist
```bash
npm run db:validate      # Validate migrations
npx tsc --noEmit        # 0 TypeScript errors
npm run build           # Must succeed
git add . && git commit -m "..." && git push origin master
```

### Environment Variables
```env
DATABASE_URL=postgresql://...              # Auto-provided by Railway
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<strong-secret>            # openssl rand -base64 32
```

### Admin Tools
```bash
# Create admin (bypasses /setup)
set DATABASE_URL=postgresql://...
npm run db:seed:admin

# Reset admin password
npm run db:reset:password

# Check database schema
npm run db:check
npm run db:validate

# Fix schema mismatch
npm run db:fix:schema
```

---

## Troubleshooting

### Sessions Not Persisting
- **Fix**: Generate strong NEXTAUTH_SECRET: `openssl rand -base64 32`
- Restart dev server after changing .env

### Icons Not Showing/Hiding Based on Auth
- **Verify**: Check browser console for session state
- **Test**: Login via group icon → private icons should appear
- **Pattern**: All icon bars use `{session && <Icon />}` pattern

### Theme Resets on Navigation
- **Status**: Fixed (Jan 2025) - uses localStorage at root level
- **Verify**: `src/components/Providers.tsx` has ThemeProvider

### Cannot Access /setup
- **Cause**: Users already exist
- **Fix**: Use `npm run db:seed:admin` instead

---

## Recent Updates

### Authentication-Based Icon Visibility (January 2025)
**Changes**:
- Frontend icons now auth-gated using `useSession()`
- Public icons always visible (navigation, theme, login)
- Private icons require authentication (settings, admin features)
- Zero breaking changes - all features work when authenticated

**Files Changed**: 4 files
- `src/components/TopIconBar.tsx` - settings icon
- `src/components/BottomIconBar.tsx` - refresh, comment, bottom_panel_open
- `src/components/LeftIconBar.tsx` - open_with
- `src/components/RightIconBar.tsx` - atr, credit_card, payment, tag, analytics, photo_library, videocam

**Impact**: Clean public-facing frontend, authenticated users see full features

### Persistent Theme + Session (January 2025)
**Changes**:
- Theme uses localStorage (was sessionStorage)
- Single root-level ThemeProvider
- 30-day session persistence
- Login auto-redirects if authenticated

**Impact**: Theme and sessions persist across browser restarts

---

**Status**: Production Ready | **Last Updated**: January 2025
