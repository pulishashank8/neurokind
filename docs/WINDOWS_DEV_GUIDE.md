# Windows Development Guide for NeuroKind

## Quick Start

### Option 1: Clean Start (Recommended)
Kill any processes on port 3000 and start fresh:

```powershell
cd web
npm run dev:clean
```

### Option 2: Normal Start
Just start the dev server:

```powershell
cd web
npm run dev
```

## Diagnostic Steps

### Step 1: Verify Next.js Server is Running

```powershell
# Check if Node.js processes are running
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

### Step 2: Verify Port 3000 is Listening

```powershell
# Check which process is using port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```

Or using netstat:

```powershell
netstat -ano | findstr :3000
```

### Step 3: Kill Process on Port 3000

```powershell
# Find and kill the process
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force
    Write-Host "Killed process on port 3000" -ForegroundColor Green
} else {
    Write-Host "No process found on port 3000" -ForegroundColor Yellow
}
```

Or using taskkill with netstat:

```powershell
# Get PID from netstat
$pid = (netstat -ano | findstr :3000 | findstr LISTENING | ForEach-Object { $_.Trim() -split '\s+' } | Select-Object -Last 1)
if ($pid) {
    taskkill /F /PID $pid
}
```

### Step 4: Start Server from Web Directory

```powershell
# Navigate to web directory
cd C:\Users\User\neurokind\web

# Start dev server
npm run dev
```

## NPM Scripts Reference

### Development

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | Starts Next.js dev server | Normal development mode |
| `npm run dev:clean` | Kills port 3000 then starts dev | Recommended for clean start |

### Health Checks

| Script | Command | Description |
|--------|---------|-------------|
| `npm run test:health` | Full health check with detailed output | Shows status, timestamp, database, redis, etc. |
| `npm run test:health:quick` | Quick status check | Just shows status inline |

### Testing

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | Run all tests | Vitest test suite |
| `npm run test:watch` | Run tests in watch mode | Auto-rerun on changes |
| `npm run test:integration` | Run integration tests only | API endpoint tests |

### Build & Deploy

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | Build production bundle | Optimized Next.js build |
| `npm start` | Start production server | After build |
| `npm run lint` | Run ESLint | Code quality check |

## Health Endpoint Details

### Endpoint
```
GET http://localhost:3000/api/health
GET http://localhost:3000/api/health?detailed=true
```

### Response Structure

```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T05:00:00.000Z",
  "uptime": 45.23,
  "environment": "development",
  "database": "ok",
  "redis": "not_configured",
  "aiFeatures": "enabled",
  "config": {
    "ready": true
  },
  "memory": {
    "heapUsedMB": 145,
    "heapTotalMB": 200,
    "externalMB": 5
  }
}
```

### Status Codes

- `200` - Healthy (all systems operational)
- `503` - Degraded (some systems failing)
- `500` - Unhealthy (critical failure)

## Common Issues & Solutions

### Issue: "Unable to connect to the remote server"

**Cause**: Dev server is not running

**Solution**:
```powershell
cd web
npm run dev:clean
```

### Issue: "Port 3000 is already in use"

**Cause**: Another process is using port 3000

**Solution**:
```powershell
# Kill the process
npm run dev:clean
```

Or manually:
```powershell
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Issue: Database connection errors

**Cause**: DATABASE_URL not configured or database not running

**Solution**:

1. Check `.env.local` file exists in `web/` directory
2. Verify DATABASE_URL is set correctly
3. For Docker PostgreSQL:
```powershell
docker-compose up -d
```

4. For Supabase (as configured):
```env
DATABASE_URL="postgresql://postgres:password@db.yourproject.supabase.co:5432/postgres"
```

**Note**: If password contains special characters like `@`, URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`

### Issue: "NEXTAUTH_SECRET is not set"

**Cause**: Missing environment variable

**Solution**:

Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"
```

Generate a secure secret:
```powershell
# Generate random secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Issue: Server starts but immediately stops

**Cause**: Usually a configuration error or missing environment variables

**Solution**:

1. Check for errors in terminal output
2. Verify `.env.local` exists and is valid
3. Check database connectivity:
```powershell
npm run test:health
```

## Testing Health Endpoint

### PowerShell Command

```powershell
Invoke-RestMethod http://localhost:3000/api/health | ConvertTo-Json
```

### Using npm script

```powershell
# Detailed output with formatted display
npm run test:health

# Quick inline status
npm run test:health:quick
```

### Using curl (if installed)

```powershell
curl http://localhost:3000/api/health
```

### Expected Output

```
Testing NeuroKind Health Endpoint...
URL: http://localhost:3000/api/health

✓ Status:      healthy
✓ Timestamp:   2026-01-19T05:00:00.000Z
✓ Environment: development
✓ Uptime:      45.23 seconds
✓ Database:    ok
✓ Redis:       not_configured

Full Response:
{
  "status": "healthy",
  "timestamp": "2026-01-19T05:00:00.000Z",
  ...
}

✓ Health check PASSED
```

## Database Setup

### Using Docker (Recommended for Development)

```powershell
# Start PostgreSQL and Redis
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### Using Supabase (Current Configuration)

Your `.env.local` should have:
```env
DATABASE_URL="postgresql://postgres:Chowdary%4012345@db.xwkcdygpvvbbyabfgumx.supabase.co:5432/postgres"
```

Run migrations:
```powershell
cd web
npm run prisma:migrate:deploy
```

### Prisma Commands

```powershell
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (GUI)
npm run db:studio

# Run migrations
npm run prisma:migrate:deploy

# Reset database (⚠️ deletes all data)
npm run prisma:migrate:reset
```

## Environment Variables Checklist

Create `web/.env.local` with these required variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="minimum-32-character-secret-key"

# OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Features (Optional)
GROQ_API_KEY="your-groq-api-key"

# Google Places (Optional)
GOOGLE_PLACES_API_KEY="your-google-places-api-key"

# Redis (Optional - for rate limiting)
REDIS_URL="redis://localhost:6379"
```

## Development Workflow

1. **Start development server**:
```powershell
cd web
npm run dev:clean
```

2. **Verify server is running**:
```powershell
npm run test:health
```

3. **Make changes** to code files

4. **Server auto-reloads** - Next.js hot reload enabled

5. **Run tests** before committing:
```powershell
npm test
npm run lint
```

6. **Build production bundle**:
```powershell
npm run build
```

## Port Reference

| Port | Service | Used For |
|------|---------|----------|
| 3000 | Next.js Dev Server | Web application |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Caching & rate limiting |

## Troubleshooting Commands

```powershell
# Check all listening ports
netstat -ano | findstr LISTENING

# Check Node.js processes
Get-Process node

# Check all processes on port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill all Node.js processes (⚠️ use with caution)
Get-Process node | Stop-Process -Force

# Clear npm cache (if modules are corrupt)
npm cache clean --force
cd web
Remove-Item node_modules -Recurse -Force
npm install

# Check Node and npm versions
node --version
npm --version

# View recent logs in terminal
# (scroll up in terminal where npm run dev is running)
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Windows PowerShell Documentation](https://docs.microsoft.com/powershell)

## Support

If you encounter issues not covered here:

1. Check the terminal output for error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Try `npm run dev:clean` for a fresh start
5. Check Docker containers if using Docker: `docker-compose ps`
