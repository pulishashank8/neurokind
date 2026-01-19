# Logging in NeuroKind

Professional runtime logging system for debugging and monitoring API requests.

## Overview

NeuroKind uses structured logging with **Pino** for high-performance, production-ready logs. Logs include request correlation IDs, performance metrics, and automatic error tracking.

## Log Format

### Development Mode
Pretty-printed, colorized logs for easy reading:
```
14:32:15.123 INFO - API GET /api/posts started
  requestId: "req_1737208335123_abc123def"
  method: "GET"
  pathname: "/api/posts"
  query: { limit: 10, sort: "new" }

14:32:15.456 INFO - API GET /api/posts completed
  requestId: "req_1737208335123_abc123def"
  statusCode: 200
  durationMs: 333
```

### Production Mode
JSON-formatted logs for log aggregation systems:
```json
{
  "level": "info",
  "time": 1737208335123,
  "requestId": "req_1737208335123_abc123def",
  "method": "GET",
  "pathname": "/api/posts",
  "statusCode": 200,
  "durationMs": 333,
  "msg": "API GET /api/posts completed"
}
```

## Request Correlation IDs

Every API request gets a unique `requestId` that flows through:
- All logs for that request
- Response header: `x-request-id`
- Error responses

**How to trace a request:**
1. Client receives error response with `x-request-id`
2. Search logs for that `requestId`
3. See complete request lifecycle: validation → processing → error/success

Example:
```bash
# Client sees error
curl -i http://localhost:3000/api/posts/invalid-id
# HTTP/1.1 404 Not Found
# x-request-id: req_1737208335123_abc123def

# Search server logs
grep "req_1737208335123_abc123def" logs.txt
```

## Performance Tracking

All API routes automatically log:
- **durationMs**: Total request processing time
- **statusCode**: HTTP response code
- **method**: HTTP method (GET, POST, etc.)
- **pathname**: API route path

Use this to identify slow endpoints:
```bash
# Find slow requests (> 1 second)
grep "durationMs" logs.txt | awk '$NF > 1000'
```

## Log Levels

| Level | Usage | Production |
|-------|-------|------------|
| `debug` | Detailed flow (query params, intermediate steps) | Disabled |
| `info` | Request start/completion, successful operations | Enabled |
| `warn` | Validation failures, rate limits, auth issues | Enabled |
| `error` | Exceptions, database errors, API failures | Enabled |

**Set log level via environment:**
```bash
LOG_LEVEL=debug npm run dev  # Show all logs
LOG_LEVEL=info npm run dev   # Default: info and above
```

## Security: Sensitive Data Filtering

The logger automatically **redacts** sensitive fields:
- `password`
- `token`, `accessToken`, `refreshToken`
- `secret`, `apiKey`, `api_key`
- `authorization`, `cookie`, `session`
- `privateKey`, `private_key`

Example:
```javascript
logger.info({ 
  email: 'user@example.com',
  password: 'secret123'  // Automatically redacted
});
// Output: { email: 'user@example.com', password: '[REDACTED]' }
```

## Debugging Common Failures

### 1. Authentication Errors
**Log pattern:**
```
WARN - Unauthorized access attempt
  requestId: "req_xyz"
  pathname: "/api/posts"
```

**Fix:** Check session/token validity, ensure user is logged in.

---

### 2. Validation Errors
**Log pattern:**
```
WARN - Invalid post data
  requestId: "req_xyz"
  validationErrors: [{ path: "title", message: "Required" }]
```

**Fix:** Check client payload against schema requirements.

---

### 3. Rate Limit Exceeded
**Log pattern:**
```
WARN - Rate limit exceeded for post creation
  requestId: "req_xyz"
  userId: "user123"
```

**Fix:** Client should wait and retry after `Retry-After` header value.

---

### 4. Database Errors
**Log pattern:**
```
ERROR - API Error: Database operation failed
  errorType: "DatabaseError"
  code: "P2025"
  statusCode: 404
```

**Fix:** Check database connectivity, verify record exists.

---

### 5. External API Failures (AI Chat)
**Log pattern:**
```
ERROR - Groq API error
  statusCode: 500
  error: "Service unavailable"
```

**Fix:** Verify `GROQ_API_KEY` in `.env.local`, check API quota/status.

## Using the Logger in Code

### Basic logging:
```typescript
import { logger } from '@/lib/logger';

logger.info('User registered successfully');
logger.warn({ userId: '123' }, 'Suspicious activity detected');
logger.error({ error }, 'Failed to process payment');
```

### Request-scoped logging:
```typescript
import { createLogger } from '@/lib/logger';

const requestLogger = createLogger({ requestId, userId });
requestLogger.info('Processing order');
```

### API routes (automatic):
API routes wrapped with `withApiHandler` get logging automatically:
```typescript
import { withApiHandler } from '@/lib/apiHandler';

export const GET = withApiHandler(async (request) => {
  // Logging happens automatically
  const data = await fetchData();
  return NextResponse.json(data);
}, { method: 'GET', routeName: '/api/myroute' });
```

## Viewing Logs

**Development:**
```bash
npm run dev
# Logs appear in terminal with colors
```

**Production:**
```bash
npm start 2>&1 | tee logs.txt
# JSON logs saved to logs.txt for analysis
```

## Best Practices

1. **Always include context:** Add relevant data (userId, postId, etc.)
2. **Use appropriate levels:** Don't log everything as `error`
3. **Never log secrets:** Password, tokens, keys (auto-filtered anyway)
4. **Include requestId:** For tracing across services
5. **Log performance:** Track slow operations with `durationMs`

## Troubleshooting

### No logs appearing
- Check `LOG_LEVEL` environment variable
- Ensure logger is imported: `import { logger } from '@/lib/logger'`

### Logs too verbose
```bash
LOG_LEVEL=warn npm run dev  # Only warnings and errors
```

### Need to debug specific request
1. Get `x-request-id` from response headers
2. Search logs: `grep "req_xyz" logs.txt`
3. See full request lifecycle

---

**Questions?** Check the logger implementation at [src/lib/logger.ts](../web/src/lib/logger.ts).
