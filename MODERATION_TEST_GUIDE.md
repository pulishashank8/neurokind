# Moderation System - Quick Test Guide

## Pre-Test Setup

### 1. Start Services

```bash
# Start Docker containers (PostgreSQL + Redis)
cd c:\Users\User\neurokind
docker-compose up -d

# Wait for containers to be ready (30 seconds)
```

### 2. Run Database Migration

```bash
cd c:\Users\User\neurokind\web
npx prisma migrate dev --name add_moderation_audit_log
```

### 3. Start Development Server

```bash
npm run dev
# App runs at http://localhost:3000
```

## Test Scenario: Complete Moderation Workflow

### Phase 1: Setup Test Users

#### Create Regular User

1. Navigate to http://localhost:3000/register
2. Create account: `testuser@example.com` / `password123`
3. Fill in profile (username: "TestUser")
4. Note: This user will be regular community member

#### Create Moderator User

1. Register second account: `moderator@example.com` / `password123`
2. Fill in profile (username: "TestMod")
3. **Important**: Manually set role in database:

   ```bash
   # Connect to PostgreSQL
   psql -h localhost -U neurokind -d neurokind

   # Update user role to MODERATOR
   UPDATE "User" SET role = 'MODERATOR' WHERE email = 'moderator@example.com';
   ```

### Phase 2: Create Test Content

#### Create a Post

1. Log in as testuser@example.com
2. Navigate to /community
3. Click "Create Post"
4. Fill in:
   - Title: "Test Post for Moderation"
   - Category: "General Discussion"
   - Content: "This is a test post to demonstrate moderation features."
5. Post should appear in community feed

#### Create a Comment (Optional)

1. On same post, scroll to comments section
2. Click "Add Comment"
3. Type: "This is a test comment"
4. Submit

### Phase 3: Submit Report

1. Still logged in as testuser@example.com
2. On the test post, click "Report" button
3. Fill in report form:
   - Reason: "Spam" or "Inappropriate"
   - Description: "This is a test report"
4. Submit report
5. Should see success message

**Important**: To test duplicate prevention, try reporting same post again immediately - should get error message

### Phase 4: Access Moderation Dashboard

1. Log out (testuser) and log in as moderator@example.com
2. Navigate to http://localhost:3000/moderation
3. Should see dashboard with:
   - Status and Type filters
   - List of reports (should include your test report)
   - Color-coded status badges

**If access denied**: Check that user role is set to MODERATOR in database

### Phase 5: Review and Action Report

1. On moderation dashboard, find your test report
2. Click report card or "View details" button
3. On detail page, should see:
   - Full report reason and description
   - Target post content
   - Reporter name
   - Status buttons
   - Action buttons

#### Test Status Updates

1. Click "Mark as Under Review"
   - Badge should change to yellow
   - Feedback message shown
2. Click "Mark as Resolved"
   - Badge should change to green
   - Feedback message shown

#### Test Content Moderation

1. Go back to detail page
2. Click "Remove Content"
   - Should see success message
   - Auto-redirect to dashboard
3. Go back to community feed - post should show "🚫 Removed by moderators" badge

#### Test Other Actions (Create new posts/reports to test each)

- **Lock**: Click "Lock" - post gets 🔒 badge, prevents comments
- **Pin**: Click "Pin" - post gets 📌 badge, moved to top
- **Suspend** (if testing user report): Click "Suspend" - user shadowbanned

### Phase 6: Verify Cache Invalidation

1. After taking any moderation action
2. Go back to community feed
3. Post status should update immediately (badge visible)
4. Verify no stale data shown (cache properly invalidated)

## API Testing (Optional - Using cURL or Postman)

### Get All Reports

```bash
curl -X GET "http://localhost:3000/api/mod/reports?status=OPEN" \
  -H "Cookie: [YOUR_AUTH_COOKIE]"
```

### Get Single Report

```bash
curl -X GET "http://localhost:3000/api/mod/reports/[REPORT_ID]" \
  -H "Cookie: [YOUR_AUTH_COOKIE]"
```

### Update Report Status

```bash
curl -X PATCH "http://localhost:3000/api/mod/reports/[REPORT_ID]" \
  -H "Content-Type: application/json" \
  -H "Cookie: [YOUR_AUTH_COOKIE]" \
  -d '{"status": "UNDER_REVIEW"}'
```

### Remove Post

```bash
curl -X POST "http://localhost:3000/api/mod/actions/remove" \
  -H "Content-Type: application/json" \
  -H "Cookie: [YOUR_AUTH_COOKIE]" \
  -d '{"targetId": "[POST_ID]", "reason": "Policy violation"}'
```

### Lock Post

```bash
curl -X POST "http://localhost:3000/api/mod/actions/lock" \
  -H "Content-Type: application/json" \
  -H "Cookie: [YOUR_AUTH_COOKIE]" \
  -d '{"targetId": "[POST_ID]", "isLocked": true}'
```

### Pin Post

