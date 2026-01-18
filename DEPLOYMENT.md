# NeuroKind Deployment Guide

Production deployment for NeuroKind using Vercel + Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Supabase Setup](#supabase-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account: https://vercel.com
- Supabase account: https://supabase.com
- Node.js 18+ locally
- `openssl` CLI tool

---

## Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/neurokind.git
cd neurokind/web
npm install
```

### 2. Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DATABASE_URL="postgresql://neurokind:neurokind@localhost:5432/neurokind"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"  # optional
```

Generate NEXTAUTH_SECRET:

```bash
openssl rand -hex 32
# Copy the output to NEXTAUTH_SECRET in .env.local
```

### 3. Start Docker (Local Development)

```bash
cd ..  # back to project root
docker-compose up -d

# Wait 10 seconds for postgres to start
sleep 10

# Verify containers running
docker ps
```

### 4. Run Migrations & Seed

```bash
cd web

# Apply all Prisma migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start Dev Server

```bash
npm run dev
# Open: http://localhost:3000
```

### 6. Test Locally

- Sign up at http://localhost:3000/register
- Login at http://localhost:3000/login
- Create a post in /community
- Verify theme toggle works
- Check rate limiting

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Choose organization and region
4. Set password (you'll need it)
5. Wait for project to initialize (~2 min)

### 2. Get Database Connection String

1. In Supabase dashboard, go to "Settings" > "Database"
2. Copy "Connection pooling" string (IMPORTANT: use pooling, not direct)
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
4. Save this for Vercel

### 3. Apply Migrations

```bash
# Set DATABASE_URL to Supabase connection string
export DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@YOUR-HOST.supabase.co:5432/postgres"

# Apply migrations
cd web
npx prisma migrate deploy

# Verify (optional, opens Prisma Studio)
npm run db:studio
```

### 4. Get Supabase API Keys (Optional)

In Supabase dashboard > Settings > API:

- **anon** (public key) - for frontend
- **service_role** (secret key) - for backend

Save these if you add other Supabase features later.

---

## Vercel Deployment

### 1. Connect GitHub Repo

1. Go to https://vercel.com/dashboard
2. Click "Add New..." > "Project"
3. Select GitHub and authorize Vercel
4. Choose `neurokind` repository
5. Click "Import"

### 2. Configure Environment Variables

In Vercel project settings > Environment Variables, add:

| Key                     | Value                      | Example                                                    |
| ----------------------- | -------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`          | Supabase connection string | `postgresql://postgres:xxx@xxx.supabase.co:5432/postgres`  |
| `NEXTAUTH_SECRET`       | Generated 32-char secret   | `a1b2c3d4...` (from `openssl rand -hex 32`)                |
| `NEXTAUTH_URL`          | Your production domain     | `https://neurokind.vercel.app` or `https://yourdomain.com` |
| `REDIS_URL`             | Optional Upstash Redis     | `redis://default:token@host:port`                          |
| `OPENAI_API_KEY`        | Optional OpenAI key        | `sk-...`                                                   |
| `GOOGLE_PLACES_API_KEY` | Optional Google key        | `AIzaSy...`                                                |
| `NEXT_PUBLIC_APP_URL`   | Production domain          | `https://neurokind.vercel.app`                             |

**Important**: Use Environment Variables for Production (`production` toggle on each var)

### 3. Configure Build Settings

Vercel should auto-detect:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

If not auto-detected, set manually:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. Deploy

Click "Deploy" - Vercel will:

1. Install dependencies
2. Run `npm run build`
3. Generate Prisma Client during build
4. Deploy to edge network

Deployment usually takes 2-5 minutes.

### 5. Verify Deployment

After deployment completes:

1. Click "Visit" to open your site
2. Try to sign up / login
3. Create a test post
4. Check theme toggle
5. Verify database connection (no 500 errors)

---

## Post-Deployment

### 1. Set Up Production Domain

If using custom domain:

1. In Vercel project settings > Domains
2. Add your domain (e.g., `neurokind.app`)
3. Follow DNS instructions
4. Update `NEXTAUTH_URL` to match

### 2. Enable Automatic Deployments

1. In Vercel project settings > Git
2. Ensure "Vercel comments" enabled for PRs
3. Set "Production Branch" to `main` or your production branch

### 3. Set Up Health Checks (Optional)

Create a simple health endpoint for monitoring:

```bash
# Test endpoint
curl https://yourapp.vercel.app/api/health
```

### 4. Backups (Optional)

For production database backups:

- **Supabase**: Automatic daily backups (free plan)
- **Manual backup**: `pg_dump` to local file
- **Restore**: `psql` to reload dump

---

## Scaling Guide

### When to Add Redis (Caching/Rate Limiting)

Free tier (in-memory) works for:

- < 100 concurrent users
- Testing/development
- Low-traffic MVP

Add Redis (Upstash) when:

- Rate limiting needs persistence across restarts
- Caching improves load times significantly
- > 100 concurrent users

Upstash pricing: Free tier 10,000 commands/day

### When to Upgrade Database

Supabase free tier includes:

- 500MB storage
- Unlimited API requests
- Up to 2 concurrent connections

Upgrade when:

- Storage > 500MB
- Need more concurrent connections
- Want priority support

---

## Monitoring & Troubleshooting

### Common Issues

#### 1. "Can't reach database server"

**Cause**: Database URL incorrect or database down

**Fix**:

```bash
# Test connection locally first
DATABASE_URL="your-url" npx prisma db execute

# If that fails, check:
# - Supabase: Dashboard > Logs for connection issues
# - Firewall: Verify IP allowlist (Supabase)
```

#### 2. "NextAuth session error"

**Cause**: NEXTAUTH_SECRET not set or incorrect

**Fix**:

```bash
# Generate new secret
openssl rand -hex 32

# Update in Vercel dashboard
# Redeploy: git push (or click "Redeploy" in Vercel)
```

#### 3. "Build failed: Prisma"

**Cause**: Prisma migration or schema issue

**Fix**:

```bash
# Check migrations status
npx prisma migrate status

# If stuck, reset (⚠️ deletes data):
# npx prisma migrate reset

# OR apply specific migration
# npx prisma migrate deploy
```

#### 4. "Rate limiting not working"

**Cause**: Redis URL not set (falls back to in-memory, which resets on deploy)

**Fix**:

1. Set REDIS_URL to Upstash Redis
2. Redeploy

Or accept in-memory behavior (rate limits reset on new deployments).

#### 5. "500 errors in production"

**Fix**:

1. Check Vercel logs: Dashboard > Deployments > Logs
2. Check database logs: Supabase > Logs
3. Verify environment variables are set
4. Check database has correct schema: `npx prisma db push`

### View Logs

**Vercel Logs**:

```bash
vercel logs    # View deployment logs
vercel logs --tail  # Stream live logs
```

**Supabase Logs**:
Dashboard > Logs > Database or Edge Functions

---

## Rollback / Downtime

### Instant Rollback (Vercel)

If deployment breaks:

1. Go to Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"

Reverting takes ~30 seconds.

### Database Rollback (Supabase)

If migration breaks:

1. Supabase Dashboard > Backups
2. Click "Restore" on previous backup
3. Confirm restore time

⚠️ Restoring resets database to that point in time.

---

## Performance Optimization

### 1. Enable CDN Caching

Vercel automatically caches:

- Static files (images, CSS, JS)
- API responses (with cache headers)

NeuroKind already optimized:

- Images lazy-loaded
- Pagination (not infinite scroll)
- Prisma indexed queries
- Redis caching for feeds

### 2. Monitor Performance

Use Vercel Analytics:

- Dashboard > Analytics
- See real-world load times

### 3. Database Query Optimization

If slow queries:

```bash
# Analyze query performance
npx prisma db execute --stdin < query.sql

# Or check Supabase query logs:
# Dashboard > Logs > Database
```

---

## Security Checklist

- ✅ Database password changed (not default)
- ✅ NEXTAUTH_SECRET unique (not committed)
- ✅ NEXTAUTH_URL matches production domain
- ✅ Environment variables set to Production (not Preview)
- ✅ API keys rotated periodically
- ✅ CORS configured (if needed)
- ✅ Rate limiting enabled
- ✅ SSL/TLS enabled (automatic on Vercel)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Updated**: January 2026  
**NeuroKind Version**: 1.0.0
