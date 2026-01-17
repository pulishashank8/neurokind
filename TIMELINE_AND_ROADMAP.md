# NeuroKind Development Roadmap - Visual & Timeline

## High-Level Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NeuroKind Development Phases                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: Backend APIs        Phase 2: Frontend       Phase 3-5    │
│  (2-3 days)                   (2-3 days)            (4-5 days)     │
│  ✓ Posts CRUD                 ✓ Community hub        ✓ Moderation  │
│  ✓ Comments (threaded)        ✓ Post pages          ✓ Search      │
│  ✓ Votes                      ✓ Forms               ✓ Polish      │
│  ✓ Validators                 ✓ Components                         │
│                                                                     │
│  ├─────────────────────────────────────────────────────────────┤ │
│  Day 1-2          Day 3-4       Day 5-6        Day 7-8   Day 9-10 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Community Backend APIs (Days 1-4)

### Task Dependency Graph

```
                    Database Schema
                         ↓
            ┌────────────────────────────┐
            │                            │
        Validators                  Auth & RBAC
            │                            │
            └────────────────────────────┘
                      ↓
        ┌─────────────┬──────────┬──────────┐
        ↓             ↓          ↓          ↓
    POST API    COMMENT API   VOTE API   SEARCH API
        ↓             ↓          ↓          ↓
        └─────────────┴──────────┴──────────┘
                      ↓
                 Phase 1 Complete
                 (Ready for Frontend)
```

### Day 1-2: Posts API (`src/app/api/posts/route.ts`)

```
Task 1.1: Create Posts Route Handler
├── POST: Create post
│   ├── Authenticate user
│   ├── Validate input (title, content, category, tags, isAnonymous)
│   ├── If anonymous: authorId = null
│   ├── Create post with tags
│   └── Return post
│
└── GET: List posts (filtered, paginated, sorted)
    ├── Query params: page, pageSize, category, tag, sort, status
    ├── Filter by status (ACTIVE for users, all for mods)
    ├── Sort: newest, popular, trending
    ├── Paginate results
    └── Include author profile & vote counts
```

### Day 3: Comments API (`src/app/api/posts/[id]/comments/route.ts`)

```
Task 1.2: Comments Routes
├── POST: Create comment
│   ├── Authenticate
│   ├── Validate content
│   ├── Create comment with postId, authorId
│   ├── Increment post.commentCount
│   └── Return comment
│
└── GET: List comments (tree structure)
    ├── Fetch all comments for post
    ├── Build tree with parentCommentId
    └── Return nested structure

Task 1.3: Comment Replies
├── POST: Create reply to comment
│   ├── Same as create comment but with parentCommentId
│   └── Indent/nest under parent
│
├── PUT: Edit comment
│   ├── Check author match
│   └── Update content
│
└── DELETE: Remove comment
    ├── Soft delete: status = REMOVED
    └── Decrement post.commentCount
```

### Day 4: Votes & Search APIs

```
Task 1.4: Votes (`src/app/api/votes/route.ts`)
├── POST: Create/Update vote
│   ├── targetType: POST | COMMENT
│   ├── value: 1 | -1
│   ├── Check unique (userId, targetId, targetType)
│   ├── Create or flip vote
│   └── Return updated vote count
│
└── GET: Get vote count for post/comment
    ├── Calculate sum of vote values
    ├── Include user's personal vote
    └── Return { totalVotes, userVote }

Task 1.5: Search (`src/app/api/search/posts/route.ts`)
├── Query: q (search term)
├── Filter: category, tag, dateFrom, dateTo
├── Sort: relevance, newest, popular
├── Search: title ILIKE or content ILIKE
├── Paginate
└── Return matching posts
```

---

## Phase 2: Community Frontend Pages (Days 5-8)

### Component Hierarchy

```
App Layout (existing)
│
├── Community Hub
│   └── [Post Cards Grid]
│
├── Category View
│   ├── Category Header
│   ├── Post List
│   │   └── [Post Cards]
│   └── Filters Sidebar
│
├── Single Post View
│   ├── Post Header
│   │   ├── Title
│   │   ├── Author Info (PostAuthor)
│   │   └── Metadata
│   ├── Vote Buttons (VoteButtons)
│   ├── Post Body
│   ├── Actions (Edit/Delete/Report)
│   │
│   └── Comments Section
│       ├── Comment Form (CommentForm)
│       └── Comment Tree (CommentThread)
│           └── [Comment Item]
│               ├── Author
│               ├── Content
│               ├── Vote Buttons
│               ├── Reply Button
│               └── [Child Comments]
│
├── Create Post Page
│   ├── Title Input
│   ├── Content Editor
│   ├── Category Select (CategorySelect)
│   ├── Tag Select (TagSelect)
│   ├── Anonymous Toggle
│   └── Submit Button
│
└── Search Results
    ├── Search Box
    ├── Filters
    └── [Post Cards]
```

