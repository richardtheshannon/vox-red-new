# Claude Configuration

This file contains configuration and notes for Claude Code.

## Project Information
- Working Directory: nextjs-app
- Platform: Windows
- Git Repository: Yes
- Current Branch: master

## Common Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm install` - Install dependencies
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize PostgreSQL database schema
- `npm run db:seed` - Seed database with sample data

## Recent Application Updates

### Development Environment Fixes
- **Fixed Tailwind CSS v4 compatibility issue**: Downgraded from Tailwind v4 to stable v3 due to LightningCSS Windows compatibility issues
- **Updated CSS configuration**: Changed from `@import "tailwindcss"` to standard Tailwind v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`)
- **Created tailwind.config.js**: Added proper Tailwind v3 configuration file
- **Updated postcss.config.mjs**: Changed from Tailwind v4 syntax to v3 syntax with autoprefixer

### UI/UX Improvements
- **Implemented 3-column layout**: Main content area now has responsive grid layout (1/8, 6/8, 1/8 proportions on desktop)
- **Improved icon styling**: Made Material Symbols icons thinner using font-variation-settings
- **Removed Next.js branding**: Deleted next.svg file and added CSS to hide development indicator

### Layout Structure
- **MainContent.tsx**: Updated to use responsive grid layout with side panels
- **globals.css**: Enhanced with better icon styling and Next.js dev tool hiding

### Backend Admin Interface (NEW)
- **Created `/admin` route**: Complete backend management interface at http://localhost:3000/admin
- **Duplicated layout structure**: Admin interface uses identical 3-column responsive layout (1/8, 6/8, 1/8)
- **Backend-focused components**: 5 new admin components with management-specific icons and functionality
  - **AdminTopIconBar.tsx**: Dashboard, bug reports, documentation, exit to main app
  - **AdminBottomIconBar.tsx**: Import/export, backup, sync, system updates
  - **AdminLeftIconBar.tsx**: User management, groups, moderation, content management
  - **AdminRightIconBar.tsx**: Analytics, library, audio files, monitoring, storage
  - **AdminMainContent.tsx**: Admin dashboard with bug reports, documentation, content library stats

### Navigation Integration
- **Settings icon navigation**: Main app settings icon (/) now links to admin interface (/admin)
- **Exit navigation**: Admin interface exit icon (/admin) links back to main app (/)
- **Bidirectional routing**: Seamless navigation between frontend and backend interfaces
- **Preserved styling**: All existing CSS classes and responsive behavior maintained

### Admin Dashboard Features
- **Content Library Management**: Statistics for Meditation (125), Yoga (89), Courses (45), Mantras (67)
- **Service Commitments Repository**: Management interface for 50-100 daily service prompts
- **System Status Panel**: Real-time display of server status, active users, storage usage, open tickets
- **Bug Reports & Documentation**: Dedicated management sections for issue tracking and help articles

### Icon Corrections
- **Fixed Material Symbols compatibility**: Replaced invalid icons that were causing rendering issues
  - `moderation` → `gavel`, `audio_file` → `audiotrack`, `monitoring` → `monitor`
  - `data_usage` → `pie_chart`, `system_update_alt` → `system_update`
- **Eliminated text fallbacks**: Resolved "RATION" text display issue from invalid icon names

### Swiper.js Integration (NEW)
- **Touch-Based Navigation**: Integrated Swiper.js 12.0.2 for smooth touch/swipe gestures in main content area
- **3-Slide Content Structure**: Main content now consists of swipeable slides:
  1. **Audio Library** - Browse meditation tracks, yoga sessions, spiritual courses
  2. **Playlists** - Personal collections, recommendations, recently played content
  3. **Service Commitments** - Daily practices, progress tracking, spiritual growth
- **Footer Arrow Navigation**: Connected existing footer arrow icons to control slide navigation
  - `arrow_circle_left` → Previous slide (with hover effects)
  - `arrow_circle_right` → Next slide (with hover effects)
- **Context-Based Communication**: Created SwiperContext for component communication between MainContent and BottomIconBar
- **Removed Built-in Controls**: Eliminated Swiper's default navigation arrows and pagination dots for cleaner interface
- **Preserved Responsive Design**: Maintained 3-column layout (1/8, 6/8, 1/8) with mobile fallbacks
- **Enhanced User Experience**:
  - Touch/swipe gestures work on both mobile and desktop
  - Smooth animations between content sections
  - Visual feedback on interactive elements
  - Content organized by functional areas (library, playlists, commitments)

### Enhanced Footer Navigation (NEW)
- **Complete 4-Direction Navigation**: All footer arrow icons now provide interactive navigation
  - `arrow_circle_left` → Previous slide (Audio Library ← Playlists ← Service Commitments)
  - `arrow_circle_right` → Next slide (Audio Library → Playlists → Service Commitments)
  - `arrow_circle_up` → Scroll up within current slide content (200px smooth scroll)
  - `arrow_circle_down` → Scroll down within current slide content (200px smooth scroll)
- **Centralized Context Management**: Moved SwiperProvider to page level for global component access
- **Enhanced SwiperContext**: Extended with `scrollUp` and `scrollDown` methods for vertical navigation
- **Consistent UI Interaction**: All arrow icons feature hover effects and cursor pointer styling
- **Debugging & Error Resolution**: Fixed duplicate export error and context accessibility issues
- **Smart Scroll Targeting**: Automatically tracks active slide's scroll container for precise vertical navigation

### Typography & Design Updates (LATEST)
- **Google Fonts Integration**: Added Ubuntu and Open Sans fonts via Google Fonts API
  - **Title Font**: Ubuntu (300, 400, 500, 700 weights) for all H1-H6 elements and `.font-title` class
  - **Paragraph Font**: Open Sans (300, 400, 500, 600, 700 weights) for all `p` elements and body text
  - **CSS Custom Properties**: Defined `--font-title` and `--font-paragraph` variables for consistent usage
  - **Cross-Platform Coverage**: Fonts applied automatically to both main app and admin interface
- **Slide Content Simplification**: Streamlined all swiper slides to minimal design
  - **Reduced Content**: Each slide now contains only H1 title + single descriptive paragraph
  - **Removed Clutter**: Eliminated colored content cards, extra sections, and H2 headings
  - **Vertical Centering**: All slide content is perfectly centered vertically using flexbox
  - **Consistent Messaging**: Unified content across desktop and mobile layouts
- **Layout Optimization**: Simplified desktop layout structure
  - **Removed Side Panels**: Eliminated left and right columns from desktop 3-column grid
  - **Full-Width Content**: Main content now uses entire available screen width
  - **Clean Design**: Focused user attention on core slide content without distractions
  - **Mobile Unchanged**: Preserved existing mobile layout and functionality
- **Navigation Enhancement**: Improved home icon functionality
  - **Home Icon Click**: Top-left home icon now navigates to main page (/) with hover effects
  - **Visual Feedback**: Added cursor pointer and opacity hover transition

### Database Architecture Migration (MAJOR UPDATE)
- **Complete Prisma Removal**: Migrated from Prisma ORM to direct PostgreSQL using `pg` client library
- **Unified Database Platform**: PostgreSQL for both local development and Railway production environments
- **Performance Optimization**: Direct SQL queries eliminate ORM overhead and provide full database control
- **Schema Conversion**: Converted Prisma schema to native PostgreSQL DDL with proper constraints and indexes
- **Connection Pooling**: Implemented efficient connection management with pg.Pool for production-ready scalability
- **Transaction Support**: Added transaction helpers for complex multi-table operations
- **Error Handling**: Comprehensive database error handling with graceful degradation

### Database Integration (PostgreSQL Native)
- **Direct PostgreSQL Integration**: Native SQL queries with `pg` client library (v8.16.3)
- **Unified Database Support**: PostgreSQL for both local development and Railway production
- **Comprehensive Schema**: 8 core models supporting full MP3 Manager functionality
  - **User Management**: Role-based access (Admin, Moderator, User)
  - **Audio File System**: Complete metadata support (artist, album, duration, bitrate, file size)
  - **Playlist Management**: User playlists with ordering and privacy controls
  - **Category Organization**: Pre-seeded with Meditation, Yoga, Courses, Mantras
  - **Service Commitments**: Repository system for 50-100 daily service prompts
  - **Admin Tools**: Bug reporting, documentation management, system analytics
  - **Content Moderation**: File approval workflow with status tracking
- **Database Health Check**: `/api/test-db` endpoint for monitoring and Railway deployment
- **Seeded Sample Data**: Default admin user, categories, and service commitments
- **Railway Ready**: Deployment configuration with PostgreSQL schema optimization

## Technical Stack
- Next.js 15.5.4
- React 19.1.0
- Tailwind CSS v3 (stable)
- TypeScript
- Material Symbols Icons
- Swiper.js 12.0.2 (touch/swipe navigation)
- PostgreSQL with `pg` client library
- Direct SQL queries (no ORM)

## Routes
- **Main Application**: http://localhost:3000/ - Frontend user interface
- **Admin Interface**: http://localhost:3000/admin - Backend management dashboard
- **Database Test**: http://localhost:3000/api/test-db - Database connection health check

## Database Setup (PostgreSQL)

### Local Development Setup
1. **Install PostgreSQL**: Ensure PostgreSQL 17+ is installed locally
2. **Create Database**: `createdb mp3_manager`
3. **Configure Connection**: Set `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mp3_manager"
   ```
4. **Initialize Schema**: `npm run db:init`
5. **Seed Data**: `npm run db:seed`

### Railway Deployment (PostgreSQL)
- **Environment**: Uses Railway's automatically provided DATABASE_URL
- **Auto-initialization**: Database schema and seeding handled automatically
- **Health check**: `/api/test-db` endpoint for Railway health monitoring

### Database Features
- **User Management**: Admin, Moderator, User roles with authentication ready
- **Audio File Management**: Complete metadata support (artist, album, duration, file size, etc.)
- **Playlist System**: User playlists with item ordering and privacy controls
- **Category Organization**: Meditation, Yoga, Courses, Mantras with color coding
- **Service Commitments**: Repository for 50-100 daily service prompts
- **Admin Tools**: Bug reporting, documentation management, system analytics
- **Content Moderation**: File approval workflow with status tracking

## Notes
- Development server runs on http://localhost:3000
- Uses icon border layout with fixed positioning
- Responsive design with mobile fallbacks
- Windows-optimized setup for CSS processing
- Database-ready with Prisma ORM and full schema implementation
- Dual environment support: SQLite (local) + PostgreSQL (Railway)
- All admin components follow same architectural patterns as frontend
- Railway deployment configured with health monitoring
- Touch-enabled main content with swipeable slides controlled by footer navigation
- Context-based component communication for Swiper navigation controls
- Complete 4-direction footer arrow navigation (slide + scroll control)
- Centralized SwiperProvider context management for cross-component communication

## File Structure Updates

### Database Migration Files (NEW)
- **src/lib/db.ts**: PostgreSQL connection utility with pooling, query helpers, and transaction support
- **scripts/init-db.ts**: Database schema initialization script with full DDL and indexes
- **scripts/seed-db.ts**: Sample data seeding script with categories, admin user, and service commitments
- **scripts/railway-init.ts**: Railway deployment initialization combining schema setup and seeding
- **.env.example**: Environment configuration template for local PostgreSQL setup

### Swiper Integration Files
- **src/contexts/SwiperContext.tsx**: React context for Swiper navigation communication with scroll methods
- **src/components/MainContent.tsx**: Enhanced with Swiper integration and slide content
- **src/components/BottomIconBar.tsx**: Footer arrows now control slide navigation and content scrolling
- **src/app/page.tsx**: Updated to provide centralized SwiperProvider context for all components

### Removed Files
- **prisma/**: Complete Prisma directory removed (schema.prisma, migrations, seed.ts)
- **railway.schema.prisma**: Railway-specific Prisma schema removed
- **src/lib/prisma.ts**: Prisma client configuration removed