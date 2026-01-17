# NeuroKind Project Status & Implementation Roadmap

**Last Updated:** January 16, 2026  
**Project:** NeuroKind - Community Platform for Autistic Parents & Families

---

## Executive Summary

NeuroKind is a fully-scaffolded Next.js 16 + Prisma + PostgreSQL + Redis platform with complete authentication (NextAuth), role-based access control (RBAC), and a comprehensive database schema. The foundation is solid and ready for feature implementation.

**Status:** ✅ **Foundation Complete** - Ready for Community Module Development

---

## Current Implementation Status

### ✅ Infrastructure & Setup
- **Database:** PostgreSQL (Docker, localhost:5432) ✓
- **Cache:** Redis (Docker) ✓
- **ORM:** Prisma 5.22 with full schema (560 lines) ✓
- **Frontend:** Next.js 16.1.2 + App Router ✓
- **Styling:** Tailwind CSS 4 ✓
- **Validation:** Zod for schema validation ✓

### ✅ Authentication & Authorization
- **NextAuth:** Configured with JWT strategy ✓
- **Credentials Provider:** Email/password login ✓
- **OAuth Ready:** Google OAuth placeholders (not configured) ✓
- **RBAC System:** 4 roles implemented (PARENT, THERAPIST, MODERATOR, ADMIN) ✓
- **Test Account:** admin@neurokind.local / admin123 ✓
- **Session Management:** 30-day expiry with role refresh ✓

### ✅ Database Schema (Fully Designed)
**Auth & Users:**
- `User` - Core user entity with email, hashed password, timestamps
- `Profile` - User profiles (username, bio, avatar, verification status)
- `UserRole` - RBAC role assignments (PARENT/THERAPIST/MODERATOR/ADMIN)
- `AuditLog` - Admin audit trail

**Community (Ready for Implementation):**
- `Category` - Forum categories (slug, icon, order)
- `Tag` - Post tags (slug, color, description)
- `Post` - Posts with anonymous support, status (ACTIVE/REMOVED/LOCKED/PINNED/DRAFT)
- `Comment` - Threaded comments with parent-child relationships
- `Vote` - Upvotes/downvotes for posts and comments
- `Bookmark` - User bookmarks for posts

**Moderation:**
- `Report` - User reports (OPEN/UNDER_REVIEW/RESOLVED/DISMISSED)
- `ModerationAction` - Admin mod actions (REMOVE/LOCK/PIN/SHADOWBAN/WARN/etc)

**Other Modules (Already Designed):**
- `AIConversation` / `AIMessage` - AI Chat system
- `Notification` - Real-time notifications
- `Resource` - Knowledge base resources
- `Provider` / `ProviderReview` / `ProviderClaimRequest` - Provider directory
- `RateLimitLog` - Rate limiting tracking

### ✅ API Routes (Implemented)
- **POST** `/api/auth/register` - User registration with profile creation
- **GET/POST** `/api/auth/[...nextauth]` - NextAuth handler
- **GET/PUT** `/api/user/profile` - Profile fetch/update (protected)

### ✅ Pages (Implemented)
- **GET** `/` - Public landing page with auth state
- **GET/POST** `/login` - Login page (unprotected)
- **GET/POST** `/register` - Registration page (unprotected)
- **GET** `/settings` - User settings/profile (protected)

### ✅ Library Functions
- `getServerSession()` - Get current session with roles
- `getCurrentUser()` - Get current user with profile and roles
- `requireAuth()` - Enforce authentication
- `requireRole()` - Enforce specific role
- `hasRole()` / `hasAnyRole()` - Check permissions
- Validators for Login, Register, ProfileUpdate

### ✅ Seed Data
- Categories: Behavior, Speech & Language, School, Medical, Parenting, etc.
- Tags: autism, adhd, sensory, sleep, nutrition, etc.
- Sample admin account with ADMIN role

---

## What's NOT Implemented Yet

### Community Module
- ❌ Post creation/listing API routes
- ❌ Comment creation/threading API routes
- ❌ Vote/upvote system
- ❌ Post/comment search and filtering
- ❌ Anonymous posting mechanism
- ❌ Frontend pages: Community hub, Post list, Single post view, Create post form
- ❌ Comment rendering (threaded)
- ❌ Bookmark UI

### Moderation Panel
- ❌ Admin moderation dashboard
- ❌ Report management UI
- ❌ Report approval/rejection/notes UI
- ❌ User management (role assignment, shadowban, etc.)
- ❌ Moderation action logging UI
- ❌ Bulk moderation actions