### Day 5: Hub & Category Pages

```
Task 2.1: Community Hub (`src/app/community/page.tsx`)
├── Display all categories as grid
├── Show latest posts feed
├── Sort options (newest, popular, trending)
├── "Create Post" button
└── Search box

Task 2.2: Category View (`src/app/community/[category]/page.tsx`)
├── Category header with description
├── Posts filtered by category
├── Pagination
├── Filters sidebar (tags, date)
├── Sort options
└── "Create Post" button
```

### Day 6: Post Pages & Components

```
Task 2.3: Single Post (`src/app/community/posts/[id]/page.tsx`)
├── Post header
├── Vote buttons (VoteButtons component)
├── Post body
├── Actions menu (Edit/Delete/Report/Mod)
└── Comments section (CommentThread component)

Task 2.4: Create Post (`src/app/community/posts/new/page.tsx`)
├── Protected route (redirect if not auth)
├── Form with all fields
├── Draft save to localStorage
├── Preview button
├── Submit & redirect

Task 2.5-2.12: Reusable Components
├── PostCard - Post preview
├── CommentThread - Threaded comments
├── CommentForm - Comment input
├── VoteButtons - Vote UI
├── PostAuthor - Author display
├── CategorySelect - Category dropdown
├── TagSelect - Tag multi-select
└── PostStatusBadge - Status indicator
```

### Day 7-8: Search & Final Polish

```
Task 3.1-3.2: Search
├── Search API (already done in Phase 1)
└── Search Results Page
    ├── Search box
    ├── Filters
    ├── Results display
    └── Pagination

Task 3.3+: Testing
├── Test all components
├── Test API integration
├── Test responsiveness
└── Bug fixes
```

---

## Phase 3: Admin & Moderation (Days 9-10)

### Admin Architecture

```
Admin Dashboard
│
├── Stats Overview
│   ├── Total Users
│   ├── Total Posts
│   ├── Open Reports
│   └── Recent Actions
│
├── Moderation Panel
│   ├── Report Queue
│   ├── Filter by Status
│   ├── Report Details Modal
│   └── Action Buttons
│
├── User Management
│   ├── User List
│   ├── Search/Filter
│   ├── Role Editor
│   └── Shadowban Toggle
│
└── Audit Log
    └── History of all mod actions
```

### Day 9-10: Admin APIs & Pages

```
Task 4.1: Report Submission (`src/app/api/reports/route.ts`)
├── POST: Create report
│   ├── targetType: POST | COMMENT | USER
│   ├── reason: SPAM | HARASSMENT | MISINFO | etc
│   └── Create Report record
│
└── GET: List reports (MODERATOR+ only)

Task 4.2: Moderation Actions (`src/app/api/admin/moderation/route.ts`)
├── POST: Create action
│   ├── action: REMOVE | LOCK | PIN | SHADOWBAN | WARN | etc
│   ├── targetUserId, postId, or commentId
│   ├── Apply action to target
│   └── Log action
│
└── GET: List recent actions

Task 4.3: User Management (`src/app/api/admin/users/route.ts`)
├── GET: List all users (ADMIN only)
├── PUT: Update user roles
└── POST: Toggle shadowban

Task 4.4-4.6: Admin Pages
├── Admin Dashboard (`/admin/page.tsx`)
├── Moderation Panel (`/admin/moderation/page.tsx`)
├── User Management (`/admin/users/page.tsx`)
└── Admin Components (ReportCard, UserEditor, etc)
```

---

## Implementation Checklist by Day

### ✅ Day 1-2: Post API

```bash
# Create file: src/app/api/posts/route.ts
[ ] POST handler for creating posts
[ ] GET handler for listing posts
[ ] Add validators to src/lib/validators.ts
[ ] Test with curl/Postman
```

**Commands:**

```bash
# Push schema (should be already done)
npm run db:push

# Start dev server
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"World","categoryId":"...","isAnonymous":false}'
```

### ✅ Day 3: Comment API

```bash
[ ] Create file: src/app/api/posts/[id]/comments/route.ts
[ ] POST handler for creating comments
[ ] GET handler for listing threaded comments
[ ] PUT/DELETE for edit/delete
[ ] Test threading
```

### ✅ Day 4: Votes & Search

