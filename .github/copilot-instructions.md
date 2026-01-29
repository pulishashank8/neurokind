# NeuroKid AI Coding Guidelines

## Project Overview
NeuroKid is a full-stack **Next.js 16 + React 19 + TypeScript** web application for autism support. It combines a Reddit-style forum (community), provider directory, screening tools, and AI assistance.

### Tech Stack
- **Frontend**: Next.js 16.1.2, React 19.2.3, Tailwind CSS 4, TanStack React Query
- **Backend**: Next.js API Routes (serverless), NextAuth.js v4, Prisma ORM
- **Database**: PostgreSQL 16 with Prisma migrations
- **Caching/Limits**: Redis 7 (optional, with in-memory fallback)
- **Testing**: Vitest with MSW mocks, integration tests in `src/__tests__/`

---

## Architecture Patterns

### 1. **API Route Structure** (`src/app/api/`)
Each API endpoint is organized by resource in Next.js app router:
```
src/app/api/
├── posts/route.ts           # GET (list) and POST (create)
├── posts/[id]/route.ts      # GET, PATCH, DELETE individual
├── comments/route.ts         # Comment CRUD
├── votes/route.ts           # Vote creation/updates
├── auth/[...nextauth]/route.ts  # NextAuth config
├── user/profile/route.ts    # User endpoints
└── ...
```

**Pattern**: Use exported named functions (`GET`, `POST`, `PATCH`, `DELETE`) in `route.ts` files.

### 2. **Request/Response Handling**
Wrap all handlers with `withApiHandler()` from `src/lib/apiHandler.ts` for:
- Request ID correlation tracking
- Performance timing
- Structured error handling
- Automatic logging

```typescript
export const GET = withApiHandler(async (request: NextRequest) => {
  const logger = createLogger({ requestId: getRequestId(request) });
  // Handler logic
  return NextResponse.json(data);
}, { routeName: 'Get Posts' });
```

### 3. **Error Handling**
- Use `createErrorResponse()` for consistent error formatting (safe client messages, full server logging)
- Handles Zod validation errors → 400, Prisma errors → 404/409, unknown → 500
- Never expose sensitive info; log full errors server-side only

### 4. **Input Validation**
All inputs validated with Zod schemas before processing:
- **Community**: `src/lib/validations/community.ts` (posts, comments, votes, profiles)
- **Catalog**: `src/lib/validations/catalog.ts` (providers, resources)
- **Pattern**: Use `.strict()` on schemas to reject unexpected fields (security)

```typescript
const validation = createPostSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
}
```

---

## Critical Developer Workflows

### Setup & Development
```bash
cd web && npm run dev      # Start dev server (port 3000)
npm run db:push            # Push schema changes (dev)
npm run db:seed            # Seed test data
npm run db:studio          # Open Prisma Studio (GUI)
```

### Database
```bash
npm run db:generate        # Regenerate Prisma client (after schema changes)
npm run prisma:migrate:deploy  # Run migrations on production
npm run prisma:migrate:reset   # Reset test DB (destructive)
```

### Testing
```bash
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:integration   # Run integration tests only
npm run test:coverage      # Generate coverage report
```

Tests use helpers in `src/__tests__/helpers/`:
- `auth.ts`: `createTestUser()`, `createMockSession()`, `createModeratorUser()`
- `database.ts`: `cleanupDatabase()`, `seedEssentialData()`, `getTestPrisma()`
- `api.ts`: `createMockRequest()`, `parseResponse()`

### Debugging
- Check logs: Console output in dev, check `src/lib/logger.ts` for structured logging
- Use Prisma Studio: `npm run db:studio` to inspect live data
- Test API health: `npm run api:health`

---

## Key Patterns & Conventions

### Authentication & Authorization
- **Session**: Use `getServerSession()` from `src/lib/auth.ts` to fetch `SessionWithRoles`
- **Roles**: Check with `currentUserHasRole(role)` or `hasRole(userId, role)` from `src/lib/rbac.ts`
- **Protected Routes**: Call `requireAuth()` to assert authentication; throws error if not logged in

```typescript
const user = await requireAuth();  // Throws "Unauthorized" if not authenticated
```

### Logging
Use `createLogger({ requestId, method, pathname })` everywhere—never `console.log()`:
- Automatically redacts sensitive fields (passwords, tokens, API keys)
- Pino-based structured logging (JSON in prod, pretty-printed in dev)

### Caching with Redis
- `getCached(key, { prefix, ttl })` retrieves; `setCached(key, value, ttl)` stores
- `invalidateCache(key)` clears specific cache
- Falls back to in-memory map if Redis unavailable (dev/test)

### Rate Limiting
- `RateLimiter` class for advanced control; simpler: `rateLimit(key, config)` returns `{ success, remaining, reset }`
- Configs in `src/lib/redis.ts` (e.g., `RATE_LIMITS.POST_CREATE: { limit: 5, window: 60 }`)
- Return 429 with retry-after header when limit exceeded

