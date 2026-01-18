# NeuroKind - Testing Checklist

**Before Launch**: Run through this entire checklist to verify all features work correctly.

---

## 1. ENVIRONMENT SETUP ✅

- [ ] `.env` file exists with all required variables:
  - [ ] `DATABASE_URL` set to PostgreSQL connection
  - [ ] `NEXTAUTH_SECRET` (32+ characters)
  - [ ] `NEXTAUTH_URL` (http://localhost:3000 for dev)
  - [ ] `ALLOW_DEV_LOGIN_WITHOUT_DB="true"` (for dev fallback)
- [ ] `.env.example` exists with template values
- [ ] Docker containers running:
  - [ ] PostgreSQL at localhost:5432
  - [ ] Redis at localhost:6379 (optional, rate limiting falls back to in-memory)

---

## 2. AUTHENTICATION ✅

### Login/Register Flow

- [ ] Navigate to `/login`
- [ ] Login with `admin@neurokind.local` / `admin123`
- [ ] Page redirects to `/dashboard`
- [ ] Session persists across page reloads
- [ ] Navbar appears with user links

### Sign Out

- [ ] Click "Sign Out" button in navbar (or mobile menu)
- [ ] Redirects to `/login`
- [ ] Session cleared

### Dev Fallback (Database Offline)

- [ ] Stop Docker containers
- [ ] Try login with dev credentials
- [ ] Should succeed and show warning in browser console
- [ ] Resume Docker for rest of tests

---

## 3. THEME TOGGLE ✅

### Light/Dark Mode

- [ ] Login to dashboard (or any authenticated page)
- [ ] Navbar shows sun/moon icon (theme toggle button)
- [ ] Click theme toggle button
- [ ] Page switches to dark mode (if in light) or light mode (if in dark)
- [ ] Refresh page - theme persists (localStorage)
- [ ] CSS variables change correctly (check DevTools):
  - [ ] `var(--bg-surface)` changes
  - [ ] `var(--text-primary)` changes
  - [ ] Colors smooth transition (no jarring flash)

### Mobile Theme Toggle

- [ ] On mobile, open menu
- [ ] Theme toggle visible in mobile menu
- [ ] Works same as desktop

---

## 4. COMMUNITY / CREATE POST ✅

### Create Post Form

- [ ] Navigate to `/community` (when logged in)
- [ ] Click "Create New Post"
- [ ] Form page loads with fields:
  - [ ] Title input
  - [ ] Category dropdown
  - [ ] Tags selector (up to 5)
  - [ ] Content textarea
  - [ ] Anonymous checkbox
  - [ ] Preview toggle

### Form Validation

- [ ] Leave title empty, try submit → error: "Title required" or "too short"
- [ ] Leave content under 10 chars → error: "Content too short"
- [ ] Fill form with valid data and submit

### Post Creation

- [ ] Submit valid post
- [ ] Success toast appears: "Post created successfully!"
- [ ] Redirects to post detail page
- [ ] Post displays with:
  - [ ] Title
  - [ ] Content
  - [ ] Author name (or "Anonymous" if checkbox checked)
  - [ ] Category
  - [ ] Tags
  - [ ] Timestamp
  - [ ] Vote buttons
  - [ ] Comment section

### Feed Display

- [ ] Navigate to `/community`
- [ ] New post appears in feed
- [ ] Can sort by "New", "Hot", "Top"
- [ ] Pagination works (limit 20 per page)

---

## 5. RATE LIMITING ✅

### Post Creation Rate Limit

- [ ] Login and navigate to `/community/new`
- [ ] Create a post (post 1 of 3)
- [ ] Try to create 5 posts in rapid succession (click Submit quickly)
- [ ] **Expected**: First 5 succeed (within 60-second window), 6th shows error
  - Error: "Rate limit exceeded. Retry after X seconds"
  - HTTP 429 response
- [ ] Wait 60 seconds
- [ ] Can create post again

### Register Rate Limit

- [ ] Logout
- [ ] Try to register 4 times from same IP in rapid succession
- [ ] **Expected**: First 3 succeed, 4th shows error (3/hour limit)

### Login Rate Limit

- [ ] Try to login 11 times with wrong password rapidly
- [ ] **Expected**: First 10 fail with auth error, 11th shows rate limit error (10/min limit)

---

## 6. ANTI-SPAM PROTECTION ✅

### Excessive Links Check

- [ ] Create post with 3 links in content
- [ ] **Expected**: Error: "Too many links. Maximum 2 links per post allowed."

### Duplicate Post Detection

- [ ] Create post with title "Test Post"
- [ ] Try to create another post with same title immediately
- [ ] **Expected**: Error: "Duplicate post detected. Please wait before posting similar content."
- [ ] Wait 5+ minutes, then can create same-titled post again

### Link Format Validation

- [ ] Create post with text: "Visit https://example.com for more info"
- [ ] Should succeed (1 link, valid URL)

---

## 7. SCREENING MODULE ✅

### Screening Flow

- [ ] Navigate to `/screening`
- [ ] Enter age (1.5-12 range)
- [ ] Select optional gender and prior evaluation
- [ ] Click "Continue"
- [ ] Screening questions load (20 questions based on age group)
- [ ] Progress bar shows current position
- [ ] Can navigate with Next/Back buttons
- [ ] Submit completes form

### Results Display

- [ ] Results page shows:
  - [ ] "Credit score" gauge (0-100 radial chart)
  - [ ] Risk category badge (Low/Mild/Moderate/High)
  - [ ] Breakdown by question group
  - [ ] Next steps recommendations
  - [ ] Optional save toggle

---

## 8. BUILD & PERFORMANCE ✅

### Development Build

- [ ] Run: `npm run dev`
- [ ] Server starts without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] No console errors or TypeScript issues

