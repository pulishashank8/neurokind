# NeuroKind Testing Guide

This guide explains how to set up and run integration tests for NeuroKind's community backend APIs on Windows.

## Table of Contents

- [Overview](#overview)
- [Test Framework](#test-framework)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)

## Overview

NeuroKind uses **Vitest** as its testing framework for integration tests. The test suite validates the community backend APIs, including:

- **Posts API**: Create, read, update, delete posts
- **Comments API**: Create comments and replies
- **Votes API**: Upvote, downvote, and remove votes

All tests use a **separate test database** to ensure isolation from development and production data.

## Test Framework

- **Framework**: Vitest (TypeScript-first test framework)
- **Test Type**: Integration tests (testing API routes end-to-end)
- **Database**: Separate PostgreSQL database for tests
- **Authentication**: Mock NextAuth sessions for authenticated requests

## Prerequisites

Before running tests, ensure you have:

1. **Node.js** (v20 or higher)
2. **PostgreSQL** (running locally or accessible remotely)
3. **Git** (for version control)
4. **PowerShell** (pre-installed on Windows)

## Setup Instructions

### Step 1: Install Dependencies

Navigate to the `web` directory and install test dependencies:

```powershell
cd C:\Users\User\neurokind\web
npm install
```

The following testing packages are included:
- `vitest` - Test framework
- `@vitest/ui` - Visual test UI
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `node-mocks-http` - Mock HTTP request/response objects
- `dotenv-cli` - Load environment variables for tests
- `msw` - Mock Service Worker (for API mocking)

### Step 2: Create Test Database

Create a separate PostgreSQL database for testing:

```powershell
# Connect to PostgreSQL using psql
psql -U postgres

# Create test database
CREATE DATABASE neurokind_test;

# Exit psql
\q
```

### Step 3: Configure Environment Variables

The `.env.test` file is already created in the `web` directory with the following configuration:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-for-integration-tests-only"
REDIS_URL="redis://localhost:6379/1"
DISABLE_RATE_LIMIT="true"
NODE_ENV="test"
```

**Important**: Update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/neurokind_test"
```

### Step 4: Run Database Migrations

Apply Prisma migrations to the test database:

```powershell
# Set environment variable for test database
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"

# Run migrations
npx prisma migrate deploy

# (Optional) Seed test database with sample data
npx prisma db seed
```

### Step 5: Verify Setup

Check that the test database is ready:

```powershell
# View database schema
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"
npx prisma studio
```

## Running Tests

### Run All Tests

Execute all integration tests:

```powershell
npm run test
```

### Run Tests in Watch Mode

Automatically re-run tests when files change:

```powershell
npm run test:watch
```

### Run Only Integration Tests

Run only the integration test suite:

```powershell
npm run test:integration
```

### Run Tests with UI

Launch Vitest's visual UI for interactive testing:

```powershell
npm run test:ui
```

### Run Tests with Coverage

Generate code coverage reports:

```powershell
npm run test:coverage
```

Coverage reports will be generated in `web/coverage/`.

## Test Structure

```
web/
├── src/
│   └── __tests__/
│       ├── setup.ts                    # Global test setup
│       ├── helpers/
│       │   ├── auth.ts                 # Auth helpers (create users, sessions)
│       │   ├── api.ts                  # API request helpers
│       │   └── database.ts             # Database cleanup utilities
│       └── integration/
│           ├── posts.test.ts           # Posts API tests
│           ├── comments.test.ts        # Comments API tests
│           └── votes.test.ts           # Votes API tests
├── vitest.config.ts                    # Vitest configuration
└── .env.test                           # Test environment variables
```

### Test Helpers

#### `auth.ts` - Authentication Helpers

- `createTestUser()` - Create a test user with credentials
- `createModeratorUser()` - Create a moderator test user
- `createMockSession()` - Generate mock NextAuth session
- `createTestCategory()` - Create test category
- `createTestTag()` - Create test tag
- `createTestPost()` - Create test post
- `createTestComment()` - Create test comment

#### `api.ts` - API Helpers

- `createMockRequest()` - Create mock NextRequest
- `mockGetServerSession()` - Mock NextAuth session
- `parseResponse()` - Parse NextResponse to JSON

#### `database.ts` - Database Helpers

- `cleanupDatabase()` - Truncate all tables (runs before each test)
- `disconnectDatabase()` - Disconnect Prisma client
- `getTestPrisma()` - Get Prisma client for tests

## Writing New Tests

### Example: Testing a New Endpoint

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/your-endpoint/route';
import {
  createTestUser,
  createMockSession,
} from '../helpers/auth';
import { createMockRequest, parseResponse } from '../helpers/api';

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

import { getServerSession } from 'next-auth';

describe('Your Endpoint Integration Tests', () => {
  let testUser: any;
  let mockSession: any;

  beforeEach(async () => {
    testUser = await createTestUser('test@example.com', 'password', 'testuser');
    mockSession = createMockSession(testUser);
  });

  describe('POST /api/your-endpoint', () => {
    it('should create a resource successfully', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = createMockRequest('POST', '/api/your-endpoint', {
        body: {
          name: 'Test Resource',
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.name).toBe('Test Resource');
    });

    it('should fail when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = createMockRequest('POST', '/api/your-endpoint', {
        body: { name: 'Test' },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });
});
```

### Best Practices

1. **Database Isolation**: Each test should be independent. The database is cleaned before each test automatically.

2. **Mock Authentication**: Use `vi.mocked(getServerSession)` to mock authenticated users.

3. **Descriptive Test Names**: Use clear, descriptive names for test cases.

4. **Test Edge Cases**: Test both success and failure scenarios.

5. **Verify Database State**: After mutations, verify changes in the database using Prisma.

6. **Clean Up**: Test helpers automatically clean the database, but ensure no side effects.

## Troubleshooting

### Error: "DATABASE_URL must point to a test database"

**Solution**: Ensure your `.env.test` file contains a database URL with "test" in the name:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"
```

### Error: "Failed to run migrations"

**Solution**: Manually run migrations with the test database URL:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"
npx prisma migrate deploy
```

### Error: "Connection refused" or "ECONNREFUSED"

**Solution**: Ensure PostgreSQL is running:

```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start PostgreSQL if not running
Start-Service -Name postgresql-x64-14
```

### Tests Timing Out

**Solution**: Increase test timeout in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    testTimeout: 20000, // Increase to 20 seconds
    hookTimeout: 20000,
  },
});
```

### Tests Failing Due to Rate Limiting

**Solution**: Ensure `DISABLE_RATE_LIMIT="true"` in `.env.test`.

### Stale Test Data

**Solution**: Manually clean the test database:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurokind_test"
npx prisma migrate reset --force
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: neurokind_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./web
        run: npm ci

      - name: Run migrations
        working-directory: ./web
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/neurokind_test
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: ./web
        run: npm run test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./web/coverage/coverage-final.json
```

## Test Coverage Goals

- **Posts API**: ✅ Complete
  - Create post
  - List posts with pagination
  - Get post details
  - Update post (author only)
  - Soft delete post

- **Comments API**: ✅ Complete
  - Create comment
  - Create reply to comment
  - Get threaded comments
  - Anonymous comments

- **Votes API**: ✅ Complete
  - Upvote post/comment
  - Downvote post/comment
  - Change vote
  - Remove vote

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [NextAuth Testing](https://next-auth.js.org/tutorials/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review test logs in the console
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: January 18, 2026  
**Version**: 1.0.0  
**Maintainer**: NeuroKind Development Team
