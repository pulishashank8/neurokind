# NeuroKind Smoke Test Checklist

Complete this checklist before each deployment to production. Each test should pass on both desktop and mobile viewports.

---

## 🔐 Authentication & Authorization (Tests 1-8)

### Test 1: User Registration
- [ ] Navigate to `/register`
- [ ] Fill form with valid email, username, password
- [ ] Submit form
- [ ] **Expected**: Success toast, redirect to `/community`
- [ ] **Expected**: User appears in navbar (logged in state)

### Test 2: Registration Validation
- [ ] Try registering with weak password (< 8 chars)
- [ ] **Expected**: Validation error shown
- [ ] Try registering with existing email
- [ ] **Expected**: Error: "Email already registered"

### Test 3: Registration Rate Limiting
- [ ] Attempt to register 4 times in 1 hour from same IP
- [ ] **Expected**: 4th attempt returns HTTP 429 "Rate limit exceeded"
- [ ] **Expected**: Response includes `retryAfterSeconds`

### Test 4: User Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] **Expected**: Success toast, redirect to `/community`
- [ ] **Expected**: Navbar shows username and logout button

### Test 5: Login Validation
- [ ] Try login with wrong password
- [ ] **Expected**: Error: "Invalid credentials"
- [ ] Try login with non-existent email
- [ ] **Expected**: Error: "Invalid credentials"

### Test 6: Logout
- [ ] Click logout button in navbar
- [ ] **Expected**: Redirect to `/login`
- [ ] **Expected**: Navbar shows login/register links

### Test 7: Protected Routes
- [ ] Log out
- [ ] Try accessing `/community/new` without login
- [ ] **Expected**: Redirect to `/login`
- [ ] After login, redirects back to original page

### Test 8: Session Persistence
- [ ] Log in
- [ ] Refresh page
- [ ] **Expected**: Still logged in
- [ ] Close browser tab, reopen
- [ ] **Expected**: Session persists (if "Remember me" enabled)

---

## 📝 Community - Create Post (Tests 9-15)

### Test 9: Create Post Flow
- [ ] Log in
- [ ] Navigate to `/community`
- [ ] Click "Create Post" button
- [ ] **Expected**: Redirects to `/community/new`

### Test 10: Post Creation
- [ ] Fill in title: "Test Post Title"
- [ ] Select category (e.g., "General Discussion")
- [ ] Add content: "This is test content for smoke testing."
- [ ] Click "Create Post"
- [ ] **Expected**: Success toast "Post created successfully!"
- [ ] **Expected**: Redirect to `/community/[id]` (post detail page)

### Test 11: Post Preview
- [ ] On create post page, add content
- [ ] Click "Preview" button
- [ ] **Expected**: Content shown in preview mode
- [ ] Click "Edit" button
- [ ] **Expected**: Back to edit mode

### Test 12: Anonymous Post
- [ ] Create post page
- [ ] Check "Post anonymously" toggle
- [ ] Submit post
- [ ] **Expected**: Post created
- [ ] On post detail page, author shows "Anonymous"
- [ ] **Expected**: Your username NOT visible

### Test 13: Post Validation
- [ ] Try creating post with empty title
- [ ] **Expected**: Validation error "Title required"
- [ ] Try creating post without selecting category
- [ ] **Expected**: Validation error "Category required"

### Test 14: Post Rate Limiting
- [ ] Create 6 posts in 1 minute
- [ ] **Expected**: 6th attempt returns HTTP 429
- [ ] **Expected**: Error message: "Rate limit exceeded"

### Test 15: Post with Tags
- [ ] Create post
- [ ] Select 2-3 tags (e.g., "parenting", "support")
- [ ] Submit
- [ ] **Expected**: Post detail shows selected tags
- [ ] **Expected**: Tags appear on feed card

---

## 💬 Community - Comments (Tests 16-22)

### Test 16: View Post Detail
- [ ] Click on any post from community feed
- [ ] **Expected**: Navigates to `/community/[id]`
- [ ] **Expected**: Full post content visible
- [ ] **Expected**: Comment section visible below

