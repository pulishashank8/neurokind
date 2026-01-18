# NeuroKind Smoke Test Checklist

Comprehensive QA checklist before public launch. All 40+ tests must pass.

**Test Environment**: Local (`npm run dev`) or Production (Vercel)  
**Duration**: ~45 minutes  
**Date Tested**: ****\_\_\_****  
**Tester**: ****\_\_\_****

---

## 1. BUILD & STARTUP (5 tests)

### 1.1 Production Build Passes

- [ ] Run `npm run build`
- [ ] No TypeScript errors
- [ ] No build warnings (only peer deps OK)
- [ ] All 35+ routes prerendered
- [ ] `.next/` folder generated

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 1.2 Dev Server Starts Clean

- [ ] Run `npm run dev` in `/web`
- [ ] No console errors on startup
- [ ] "Ready in X seconds" message
- [ ] Open http://localhost:3000 loads
- [ ] No hydration errors

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 1.3 Database Connection

- [ ] Verify `docker ps` shows postgres + redis
- [ ] Prisma connects to DB without errors
- [ ] Can fetch posts from `/api/posts` (no 500 errors)
- [ ] Can fetch categories from `/api/categories`
- [ ] Can fetch user profile from `/api/user/profile`

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 1.4 Environment Variables

- [ ] `.env.local` exists with all required vars
- [ ] DATABASE_URL works
- [ ] NEXTAUTH_SECRET set
- [ ] NEXTAUTH_URL matches current domain
- [ ] Optional vars (REDIS_URL, etc) not required

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 1.5 No Console Errors

- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] No red errors on home page
- [ ] No "useTheme must be used within" errors
- [ ] No missing dependency warnings

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 2. AUTHENTICATION (7 tests)

### 2.1 Signup Works

- [ ] Go to http://localhost:3000/register
- [ ] Fill form: email, password, confirm password
- [ ] Submit form
- [ ] No validation errors
- [ ] Redirects to /login or /dashboard
- [ ] Can login with new account

**Result**: ✅ Pass / ❌ Fail  
**Email Used**: ****\_\_\_****

### 2.2 Login Works (Dev Account)

- [ ] Go to http://localhost:3000/login
- [ ] Use: admin@neurokind.local / admin123
- [ ] Click "Sign In"
- [ ] Redirects to /dashboard
- [ ] Session shows in navbar (username visible)
- [ ] Theme toggle appears in navbar

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 2.3 Logout Works

- [ ] While logged in, find logout button (navbar)
- [ ] Click logout
- [ ] Redirects to /login
- [ ] Session cleared (navbar shows login link)
- [ ] Cannot access /dashboard (redirects to /login)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 2.4 Unauthorized Routes Protected

- [ ] Logout first
- [ ] Try to access /settings (should redirect to /login)
- [ ] Try to access /community/new (should redirect to /login)
- [ ] Try to access /dashboard (should redirect to /login)
- [ ] Public pages (/about, /trust) accessible without login

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 2.5 Session Persists

- [ ] Login
- [ ] Refresh page (F5)
- [ ] Still logged in (session persists)
- [ ] Navbar shows username
- [ ] Theme toggle visible

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 2.6 Invalid Credentials Fail

- [ ] Go to /login
- [ ] Enter wrong email or password
- [ ] Submit
- [ ] See error message (not generic 500)
- [ ] Redirects back to /login (not /dashboard)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 2.7 Settings Page (Only When Logged In)

- [ ] Login
- [ ] Go to /settings
- [ ] Page loads (no 500 error)
- [ ] Can see user info
- [ ] Logout first, try /settings -> redirects to /login

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 3. COMMUNITY FEED (/community) - (8 tests)

### 3.1 Feed Loads

- [ ] Navigate to /community (no login needed)
- [ ] Page loads without 500 error
- [ ] Posts display in cards
- [ ] Vote buttons visible on each card
- [ ] Comment count visible

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.2 Post Cards Display Correctly

