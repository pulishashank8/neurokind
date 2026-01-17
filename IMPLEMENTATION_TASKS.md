# NeuroKind Implementation Tasks - Detailed Checklist

## Phase 1: Community Module - Backend APIs

### Task 1.1: Post API Routes
- [ ] Create file: `src/app/api/posts/route.ts`
- [ ] Implement POST handler (create post)
  - [ ] Validate input with CreatePostSchema
  - [ ] Check authentication (requireAuth)
  - [ ] Get current user
  - [ ] If `isAnonymous=true`, set `authorId=null`
  - [ ] Create post in database with category and tags
  - [ ] Return created post with 201 status
  - [ ] Handle validation errors with 400
  - [ ] Handle unauthorized with 401
- [ ] Implement GET handler (list posts)
  - [ ] Accept query params: `page`, `pageSize`, `category`, `tag`, `status`, `sort`
  - [ ] Build Prisma filter object based on query params
  - [ ] If user is not MODERATOR/ADMIN, filter `status=ACTIVE`
  - [ ] Support sorting: `newest`, `popular` (vote count), `trending`, `commentCount`
  - [ ] Implement pagination with offset/limit
  - [ ] Include author profile (omit if anonymous)
  - [ ] Include vote count, comment count
  - [ ] Return paginated response: `{ data: [], pagination: { total, page, pageSize, pages } }`
- [ ] Add validators to `src/lib/validators.ts`
  - [ ] `CreatePostSchema` with Zod
  - [ ] `UpdatePostSchema` with Zod
- [ ] Test with curl/Postman or write test file

### Task 1.2: Single Post & Update/Delete Routes
- [ ] Create file: `src/app/api/posts/[id]/route.ts`
- [ ] Implement GET handler (fetch single post)
  - [ ] Get post by ID from URL params
  - [ ] Increment viewCount by 1
  - [ ] Include author profile (with isAnonymous check)
  - [ ] Include all comments (or just count?)
  - [ ] Include user's vote on this post (if authenticated)
  - [ ] Include bookmark status (if authenticated)
  - [ ] Return 404 if post not found
  - [ ] Return 403 if post is REMOVED and user is not author/mod
- [ ] Implement PUT handler (update post)
  - [ ] Require authentication
  - [ ] Get post by ID
  - [ ] Check post author is current user (or is ADMIN)
  - [ ] Validate input with UpdatePostSchema
  - [ ] Update only: title, content, tags, category (if author is ADMIN)
  - [ ] Update updatedAt timestamp
  - [ ] Return updated post
  - [ ] Return 403 if user not author/admin
  - [ ] Return 404 if post not found
- [ ] Implement DELETE handler (delete post)
  - [ ] Require authentication
  - [ ] Get post by ID
  - [ ] Check post author is current user (or is ADMIN/MODERATOR)
  - [ ] Soft delete: set `status='REMOVED'` instead of hard delete
  - [ ] Return 200 with success message
  - [ ] Return 403 if user not author/mod/admin
  - [ ] Return 404 if post not found

### Task 1.3: Comment API Routes
- [ ] Create file: `src/app/api/posts/[id]/comments/route.ts`
- [ ] Implement POST handler (create comment)
  - [ ] Require authentication
  - [ ] Validate input with CreateCommentSchema
  - [ ] Get post by ID from URL (check exists)
  - [ ] Check post.status is ACTIVE (or user is mod/admin)
  - [ ] Create comment with authorId, postId, parentCommentId (null for top-level)
  - [ ] Increment post.commentCount by 1
  - [ ] Return created comment with author profile
  - [ ] Handle validation/auth/not-found errors
- [ ] Implement GET handler (list comments for post)
  - [ ] Get post by ID
  - [ ] Fetch all comments for that post filtered by status
  - [ ] Build tree structure with nested children
  - [ ] Return as list with `parentCommentId` so frontend can build tree
  - [ ] Option: return flat list or nested structure? Recommend nested for simplicity
