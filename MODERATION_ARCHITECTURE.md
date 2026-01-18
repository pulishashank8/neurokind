# Moderation System - Architecture & Design

## System Overview

The NeuroKind moderation system is a comprehensive safety framework built on proven patterns from platforms like Reddit and Discord. It enables human moderators to manage community health while maintaining transparency through audit logging.

### Core Design Principles

1. **Security First**: RBAC enforced at every boundary
2. **Auditability**: Every action logged and timestamped
3. **Performance**: Redis-backed caching and rate limiting
4. **Reliability**: Graceful degradation when services unavailable
5. **User Experience**: Fast feedback and clear status indicators

## Architectural Components

### 1. Data Layer (Prisma ORM + PostgreSQL)

```
┌─────────────────────────────┐
│      PostgreSQL Database    │
├─────────────────────────────┤
│ User (updated)              │ ◄─── Added: modActionLogs relation
│ Post                        │ ◄─── Existing: status field
│ Comment                     │
│ Report                      │
│ ┌─────────────────────┐    │
│ │ ModActionLog (NEW)  │    │ ◄─── Audit trail table
│ ├─────────────────────┤    │
│ │ id                  │    │
│ │ actionType (enum)   │    │
│ │ targetType (enum)   │    │
│ │ targetId            │    │
│ │ targetTitle         │    │
│ │ moderatorId (FK)    │    │
│ │ reason              │    │
│ │ notes               │    │
│ │ createdAt           │    │
│ │ [indexes on each]   │    │
│ └─────────────────────┘    │
└─────────────────────────────┘
```

**Schema Relationships:**

- `ModActionLog.moderatorId` → `User.id` (M:1 relationship)
- `User.modActionLogs` ← `ModActionLog[]` (inverse relation for queries)
- `Post.status` uses enum: ACTIVE, REMOVED, LOCKED, PINNED, DRAFT

### 2. Caching Layer (Redis)

```
┌──────────────────────────────────┐
│        Redis Cache (ioredis)     │
├──────────────────────────────────┤
│ Rate Limit Buckets               │
│  - posts:userId:CREATE           │ (5/min)
│  - comments:userId:CREATE        │ (10/min)
│  - votes:userId:VOTE             │ (60/min)
│  - reports:userId:REPORT         │ (5/min)
│                                  │
│ Duplicate Report Blocks          │
│  - report_dup:userId:postId      │ (24h TTL)
│                                  │
│ Feed Cache                       │
│  - posts:feed:page:1             │ (5min TTL)
│  - posts:feed:page:2             │
│  - posts:by:id:postId            │
│                                  │
│ [Gracefully degrades if Redis   │
│  unavailable - returns success]  │
└──────────────────────────────────┘
```

**Key Features:**

- Sliding window rate limiting (redis.rateLimit function)
- Automatic TTL expiration for duplicate prevention
- Wildcard cache invalidation on content updates
- Connection pooling and automatic reconnect

### 3. API Layer (Next.js Route Handlers)