- [ ] Each post shows:
  - [ ] Title (clickable)
  - [ ] Author or "Anonymous"
  - [ ] Category tag
  - [ ] Timestamp ("2 hours ago")
  - [ ] Content snippet (truncated)
  - [ ] Vote score
  - [ ] Comment count
- [ ] Card layout responsive on mobile

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.3 Sorting Works (New/Hot/Top)

- [ ] Click "New" sort tab -> posts order changes
- [ ] Click "Hot" sort tab -> posts reorder (hot first)
- [ ] Click "Top" sort tab -> highest voted first
- [ ] URL updates with sort param
- [ ] Reload preserves sort preference

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.4 Category Filtering

- [ ] See category list in sidebar (or filter button)
- [ ] Click a category
- [ ] Posts filter to that category only
- [ ] Title shows "Category: [name]"
- [ ] URL contains category param
- [ ] Click "All" -> reset to all categories

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.5 Search Works

- [ ] Type in search box (e.g., "autism")
- [ ] Press Enter or click search button
- [ ] Posts filter to matching titles/content
- [ ] URL updates with search param
- [ ] "No results" message if no matches
- [ ] Can clear search and reset

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.6 Pagination Works

- [ ] Scroll to bottom of feed
- [ ] "Load More" button appears (or auto-loads)
- [ ] Click loads next batch of posts
- [ ] Posts add to feed (no reload)
- [ ] Can continue paginating

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.7 Anonymous Posts Display Correctly

- [ ] Look for posts with "Anonymous" author
- [ ] Verify username not shown (just "Anonymous")
- [ ] Still shows category, timestamp, content
- [ ] Author ID not leaked in DOM/API response

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 3.8 Reddit-Like Card Layout

- [ ] Vote buttons on LEFT side (desktop)
- [ ] Content (title/meta/snippet) on RIGHT
- [ ] Mobile: vote buttons become horizontal at bottom
- [ ] Hover effects work (no jank)
- [ ] Responsive at all breakpoints (320px, 768px, 1024px)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 4. CREATE POST (/community/new) - (7 tests)

### 4.1 Page Loads (Logged In)

- [ ] Login first
- [ ] Go to /community/new
- [ ] Form loads without errors
- [ ] See all fields: title, category, content, tags, anon toggle
- [ ] Submit button visible and enabled

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 4.2 Page Requires Login

- [ ] Logout
- [ ] Try to access /community/new
- [ ] Redirects to /login
- [ ] After login, redirects back to /community/new

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 4.3 Form Validation

- [ ] Try to submit empty form
- [ ] See validation error for title (required)
- [ ] Fill title, leave category empty
- [ ] See validation error for category
- [ ] Fill title + category, leave content empty
- [ ] See validation error for content
- [ ] Fix all errors, submit succeeds

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 4.4 Character Count Works

- [ ] Type in content field
- [ ] Character count updates real-time
- [ ] Shows "X / 50,000 characters"
- [ ] No error when hitting limit (gracefully stops)
- [ ] No crash with undefined error

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 4.5 Submit Post Successfully

- [ ] Fill valid post:
  - Title: "Test Post About Autism"
  - Category: "Parenting Tips"
  - Content: "This is a test post..."
  - Tags: Select 2-3
- [ ] Do NOT check "Post Anonymously"
- [ ] Click "Create Post"
- [ ] Should succeed (no 500 error)
- [ ] Redirects to /community/[id]

**Result**: ✅ Pass / ❌ Fail  
**Post ID**: ****\_\_\_****

### 4.6 Anonymous Post Submission

- [ ] Go back to /community/new
- [ ] Fill post form again
- [ ] Check "Post Anonymously" toggle
- [ ] Submit
- [ ] Should succeed
- [ ] Redirects to /community/[id]
- [ ] Verify "Anonymous" author when viewing feed