```bash
curl -X POST "http://localhost:3000/api/mod/actions/pin" \
  -H "Content-Type: application/json" \
  -H "Cookie: [YOUR_AUTH_COOKIE]" \
  -d '{"targetId": "[POST_ID]", "isPinned": true}'
```

### Suspend User

```bash
curl -X POST "http://localhost:3000/api/mod/actions/suspend" \
  -H "Content-Type: application/json" \
  -H "Cookie: [YOUR_AUTH_COOKIE]" \
  -d '{"targetId": "[USER_ID]", "reason": "Policy violation"}'
```

## Test Verification Checklist

### Dashboard

- [ ] /moderation loads without errors
- [ ] Access denied for non-moderators
- [ ] Reports list populates
- [ ] Status filter works
- [ ] Type filter works
- [ ] Report count displays correctly
- [ ] Pagination works (if >20 reports)

### Detail Page

- [ ] Report info displays completely
- [ ] Target content shows correctly
- [ ] Status buttons work and update
- [ ] Action buttons execute and show feedback
- [ ] Redirect happens on success

### Content Display

- [ ] "Removed" badge shows on removed posts
- [ ] "Locked" badge shows on locked posts
- [ ] "Pinned" badge shows on pinned posts
- [ ] Badges remove when action undone
- [ ] Community feed shows updated status immediately

### Audit Trail

- [ ] Check database ModActionLog table:
  ```bash
  psql -h localhost -U neurokind -d neurokind
  SELECT * FROM "ModActionLog" ORDER BY "createdAt" DESC LIMIT 10;
  ```
- [ ] Each action creates a record
- [ ] Action type recorded correctly
- [ ] Moderator ID and reason stored
- [ ] Timestamps accurate

### Rate Limiting

- [ ] Rate limits enforced on post creation
- [ ] Rate limits enforced on reports
- [ ] Rate limits enforced on votes
- [ ] Error message shows when limit exceeded

### Error Handling

- [ ] Invalid report ID returns 404
- [ ] Unauthorized users return 401
- [ ] Missing fields return 400
- [ ] Server errors return 500 with message

## Database Inspection

### View All Moderation Actions

```sql
SELECT
  id,
  "actionType",
  "targetType",
  "targetId",
  "moderatorId",
  reason,
  "createdAt"
FROM "ModActionLog"
ORDER BY "createdAt" DESC;
```

### View Specific User's Actions

```sql
SELECT * FROM "ModActionLog"
WHERE "moderatorId" = '[MODERATOR_ID]'
ORDER BY "createdAt" DESC;
```

### View Posts with Moderation Status

```sql
SELECT id, title, status, "isPinned", "isLocked"
FROM "Post"
WHERE status != 'ACTIVE' OR "isPinned" = true OR "isLocked" = true;
```

## Troubleshooting

### Issue: "Access denied" on /moderation

**Solution**: Verify user role in database is MODERATOR or ADMIN

```bash
SELECT email, role FROM "User";
```

### Issue: Post doesn't show "Removed" badge

**Solution**: Verify post status is REMOVED in database

```bash
SELECT id, title, status FROM "Post" WHERE id = '[POST_ID]';
```

### Issue: Cache not invalidating (old data shows)

**Solution**: Verify Redis is running and connected

```bash
redis-cli ping
# Should return "PONG"
```

### Issue: Report submission fails

**Solution**:

1. Check duplicate report error - try different post
2. Check rate limiting - wait a minute before trying again
3. Check browser console for error details

### Issue: Moderation actions fail with 500

**Solution**:

1. Check server logs for database errors
2. Verify PostgreSQL is running
3. Verify migrations ran successfully: `npx prisma migrate status`

## Performance Notes

- Report list pagination: 20 per page (configurable)
- Cache TTL for posts: 5 minutes (configurable in redis.ts)
- Rate limit windows: 1 minute (configurable in redis.ts)
- Duplicate report window: 24 hours (86400 seconds - configurable)

## Cleanup After Testing

### Remove Test Data

```bash
# Connect to database
psql -h localhost -U neurokind -d neurokind

# Remove test posts/comments/reports
DELETE FROM "Report" WHERE "reportedContent" LIKE '%test%';
DELETE FROM "Post" WHERE title LIKE '%Test Post%';

# Remove test users (optional)
DELETE FROM "User" WHERE email = 'testuser@example.com';
DELETE FROM "User" WHERE email = 'moderator@example.com';
```

### Stop Services

```bash
# Stop containers
docker-compose down

# Keep volumes for data persistence:
# docker-compose down -v (use -v to remove volumes)
```

## Next Steps

1. **Set Up Admin User**: Promote trusted user to ADMIN role
2. **Create Moderation Guidelines**: Document community standards
3. **Train Moderators**: Review moderation dashboard features
4. **Monitor Activity**: Check ModActionLog regularly
5. **Gather Feedback**: Adjust rate limits/categories as needed
6. **Scale Infrastructure**: Monitor performance under production load