- [ ] Add validator to `src/lib/validators.ts`
  - [ ] `CreateCommentSchema` (content, postId, parentCommentId optional)
- [ ] Test routes

### Task 1.4: Comment Threaded Replies
- [ ] Create file: `src/app/api/posts/[id]/comments/[commentId]/route.ts`
- [ ] Implement POST handler (create reply to comment)
  - [ ] Same as Task 1.3 POST but:
  - [ ] Accept `parentCommentId` from URL or body
  - [ ] Validate parent comment exists and is not REMOVED
  - [ ] Set parentCommentId on new comment
  - [ ] Increment post.commentCount by 1
- [ ] Implement PUT handler (edit comment)
  - [ ] Check user is comment author
  - [ ] Update only content (not parentCommentId)
  - [ ] Return updated comment
- [ ] Implement DELETE handler (delete comment)
  - [ ] Check user is author or mod/admin
  - [ ] Soft delete: set `status='REMOVED'`
  - [ ] Decrement post.commentCount by 1
  - [ ] Return 200 success

### Task 1.5: Vote System API
- [ ] Create file: `src/app/api/votes/route.ts`
- [ ] Implement POST handler (create/update vote)
  - [ ] Require authentication
  - [ ] Body: `{ targetType: 'POST'|'COMMENT', targetId: string, value: 1|-1 }`
  - [ ] Validate: targetType must be POST or COMMENT, value must be 1 or -1
  - [ ] Get target (post or comment) - check exists
  - [ ] Check user not voting on own post/comment (optional validation)
  - [ ] Check if vote already exists (userId, targetId, targetType unique)
  - [ ] If exists: update vote.value (flip or update)
  - [ ] If not exists: create new vote
  - [ ] Return vote with target details
- [ ] Implement GET handler (get votes)
  - [ ] Query params: `targetType`, `targetId`
  - [ ] Calculate vote sum: `SUM(value)` where targetId and targetType match
  - [ ] Include user's personal vote if authenticated
  - [ ] Return: `{ targetId, targetType, totalVotes, userVote: 1|0|-1|null }`
- [ ] Add validator to `src/lib/validators.ts`
  - [ ] `VoteSchema` (targetType, targetId, value)

### Task 1.6: Pagination & Filtering Utilities
- [ ] Create file: `src/lib/post-utils.ts`
- [ ] Add helper function: `buildPostFilter()`
  - [ ] Takes query params
  - [ ] Returns Prisma filter object
  - [ ] Handles category, tag, status, date range filtering
- [ ] Add helper function: `buildPostSort()`
  - [ ] Takes sort param
  - [ ] Returns Prisma orderBy object
- [ ] Add helper function: `getPaginatedResult()`
  - [ ] Takes total count, page, pageSize
  - [ ] Returns pagination metadata

### Task 1.7: Test Phase 1 Thoroughly
- [ ] Test create post API
  - [ ] Valid post creation
  - [ ] Anonymous post creation (authorId should be null)
  - [ ] Validation errors
  - [ ] Unauthorized (no session)
  - [ ] Check post appears in list
- [ ] Test list posts API
  - [ ] Pagination works
  - [ ] Category/tag filters work
  - [ ] Sort options work (newest, popular)
  - [ ] Status filtering works (ACTIVE only for users, all for mods)
- [ ] Test comment system
  - [ ] Create top-level comment
  - [ ] Create reply to comment
  - [ ] Comment count updates
  - [ ] Delete/edit comments
  - [ ] Soft delete (status=REMOVED)
- [ ] Test vote system
  - [ ] Vote +1 on post
  - [ ] Vote -1 on comment
  - [ ] Flip vote (change +1 to -1)
  - [ ] Get vote count
  - [ ] User's personal vote returned

---

## Phase 2: Community Module - Frontend Pages