```bash
[ ] Create file: src/app/api/votes/route.ts
[ ] POST handler for voting
[ ] GET handler for vote counts
[ ] Create file: src/app/api/search/posts/route.ts
[ ] Implement search with filters
[ ] Test search queries
```

### ✅ Day 5-6: Frontend Pages & Components

```bash
[ ] Create: src/app/community/page.tsx
[ ] Create: src/app/community/[category]/page.tsx
[ ] Create: src/app/community/posts/[id]/page.tsx
[ ] Create: src/app/community/posts/new/page.tsx
[ ] Create components in src/components/community/
[ ] Test all pages
```

### ✅ Day 7: Search & Polish

```bash
[ ] Create: src/app/search/page.tsx
[ ] Create: src/app/api/search/posts/route.ts (if not done)
[ ] Test search functionality
[ ] Fix UI issues
[ ] Test responsive design
```

### ✅ Day 8-9: Admin & Moderation

```bash
[ ] Create: src/app/api/reports/route.ts
[ ] Create: src/app/api/admin/moderation/route.ts
[ ] Create: src/app/api/admin/users/route.ts
[ ] Create: src/app/admin/page.tsx
[ ] Create: src/app/admin/moderation/page.tsx
[ ] Create: src/app/admin/users/page.tsx
[ ] Create admin components
[ ] Test moderation workflow
```

### ✅ Day 10: Testing & Polish

```bash
[ ] End-to-end testing
[ ] Bug fixes
[ ] Performance optimization
[ ] Documentation
[ ] Deploy to staging
```

---

## Parallel Work (If Multiple Developers)

### Developer 1: Backend APIs (Phase 1)

- Days 1-4: Build all API routes
- Days 5-7: Create API tests and documentation

### Developer 2: Frontend Pages (Phase 2)

- Days 1: Set up components folder, start on PostCard
- Days 2-4: Wait for API completion, then build pages
- Days 5-7: Polish UI and fix bugs

### Developer 3: Admin (Phase 3)

- Days 1-4: Plan admin UI architecture
- Days 5-7: Build admin APIs
- Days 8-10: Build admin pages

---

## Success Milestones

### Milestone 1: API Ready (Day 4)

```
✓ Can create posts via API
✓ Can list posts via API
✓ Can create/edit/delete comments via API
✓ Can vote on posts/comments via API
✓ Can search posts via API
```

### Milestone 2: Basic UI (Day 7)

```
✓ Community hub displays posts
✓ Can create post from web UI
✓ Can view single post with comments
✓ Can vote from web UI
✓ Can reply to comments
```

### Milestone 3: Full Featured (Day 10)

```
✓ Search works
✓ Admin can moderate content
✓ Admin can manage users
✓ All features tested
✓ Ready for beta
```

---

## Risk Mitigation

### If Behind Schedule

- **Priority 1:** Posts, Comments, Voting (core features)
- **Priority 2:** Frontend pages (manual testing can work)
- **Priority 3:** Search, Moderation (can be added later)
- **Priority 4:** Polish (defer non-critical UI improvements)

### If Blocked

- **API not ready?** Build mock API responses in frontend
- **Auth issues?** Use hardcoded test user
- **Database issues?** Reset with `npx prisma migrate reset`
- **TypeScript errors?** Use `any` type temporarily, refactor later

### Quality Gates

- **Before merging:** Unit tests pass, TypeScript compiles, ESLint passes
- **Before deployment:** Manual testing of happy path
- **Before production:** Load testing (if expecting high traffic)

---

## Post-MVP Features (Future)

### Week 3-4

- [ ] Real-time notifications
- [ ] Email digest notifications
- [ ] User followers/following
- [ ] Private messages
- [ ] Post scheduling

### Week 5-6

- [ ] AI chat with moderation
- [ ] Analytics dashboard
- [ ] Provider directory search
- [ ] Resource library
- [ ] User badges/reputation

### Beyond

- [ ] Mobile app (React Native)
- [ ] Video support
- [ ] Live video streaming
- [ ] Advanced search (Elasticsearch)
- [ ] Recommendation engine

---

## Tools & Resources

### Development Tools

- **VS Code:** IDE
- **Postman/Insomnia:** API testing
- **Prisma Studio:** Database viewer (npm run db:studio)
- **Chrome DevTools:** Frontend debugging
- **Docker:** Database/Redis containers

### Documentation to Reference

- Existing code in `src/app/api/auth/register/route.ts`
- Prisma schema in `prisma/schema.prisma`
- NextAuth config in `src/app/api/auth/[...nextauth]/route.ts`
- Validators in `src/lib/validators.ts`

---

**Last Updated:** January 16, 2026  
**Ready to Start?** Begin with Task 1.1 on Day 1!