### Test 17: Add Comment (Logged In)
- [ ] On post detail page
- [ ] Type comment: "Great discussion!"
- [ ] Click "Post Comment"
- [ ] **Expected**: Success toast
- [ ] **Expected**: Comment appears in thread
- [ ] **Expected**: Comment count updates

### Test 18: Add Comment (Logged Out)
- [ ] Log out
- [ ] Navigate to any post detail page
- [ ] **Expected**: Comment box shows "Sign in to join the conversation"
- [ ] **Expected**: CTA button: "Sign in to comment"
- [ ] Click CTA
- [ ] **Expected**: Redirect to `/login`

### Test 19: Reply to Comment
- [ ] Log in, go to post with existing comments
- [ ] Click "Reply" on a comment
- [ ] Type reply: "I agree with this!"
- [ ] Submit
- [ ] **Expected**: Reply appears nested under parent comment
- [ ] **Expected**: Indented to show hierarchy

### Test 20: Anonymous Comment
- [ ] Add comment
- [ ] Check "Post anonymously" toggle
- [ ] Submit
- [ ] **Expected**: Comment author shows "Anonymous"

### Test 21: Comment Validation
- [ ] Try submitting empty comment
- [ ] **Expected**: Validation error

### Test 22: Comment Rate Limiting
- [ ] Post 11 comments in 1 minute
- [ ] **Expected**: 11th attempt returns HTTP 429

---

## 👍 Voting System (Tests 23-27)

### Test 23: Upvote Post
- [ ] On community feed, click upvote arrow on a post
- [ ] **Expected**: Arrow turns blue (or highlight color)
- [ ] **Expected**: Vote score increases by 1

### Test 24: Downvote Post
- [ ] Click downvote arrow
- [ ] **Expected**: Arrow turns orange/red
- [ ] **Expected**: Vote score decreases by 1

### Test 25: Remove Vote
- [ ] Click upvote on already-upvoted post
- [ ] **Expected**: Vote removed, score decreases
- [ ] **Expected**: Arrow back to default color

### Test 26: Vote on Comment
- [ ] On post detail, upvote a comment
- [ ] **Expected**: Comment score updates
- [ ] **Expected**: Visual feedback (highlight)

### Test 27: Vote Rate Limiting
- [ ] Vote 61 times in 1 minute
- [ ] **Expected**: 61st vote returns HTTP 429

---

## 🔖 Bookmarks (Tests 28-30)

### Test 28: Bookmark Post
- [ ] On feed, click bookmark icon on a post
- [ ] **Expected**: Icon changes to filled/highlighted
- [ ] Navigate to `/bookmarks`
- [ ] **Expected**: Post appears in bookmarks list

### Test 29: Unbookmark Post
- [ ] Click bookmark icon again
- [ ] **Expected**: Icon back to unfilled
- [ ] Check `/bookmarks`
- [ ] **Expected**: Post removed from list

### Test 30: Bookmarks Page Empty State
- [ ] Remove all bookmarks
- [ ] Navigate to `/bookmarks`
- [ ] **Expected**: Empty state message shown

---

## 🌓 Theme Toggle (Tests 31-33)

### Test 31: Theme Toggle Visibility
- [ ] Log out
- [ ] **Expected**: Theme toggle NOT visible in navbar
- [ ] Log in
- [ ] **Expected**: Theme toggle visible in navbar