### Form Validation
- All POST/PATCH bodies validated with Zod before processing
- Use `zodResolver()` in React forms (client-side) and `.safeParse()` in API routes (server-side)

### Prisma Queries
- Include relations selectively: `include: { profile: true, userRoles: true }`
- Use `where` clauses for filtering; leverage indices on frequently queried columns
- Pagination: cursor-based for feeds (preferred); offset-based for UI lists
- Always include error handling (P2002 = unique constraint, P2025 = not found, P2003 = invalid reference)

---

## Codebase-Specific Patterns

### Post Scoring (Reddit-Style "Hot" Algorithm)
Posts ranked by upvotes + decay over time:
```typescript
// From src/app/api/posts/route.ts
function calculateHotScore(voteScore: number, createdAt: Date): number {
  const sign = voteScore > 0 ? 1 : voteScore < 0 ? -1 : 0;
  const magnitude = Math.log10(Math.max(Math.abs(voteScore), 1) + 1);
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const decay = Math.pow(0.8, ageHours / 2); // 50% decay per 2 hours
  return sign * magnitude * decay;
}
```

### HTML Sanitization
Custom simple sanitizer (no external deps in production) removes scripts and event handlers:
```typescript
function simpleSanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:[^"']*/gi, "");
}
// Link safety: ensure rel="noopener noreferrer" on all <a> tags
```

### Cursor-Based Pagination
Feeds use cursor pagination (not offset) for performance:
- Query `limit+1` to check if "next page" exists
- Return `{ items, nextCursor, hasMore }`
- Cursor is base64-encoded timestamp + ID

### File Paths & Imports
- Use `@/` alias (configured in `tsconfig.json` → `src/*`)
- Example: `import { prisma } from '@/lib/prisma'` (not `../../lib/...`)

---

## Testing Guidelines

### Test Structure
- **Unit tests**: Test individual functions (validations, utils)
- **Integration tests**: Test full API routes with mocked auth and real Prisma queries
- **Setup**: `beforeEach()` creates fresh test user + fixtures; `afterAll()` cleans database

### Mocking NextAuth
```typescript
import { getServerSession } from 'next-auth';
vi.mock('next-auth');
vi.mocked(getServerSession).mockResolvedValue(mockSession);
```

### Testing API Endpoints
```typescript
const request = createMockRequest('POST', '/api/posts', { body: { title: '...', content: '...' } });
const response = await POST(request);
const data = await parseResponse(response);
expect(response.status).toBe(200);
expect(data.id).toBeDefined();
```

---

## Environment & Configuration

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (validated at startup)
- `NEXTAUTH_SECRET` - Min 32 chars, used for JWT signing
- `NEXTAUTH_URL` - Callback URL (e.g., `http://localhost:3000`)
- `REDIS_URL` (optional) - Redis connection; disables caching if absent
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional) - OAuth

### Configuration Files
- `next.config.ts` - Next.js config (standalone output, image remotes)
- `prisma/schema.prisma` - Data model (PostgreSQL)
- `vitest.config.ts` - Test config (node environment, path aliases)
- `middleware.ts` - Security headers (frame-options, CSP, referrer-policy)

---

## Common Pitfalls & Tips

1. **Always use `withApiHandler()`** - Ensures logging, error handling, request IDs
2. **Validate first** - Check schema before touching database; prevents bad states
3. **Never log sensitive data** - Logger redacts automatically; don't override
4. **Test with real Prisma queries** - Mocking DB hides real issues; integration tests use actual schema
5. **Use cursor pagination** - Offset-based (e.g., `skip: 100`) is slow; cursors are O(1)
6. **Cache invalidation** - Invalidate cache when data changes; TTLs: posts (5min), user profiles (10min)
7. **Handle role checks** - Moderators via `MODERATOR` role; admins via `ADMIN` role in `userRoles` table

---

## Key Files Reference
| File | Purpose |
|------|---------|
| [src/lib/apiHandler.ts](../web/src/lib/apiHandler.ts) | Request wrapping, error handling |
| [src/lib/auth.ts](../web/src/lib/auth.ts) | Authentication, session management |
| [src/lib/rbac.ts](../web/src/lib/rbac.ts) | Role-based access control |
| [src/lib/logger.ts](../web/src/lib/logger.ts) | Structured logging, redaction |
| [src/lib/validators.ts](../web/src/lib/validators.ts) | User/profile schemas |
| [src/lib/validations/community.ts](../web/src/lib/validations/community.ts) | Post, comment, vote schemas |
| [src/lib/redis.ts](../web/src/lib/redis.ts) | Caching, rate limiting |
| [prisma/schema.prisma](../prisma/schema.prisma) | Data model |
| [src/__tests__/setup.ts](../web/src/__tests__/setup.ts) | Test environment setup |
| [src/__tests__/helpers/](../web/src/__tests__/helpers/) | Test utilities |