### Task 2.1: Community Hub Page
- [ ] Create file: `src/app/community/page.tsx`
- [ ] Features:
  - [ ] Fetch all categories from database
  - [ ] Display categories as grid/cards
  - [ ] Show post count per category
  - [ ] Show latest posts across all categories (recent activity)
  - [ ] "Create Post" button (link to /community/posts/new, protected)
  - [ ] Search box
  - [ ] Sort options for feed: newest, popular, trending
  - [ ] Pagination for feed
- [ ] Styling:
  - [ ] Use Tailwind CSS grid layout
  - [ ] Category cards with icon, name, description
  - [ ] Post preview cards (reuse PostCard component)

### Task 2.2: Create PostCard Component
- [ ] Create file: `src/components/community/PostCard.tsx`
- [ ] Props:
  - [ ] `post` - Post object with author, category, tags, votes, comments
  - [ ] `onClick` - Optional callback
- [ ] Display:
  - [ ] Title (clickable link)
  - [ ] Author name or "Anonymous"
  - [ ] Category tag
  - [ ] Tag chips
  - [ ] Post excerpt (first 150 chars)
  - [ ] Vote count with +/- icons
  - [ ] Comment count
  - [ ] Created date (relative time: "2h ago")
  - [ ] Bookmark icon
- [ ] Styling: Card component with hover effect

### Task 2.3: Category View Page
- [ ] Create file: `src/app/community/[category]/page.tsx`
- [ ] Features:
  - [ ] Get category from URL slug
  - [ ] Fetch posts filtered by category
  - [ ] Display category header with description and icon
  - [ ] Post list with pagination
  - [ ] Filters sidebar: tags, date range, status
  - [ ] Sort options: newest, popular, controversial, comments
  - [ ] "Create Post" button
- [ ] Fetch from GET /api/posts?category=[categoryId]&page=1

### Task 2.4: Single Post Page
- [ ] Create file: `src/app/community/posts/[id]/page.tsx`
- [ ] Top section - Post header:
  - [ ] Title
  - [ ] Author info or "Anonymous" with PostAuthor component
  - [ ] Category and tags
  - [ ] Created date, updated date
  - [ ] View count
  - [ ] Post status badge (if pinned, locked, etc)
- [ ] Vote section:
  - [ ] VoteButtons component with up/down votes
  - [ ] Current vote count
- [ ] Post body:
  - [ ] Full content (rendered markdown if applicable)
- [ ] Post actions:
  - [ ] Bookmark button (save bookmark)
  - [ ] Share button (copy link)
  - [ ] Edit button (if author)
  - [ ] Delete button (if author or mod)
  - [ ] Report button (all users)
  - [ ] Mod actions menu (if user is mod/admin)
- [ ] Comments section:
  - [ ] CommentThread component showing all comments
  - [ ] Comment form at top: "Add a comment"
  - [ ] Threaded replies visible under each comment
- [ ] Fetch from GET /api/posts/[id] and GET /api/posts/[id]/comments

### Task 2.5: Create Post Page
- [ ] Create file: `src/app/community/posts/new/page.tsx`
- [ ] Protected route (redirect to /login?callbackUrl=/community/posts/new if not authenticated)
- [ ] Form fields:
  - [ ] Title input (3-255 chars, live char count)
  - [ ] Content textarea (10+ chars, with markdown preview)
  - [ ] Category dropdown (required)
  - [ ] Tag multi-select (optional, limit 5 tags)
  - [ ] Anonymous checkbox (default false)
  - [ ] Submit button (disabled while loading)
  - [ ] Cancel button (link to /community)
- [ ] Behavior:
  - [ ] Save form data to localStorage on each change (draft recovery)
  - [ ] Show validation errors for each field
  - [ ] Show loading spinner on submit
  - [ ] Show success/error toast on completion
  - [ ] Redirect to /community/posts/[id] on success
  - [ ] Clear localStorage after successful submit
- [ ] Call POST /api/posts

### Task 2.6: CommentThread Component
- [ ] Create file: `src/components/community/CommentThread.tsx`
- [ ] Props:
  - [ ] `comments` - array of comments with nested children
  - [ ] `postId` - for creating replies
  - [ ] `onCommentAdded` - callback to refresh list
