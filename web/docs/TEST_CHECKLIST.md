# PRODUCTION SAFETY + PERFORMANCE TEST CHECKLIST

## Overview

This checklist validates that NeuroKind meets production safety and performance standards. All checks are automated where possible. Manual verification is needed for real-world scenarios.

---

## A) ENVIRONMENT & STARTUP CHECKS ✓

### A1. Environment Validation

```bash
# Verify environment validation works
npm run dev
```

Expected: App starts without crashing. If required vars missing, see error message.

### A2. Health Endpoint

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health?detailed=true
```

Expected responses:

```json
{
  "status": "healthy",
  "database": "ok",
  "redis": "ok|not_configured",
  "aiFeatures": "enabled|disabled",
  "memory": { "heapUsedMB": 150, "heapTotalMB": 512, "externalMB": 10 },
  "uptime": 120.5
}
```

### A3. Build Verification

```bash
npm run build
```

Expected: Zero errors, "Build succeeded" or similar message.

---

## B) RATE LIMITING TESTS ✓

### B1. Registration Rate Limit (3/hour per IP)

```bash
# Attempt to register 3 times quickly (should succeed)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"Test123!@","username":"user1","displayName":"User 1"}'

# 4th attempt (should fail with 429)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test4@example.com","password":"Test123!@","username":"user4","displayName":"User 4"}'
```

Expected: 4th request returns 429 with:

```json
{ "error": "Rate limit exceeded", "retryAfterSeconds": 3595 }
```

### B2. Post Creation Rate Limit (5/min per user)

Log in, then:

```bash
# Create 5 posts rapidly (should succeed)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/posts \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Post $i\",\"content\":\"Content $i\",\"categoryId\":\"<id>\",\"tags\":[]}"
done

# 6th post (should fail with 429)
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Post 6","content":"Content 6","categoryId":"<id>","tags":[]}'
```

Expected: 6th request returns 429 with retry-after header.

### B3. Comment Creation Rate Limit (10/min per user)

```bash
# Create 10 comments rapidly (should succeed)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/posts/<postId>/comments \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"Comment $i\"}"
done

# 11th comment (should fail with 429)
```

### B4. Vote Rate Limit (60/min per user)

```bash
# Rapid voting (40+ votes, should succeed)
for i in {1..40}; do
  curl -X POST http://localhost:3000/api/votes \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"targetType\":\"POST\",\"targetId\":\"<id>\",\"value\":1}"
done

# Each should return 200 until limit exceeded
```

### B5. Report Creation Rate Limit (5/min per user)

```bash
# Create 5 reports rapidly (should succeed)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/reports \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"targetType\":\"POST\",\"targetId\":\"<id>\",\"reason\":\"spam\",\"details\":\"Test\"}"
done

# 6th report (should fail with 429)
```

### B6. Duplicate Report Prevention (24h window)

```bash
# Submit first report
curl -X POST http://localhost:3000/api/reports \
  -d "{\"targetType\":\"POST\",\"targetId\":\"<postId>\",\"reason\":\"spam\",\"details\":\"Test\"}"
# Returns: 201 Created

# Immediately submit duplicate report on same target
curl -X POST http://localhost:3000/api/reports \
  -d "{\"targetType\":\"POST\",\"targetId\":\"<postId>\",\"reason\":\"spam\",\"details\":\"Test\"}"
```

Expected: 2nd request returns 400:

```json
{ "error": "You have already reported this content in the last 24 hours" }
```

---

## C) SECURITY HEADERS CHECK ✓

### C1. Verify Security Headers

```bash
curl -I http://localhost:3000
```

Expected headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; ...
```

### C2. HSTS Header (production only)

In production (`NODE_ENV=production`):

```bash
curl -I https://yourdomain.com
```

Expected:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## D) PERFORMANCE & CACHING TESTS ✓

### D1. Page Load Speed

```bash
# Measure homepage load
time curl -s http://localhost:3000 > /dev/null
```

Target: < 1 second for repeat loads (after cache warm-up)

### D2. API Response Time

```bash
# Check API latencies
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/posts
```

Targets:

- GET /api/posts: < 200ms (cached) / < 500ms (cold)
- GET /api/health: < 50ms
- GET /api/categories: < 100ms (cached)

### D3. Cache Verification

```bash
# First request (cold cache)
time curl http://localhost:3000/api/posts
# Second request (warm cache, should be faster)
time curl http://localhost:3000/api/posts
```

Expected: 2nd request significantly faster.

### D4. Pagination

```bash
# Test paginated endpoint
curl "http://localhost:3000/api/posts?skip=0&take=20"
curl "http://localhost:3000/api/posts?skip=20&take=20"
```

Expected:

- Returns max 20 items per page
- `hasMore` boolean correct
- No N+1 queries (verify in logs)

---

## E) ABUSE PROTECTION TESTS ✓

### E1. Duplicate Report Prevention

See B6 above - 24-hour duplicate blocking active.

### E2. XSS Prevention (Content Sanitization)

```bash
# Try posting with script tags
curl -X POST http://localhost:3000/api/posts \
  -d '{"title":"Test","content":"<script>alert(1)</script>","categoryId":"<id>"}'
```

Expected: Script tags removed/escaped in response.

### E3. Input Validation

```bash
# Try invalid inputs
curl -X POST http://localhost:3000/api/posts \
  -d '{"title":"","content":"","categoryId":"invalid"}'
```