### Other Features
- ❌ Real-time notifications
- ❌ AI chat interface
- ❌ Provider directory search
- ❌ Rate limiting enforcement
- ❌ Search functionality
- ❌ Follow/unfollow system
- ❌ Direct messaging
- ❌ Email notifications

---

## Implementation Roadmap (Ordered by Dependencies)

### Phase 1: Community Module - Backend APIs (2-3 days)

#### Task 1.1: Post API Routes
**File:** `src/app/api/posts/route.ts` (create new)

Create endpoints:
- `POST /api/posts` - Create post (authenticated, can be anonymous)
- `GET /api/posts` - List posts with pagination, filtering by category/tag/status
- `GET /api/posts/[id]` - Get single post with comment count
- `PUT /api/posts/[id]` - Update post (author only)
- `DELETE /api/posts/[id]` - Delete post (author or mod)

Responsibilities:
- Validate post data (title, content, category, tags, isAnonymous flag)
- Create post with authorId=null if anonymous
- Increment view count on GET
- Filter by PostStatus.ACTIVE (except for mods viewing their own)
- Return pagination metadata (total, page, pageSize)

#### Task 1.2: Comment API Routes
**File:** `src/app/api/posts/[id]/comments/route.ts` (create new)

Create endpoints:
- `POST /api/posts/[id]/comments` - Create top-level comment
- `POST /api/posts/[id]/comments/[commentId]/replies` - Create reply (threaded)
- `GET /api/posts/[id]/comments` - Get all comments (tree structure)
- `PUT /api/posts/[id]/comments/[commentId]` - Edit comment
- `DELETE /api/posts/[id]/comments/[commentId]` - Delete comment

Responsibilities:
- Support threaded comments (parentCommentId)
- Return comments in tree structure
- Filter by CommentStatus.ACTIVE (except mods)
- Validate comment content length
- Update post.commentCount automatically

#### Task 1.3: Vote API Routes
**File:** `src/app/api/votes/route.ts` (create new)

Create endpoints:
- `POST /api/votes` - Create/update vote (body: targetType, targetId, value: +1/-1)
- `GET /api/votes/[targetType]/[targetId]` - Get vote count for post/comment
- `DELETE /api/votes/[targetType]/[targetId]` - Remove user's vote

Responsibilities:
- Store vote with unique constraint (userId, targetId, targetType)
- Return vote count and user's vote
- Update post/comment vote counts
- Handle vote flipping (changing +1 to -1)

#### Task 1.4: Post Validators
**File:** `src/lib/validators.ts` (extend existing)

Add validators:
- `CreatePostSchema` - title (3-255 chars), content (10+ chars), categoryId, tags[], isAnonymous
- `CreateCommentSchema` - content (1-5000 chars), postId
- `CreateReplySchema` - content (1-5000 chars), postId, parentCommentId

---

### Phase 2: Community Module - Frontend Pages (2-3 days)

#### Task 2.1: Community Hub Page
**File:** `src/app/community/page.tsx` (create new)

Features:
- Display all categories as grid/tabs
- Show featured/pinned posts
- Latest posts feed with pagination
- Filter/sort options (newest, popular, trending)
- Link to create post (authenticated only)
- Search box

#### Task 2.2: Category View Page
**File:** `src/app/community/[category]/page.tsx` (create new)

Features:
- Posts filtered by category
- Pagination
- Sort options (newest, top, controversial)
- "Create Post" button for authenticated users
- Tag chips for filtering
- Post preview cards (title, excerpt, author, vote count, comment count)

#### Task 2.3: Single Post Page
**File:** `src/app/community/posts/[id]/page.tsx` (create new)

Features:
- Full post display with metadata
- "Posted by" info (show "Anonymous" if isAnonymous=true)
- Vote buttons (+/- with count)
- Bookmark button
- Comments section with threaded view
- "Reply" and "Reply to comment" forms
- Edit/Delete buttons for post author (if author matches session)
- Mod action menu for moderators/admins

#### Task 2.4: Create Post Page
**File:** `src/app/community/posts/new/page.tsx` (create new)

Features:
- Protected route (redirect to login if not authenticated)
- Form: Title, Content (markdown editor optional), Category dropdown, Tag multi-select, Anonymous toggle
- Preview button
- Draft save to localStorage
- Submit creates post via POST /api/posts
- Redirect to post page on success
- Show loading/error states