- [ ] Render:
  - [ ] Each comment with author, content, timestamp, vote buttons
  - [ ] Replies nested under parent (indented)
  - [ ] Reply form inside expanded comment
  - [ ] Recursive rendering for nested structure
  - [ ] Edit/delete buttons (if author)
- [ ] Behavior:
  - [ ] "Reply" button toggles reply form visibility
  - [ ] Submit reply calls POST to create reply
  - [ ] Refresh comment list after reply posted

### Task 2.7: CommentForm Component
- [ ] Create file: `src/components/community/CommentForm.tsx`
- [ ] Props:
  - [ ] `postId` - required
  - [ ] `parentCommentId` - optional (for replies)
  - [ ] `onCommentAdded` - callback
  - [ ] `initialContent` - optional (for edit mode)
- [ ] Textarea for comment content
- [ ] Submit button
- [ ] Cancel button
- [ ] Character count (max 5000)
- [ ] Loading state
- [ ] Error message display

### Task 2.8: VoteButtons Component
- [ ] Create file: `src/components/community/VoteButtons.tsx`
- [ ] Props:
  - [ ] `targetType` - 'POST' | 'COMMENT'
  - [ ] `targetId` - post or comment ID
  - [ ] `initialVotes` - initial vote count
  - [ ] `userVote` - user's current vote (1, 0, -1, or null)
- [ ] Display:
  - [ ] Up arrow button
  - [ ] Vote count
  - [ ] Down arrow button
- [ ] Behavior:
  - [ ] Click up button: call POST /api/votes with value=1
  - [ ] Click down button: call POST /api/votes with value=-1
  - [ ] Show loading state
  - [ ] Highlight user's vote
  - [ ] Update vote count on response
  - [ ] Show error toast on failure
  - [ ] Redirect to login if not authenticated

### Task 2.9: PostAuthor Component
- [ ] Create file: `src/components/community/PostAuthor.tsx`
- [ ] Props:
  - [ ] `author` - User object or null
  - [ ] `isAnonymous` - boolean
  - [ ] `createdAt` - date
- [ ] Display:
  - [ ] If anonymous: "Anonymous • 2h ago"
  - [ ] If author: "[Username] • verified badge if therapist • 2h ago"
  - [ ] Link to author profile (if not anonymous)

### Task 2.10: CategorySelect Component
- [ ] Create file: `src/components/community/CategorySelect.tsx`
- [ ] Props:
  - [ ] `value` - selected category ID
  - [ ] `onChange` - callback
  - [ ] `required` - boolean
- [ ] Fetch categories from database or hardcode from seed
- [ ] Display as dropdown select

### Task 2.11: TagSelect Component
- [ ] Create file: `src/components/community/TagSelect.tsx`
- [ ] Props:
  - [ ] `value` - array of selected tag IDs
  - [ ] `onChange` - callback
  - [ ] `maxTags` - limit number of tags
- [ ] Display available tags as chips/buttons
- [ ] Click to toggle selection
- [ ] Show selected count
- [ ] Show "Max tags reached" message

### Task 2.12: PostStatusBadge Component
- [ ] Create file: `src/components/community/PostStatusBadge.tsx`
- [ ] Props:
  - [ ] `status` - PostStatus enum value
- [ ] Display badge with appropriate color:
  - [ ] ACTIVE - green (hidden)
  - [ ] PINNED - gold/yellow
  - [ ] LOCKED - red
  - [ ] REMOVED - gray
  - [ ] DRAFT - blue

### Task 2.13: Test Phase 2
- [ ] Test community hub loads
- [ ] Test category view works
- [ ] Test single post page renders correctly
- [ ] Test create post form
- [ ] Test comment creation and threading
- [ ] Test voting on posts and comments
- [ ] Test anonymous posting (author shows as "Anonymous")
- [ ] Test edit/delete for own posts
- [ ] Test bookmark functionality

---

## Phase 3: Search & Filtering