### Production Build

- [ ] Run: `npm run build`
- [ ] Build completes successfully
- [ ] Output directory created (`.next`)
- [ ] No build warnings (TypeScript, ESLint)

### Page Load Performance

- [ ] Dashboard loads < 2 seconds
- [ ] Community page loads < 2 seconds
- [ ] Screening page loads < 1 second
- [ ] Network tab shows no 404s or errors

---

## 9. DATABASE OPERATIONS ✅

### Prisma Migrations

- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] All schema changes reflected in database
- [ ] Data persists across server restarts

### N+1 Query Prevention

- [ ] Check API logs for excessive queries
- [ ] Posts endpoint uses cursor pagination
- [ ] Includes select/include for related data

---

## 10. SECURITY ✅

### XSS Prevention

- [ ] Create post with: `<script>alert('xss')</script>`
- [ ] Script tags removed/sanitized on display
- [ ] No alert appears

### CSRF Protection

- [ ] CSRF token present in forms (check page source)
- [ ] POST requests include `X-CSRF-Token` header

### Session Security

- [ ] Session cookie has `HttpOnly` flag (DevTools → Application → Cookies)
- [ ] Cookie includes `Secure` flag (if HTTPS)
- [ ] `SameSite=Lax` or `Strict` set

---

## 11. RESPONSIVE DESIGN ✅

### Desktop (1920x1080)

- [ ] All components visible and properly spaced
- [ ] Navbar displays full menu
- [ ] No horizontal scroll

### Tablet (768x1024)

- [ ] Navigation responsive
- [ ] Form inputs full width
- [ ] Touch targets minimum 44px

### Mobile (375x667)

- [ ] Hamburger menu visible
- [ ] All pages readable without zoom
- [ ] Buttons/inputs responsive
- [ ] Theme toggle in mobile menu

---

## 12. ACCESSIBILITY ✅

### Keyboard Navigation

- [ ] Tab key cycles through all interactive elements
- [ ] Enter/Space trigger buttons
- [ ] Focus visible (blue ring outline)

### Screen Reader (NVDA/JAWS)

- [ ] Page title announced
- [ ] Headings announced with levels
- [ ] Form labels associated with inputs
- [ ] Buttons have accessible names

### Color Contrast

- [ ] Text meets WCAG AA standard (4.5:1 ratio)
- [ ] Check with DevTools → Lighthouse → Accessibility

---

## 13. ERROR HANDLING ✅

### 404 Pages

- [ ] Navigate to `/nonexistent-page`
- [ ] Shows 404 error page

### 500 Errors

- [ ] Create post when database temporarily unavailable
- [ ] Shows user-friendly error message (not stack trace)

### Form Errors

- [ ] Invalid input shows field-level error messages
- [ ] Errors clear when user corrects input

---

## 14. FINAL VERIFICATION ✅

### Summary

- [ ] All above tests pass
- [ ] No console warnings/errors (except dev-only)
- [ ] All features work as documented
- [ ] Ready for production deployment

### User Feedback

- [ ] No broken links
- [ ] All navigation works
- [ ] Consistent branding/design
- [ ] Professional appearance

---

## SIGN-OFF

| Tester | Date | Status |
| ------ | ---- | ------ |
| [ ]    | [ ]  | [ ]    |

---

## NOTES

Any issues found during testing should be logged below:

```
Issue #1: [Description]
  - Status: Open/Closed
  - Severity: Low/Medium/High
  - Fix: [Details]

```