#### Task 2.5: Post Components
**Create new folder:** `src/components/community/`

Components to create:
- `PostCard` - Reusable post preview card
- `CommentThread` - Render threaded comments recursively
- `CommentForm` - Create/edit comment form
- `VoteButtons` - Up/downvote buttons
- `PostAuthor` - Display author info or "Anonymous"
- `CategorySelect` - Category dropdown
- `TagSelect` - Multi-select tag picker
- `PostStatusBadge` - Show post status (pinned, locked, etc)

---

### Phase 3: Search & Filtering (1-2 days)

#### Task 3.1: Search API Route
**File:** `src/app/api/search/posts/route.ts` (create new)

Endpoint:
- `GET /api/search/posts?q=...&category=...&tag=...&sort=...&page=...`

Features:
- Full-text search on post title + content using PostgreSQL `ILIKE`
- Filter by category, tag(s), date range, status
- Sort by: relevance, newest, popular (vote count), trending
- Pagination
- Limit results to non-removed posts (and non-removed comments for count)

#### Task 3.2: Search Results Page
**File:** `src/app/search/page.tsx` (create new)

Features:
- Search query input
- Filters panel (category, tags, date, sort)
- Results display with pagination
- "No results" message
- Integration with `/api/search/posts`

---

### Phase 4: Moderation Panel (2-3 days)

#### Task 4.1: Moderation API Routes
**File:** `src/app/api/admin/moderation/route.ts` (create new)

Endpoints:
- `GET /api/admin/moderation/reports` - List reports (paginated, filterable by status)
- `GET /api/admin/moderation/reports/[id]` - Get report details
- `POST /api/admin/moderation/reports/[id]/review` - Approve/reject report (body: status, notes)
- `POST /api/admin/moderation/actions` - Create moderation action (body: action, targetUserId/postId/commentId, notes)
- `GET /api/admin/moderation/actions` - List recent moderation actions
- `GET /api/admin/users` - List all users (paginated)
- `PUT /api/admin/users/[id]/roles` - Update user roles
- `POST /api/admin/users/[id]/shadowban` - Toggle shadowban

All endpoints protected with `requireRole("ADMIN")` or `requireAnyRole(["ADMIN", "MODERATOR"])`

#### Task 4.2: Report Submission API
**File:** `src/app/api/reports/route.ts` (create new)

Endpoint:
- `POST /api/reports` - Submit report (body: targetType, targetId, reason, description)
- Authenticated users only
- Create Report record in DB
- Optional: trigger notification to mods

#### Task 4.3: Admin Dashboard
**File:** `src/app/admin/page.tsx` (create new)

Features:
- Protected route: `requireRole("ADMIN")`
- Dashboard stats: total users, posts, reports (open/pending), recent actions
- Quick links to moderation panel

#### Task 4.4: Moderation Panel Page
**File:** `src/app/admin/moderation/page.tsx` (create new)

Features:
- Report queue (filter by status)
- Report cards with: target (post/comment/user), reason, reporter, timestamp, actions
- "Review" button → detail modal with full context
- Approve/Reject/More info buttons
- Notes field
- Link to user profile / post / comment

#### Task 4.5: User Management Page
**File:** `src/app/admin/users/page.tsx` (create new)

Features:
- User table/list (paginated search)
- Show roles, created date, last login
- Edit roles dropdown (multi-select: PARENT/THERAPIST/MODERATOR/ADMIN)
- Shadowban toggle button
- View user profile button

#### Task 4.6: Moderation Components
**Create:** `src/components/admin/`

Components:
- `ReportCard` - Report preview in queue
- `ReportDetailModal` - Full report review modal
- `UserRoleEditor` - Role assignment UI
- `ModerationActionLog` - Timeline of mod actions on post/user
- `ShadowbanToggle` - Shadowban button
- `ModStats` - Dashboard statistics cards

---

### Phase 5: Polish & Enhancement (1-2 days)

#### Task 5.1: Permissions & Guards
- Add middleware to check role-based access to routes
- Create `ProtectedRoute` component
- Ensure anonymous posts don't leak author info in APIs

#### Task 5.2: Rate Limiting
- Implement rate limit checks on post/comment creation
- Log attempts to RateLimitLog
- Return 429 Too Many Requests when limit exceeded

#### Task 5.3: Notifications
- Trigger notifications when post is commented on
- Trigger notifications when comment is replied to
- Trigger notifications for mentions (@username)
- Show notification badge in nav