```
┌────────────────────────────────────────────────┐
│         Next.js App Router API Routes          │
├────────────────────────────────────────────────┤
│                                                │
│ ┌─ /api/mod/reports              [GET]        │
│ │  │ ├─ RBAC Check (canModerate)             │
│ │  │ ├─ Query Builder (filters)              │
│ │  │ ├─ Prisma.findMany()                    │
│ │  │ └─ Return { reports[], pagination }     │
│ │                                             │
│ ├─ /api/mod/reports/[id]        [PATCH]      │
│ │  │ ├─ RBAC Check                           │
│ │  │ ├─ Validate status enum                 │
│ │  │ ├─ Update report.status                 │
│ │  │ ├─ Create ModActionLog entry            │
│ │  │ └─ Return updated report                │
│ │                                             │
│ ├─ /api/mod/actions/remove      [POST]       │
│ │  │ ├─ RBAC Check                           │
│ │  │ ├─ Find post/comment                    │
│ │  │ ├─ Set status = REMOVED                 │
│ │  │ ├─ Create ModActionLog                  │
│ │  │ ├─ Invalidate cache (posts:*)           │
│ │  │ └─ Return success                       │
│ │                                             │
│ ├─ /api/mod/actions/lock        [POST]       │
│ │  │ ├─ RBAC Check                           │
│ │  │ ├─ Toggle isLocked                      │
│ │  │ ├─ Create ModActionLog                  │
│ │  │ ├─ Invalidate cache                     │
│ │  │ └─ Return success                       │
│ │                                             │
│ ├─ /api/mod/actions/pin         [POST]       │
│ │  │ ├─ RBAC Check                           │
│ │  │ ├─ Toggle isPinned                      │
│ │  │ ├─ Set pinnedAt timestamp               │
│ │  │ ├─ Create ModActionLog                  │
│ │  │ ├─ Invalidate cache                     │
│ │  │ └─ Return success                       │
│ │                                             │
│ └─ /api/mod/actions/suspend     [POST]       │
│    │ ├─ RBAC Check                           │
│    │ ├─ Set shadowbanned = true              │
│    │ ├─ Create ModActionLog                  │
│    │ └─ Return success                       │
│                                                │
└────────────────────────────────────────────────┘
```

**Error Handling Pattern:**

```typescript
// All endpoints follow this pattern:
try {
  // 1. Authenticate
  const session = getServerSession()
  if (!session) return 401 Unauthorized

  // 2. Authorize
  if (!canModerate(userId)) return 401 Forbidden

  // 3. Validate input
  const parsed = schema.parse(body)

  // 4. Execute operation
  const result = await prisma.operation()

  // 5. Audit log
  await prisma.modActionLog.create({...})

  // 6. Cache invalidation
  await invalidateCache(...)

  // 7. Return success
  return 200 { success: true }
} catch (error) {
  // 8. Error handling
  return 500 { error: message }
}
```

### 4. UI Layer (Next.js Pages + React Components)

```
┌──────────────────────────────────────────┐
│     Next.js App Router Pages (Client)    │
├──────────────────────────────────────────┤
│                                          │
│ /moderation (Dashboard)                 │
│  ├─ Filter component (Status/Type)      │
│  ├─ Report list (pagination)            │
│  ├─ React Query (useQuery hook)         │
│  └─ Fetch: GET /api/mod/reports         │
│                                          │
│ /moderation/[id] (Detail)               │
│  ├─ Report info display                 │
│  ├─ Status update buttons               │
│  ├─ Action buttons (Remove/Lock/Pin)    │
│  ├─ Feedback system (success/error)     │
│  └─ API calls via fetch POST/PATCH      │
│                                          │
│ /community (Enhanced)                   │
│  ├─ PostCard component (updated)        │
│  │  └─ Status badges                    │
│  │     ├─ 🚫 Removed                   │
│  │     ├─ 🔒 Locked                    │
│  │     └─ 📌 Pinned                    │
│  └─ Fetch: GET /api/posts?...           │
│                                          │
│ /community/[id] (Updated)               │
│  ├─ Post detail display                 │
│  ├─ Status badges (same as feed)        │
│  └─ Fetch: GET /api/posts/[id]          │
│                                          │
└──────────────────────────────────────────┘
```

**Client-Side State Management:**

- React Query for server state (caching, refetching)
- React hooks for UI state (modals, filters, feedback)
- NextAuth session for authentication
- useRouter for navigation and redirects

### 5. Security Layer (RBAC + NextAuth)