**Result**: ✅ Pass / ❌ Fail  
**Post ID**: ****\_\_\_****

### 4.7 Anti-Spam Protection (2 links max)

- [ ] Go to /community/new
- [ ] Fill post with 3+ links:
  ```
  Check out https://example1.com and https://example2.com and https://example3.com
  ```
- [ ] Submit
- [ ] Should get error: "Too many links"
- [ ] Form not submitted
- [ ] Can edit and resubmit with ≤2 links

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 5. POST DETAIL (/community/[id]) - (8 tests)

### 5.1 Post Loads

- [ ] Click on post title from feed
- [ ] Redirects to /community/[id]
- [ ] Full post displays (title, author, content, category, tags)
- [ ] No 404 error for valid post IDs
- [ ] 404 shown for invalid/deleted post IDs

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.2 Vote Buttons Work (Desktop)

- [ ] On post detail page, find vote buttons (left side)
- [ ] Click upvote
- [ ] Vote count increases
- [ ] Button highlights (shows you voted)
- [ ] Click downvote
- [ ] Vote score decreases
- [ ] Click again to un-vote

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.3 "Join the Conversation" Composer

- [ ] Scroll down to comment section
- [ ] See label: "Join the conversation" (or similar)
- [ ] Text area for entering comment
- [ ] Submit button ("Post Comment" or similar)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.4 Create Comment (Logged In)

- [ ] Login first
- [ ] Go to any post detail page
- [ ] Type comment: "This is a test comment"
- [ ] Click "Post Comment"
- [ ] Comment appears in thread
- [ ] Your name/avatar shown on comment
- [ ] Comment count increments

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.5 Anonymous Comments

- [ ] Create another post for testing
- [ ] Go to post detail
- [ ] Find comment composer
- [ ] Look for "Post Anonymously" checkbox (or similar)
- [ ] Check it
- [ ] Submit comment
- [ ] Verify comment shows "Anonymous" instead of username

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.6 Nested Replies (Threaded)

- [ ] On existing comment, find "Reply" button
- [ ] Click "Reply"
- [ ] Reply composer appears indented
- [ ] Type reply: "Great point!"
- [ ] Submit
- [ ] Reply appears nested under parent comment
- [ ] Indentation shows hierarchy

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.7 Comment Sorting (Best/New/Top)

- [ ] Find comment sort tabs: "Best" / "New" / "Top"
- [ ] Click "Best" (default)
- [ ] Comments order by vote score (highest first)
- [ ] Click "New"
- [ ] Comments order by creation time (newest first)
- [ ] Click "Top"
- [ ] Comments order by vote score again (highest first)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 5.8 Comment Votes

- [ ] Find comment upvote/downvote buttons
- [ ] Click upvote
- [ ] Vote count increases
- [ ] Click downvote
- [ ] Vote count decreases
- [ ] Can un-vote by clicking same button again

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 6. VOTING SYSTEM - (4 tests)

### 6.1 Post Upvote/Downvote (Real-time)

- [ ] Go to post in feed or detail
- [ ] Note initial vote score
- [ ] Click upvote
- [ ] Score increases by 1 immediately
- [ ] Click downvote
- [ ] Score decreases by 2 (net -1 from original)
- [ ] Refresh page
- [ ] Vote persists (vote counted in DB)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 6.2 Unauthorized Vote Attempts

- [ ] Logout
- [ ] Go to any post
- [ ] Click upvote button
- [ ] Should show error or redirect to login
- [ ] After login, vote should work

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 6.3 Vote Count Consistency

- [ ] Check post vote score in feed
- [ ] Click post to go to detail page
- [ ] Verify vote score same on both pages
- [ ] Vote on post
- [ ] Go back to feed
- [ ] Verify vote reflected in feed card

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 6.4 Cannot Vote Twice

- [ ] Upvote a post
- [ ] Upvote again (click upvote while already upvoted)
- [ ] Vote should toggle to 0 (un-vote), not increase further
- [ ] Downvote
- [ ] Vote should change to -1 (not layer)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 7. RATE LIMITING - (5 tests)