#### Task 5.4: Edge Cases & Error Handling
- Soft delete posts/comments (set status to REMOVED)
- Prevent voting on own posts
- Prevent duplicate votes
- Validate category/tag ownership in seed

---

## File Structure After Complete Implementation

```
src/
├── app/
│   ├── community/
│   │   ├── page.tsx                    # Community hub
│   │   ├── posts/
│   │   │   ├── new/page.tsx           # Create post form
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx           # Single post + comments
│   │   │   │   └── comments/route.ts  # Comments API (in api folder)
│   │   │   └── route.ts               # Posts CRUD API
│   │   └── [category]/page.tsx        # Category view
│   ├── search/
│   │   └── page.tsx                    # Search results
│   ├── admin/
│   │   ├── page.tsx                    # Admin dashboard
│   │   ├── moderation/
│   │   │   └── page.tsx               # Moderation panel
│   │   └── users/
│   │       └── page.tsx               # User management
│   ├── api/
│   │   ├── posts/route.ts             # POST/GET/PUT/DELETE posts
│   │   ├── posts/[id]/comments/route.ts   # POST/GET comments
│   │   ├── votes/route.ts             # Voting system
│   │   ├── reports/route.ts           # Report submission
│   │   ├── search/posts/route.ts      # Search API
│   │   ├── admin/
│   │   │   ├── moderation/route.ts    # Moderation CRUD
│   │   │   └── users/route.ts         # User management CRUD
│   │   ├── auth/ (existing)
│   │   └── user/ (existing)
│   ├── (auth)/ (existing)
│   ├── settings/ (existing)
│   ├── layout.tsx (existing)
│   └── page.tsx (existing)
├── components/
│   ├── community/
│   │   ├── PostCard.tsx
│   │   ├── CommentThread.tsx
│   │   ├── CommentForm.tsx
│   │   ├── VoteButtons.tsx
│   │   ├── PostAuthor.tsx
│   │   ├── CategorySelect.tsx
│   │   ├── TagSelect.tsx
│   │   └── PostStatusBadge.tsx
│   ├── admin/
│   │   ├── ReportCard.tsx
│   │   ├── ReportDetailModal.tsx
│   │   ├── UserRoleEditor.tsx
│   │   ├── ModerationActionLog.tsx
│   │   ├── ShadowbanToggle.tsx
│   │   └── ModStats.tsx
│   └── (existing layout components)
├── lib/
│   ├── auth.ts (existing)
│   ├── rbac.ts (existing)
│   ├── validators.ts (extend with post/comment schemas)
│   ├── prisma.ts (existing)
│   └── post-utils.ts (new: helper functions for posts)
└── generated/ (existing Prisma client)
```

---

## Command Reference

### Database Commands
```bash
# Push schema changes
npm run db:push

# Create migration
npx prisma migrate dev --name <migration_name>

# Seed database
npm run db:seed

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

### Development
```bash
# Start dev server
npm run dev

# Start with database studio
npm run db:studio &
npm run dev

# Lint
npm run lint
```

---

## Key Decision Points

1. **Anonymous Posting:** Handled by setting `authorId=null`. Frontend shows "Anonymous User" when true.
2. **Threaded Comments:** Use `parentCommentId` for nested structure. Frontend renders recursively.
3. **Vote System:** Store votes as separate records (unique on userId+targetId). Calculate totals on query.
4. **Moderation:** Soft delete via status (REMOVED/LOCKED/PINNED) rather than hard delete for audit trail.
5. **Search:** Start with PostgreSQL `ILIKE` for simplicity; upgrade to Elasticsearch later if needed.
6. **Shadowban:** Moderators can hide shadowbanned users' posts without user knowing.
7. **Rate Limiting:** Track RateLimitLog per user per action type; enforce in middleware.

---

## Next Immediate Steps

1. **Review this document** with team
2. **Start Phase 1.1:** Create `src/app/api/posts/route.ts` with POST/GET handlers
3. **Run `npm run db:push`** to ensure schema is synced
4. **Create test cases** for each API endpoint
5. **Implement incrementally**, testing each task before moving to the next

---

## Notes

- **Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma 5.22, PostgreSQL, Tailwind CSS 4, NextAuth
- **Database:** All tables already defined in schema; ready for use
- **Auth:** RBAC working, protected routes via `requireRole()` / `requireAuth()`
- **Testing Account:** admin@neurokind.local / admin123 with ADMIN role
- **Environment:** Docker Compose running Postgres & Redis locally

All foundation work is complete. Ready to build features!