### Task 3.1: Search API Route
- [ ] Create file: `src/app/api/search/posts/route.ts`
- [ ] Query params: `q` (search term), `category`, `tag`, `dateFrom`, `dateTo`, `sort`, `page`, `pageSize`
- [ ] Implement full-text search:
  - [ ] Search post title: `title ILIKE '%query%'`
  - [ ] Search post content: `content ILIKE '%query%'`
  - [ ] Use Prisma raw query or `OR` in Prisma filter
- [ ] Filtering:
  - [ ] By category (if provided)
  - [ ] By tag (if provided)
  - [ ] By date range (if provided)
  - [ ] Always exclude REMOVED posts (unless user is mod/admin)
- [ ] Sorting: `relevance`, `newest`, `popular`, `comments`
- [ ] Return paginated results

### Task 3.2: Search Page
- [ ] Create file: `src/app/search/page.tsx`
- [ ] Features:
  - [ ] Search query input at top
  - [ ] Search filters sidebar: category, tags, date range, sort
  - [ ] Results list using PostCard component
  - [ ] Pagination
  - [ ] "No results" message
  - [ ] Search button or auto-search on input change (debounced)
- [ ] Fetch from GET /api/search/posts?q=[query]&...

### Task 3.3: Test Phase 3
- [ ] Test search returns correct results
- [ ] Test filters work correctly
- [ ] Test pagination
- [ ] Test no results message

---

## Phase 4: Moderation Panel

### Task 4.1: Report Submission API
- [ ] Create file: `src/app/api/reports/route.ts`
- [ ] POST handler (create report):
  - [ ] Require authentication
  - [ ] Body: `{ targetType: 'POST'|'COMMENT'|'USER', targetId: string, reason: ReportReason, description?: string }`
  - [ ] Validate target exists (post/comment/user)
  - [ ] Check not already reported by this user? (optional)
  - [ ] Create Report record with status=OPEN
  - [ ] Return created report
- [ ] GET handler (list reports):
  - [ ] Require MODERATOR or ADMIN role
  - [ ] Query params: `status`, `targetType`, `page`, `pageSize`
  - [ ] Return paginated reports with target details

### Task 4.2: Moderation API - Report Review
- [ ] Create file: `src/app/api/admin/moderation/reports/[id]/route.ts`
- [ ] GET handler (fetch single report):
  - [ ] Require MODERATOR+ role
  - [ ] Include target details (post/comment/user)
  - [ ] Include reporter info
  - [ ] Include any previous moderation actions on target
  - [ ] Return 404 if not found
- [ ] POST handler (review report):
  - [ ] Require MODERATOR+ role
  - [ ] Body: `{ status: 'RESOLVED'|'DISMISSED'|'UNDER_REVIEW', notes?: string, actionType?: ModerationActionType }`
  - [ ] Update Report.status and reviewedBy and reviewedAt
  - [ ] If actionType provided, create ModerationAction record
  - [ ] Return updated report

### Task 4.3: Moderation API - Actions
- [ ] Create file: `src/app/api/admin/moderation/actions/route.ts`
- [ ] POST handler (create moderation action):
  - [ ] Require MODERATOR+ role
  - [ ] Body: `{ action: ModerationActionType, targetUserId?: string, postId?: string, commentId?: string, notes?: string }`
  - [ ] Create ModerationAction record
  - [ ] Based on action type, update target:
    - [ ] REMOVE: set post/comment status=REMOVED
    - [ ] LOCK: set post status=LOCKED
    - [ ] PIN: set post pinnedAt=now()
    - [ ] UNPIN: set post pinnedAt=null
    - [ ] SHADOWBAN: set profile.shadowbanned=true
    - [ ] UNSHADOWBAN: set profile.shadowbanned=false
    - [ ] WARN: create audit log entry
    - [ ] VERIFY_THERAPIST: set profile.verifiedTherapist=true, profile.verifiedAt=now()
    - [ ] etc
  - [ ] Return created action
