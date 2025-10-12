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

### Essential Audio Player Integration (LATEST)
- **Third-Party Audio Player**: Integrated Essential Audio Player from essential-audio-player.net for MP3 playback functionality
- **React Component Wrapper**: Created `EssentialAudioPlayer.tsx` with proper TypeScript types and SSR handling
- **Hydration Fix**: Implemented client-side only rendering to prevent server/client mismatch errors
- **Custom Red Theme Styling**: Comprehensive CSS customization in `globals.css`
  - **Red Color Scheme**: Play button (#dc2626) and progress bar with hover effects and transitions
  - **Left Alignment**: Removed center alignment for left-justified layout matching design requirements
  - **Professional Layout**: Play button → Progress bar → Time display horizontal arrangement
  - **Responsive Design**: Maximum width constraint (400px) with flexible gap spacing
- **Slide Integration**: Audio players positioned between H1 titles and paragraph content on all 3 slides
  - **Audio Library**: `/media/meditation-sample.mp3`
  - **Playlists**: `/media/playlist-sample.mp3`
  - **Service Commitments**: `/media/service-sample.mp3`
- **File Structure**: Essential Audio Player files located in `public/essential-audio-player/` directory
- **Cross-Platform Support**: Works on both desktop and mobile with consistent styling

### Railway Deployment Preparation (LATEST)
- **Production Build Optimization**: Fixed all TypeScript and Next.js compatibility issues for Railway deployment
- **Next.js Configuration**: Removed deprecated `buildActivity` setting from `next.config.ts`
- **Font Loading Optimization**: Added `display=optional` parameters to Google Fonts for better performance
- **Script Loading**: Migrated from manual `<script>` tags to Next.js `<Script>` component with `beforeInteractive` strategy
- **TypeScript Strict Mode**: Eliminated all `any` types with proper type definitions
  - **EssentialAudioPlayer**: Window globals properly typed with interface definitions
  - **Database Layer**: `PoolClient` and `Record<string, unknown>` types for query functions
- **Build Validation**: All components pass TypeScript compilation (`npx tsc --noEmit`) with zero errors
- **Production Ready**:
  - **Build Size**: Optimized at 132KB first load JS
  - **Static Generation**: 7/7 pages successfully generated
  - **Route Optimization**: Static and dynamic routes properly configured
  - **Database Health Check**: Functional `/api/test-db` endpoint for Railway monitoring

## Technical Stack
- Next.js 15.5.4
- React 19.1.0
- Tailwind CSS v3 (stable)
- TypeScript
- Material Symbols Icons
- Swiper.js 12.0.2 (touch/swipe navigation)
- Essential Audio Player (MP3 playback)
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
- Database-ready with direct PostgreSQL integration (no ORM)
- PostgreSQL for both local development and Railway production
- All admin components follow same architectural patterns as frontend
- Railway deployment configured with health monitoring and optimized builds
- Touch-enabled main content with swipeable slides controlled by footer navigation
- Context-based component communication for Swiper navigation controls
- Complete 4-direction footer arrow navigation (slide + scroll control)
- Centralized SwiperProvider context management for cross-component communication
- Integrated MP3 audio playback on all slides with Essential Audio Player
- Custom red-themed audio player styling with left alignment
- Production-ready with TypeScript strict mode and zero build errors

### Mobile Layout Optimization (LATEST)
- **Mobile Alignment Fix**: Corrected mobile view content alignment to be left-aligned while maintaining vertical centering
  - **Layout Enhancement**: Changed mobile slides from `justify-center` to `justify-center items-start`
  - **Audio Player Position**: Updated from `mx-auto` to `w-full` for proper left alignment
  - **Visual Consistency**: Maintained vertical centering with `justify-center` while ensuring left text/content alignment
- **Mobile Audio Player Improvements**: Enhanced mobile audio player display and functionality
  - **Full Width Display**: Ensured MP3 player shows completely with full progress bar on mobile devices
  - **Border Removal**: Eliminated unwanted grey borders at bottom of mobile audio player
  - **Responsive Sizing**: Added mobile-specific CSS with minimum 280px width and proper flex layout
  - **Touch Optimization**: Improved mobile controls visibility and interaction areas

### Content Slide Testing & Alignment Fix (LATEST)
- **Overflow Test Slide Addition**: Added fourth slide "Spiritual Teachings" with extensive paragraph content for testing scroll functionality
  - **Content Volume**: 12 comprehensive paragraphs covering spiritual traditions (Buddhism, Hinduism, Christianity, Islam, Zen, etc.)
  - **Scroll Testing**: Content intentionally exceeds slide height to test vertical scrolling with footer up/down arrows
  - **Audio Player Integration**: Maintains consistency with existing slides including Essential Audio Player
- **Vertical Alignment Standardization**: Fixed alignment inconsistency across all slides
  - **Desktop Fix**: Changed overflow slide from `justify-start` to `justify-center` to match other slides
  - **Mobile Fix**: Changed overflow slide from `justify-start items-start` to `justify-center items-start` for consistency
  - **Design Principle**: All slides maintain vertical centering (`justify-center`) regardless of content volume
  - **Scroll Behavior**: Vertical centering preserved even when content overflows and requires scrolling

### Swiper Runtime Error Fix (LATEST)
- **Critical Runtime Error Resolution**: Fixed `Cannot read properties of undefined (reading 'undefined')` TypeError in Swiper slide change handler
  - **Root Cause**: `swiper.activeIndex` was undefined during Swiper initialization timing issues between desktop and mobile instances
  - **Error Location**: `src/app/page.tsx:39` in `handleSlideChange` function when accessing `swiper.slides[swiper.activeIndex]`
  - **Surgical Fix**: Added comprehensive safety checks to prevent crashes without affecting functionality
    - Validates `swiper` object exists
    - Checks `swiper.activeIndex` is defined (not undefined)
    - Ensures `swiper.slides` array is available
  - **Preserved Functionality**: All existing slide navigation and scroll behavior maintained
  - **Zero Layout Impact**: No visual or behavioral changes to user interface
  - **Development Stability**: Local development server now runs without TypeError crashes

### Railway Deployment Resolution
- **Build Phase Fix**: Resolved Railway deployment failures by moving database initialization from build to runtime
  - **Database Timing**: Moved `tsx scripts/railway-init.ts` from build script to start script
  - **Connection Availability**: Fixed `ENOTFOUND postgres.railway.internal` errors by ensuring database access only at runtime
  - **Graceful Handling**: Added error handling for existing database schemas to prevent startup failures
- **Database Connection Optimization**: Enhanced PostgreSQL connection settings for Railway environment
  - **SSL Configuration**: Added SSL support with `rejectUnauthorized: false` for Railway PostgreSQL
  - **Timeout Adjustments**: Increased connection timeouts to 20s and query timeouts to 45s for Railway network latency
  - **Pool Optimization**: Reduced connection pool from 20 to 10 connections for Railway resource limits
- **Health Check Resilience**: Improved `/api/test-db` endpoint reliability for Railway health monitoring
  - **Retry Logic**: Enhanced from 3 to 5 retry attempts with exponential backoff (1s, 2s, 4s, 8s, 10s max)
  - **Error Recovery**: Better error handling and logging for Railway deployment diagnostics
  - **Graceful Degradation**: Startup continues even if database is already initialized

### Light/Dark Theme System (LATEST)
- **Complete Theme Toggle Implementation**: Added comprehensive light/dark mode system with session persistence
- **Theme Context**: Created `ThemeContext.tsx` with React context for global theme state management
  - **Session Storage**: Theme preference persists during browser session but resets on new session
  - **Dynamic Icon**: Toggle shows moon icon in light mode, sun icon in dark mode
  - **Cross-Interface Support**: Available in both main app and admin interface
- **Header Integration**: Theme toggle positioned between settings and menu icons in top navigation
  - **Main App**: TopIconBar.tsx includes theme toggle with hover effects
  - **Admin Interface**: AdminTopIconBar.tsx includes identical theme toggle functionality
- **Comprehensive CSS Variables**: Full theme system with extensive variable coverage
  - **Core Colors**: `--bg-color`, `--text-color`, `--icon-color` for primary elements
  - **UI Elements**: `--header-bg`, `--footer-bg`, `--content-bg` for layout components
  - **Interactive Elements**: `--icon-hover`, `--progress-bg` for user interactions
  - **Admin Specific**: `--card-bg`, `--border-color`, `--secondary-text` for admin interface
- **Complete UI Coverage**: All elements properly themed for both light and dark modes
  - **Background**: Full dark background (#1a1a1a) in dark mode, white in light mode
  - **Text Elements**: All headings, paragraphs, and content text properly colored
  - **Icons**: Material Symbols icons change to white in dark mode, black in light mode
  - **Audio Player**: Progress bars, time displays, and controls themed appropriately
  - **Admin Interface**: Cards, panels, borders, and status elements fully themed
- **Smooth Transitions**: 0.3s ease transitions between theme changes for professional UX
- **Material Icons Font Loading Fix**: Resolved icon display issues on initial page load
  - **Font Preloading**: Added preload link for Material Symbols font
  - **Display Strategy**: Changed from `display=optional` to `display=swap` for better loading
  - **JavaScript Fallback**: Added font loading detection and repaint trigger
  - **Hardcoded Style Removal**: Removed conflicting `bg-white text-black` body classes

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

### Essential Audio Player Files (NEW)
- **src/components/EssentialAudioPlayer.tsx**: React wrapper component with TypeScript types and SSR compatibility
- **public/essential-audio-player/essential_audio.js**: Core Essential Audio Player JavaScript library
- **public/essential-audio-player/essential_audio.css**: Default CSS styles (overridden by custom styles)
- **public/media/**: Directory containing MP3 audio files (meditation-sample.mp3, playlist-sample.mp3, service-sample.mp3)
- **src/app/globals.css**: Extended with comprehensive Essential Audio Player custom styling (red theme, left alignment)

### Theme System Files (NEW)
- **src/contexts/ThemeContext.tsx**: React context for global theme state management with session storage
- **src/components/TopIconBar.tsx**: Updated with theme toggle integration between settings and menu icons
- **src/components/admin/AdminTopIconBar.tsx**: Updated with theme toggle for admin interface consistency
- **src/app/page.tsx**: Enhanced with ThemeProvider wrapper for main application
- **src/app/admin/page.tsx**: Enhanced with ThemeProvider wrapper for admin interface
- **src/app/layout.tsx**: Updated with improved Material Symbols font loading and removed conflicting body classes
- **src/app/globals.css**: Comprehensive theme system with CSS variables and complete UI coverage overrides

### Removed Files
- **prisma/**: Complete Prisma directory removed (schema.prisma, migrations, seed.ts)
- **railway.schema.prisma**: Railway-specific Prisma schema removed
- **src/lib/prisma.ts**: Prisma client configuration removed