Expected: 400 Bad Request with validation errors.

---

## F) REGRESSION TESTS ✓

### F1. Community Functionality

```bash
# Test main community page
curl http://localhost:3000/community
# Should return 200 OK
```

### F2. Provider/Resource Pages

```bash
curl http://localhost:3000/providers
curl http://localhost:3000/resources
```

Expected: All pages load, no 5xx errors.

### F3. Authentication Pages

```bash
curl http://localhost:3000/login
curl http://localhost:3000/register
```

Expected: 200 OK, HTML returned.

### F4. Moderation Endpoints (if moderator)

```bash
# Get reports list
curl -H "Authorization: Bearer $MODERATOR_TOKEN" \
  http://localhost:3000/api/mod/reports

# Should return report list or 401 if not moderator
```

---

## G) BUILD VERIFICATION ✓

### G1. TypeScript Compilation

```bash
npm run build 2>&1 | grep -E "error|failed|Build completed"
```

Expected: No errors, "Build completed successfully" or similar.

### G2. Development Server

```bash
npm run dev
# Wait for "✓ Ready" message
curl http://localhost:3000
```

Expected: Server starts, responds to requests.

### G3. Production Build

```bash
npm run build
npm run start
```

Expected: App runs without errors.

---

## H) DEPENDENCY STABILITY CHECK ✓

### H1. No New Vulnerabilities

```bash
npm audit
```

Expected: No critical vulnerabilities, or documented exceptions.

### H2. Package Lock Consistency

```bash
npm ci
```

Expected: Installs from lock file without conflicts.

### H3. Check for Broken Imports

```bash
grep -r "import.*from.*['\"]@/" src/ | wc -l
# Verify all imports resolve correctly
npm run build
```

Expected: Build succeeds, no import errors.

---

## I) ENVIRONMENT VALIDATION TEST ✓

### I1. Required Variables Missing

Remove `DATABASE_URL` and run:

```bash
npm run dev
```

Expected: Error message about missing DATABASE_URL, clean exit (no crash).

### I2. Optional Variables Gracefully Missing

Remove `REDIS_URL` and run:

```bash
npm run dev
```

Expected: App starts, uses in-memory cache/rate limiting, logs warning.

### I3. Optional API Keys Missing

Remove `OPENAI_API_KEY` and run:

```bash
npm run dev
```

Expected: App starts, AI features disabled, no crash.

---

## J) LOAD TESTING (OPTIONAL) ⚠️

### J1. Sustained Load (5 concurrent users, 60s)

```bash
ab -n 300 -c 5 -t 60 http://localhost:3000/api/posts
```

Expected:

- Requests/sec: > 50
- Failed requests: 0
- p99 latency: < 2s

### J2. Rate Limiting Under Load

```bash
# Stress-test rate limiter
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/votes \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"targetType":"POST","targetId":"<id>","value":1}' &
done
wait
```

Expected: Rate limiter returns 429 after limits exceeded, no crashes.

---

## K) MANUAL VERIFICATION CHECKLIST

- [ ] Logged in user can create a post
- [ ] Logged in user can comment on posts
- [ ] Logged in user can vote on posts/comments
- [ ] Anonymous mode works (posts don't show author)
- [ ] Moderator can access /moderation dashboard
- [ ] Moderator can submit a report
- [ ] Categories and tags load correctly
- [ ] Search functionality works
- [ ] Pagination works (can browse multiple pages)
- [ ] Responsive design works on mobile (if applicable)
- [ ] Error pages display correctly (404, 500, etc.)

---

## DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All tests in this checklist pass
- [ ] Environment variables set: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Optional variables configured: `REDIS_URL`, `OPENAI_API_KEY`
- [ ] Database migration run: `npx prisma migrate deploy`
- [ ] Redis container running (if using): `docker-compose up -d`
- [ ] Moderator roles set in database (manual SQL or admin panel)
- [ ] Build passes with no errors: `npm run build`
- [ ] Secrets NOT committed to git
- [ ] `.env` file added to `.gitignore`
- [ ] CDN/cache headers configured (if using CDN)
- [ ] Monitoring/logging configured (Sentry, DataDog, etc.)
- [ ] Backups configured
- [ ] SSL certificate valid and HTTPS enforced

---

## TROUBLESHOOTING

### Health endpoint returns 503 (degraded)

- Check database connection: `psql $DATABASE_URL`
- Check Redis (if using): `redis-cli ping`
- Check server logs for detailed errors

### Rate limiting not working

- Verify Redis is running: `docker-compose ps`
- Check `REDIS_URL` environment variable
- Restart dev server: `npm run dev`

### Build failing

- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Getting "Too many open connections" error

- Increase Prisma connection pool in `.env`: `DATABASE_URL="..." ?connection_limit=20"`
- Check for connection leaks in code
- Restart database container

---

## NOTES

- **Rate Limiters**: Configured to use Redis if available, fall back to in-memory for development
- **Caching**: 45s TTL for posts (volatile), 10min for categories/tags (stable)
- **Duplicate Reports**: Checks for duplicates within 24h window to prevent spam
- **Security**: CSP, HSTS, X-Frame-Options all configured; review CSP policy if content blocked
- **Performance**: All queries optimized with Prisma `select` statements to avoid N+1 issues

---

**Last Updated**: January 2026  
**Status**: Production Ready ✓