- [ ] GET handler (list recent actions):
  - [ ] Require MODERATOR+ role
  - [ ] Return recent ModerationActions with actor and target info
  - [ ] Support filtering by action type, target type

### Task 4.4: Moderation API - User Management
- [ ] Create file: `src/app/api/admin/users/route.ts`
- [ ] GET handler (list users):
  - [ ] Require ADMIN role
  - [ ] Query params: `search` (email/username), `role`, `page`, `pageSize`
  - [ ] Return users with profiles, roles, created date, last login
- [ ] Create file: `src/app/api/admin/users/[id]/route.ts`
- [ ] PUT handler (update user roles):
  - [ ] Require ADMIN role
  - [ ] Body: `{ roles: Role[] }`
  - [ ] Delete all existing UserRole records for user
  - [ ] Create new UserRole records for each role in array
  - [ ] Return updated user with roles
- [ ] POST handler (shadowban toggle):
  - [ ] Body: `{ shadowbanned: boolean }`
  - [ ] Update profile.shadowbanned
  - [ ] Return updated profile

### Task 4.5: Admin Dashboard Page
- [ ] Create file: `src/app/admin/page.tsx`
- [ ] Protected route: `requireRole("ADMIN")`
- [ ] Display dashboard stats:
  - [ ] Total users (count)
  - [ ] Total posts (count)
  - [ ] Open reports (count)
  - [ ] Recent moderation actions (list)
- [ ] Navigation links:
  - [ ] Moderation Panel
  - [ ] User Management
  - [ ] Audit Logs (future)
- [ ] Quick stats cards with Tailwind styling

### Task 4.6: Moderation Panel Page
- [ ] Create file: `src/app/admin/moderation/page.tsx`
- [ ] Protected route: `requireAnyRole(["ADMIN", "MODERATOR"])`
- [ ] Features:
  - [ ] Report queue/list
  - [ ] Filter by status: OPEN, UNDER_REVIEW, RESOLVED, DISMISSED
  - [ ] Each report shown as card with: target preview, reason, reporter, timestamp
  - [ ] Click card → ReportDetailModal
  - [ ] Bulk action checkboxes? (optional)
- [ ] Modal/Detail view:
  - [ ] Full report details
  - [ ] Target context (show actual post/comment/user)
  - [ ] Reporter info (name, account age, other reports)
  - [ ] Previous moderation history on target
  - [ ] Action dropdown: Remove, Lock, Shadowban, Verify, etc
  - [ ] Notes textarea
  - [ ] Approve/Dismiss buttons
  - [ ] Submit logs ModerationAction

### Task 4.7: User Management Page
- [ ] Create file: `src/app/admin/users/page.tsx`
- [ ] Protected route: `requireRole("ADMIN")`
- [ ] Features:
  - [ ] User search/filter box
  - [ ] User table/list: email, username, roles, created date, last login, actions
  - [ ] Each row: View Profile, Edit Roles, Shadowban Toggle
  - [ ] Edit roles modal: multi-select checkboxes for PARENT/THERAPIST/MODERATOR/ADMIN
  - [ ] Shadowban toggle button with confirmation
  - [ ] Pagination

### Task 4.8: Admin Components
- [ ] Create file: `src/components/admin/ReportCard.tsx`
  - [ ] Props: `report`, `onClick`
  - [ ] Display: target type, reason, reporter name, timestamp
  - [ ] Status badge
- [ ] Create file: `src/components/admin/ReportDetailModal.tsx`
  - [ ] Props: `report`, `onClose`, `onAction`
  - [ ] Show full report with context
  - [ ] Action dropdown and notes
  - [ ] Buttons: Approve/Dismiss/Update
- [ ] Create file: `src/components/admin/UserRoleEditor.tsx`
  - [ ] Props: `user`, `onSave`
  - [ ] Multi-select checkboxes for roles
  - [ ] Save button
- [ ] Create file: `src/components/admin/ModStats.tsx`
  - [ ] Props: stats object
  - [ ] Display as cards: users, posts, reports, actions