```
┌──────────────────────────────────────────┐
│       NextAuth + RBAC Authorization      │
├──────────────────────────────────────────┤
│                                          │
│ canModerate(userId) function             │
│  └─ Queries user.role                    │
│     ├─ MODERATOR ✓ (full access)        │
│     ├─ ADMIN     ✓ (full access)        │
│     └─ PARENT/   ✗ (denied)             │
│        THERAPIST                         │
│                                          │
│ Session-based auth check                 │
│  └─ Every endpoint checks:               │
│     ├─ User is authenticated             │
│     └─ User has MODERATOR/ADMIN role     │
│                                          │
│ Client-side protection                   │
│  └─ /moderation route                    │
│     ├─ Redirect to login if no session   │
│     ├─ Show 403 if not authorized        │
│     └─ Auto-redirect to /community       │
│                                          │
└──────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: User Reports a Post

```
1. User (browser)
   └─> POST /api/reports
       ├─ reportedPostId: "abc123"
       └─ reason: "Spam"
                ▼
2. API Handler (POST /api/reports)
   ├─ Check: rateLimit(userId, REPORT) ────┐
   │                                        │ checks Redis
   ├─ Check: checkDuplicateReport()         │ checks Redis
   │                                        │
   └─> Database: CREATE Report
       └─> POST /api/mod/reports ────┐
                                     │ moderator polls
3. Moderator Browser (periodic)      │
   └─> GET /api/mod/reports          │ checks DB
       └─> React Query refetch
           └─> Display report in dashboard
```

### Example 2: Moderator Removes a Post

```
1. Moderator (browser)
   └─> POST /api/mod/actions/remove
       ├─ targetId: "post_abc123"
       └─ reason: "Policy violation"
                ▼
2. Middleware
   ├─ getServerSession() ──────────┐
   │                               │
   ├─ canModerate(session.user.id) │ checks DB
   │                               │
   └─ RBAC: isModeratorOrAdmin? ──────┐ ✓
                                      │
3. API Handler                        │
   ├─ prisma.post.update()           │
   │  └─ status = REMOVED            │
   │                ▼                │
   ├─ prisma.modActionLog.create()   │ auditing
   │  ├─ actionType: "REMOVE"        │
   │  ├─ moderatorId: mod_user_id    │
   │  └─ reason: "Policy violation"  │
   │                ▼                │
   ├─ invalidateCache("posts:*")     │ clear cache
   │  └─ Redis: DEL posts:* ─────────┤
   │                ▼                │
   └─> Response: 200 OK              │
       └─> Moderator: Success msg    │
                                     │
4. Community Users                   │
   ├─> GET /api/posts (after cache clear)
   │   └─> Re-fetch from DB
   │       ├─> Post now has status=REMOVED
   │       └─> React re-renders with badge
   │           └─> "🚫 Removed by moderators"
```

## Rate Limiting Algorithm

```
Sliding Window Rate Limiting (Redis Implementation):

Key: "ratelimit:posts:user123:1735969200"
     (action:resource:userId:windowStart)

Algorithm:
1. Request arrives at time T
2. Calculate window start: floor(T / windowMs)
3. Build Redis key with window start
4. INCR key counter
5. SET key expiry to (window + 1 minute)
6. Compare counter vs limit
   ├─ counter ≤ limit → Allow
   └─ counter > limit → Reject

Multiple concurrent requests:
├─ Request 1 at 12:00:00 → counter=1 ✓
├─ Request 2 at 12:00:05 → counter=2 ✓
├─ Request 3 at 12:00:10 → counter=3 ✓
├─ Request 4 at 12:00:15 → counter=4 ✓
├─ Request 5 at 12:00:20 → counter=5 ✓
└─ Request 6 at 12:00:25 → counter=6 ✗ REJECT
                              (limit is 5/min)

Window resets at 12:01:00:
├─ Old window key expires (auto-deleted)
├─ New window key created
└─ counter resets to 0
```

## Cache Invalidation Strategy

```
Tag-based Invalidation:

Posts cached with tags:
├─ posts:list (main feed)
├─ posts:feed:page:1
├─ posts:feed:page:2
├─ posts:by:id:post_abc123
└─ posts:by:author:user_xyz

