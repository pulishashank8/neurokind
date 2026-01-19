# CI/CD Documentation

## Overview

NeuroKind uses GitHub Actions for Continuous Integration (CI) to ensure code quality, security, and functionality before merging changes to the main branch.

## Pipeline Architecture

### Workflow File
- **Location**: `.github/workflows/ci.yml`
- **Trigger Events**:
  - Push to `main` branch
  - Pull requests targeting `main` branch

### Pipeline Checks

The CI pipeline runs the following checks in sequence:

#### 1. **Checkout Code**
- Clones the repository to the runner
- Uses: `actions/checkout@v4`

#### 2. **Setup Node.js**
- Node Version: `22.x`
- Automatically caches npm dependencies based on `package-lock.json`
- Uses: `actions/setup-node@v4`

#### 3. **Install Dependencies**
- Command: `npm ci`
- Working Directory: `./web`
- Uses lockfile for reproducible builds
- Faster and more reliable than `npm install` in CI environments

#### 4. **Security Audit** ⚠️ **BLOCKING**
- Command: `npm audit --audit-level=critical`
- **Fails the build** if critical vulnerabilities are found
- Lower severity issues (high, moderate, low) are reported but don't block the build
- This step runs early to catch security issues before resource-intensive tests

#### 5. **Validate Prisma Schema**
- Command: `npx prisma validate --schema=./prisma/schema.prisma`
- Validates database schema syntax and relationships
- Ensures schema is well-formed and consistent

#### 6. **Generate Prisma Client**
- Command: `npx prisma generate --schema=./prisma/schema.prisma`
- Generates type-safe database client
- Required for TypeScript type checking and tests

#### 7. **Run Linter**
- Command: `npm run lint`
- Runs ESLint to enforce code style and catch common errors
- Configuration: `eslint.config.mjs`

#### 8. **Run Type Checking**
- Command: `npx tsc --noEmit`
- Performs TypeScript compilation without emitting files
- Catches type errors across the entire codebase
- Configuration: `tsconfig.json`

#### 9. **Run Tests**
- Command: `npm test`
- Executes Vitest test suite
- Includes unit and integration tests
- Uses test database (PostgreSQL service container)

#### 10. **Build Application**
- Command: `npm run build`
- Builds Next.js production bundle
- Ensures the application can be built successfully
- Catches build-time errors

### Services

#### PostgreSQL Database
- **Image**: `postgres:15`
- **Port**: `5432`
- **Database**: `neurokind_test`
- **Credentials**: postgres/postgres (test environment only)
- **Health Checks**: Configured to ensure database is ready before tests run

## Environment Variables

The following environment variables are configured for CI:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neurokind_test
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key-for-ci
```

**Note**: These are test-only credentials and are safe to expose in CI configuration.

## Debugging Failed CI Runs

### How to Access CI Logs

1. Navigate to your pull request or commit on GitHub
2. Click on the "Checks" tab
3. Select the "Continuous Integration" workflow
4. Expand the failed step to view detailed logs

### Common Failures and Solutions

#### 🔴 Security Audit Failures

**Error**: `npm audit found critical vulnerabilities`

**Solutions**:
```bash
# Check vulnerabilities locally
cd web
npm audit

# Update vulnerable packages
npm audit fix

# For packages that can't be auto-fixed
npm audit fix --force  # Use with caution

# Check for specific package updates
npm outdated
```

#### 🔴 Linting Failures

**Error**: ESLint errors or warnings

**Solutions**:
```bash
# Run linter locally
cd web
npm run lint

# Auto-fix issues where possible
npm run lint -- --fix
```

#### 🔴 Type Checking Failures

**Error**: TypeScript compilation errors

**Solutions**:
```bash
# Run type checking locally
cd web
npx tsc --noEmit

# Common fixes:
# - Add missing type definitions
# - Fix type mismatches
# - Ensure Prisma client is generated: npm run db:generate
```

#### 🔴 Test Failures

**Error**: Vitest tests failing

**Solutions**:
```bash
# Run tests locally
cd web
npm test

# Run specific test file
npm test -- src/__tests__/integration/posts.test.ts

# Run tests in watch mode for debugging
npm run test:watch

# Check test coverage
npm run test:coverage
```

**Database Issues**:
- Ensure your test database is running locally
- Reset test database: `npm run prisma:migrate:reset`
- Generate Prisma client: `npm run db:generate`

#### 🔴 Prisma Validation Failures

**Error**: Schema validation errors

**Solutions**:
```bash
# Validate schema locally
cd web
npx prisma validate

# Format schema
npx prisma format

# Common issues:
# - Missing relations
# - Invalid field types
# - Syntax errors in schema
```

#### 🔴 Build Failures

**Error**: Next.js build fails

**Solutions**:
```bash
# Build locally to reproduce
cd web
npm run build

# Common causes:
# - TypeScript errors (check with: npx tsc --noEmit)
# - Missing environment variables
# - Invalid imports or exports
# - Next.js configuration issues
```

### Local Testing Before Push

To avoid CI failures, run these commands locally before pushing:

```bash
cd web

# Install dependencies
npm ci

# Security check
npm audit --audit-level=critical

# Prisma validation and generation
npx prisma validate
npx prisma generate

# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Tests
npm test

# Build
npm run build
```

### Viewing Detailed Logs

For more detailed logging in CI:

1. **Re-run jobs with debug logging**:
   - Go to the failed workflow run
   - Click "Re-run jobs" → "Enable debug logging"
   - This enables verbose GitHub Actions logging

2. **Check specific step outputs**:
   - Each step in the workflow can be expanded
   - Look for error messages, stack traces, and exit codes

### Getting Help

If you're stuck debugging a CI failure:

1. **Check the specific error message** in the logs
2. **Search for similar issues** in the GitHub repository issues
3. **Run the same commands locally** to reproduce the issue
4. **Check recent changes** that might have introduced the issue
5. **Verify environment variables** are correctly set
6. **Ensure dependencies** are up to date: `npm outdated`

## Best Practices

### Before Merging

- ✅ Ensure all CI checks pass
- ✅ Review test coverage reports
- ✅ Check for any new security vulnerabilities
- ✅ Verify build artifacts are created successfully

### Maintaining CI Health

- 📦 Keep dependencies updated regularly
- 🔒 Run security audits weekly
- 🧪 Maintain test coverage above 80%
- 📝 Update CI configuration when adding new checks
- ⚡ Monitor CI run times and optimize slow steps

### Caching Strategy

The pipeline uses npm caching to speed up installations:

```yaml
cache: 'npm'
cache-dependency-path: web/package-lock.json
```

This caches `node_modules` based on the lockfile hash. If you encounter caching issues:

1. Update dependencies: `npm ci`
2. Commit the updated `package-lock.json`
3. CI will automatically invalidate the old cache

## Future Enhancements

Potential improvements to consider:

- [ ] Add deployment workflow for staging/production
- [ ] Implement parallel test execution for faster runs
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Configure automated dependency updates (Dependabot)
- [ ] Add code coverage reporting to PRs
- [ ] Implement branch protection rules requiring CI success
- [ ] Add performance benchmarking
- [ ] Configure deployment previews for PRs

## Workflow Metrics

Monitor these metrics for CI health:

- **Run Time**: Target < 10 minutes for full pipeline
- **Success Rate**: Target > 95%
- **Flaky Tests**: Track and fix tests that intermittently fail
- **Cache Hit Rate**: Target > 90% for npm cache

## Contact

For CI/CD questions or issues, contact the DevOps team or create an issue in the repository.