- [ ] Create file: `src/components/admin/ShadowbanToggle.tsx`
  - [ ] Props: `userId`, `isShadowbanned`, `onToggle`
  - [ ] Button to toggle with confirmation modal

### Task 4.9: Test Phase 4
- [ ] Test report submission API
- [ ] Test report review workflow
- [ ] Test moderation actions (remove, lock, pin, shadowban)
- [ ] Test user management (list, update roles, shadowban)
- [ ] Test admin dashboard loads
- [ ] Test moderation panel loads and displays reports
- [ ] Test user management page loads
- [ ] Test role-based access (ADMIN only, MODERATOR+, etc)

---

## Phase 5: Polish & Enhancement

### Task 5.1: Middleware & Route Protection
- [ ] Create file: `src/middleware.ts`
- [ ] Protect admin routes: `/admin/*` → require ADMIN role
- [ ] Protect moderator routes: `/api/admin/*` → require ADMIN or MODERATOR
- [ ] Redirect unauthenticated users to login with callback URL

### Task 5.2: Rate Limiting
- [ ] Implement rate limit check function in `src/lib/rate-limit.ts`
- [ ] Track RateLimitLog entries per user per action
- [ ] Apply to: create post (1 per minute), create comment (3 per minute), create vote (10 per minute)
- [ ] Return 429 Too Many Requests when limit exceeded
- [ ] Show user-friendly error message

### Task 5.3: Error Handling & Validation
- [ ] Add global error handler for API routes
- [ ] Standardize error responses: `{ error: string, code?: string }`
- [ ] Validate all inputs with Zod schemas
- [ ] Return appropriate HTTP status codes

### Task 5.4: Edge Cases
- [ ] Test anonymous posts don't leak author info
- [ ] Test can't vote on own posts (optional check)
- [ ] Test can't delete others' comments
- [ ] Test shadowbanned users can't create posts (but can view)
- [ ] Test rate limiting works

### Task 5.5: UI Polish
- [ ] Add loading spinners to all async operations
- [ ] Add error toast notifications
- [ ] Add success toast notifications
- [ ] Keyboard shortcuts? (optional)
- [ ] Accessibility: ARIA labels, tab order, etc
- [ ] Mobile responsive design

### Task 5.6: Documentation
- [ ] Document all API endpoints in code comments
- [ ] Create API documentation file
- [ ] Document database schema
- [ ] Create contributor guidelines

---

## Testing Checklist

### Unit Tests (Optional but Recommended)
- [ ] Validator functions
- [ ] Permission checks (hasRole, requireAuth, etc)
- [ ] Rate limit calculations

### Integration Tests
- [ ] End-to-end user registration → login → create post → comment → vote → report
- [ ] Admin workflow: review report → take action → verify action applied
- [ ] Moderator workflow: review report → update status
- [ ] Anonymous posting: verify author hidden in API and UI

### Manual Testing
- [ ] Create multiple posts with different categories/tags
- [ ] Create threaded comments (replies to replies)
- [ ] Vote on posts and comments
- [ ] Edit and delete own content
- [ ] Test as different roles (admin, moderator, user)
- [ ] Test search with various filters
- [ ] Test pagination on all list views
- [ ] Test mobile responsiveness
- [ ] Test error states (500, 404, 403, validation errors)

---

## Deployment Checklist

- [ ] Run `npm run build` and fix any TypeScript errors
- [ ] Run `npm run lint` and fix any ESLint errors
- [ ] Test all features in production build locally
- [ ] Verify environment variables are set in production
- [ ] Run seed script on production database
- [ ] Test login with production database
- [ ] Monitor error logs
- [ ] Test email notifications (if implemented)

---

## Notes

- Use this checklist to track progress
- Check off tasks as completed
- Update timestamps in sections
- Mark "BLOCKED" if dependent on other work
- Add notes for tricky implementations or decisions made

---

**Last Updated:** January 16, 2026
