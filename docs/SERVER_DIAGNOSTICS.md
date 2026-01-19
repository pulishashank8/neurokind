# NeuroKind Server Diagnostics & Manual Start Guide

## Problem: Server shows "Ready" but nothing responds on port 3000

This happens when Next.js starts but immediately crashes due to a configuration or runtime error.

## Manual Diagnostic Procedure

### Step 1: Verify Node.js is Running

Open PowerShell and run:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

**Expected**: Should show running Node.js processes if server is actually running.
**If empty**: Server crashed after startup.

### Step 2: Check Port 3000

```powershell
netstat -ano | findstr :3000
```

**Expected**: Should show LISTENING on port 3000.
**If empty**: Nothing is bound to port 3000.

### Step 3: Kill Any Stale Processes

```powershell
# Option 1: Kill specific port
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Option 2: Kill all Node processes (use with caution)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 4: Start Server Manually with Verbose Output

```powershell
cd C:\Users\User\neurokind\web
npm run dev
```

**Watch for**:
- Database connection errors
- Missing environment variables
- Module loading errors
- Port binding errors

## Common Root Causes

### 1. Database Connection Error

**Symptom**: Server starts then crashes immediately.

**Check** `.env.local`:
```env
DATABASE_URL="postgresql://postgres:Chowdary%4012345@db.xwkcdygpvvbbyabfgumx.supabase.co:5432/postgres"
```

**Fix**:
- Ensure password special characters are URL-encoded (`@` → `%40`)
- Test database connectivity:
```powershell
# Using Prisma
npm run db:generate
npx prisma db push
```

### 2. Missing NEXTAUTH_SECRET

**Symptom**: Authentication error on startup.

**Fix** - Add to `.env.local`:
```env
NEXTAUTH_SECRET="minimum-32-characters-long-secret-key-12345"
```

### 3. Redis Connection Error (Non-Critical)

**Symptom**: Warning about Redis, but shouldn't crash server.

**Fix** - If Redis is optional, ensure code handles unavailability gracefully.

### 4. Module or Dependency Error

**Symptom**: Import errors, module not found.

**Fix**:
```powershell
cd web
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

## Alternative: Start with Docker

If local development issues persist, use Docker:

```powershell
# From project root
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

## Scripts Added

### `npm run dev:clean` 
- **File**: `web/dev-clean.bat`
- **What it does**: 
  1. Finds and kills any process using port 3000
  2. Starts `npm run dev`

### `npm run test:health`
- **File**: `web/scripts/test-health.ps1`
- **What it does**: 
  1. Calls `http://localhost:3000/api/health`
  2. Displays formatted status, timestamp, environment
  3. Shows full JSON response

### `npm run test:health:quick`
- **What it does**: Inline status check (one-liner)

## Health Endpoint Expected Response

```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T05:15:00.000Z",
  "uptime": 12.45,
  "environment": "development",
  "database": "ok",
  "redis": "not_configured",
  "aiFeatures": "enabled",
  "config": { "ready": true },
  "memory": {
    "heapUsedMB": 89,
    "heapTotalMB": 150,
    "externalMB": 3
  }
}
```

## Manual Test Commands

### Test Health Endpoint
```powershell
Invoke-RestMethod http://localhost:3000/api/health | ConvertTo-Json
```

### Test with Browser
Open: `http://localhost:3000/api/health`

### Test with curl (if installed)
```powershell
curl http://localhost:3000/api/health
```

## Recommended Development Workflow

1. **Open TWO PowerShell windows**:

**Window 1 - Server**:
```powershell
cd C:\Users\User\neurokind\web
npm run dev
```
Leave this running and watch for errors.

**Window 2 - Testing**:
```powershell
cd C:\Users\User\neurokind\web
npm run test:health
```

2. **If you see errors in Window 1**, address them before testing.

3. **If server crashes immediately**, check:
   - Database URL in `.env.local`
   - All required environment variables present
   - No syntax errors in schema or config files

## Environment File Template

Create `web/.env.local` with:

```env
# Database - REQUIRED
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/DATABASE"

# NextAuth - REQUIRED
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secure-32-char-minimum-secret"

# OAuth - OPTIONAL (for Google login)
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# AI Features - OPTIONAL
GROQ_API_KEY="your-groq-api-key"

# Google Places - OPTIONAL
GOOGLE_PLACES_API_KEY="your-key"

# Redis - OPTIONAL
REDIS_URL="redis://localhost:6379"

# Node Environment
NODE_ENV="development"
```

## Next Steps

1. Fix the underlying issue causing the server to crash
2. Verify `.env.local` is correctly configured
3. Test database connectivity
4. Restart server with `npm run dev` and watch for errors
5. Once running successfully, test with `npm run test:health`

## Files Created/Modified

1. ✅ `web/package.json` - Added `dev:clean`, `test:health`, `test:health:quick` scripts
2. ✅ `web/dev-clean.bat` - Windows batch file to kill port 3000 and start dev
3. ✅ `web/scripts/test-health.ps1` - PowerShell script to test health endpoint
4. ✅ `web/scripts/dev-clean.ps1` - PowerShell script for clean dev start
5. ✅ `docs/WINDOWS_DEV_GUIDE.md` - Comprehensive Windows development guide
6. ✅ `docs/CI_CD.md` - CI/CD pipeline documentation
7. ✅ `.github/workflows/ci.yml` - GitHub Actions CI pipeline

## Getting Help

If you're still stuck:

1. Share the FULL terminal output from `npm run dev`
2. Share your `.env.local` (redact passwords!)
3. Check if database is accessible:
   ```powershell
   npm run prisma:migrate:status
   ```
4. Verify Node version:
   ```powershell
   node --version  # Should be v22.x
   ```
