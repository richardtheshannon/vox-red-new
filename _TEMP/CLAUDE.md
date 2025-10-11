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

## Technical Stack
- Next.js 15.5.4
- React 19.1.0
- Tailwind CSS v3 (stable)
- TypeScript
- Material Symbols Icons

## Routes
- **Main Application**: http://localhost:3000/ - Frontend user interface
- **Admin Interface**: http://localhost:3000/admin - Backend management dashboard

## Notes
- Development server runs on http://localhost:3000
- Uses icon border layout with fixed positioning
- Responsive design with mobile fallbacks
- Windows-optimized setup for CSS processing
- Zero new dependencies added - pure layout duplication with existing tools
- All admin components follow same architectural patterns as frontend