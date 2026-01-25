# NeuroKid

## Overview
NeuroKid is a Next.js-based community platform for parents of autistic children. It features forums, verified provider directories, AI chat support, and resources. The app uses PostgreSQL with Prisma ORM for data persistence.

## Project Structure
- `/web` - Main Next.js application
  - `/src/app` - Next.js App Router pages and API routes
  - `/src/components` - React components
  - `/src/lib` - Utility functions and shared code
  - `/prisma` - Database schema and migrations
- `/prisma` - Root level Prisma schema (reference)
- `/docs` - Documentation files

## Tech Stack
- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS with PostCSS

## Development
- Dev server runs on port 5000
- Database schema is managed via Prisma
- Run `cd web && npm run dev` to start development

## Database Commands
- `cd web && npx prisma db push` - Sync schema with database
- `cd web && npx prisma studio` - Open database GUI
- `cd web && npm run db:seed` - Seed database with sample data

## Premium UI Design System
The platform uses a premium, luxurious UI with the following features:
- **3D Card Effects**: Cards have hover tilt effects and layered shadows (`.card-3d`, `.shadow-premium`)
- **Glassmorphism**: Frosted glass effects with backdrop blur (`.glass`, `.glass-subtle`)
- **Animated Interactions**: Micro-animations for voting, bookmarks, and buttons (`.animate-vote-pop`, `.animate-fade-up`)
- **Premium Buttons**: Shine effects and smooth transitions (`.btn-premium`)
- **Glow Effects**: Subtle glows for primary elements (`.glow-primary`)
- **Staggered Animations**: Child elements animate in sequence (`.stagger-children`)
- **Custom Scrollbar**: Premium styled scrollbar matching the theme
- **Color Scheme**: Emerald green primary with sensory-friendly, accessible contrast

## Recent Updates (Jan 2026)
- Added premium 3D card effects and glassmorphism to globals.css
- Redesigned PostCard with 3D hover effects and improved visual hierarchy
- Enhanced VoteButtons with animated counters and satisfying pop feedback
- Updated CategorySidebar with premium styling and smooth animations
- Improved SearchBar with focus states and scale transitions
- Redesigned SortTabs with pill-style toggle buttons
- Premium-styled BookmarkButton and ReportButton with micro-interactions
- Enhanced LoadingSkeletons with premium animation effects
