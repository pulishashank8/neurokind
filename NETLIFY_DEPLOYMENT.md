# Deploying NeuroKind to Netlify (Free Tier)

## ⚠️ Important Limitations

**Netlify's free tier has limitations for your app:**

1. **Database**: Netlify doesn't provide PostgreSQL. You need an external database (see options below)
2. **Redis**: Not included, rate limiting won't work without external Redis
3. **Build minutes**: 300 minutes/month on free tier
4. **Bandwidth**: 100GB/month
5. **Serverless functions**: 125k requests/month

## 🗄️ Database Options (Required)

Your app needs PostgreSQL. Free options:

### Option 1: Supabase (Recommended) ✅
- **Free tier**: 500MB database, unlimited API requests
- **Setup**: https://supabase.com
1. Create account
2. Create new project
3. Copy connection string from Settings → Database
4. Use as `DATABASE_URL` in Netlify

### Option 2: Neon
- **Free tier**: 0.5GB storage, always-on
- **Setup**: https://neon.tech
1. Create account
2. Create project
3. Copy connection string
4. Use as `DATABASE_URL`

### Option 3: Railway (Limited Free)
- **Free tier**: $5 credit/month
- **Setup**: https://railway.app
1. Create account
2. New PostgreSQL database
3. Copy connection string

## 🚀 Deployment Steps

### 1. Prepare Your Repository

```bash
# Make sure you're on main branch
git checkout main

# Commit all changes
git add .
git commit -m "Prepare for Netlify deployment"

# Push to GitHub
git push origin main
```

### 2. Set Up Database

1. Choose a database provider (Supabase recommended)
2. Create a new PostgreSQL database
3. Copy the connection string (looks like: `postgresql://user:pass@host:5432/db`)
4. Save it - you'll need it for Netlify environment variables

### 3. Deploy to Netlify

#### Via Netlify Dashboard (Easiest):

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your **neurokind** repository
5. Configure build settings:
   - **Base directory**: Leave empty or `/`
   - **Build command**: `cd web && npm install && npx prisma generate && npm run build`
   - **Publish directory**: `web/.next`
   - Click **"Show advanced"** → **"Add environment variable"**
6. Add environment variables (see below)
7. Click **"Deploy site"**

#### Via Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project root)
netlify deploy --prod
```

### 4. Configure Environment Variables in Netlify

Go to **Site settings** → **Environment variables** and add:

**Required:**
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-here
```

**Optional (if using):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIS_URL=redis://your-redis-host:6379
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this locally:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Via Netlify CLI**
```bash
# Set environment variable locally first
export DATABASE_URL="your-production-database-url"

# Run migration
cd web
npx prisma migrate deploy
```

**Option B: Via Build Command**

Update `netlify.toml`:
```toml
[build]
  command = "cd web && npm install && npx prisma generate && npx prisma migrate deploy && npm run build"
```

⚠️ **Note**: This runs migrations on every build. Be careful!

### 6. Seed Initial Data (One-time)

```bash
# Set DATABASE_URL to production
export DATABASE_URL="your-production-database-url"

# Run seed
cd web
npm run db:seed
```

## 🔧 Troubleshooting

### Build Fails

**Error**: `Cannot find module '@prisma/client'`
- **Fix**: Ensure `npx prisma generate` runs before build

**Error**: `Database connection failed`
- **Fix**: Check `DATABASE_URL` is correct in environment variables

### App Loads but Features Don't Work

**Database not accessible:**
- Verify `DATABASE_URL` in Netlify env vars
- Check database allows connections from Netlify IPs

**Auth doesn't work:**
- Set `NEXTAUTH_URL` to your Netlify URL
- Update Google OAuth redirect URIs if using Google auth

**Rate limiting errors:**
- Expected without Redis. Either:
  - Add Redis (Upstash has free tier)
  - Disable rate limiting temporarily

## 💰 Cost Optimization (Free Tier)

To stay within free tier:

1. **Optimize builds**: Use build cache
2. **CDN caching**: Netlify caches static assets automatically
3. **Database**: Use Supabase free tier (500MB limit)
4. **Redis**: Optional - use Upstash free tier (10k commands/day)

## 🔄 Alternative: Vercel (Recommended for Next.js)

**Vercel is better suited for Next.js apps:**

1. Free tier: 100GB bandwidth, unlimited deployments
2. Built for Next.js (made by same team)
3. Better serverless function support
4. Easier setup

**Quick Vercel Deploy:**
```bash
npm install -g vercel
vercel
```

## 📋 Deployment Checklist

- [ ] Database created (Supabase/Neon/Railway)
- [ ] DATABASE_URL obtained
- [ ] Repository pushed to GitHub
- [ ] Netlify site created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Admin user created
- [ ] Test login works
- [ ] Test community features
- [ ] Test admin console

## 🆘 Need Help?

**Common issues:**
- Builds timing out → Reduce dependencies or upgrade Netlify plan
- Database connection issues → Check firewall/IP allowlist
- 404 errors → Check redirects in `netlify.toml`

**Resources:**
- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/
- Supabase Docs: https://supabase.com/docs

## 🎯 Quick Start Commands

```bash
# 1. Setup database (Supabase)
# Visit https://supabase.com and create project

# 2. Deploy to Netlify
cd C:\Users\User\neurokind
git push origin main
# Then use Netlify dashboard to import

# 3. After deployment, run migrations
export DATABASE_URL="your-production-url"
cd web
npx prisma migrate deploy
npm run db:seed
```

---

**Ready to deploy?** Start with setting up your database on Supabase, then follow the Netlify deployment steps above.