### 7.1 Post Rate Limit (3 posts per minute)

- [ ] Create post #1, #2, #3 quickly
- [ ] All should succeed
- [ ] Try to create post #4 within 60 seconds
- [ ] Should get HTTP 429 error: "Rate limit exceeded"
- [ ] Wait 60 seconds
- [ ] Can create post #4

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 7.2 Comment Rate Limit (8 comments per minute)

- [ ] Go to post detail
- [ ] Comment 8 times quickly
- [ ] All should succeed
- [ ] Try 9th comment within 60 seconds
- [ ] Should get HTTP 429: "Rate limit exceeded"
- [ ] Wait 60 seconds, 9th comment succeeds

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 7.3 Vote Rate Limit (60 votes per minute)

- [ ] Rapidly upvote/downvote multiple posts/comments
- [ ] First 60 votes within 60 seconds should work
- [ ] 61st vote gets HTTP 429
- [ ] After 60 seconds, can vote again

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 7.4 Rate Limit Error Display

- [ ] Trigger rate limit error
- [ ] Should see user-friendly message (not stack trace)
- [ ] Message should say when to retry
- [ ] No console errors

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 7.5 Rate Limit Per User (Not Global)

- [ ] In one browser, create post
- [ ] In incognito/private window, login as different user
- [ ] That user should be able to create post independently
- [ ] Rate limits don't affect each other

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 8. ANTI-SPAM PROTECTION - (3 tests)

### 8.1 Duplicate Post Detection (5 min window)

- [ ] Create post with title "Test Duplicate Detection"
- [ ] Immediately try to create another post with SAME title
- [ ] Should get error: "Duplicate post detected"
- [ ] Wait 5+ minutes
- [ ] Can create post with same title again

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 8.2 Link Spam Prevention

- [ ] Try to create post with 3+ URLs:
  ```
  https://link1.com https://link2.com https://link3.com
  ```
- [ ] Should get error: "Too many links. Maximum 2 links per post"
- [ ] Can create post with exactly 2 URLs
- [ ] Can create post with 0 or 1 URL

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 8.3 Spam Attempts Don't Crash App

- [ ] Try creating post with:
  - [ ] Extremely long title (10,000 chars)
  - [ ] Extremely long content (100,000 chars)
  - [ ] Special characters and unicode
  - [ ] Null/undefined values
- [ ] All should be rejected gracefully (no 500 errors)
- [ ] See validation error, not crash

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 9. THEME TOGGLE - (5 tests)

### 9.1 Theme Button Visible (After Login)

- [ ] Logout
- [ ] Navbar: Theme button NOT visible
- [ ] Login
- [ ] Navbar: Theme button visible (sun/moon icon)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 9.2 Light Theme (Default)

- [ ] Login
- [ ] Check browser console: `document.documentElement.classList` should NOT have "dark"
- [ ] Page uses light background
- [ ] Text is dark/readable

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 9.3 Theme Toggle Works

- [ ] Click theme button (sun icon)
- [ ] Page transitions to dark mode
- [ ] Icon changes to moon
- [ ] Dark background applied
- [ ] Text remains readable

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 9.4 Theme Persists (localStorage)

- [ ] Toggle to dark mode
- [ ] Refresh page (F5)
- [ ] Still in dark mode (not reset to light)
- [ ] Toggle back to light mode
- [ ] Refresh page
- [ ] Still in light mode

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 9.5 Theme Works on All Pages

- [ ] Go through pages and toggle theme:
  - [ ] /community (feed)
  - [ ] /community/[id] (post detail)
  - [ ] /providers
  - [ ] /ai-support
  - [ ] /screening
  - [ ] /resources
  - [ ] /settings
- [ ] Theme applies consistently
- [ ] No pages break in dark mode

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 10. BOOKMARK FEATURE - (2 tests)