When post is modified:
├─ Remove from cache: posts:by:id:post_abc123
├─ Invalidate dependent: posts:list, posts:feed:*
└─ Pattern: SCAN posts:* → DEL matching keys

Result:
├─ Old feed cached data cleared
├─ Old detail page cleared
├─ New fetches hit database
└─ Fresh data displayed in UI
```

## Audit Logging Structure

```
ModActionLog Entry:
{
  id: "mod_action_xyz789",
  actionType: "REMOVE",              (enum)
  targetType: "POST",                (enum)
  targetId: "post_abc123",
  targetTitle: "Original post title",
  moderatorId: "user_mod_456",
  reason: "Policy violation: spam",
  notes: "User warned, reoffense",
  createdAt: "2025-01-16T23:45:00Z"
}

Audit Queries:
├─ All actions by moderator:
│  WHERE moderatorId = 'user_mod_456'
│
├─ All actions on content:
│  WHERE targetId = 'post_abc123'
│
├─ Action timeline:
│  ORDER BY createdAt DESC
│  WHERE createdAt > 7 days ago
│
└─ Stats:
   SELECT actionType, COUNT(*)
   GROUP BY actionType
```

## Error Handling & Resilience

```
Redis Unavailable Scenario:
├─ Rate limiting
│  └─ Returns success: { remaining: limit, reset: now }
│     (All requests allowed, but tracked locally)
│
├─ Duplicate prevention
│  └─ Returns false: allow report submission
│     (May allow rare duplicates)
│
├─ Cache invalidation
│  └─ Skipped silently
│     (Database returns fresh data anyway)
│
└─ Result: Platform remains operational
   (Slightly reduced safety, but service available)

Database Connection Lost:
├─ Return 500 error
├─ Log error with context
├─ User sees "Service temporarily unavailable"
└─ Client retries request

Invalid User Input:
├─ Validate with Zod schema
├─ Return 400 Bad Request
├─ Include field-level errors
└─ User sees validation feedback

Authorization Failure:
├─ Return 401 Unauthorized
├─ Log attempt (security audit)
├─ Redirect user to login
└─ Display "Access denied" message
```

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ├─ API Server 1 ──────┐
    ├─ API Server 2 ──────┤─► PostgreSQL (single)
    ├─ API Server 3 ──────┤
    └─ API Server N ──────┴─► Redis (shared)

All servers connect to same:
├─ PostgreSQL database
├─ Redis cache
└─ Authentication provider (NextAuth)
```

### Performance Bottlenecks & Solutions

1. **Report List Queries**
   - Solution: Database indexes on (userId, status, createdAt)
   - Pagination: 20 per page
   - Estimated: <100ms response time

2. **ModActionLog Growth**
   - Solution: Archive old logs after 90 days
   - Estimated: 10KB per action entry
   - Growth: ~50MB/month for 1000 mod actions/day

3. **Cache Invalidation**
   - Challenge: Wildcard pattern matches all posts
   - Solution: Tag-based invalidation system
   - Estimated: <50ms for invalidation operation

4. **Concurrent Rate Limit Checks**
   - Challenge: Redis throughput under load
   - Solution: Connection pooling (default: 16 connections)
   - Estimated: <10ms per request at 1000 req/s

## Future Enhancement Opportunities

1. **Automation**
   - Auto-flag content with 5+ reports
   - Auto-remove egregious policy violations
   - Auto-notify escalation on patterns

2. **Analytics**
   - Moderator performance dashboard
   - Content violation trends
   - Appeal success rates

3. **Appeals System**
   - User appeals for removals
   - Appeal queue for admins
   - Reinstatement workflow

4. **Notifications**
   - Real-time mod alerts
   - User notifications on actions
   - Report status updates

5. **Community Transparency**
   - Public moderation logs (anonymized)
   - Appeal outcomes visible to users
   - Community guidelines enforcement stats