### Test 32: Toggle to Dark Mode
- [ ] Click theme toggle (sun/moon icon)
- [ ] **Expected**: App switches to dark mode
- [ ] **Expected**: Background is soft navy (#1a1f35), NOT harsh black
- [ ] **Expected**: Text is readable with good contrast

### Test 33: Theme Persistence
- [ ] Toggle to dark mode
- [ ] Refresh page
- [ ] **Expected**: Still in dark mode
- [ ] Close tab, reopen app
- [ ] **Expected**: Dark mode persists (localStorage)

---

## 📱 Mobile Responsiveness (Tests 34-38)

### Test 34: Mobile Navigation
- [ ] Resize viewport to 375px width (iPhone SE)
- [ ] **Expected**: Navbar collapses to hamburger menu
- [ ] Click hamburger
- [ ] **Expected**: Mobile menu opens with all nav links

### Test 35: Mobile Feed Layout
- [ ] On `/community` in mobile viewport
- [ ] **Expected**: Post cards stack vertically
- [ ] **Expected**: Vote buttons appear inline (not in sidebar)
- [ ] **Expected**: Touch targets >= 44px

### Test 36: Mobile Post Detail
- [ ] Open post detail on mobile
- [ ] **Expected**: Content readable, no horizontal scroll
- [ ] **Expected**: Comment composer is touch-friendly
- [ ] **Expected**: Vote/reply buttons have good touch targets

### Test 37: Mobile Create Post
- [ ] Navigate to `/community/new` on mobile
- [ ] **Expected**: Form fields are full-width
- [ ] **Expected**: Textarea expands without overflow
- [ ] **Expected**: Submit button is >= 44px height

### Test 38: Mobile Theme Toggle
- [ ] Log in on mobile
- [ ] **Expected**: Theme toggle visible and touch-friendly
- [ ] Toggle theme
- [ ] **Expected**: Works correctly

---

## 🔒 Security (Tests 39-45)

### Test 39: RBAC - Edit Post (Unauthorized)
- [ ] Create post as User A
- [ ] Log in as User B
- [ ] Try to edit User A's post via API:
  ```
  PUT /api/posts/[id]
  ```
- [ ] **Expected**: HTTP 403 Forbidden

### Test 40: RBAC - Delete Post (Unauthorized)
- [ ] As User B, try to delete User A's post
- [ ] **Expected**: HTTP 403 Forbidden

### Test 41: Anonymous Identity Protection
- [ ] Create anonymous post as User A
- [ ] Log in as User B
- [ ] Inspect API responses for post detail
- [ ] **Expected**: Author ID should be "anonymous" or not leaked
- [ ] **Expected**: No way to identify User A

### Test 42: XSS Protection
- [ ] Create post with title: `<script>alert('XSS')</script>`
- [ ] Submit post
- [ ] View post in feed and detail
- [ ] **Expected**: Script NOT executed
- [ ] **Expected**: Shows sanitized text or escaped HTML

### Test 43: SQL Injection Protection
- [ ] Search for: `' OR 1=1--`
- [ ] **Expected**: No error, returns empty or safe results
- [ ] **Expected**: Database not compromised

### Test 44: CSRF Protection
- [ ] Inspect API requests (Network tab)
- [ ] **Expected**: NextAuth CSRF token present in requests

### Test 45: Security Headers
- [ ] Open DevTools > Network tab
- [ ] Load any page
- [ ] Check response headers
- [ ] **Expected**: `X-Frame-Options: DENY`
- [ ] **Expected**: `X-Content-Type-Options: nosniff`
- [ ] **Expected**: `Content-Security-Policy` present

---

## 🚨 Error Handling (Tests 46-50)

### Test 46: Database Offline
- [ ] Stop Docker Postgres (or disconnect Supabase)
- [ ] Try loading `/community`
- [ ] **Expected**: Friendly error message (NOT crash)
- [ ] **Expected**: Message: "Unable to connect to database" or similar

### Test 47: API Error Handling
- [ ] Make invalid API request: `POST /api/posts` with empty body
- [ ] **Expected**: HTTP 400 with clear error message
- [ ] **Expected**: NO stack trace leaked

### Test 48: 404 Page
- [ ] Navigate to `/this-page-does-not-exist`
- [ ] **Expected**: Custom 404 page shown
- [ ] **Expected**: Link to go back home

### Test 49: Network Error
- [ ] Enable DevTools offline mode
- [ ] Try creating a post
- [ ] **Expected**: User-friendly error toast
- [ ] **Expected**: "Network error" or "Unable to connect"

### Test 50: Graceful Degradation - Redis Offline
- [ ] Set `REDIS_URL` to invalid URL or remove it
- [ ] Restart app
- [ ] Try voting, commenting
- [ ] **Expected**: Features work (fallback to in-memory rate limiting)
- [ ] **Expected**: Console logs: "Using in-memory rate limiting"

---

## 🔍 Search & Filtering (Tests 51-54)

### Test 51: Search Posts
- [ ] On `/community`, use search bar
- [ ] Enter keyword from a post title
- [ ] **Expected**: Results filtered to matching posts
- [ ] **Expected**: Non-matching posts hidden

### Test 52: Category Filter
- [ ] Click a category in sidebar (e.g., "Mental Health")
- [ ] **Expected**: Feed shows only posts in that category
- [ ] **Expected**: URL updates: `?category=mental-health`

### Test 53: Tag Filter
- [ ] Click a tag (e.g., "#anxiety")
- [ ] **Expected**: Feed filtered to posts with that tag

### Test 54: Sort by Hot/New/Top
- [ ] Click "Hot" tab
- [ ] **Expected**: Posts sorted by hot score (votes + recency)
- [ ] Click "New"
- [ ] **Expected**: Posts sorted by creation date (newest first)
- [ ] Click "Top"
- [ ] **Expected**: Posts sorted by vote score

---

## ⚡ Performance (Tests 55-57)

### Test 55: Page Load Speed
- [ ] Open DevTools > Network
- [ ] Load `/community`
- [ ] **Expected**: Initial page load < 2 seconds
- [ ] **Expected**: No blocking resources

### Test 56: Infinite Scroll / Pagination
- [ ] Scroll to bottom of community feed
- [ ] **Expected**: Next page loads automatically OR pagination buttons work
- [ ] **Expected**: No duplicate posts

### Test 57: Image Loading
- [ ] Check user avatars load correctly
- [ ] **Expected**: Lazy loading for off-screen images
- [ ] **Expected**: Fallback avatar if image fails

---

## 📊 Build & Deploy (Tests 58-60)

### Test 58: Build Success
```bash
cd web
npm run build
```
- [ ] **Expected**: Build completes with 0 errors
- [ ] **Expected**: No TypeScript errors
- [ ] **Expected**: Output: "Compiled successfully"

### Test 59: Production Start
```bash
npm run start
```
- [ ] **Expected**: Server starts on port 3000
- [ ] **Expected**: Navigate to http://localhost:3000
- [ ] **Expected**: App works in production mode

### Test 60: Environment Variables Validation
- [ ] Remove `DATABASE_URL` from `.env`
- [ ] Try starting app
- [ ] **Expected**: App fails fast with clear error
- [ ] **Expected**: Error message: "DATABASE_URL is required"

---

## ✅ Final Production Checklist

Before deploying to production:

- [ ] All 60 smoke tests pass
- [ ] Build passes with 0 errors
- [ ] No console errors in browser
- [ ] No CORS issues
- [ ] HTTPS enabled (Vercel auto-provides)
- [ ] Database migrations applied
- [ ] Seed data loaded (categories, tags)
- [ ] Rate limiting tested and working
- [ ] Theme toggle works and persists
- [ ] Mobile responsive on iPhone/Android
- [ ] Security headers present
- [ ] Error monitoring setup (Vercel Analytics)
- [ ] Backups configured (Supabase auto-backup enabled)
- [ ] Custom domain configured (if applicable)
- [ ] Legal pages added (Privacy Policy, Terms)

---

## 🐛 Bug Report Template

If any test fails, use this template:

```
**Test Number**: #XX
**Test Name**: [Test name]
**Environment**: [Local / Staging / Production]
**Browser**: [Chrome / Firefox / Safari]
**Viewport**: [Desktop / Mobile]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:
[Attach if applicable]

**Console Errors**:
[Paste errors from DevTools console]

**Network Errors**:
[Check Network tab for failed requests]
```

---

**All tests passing? You're ready to launch! 🚀**

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