### 10.1 Bookmark Post

- [ ] Go to post in feed or detail
- [ ] Click bookmark button
- [ ] Button state changes (filled/highlighted)
- [ ] Page doesn't reload
- [ ] Toast/message shows "Bookmarked"

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 10.2 View Bookmarks

- [ ] After bookmarking posts, go to /bookmarks
- [ ] Bookmarked posts appear
- [ ] Can unbookmark from here
- [ ] Bookmarks persist after logout/login

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 11. MOBILE RESPONSIVENESS - (4 tests)

### 11.1 Mobile Feed (320px width)

- [ ] Open DevTools (F12)
- [ ] Set width to 320px (mobile)
- [ ] Go to /community
- [ ] Posts display vertically
- [ ] Vote buttons horizontal (inline)
- [ ] Title readable
- [ ] No horizontal scroll

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 11.2 Mobile Post Detail

- [ ] Go to /community/[id] on mobile (320px)
- [ ] Post displays full-width
- [ ] Comments readable
- [ ] Comment composer accessible (can scroll to it)
- [ ] Vote/reply buttons touch-friendly (> 44px height)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 11.3 Mobile Create Post

- [ ] Go to /community/new on mobile
- [ ] Form fields stack vertically
- [ ] All fields visible (no overflow)
- [ ] Submit button clickable
- [ ] Can successfully create post on mobile

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 11.4 Mobile Navbar

- [ ] Navbar items responsive
- [ ] Menu hamburger icon appears on mobile
- [ ] Click hamburger, menu expands
- [ ] Theme toggle in mobile menu (after login)
- [ ] Sign out button in mobile menu (after login)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 12. ERROR HANDLING - (5 tests)

### 12.1 404 Errors

- [ ] Go to /community/nonexistent-id
- [ ] Should see 404 page (not 500)
- [ ] Message: "Post not found"
- [ ] Link back to /community works

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 12.2 500 Errors

- [ ] Database is running (should be)
- [ ] No 500 errors on normal usage
- [ ] If error occurs, user sees message (not stack trace)
- [ ] App doesn't crash

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 12.3 Network Error Handling

- [ ] Simulate network error: Open DevTools > Network > Offline
- [ ] Try to create post
- [ ] See error: "Network error" or "Please check your connection"
- [ ] Go back online
- [ ] Can create post again

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 12.4 Validation Errors

- [ ] Try to submit invalid data:
  - [ ] Title < 3 chars
  - [ ] Title > 255 chars
  - [ ] Content > 50,000 chars
  - [ ] Invalid category ID
  - [ ] Invalid email on signup
- [ ] See specific error messages (not generic 500)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 12.5 Authorization Errors

- [ ] Try to delete someone else's post (API call via console)
- [ ] Should get 403 Forbidden (not 500)
- [ ] Try to edit someone else's comment
- [ ] Should get 403 Forbidden
- [ ] No stack trace leaked in errors

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 13. DATABASE & PERSISTENCE - (3 tests)

### 13.1 Data Persists After Refresh

- [ ] Create post
- [ ] Refresh page (F5)
- [ ] Post still there
- [ ] Vote on post
- [ ] Refresh
- [ ] Vote persists
- [ ] Create comment
- [ ] Refresh
- [ ] Comment still there

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 13.2 Data Persists After Logout/Login

- [ ] Create post/comment
- [ ] Logout
- [ ] Login (different or same account if it's yours)
- [ ] Go to /community
- [ ] Post/comment visible
- [ ] Data not lost

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 13.3 Concurrent User Consistency

- [ ] In browser 1: Create post
- [ ] In browser 2 (incognito): Refresh /community
- [ ] Post visible in browser 2
- [ ] In browser 1: Vote on post
- [ ] In browser 2: Refresh
- [ ] Vote count updated

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 14. SECURITY - (4 tests)

### 14.1 XSS Prevention

- [ ] Try to create post with HTML/script:
  ```
  <script>alert('XSS')</script>
  <img src=x onerror="alert('XSS')">
  ```
- [ ] Post created but script NOT executed
- [ ] Script shown as plain text or sanitized
- [ ] No alerts appear
- [ ] Check DOM: script tags not in DOM

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 14.2 CSRF Protection

- [ ] Open DevTools Network tab
- [ ] Create post
- [ ] Check network request has proper headers
- [ ] Request includes csrf token (NextAuth handles automatically)
- [ ] No CSRF warnings

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 14.3 SQL Injection Prevention

- [ ] Try to create post with title:
  ```
  '; DROP TABLE posts; --
  ```
- [ ] Post created safely (title treated as literal string)
- [ ] No SQL errors
- [ ] Database not affected

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 14.4 Auth Token Security

- [ ] Open DevTools > Application > Cookies
- [ ] Find session cookies
- [ ] Verify:
  - [ ] HttpOnly flag set (not accessible from JS)
  - [ ] Secure flag set (HTTPS only)
  - [ ] SameSite=Lax or Strict
- [ ] No auth tokens in localStorage

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 15. PERFORMANCE - (3 tests)

### 15.1 Feed Loads Fast (< 2 seconds)

- [ ] Open DevTools > Network tab
- [ ] Clear cache (Ctrl+Shift+Delete)
- [ ] Go to /community
- [ ] Check load time
- [ ] First contentful paint < 2 seconds
- [ ] Page interactive within 3 seconds

**Result**: ✅ Pass / ❌ Fail  
**Time**: \_\_\_ seconds

### 15.2 No N+1 Queries

- [ ] Open DevTools > Network tab
- [ ] Go to /community
- [ ] Check API calls
- [ ] Should see 1-2 requests (not 10+)
- [ ] Post detail should fetch post + comments in 1-2 requests
- [ ] Not fetching individual author data for each post

**Result**: ✅ Pass / ❌ Fail  
**Request Count**: ****\_\_\_****

### 15.3 Images Lazy Load

- [ ] Go to /community with many posts
- [ ] Scroll down
- [ ] Images load as you scroll (not all at once)
- [ ] Page remains responsive
- [ ] No "Layout shift" jank

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## 16. FINAL VERIFICATION (3 tests)

### 16.1 All Features Work End-to-End

- [ ] Can signup
- [ ] Can login
- [ ] Can view community feed
- [ ] Can create post (normal and anonymous)
- [ ] Can comment (normal and anonymous)
- [ ] Can reply to comments
- [ ] Can vote on posts/comments
- [ ] Can bookmark
- [ ] Can toggle theme
- [ ] Can logout

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 16.2 No Broken Links

- [ ] Click through all navbar links
- [ ] Click post titles
- [ ] Click comment usernames
- [ ] Click category tags
- [ ] All navigate correctly (no 404s)
- [ ] No links to unfinished pages

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

### 16.3 Browser Compatibility

- [ ] Test on:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] All features work on each browser
- [ ] No console errors
- [ ] Styling consistent

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ****\_\_\_****

---

## Summary

**Total Tests**: 50+  
**Passed**: **\_** / **\_**  
**Failed**: **\_** / **\_**  
**Blocked**: **\_** / **\_**

**Overall Status**: ✅ READY FOR LAUNCH / ⚠️ NEEDS FIXES / ❌ NOT READY

**Critical Issues Found**:

1. ***
2. ***
3. ***

**Recommendations**:

---

**Sign-Off**:

- Tester: ****\_\_\_****
- Date: ****\_\_\_****
- Time Spent: ****\_\_\_****

---

**Next Steps**:

- [ ] Fix any failed tests
- [ ] Re-run failed tests
- [ ] Get approval from product
- [ ] Deploy to production (Vercel + Supabase)
- [ ] Monitor for 24 hours
- [ ] Announce launch
