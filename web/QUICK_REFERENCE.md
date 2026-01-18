# NeuroKind - Quick Reference Card

## 🚀 5-Minute Quick Start

### Local Development (Docker)

```bash
# Start services
docker compose up -d

# Setup database
cd web
npm install
npx prisma migrate dev
npm run db:seed

# Run app
npm run dev
# → http://localhost:3000
```

### Local Development (Supabase)

```bash
cd web
cp .env.example .env
# Edit .env with Supabase DATABASE_URL
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

---

## 📦 Required Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="min-32-chars-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate secret:**

```bash
openssl rand -base64 32
```

---

## 🌐 Deploy to Vercel in 5 Steps

1. **Push to GitHub**

   ```bash
   git init && git add . && git commit -m "Production ready"
   git remote add origin https://github.com/YOU/neurokind.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - vercel.com → New Project
   - Import your repo
   - **Root Directory:** `web` ⚠️

3. **Set Environment Variables**
   - Settings → Environment Variables
   - Add: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

4. **Redeploy**
   - Deployments → Redeploy

5. **Run Migrations**
   ```bash
   vercel env pull .env.production.local
   cd web && npx prisma migrate deploy
   ```

---

## ✅ Feature Checklist

### Community Module

- ✅ Reddit-like feed with vote bar
- ✅ Post detail with "Join the conversation"
- ✅ Create post (title, category, tags, anonymous)
- ✅ Threaded comments with replies
- ✅ Upvote/downvote on posts & comments
- ✅ Bookmark posts
- ✅ Report content
- ✅ NO Share button
- ✅ Mobile responsive

### Authentication

- ✅ Register with rate limiting (3/hour per IP)
- ✅ Login with rate limiting (10/min per IP)
- ✅ Session persistence
- ✅ Logout
- ✅ Protected routes

### Theme

- ✅ Light/Dark toggle (visible after login)
- ✅ Persists in localStorage
- ✅ Soft colors (navy, not black)

### Security

- ✅ Rate limiting (Redis or in-memory)
- ✅ RBAC on edit/delete
- ✅ XSS protection (DOMPurify)
- ✅ Security headers (middleware)
- ✅ Anonymous identity protection
- ✅ Input validation (Zod)

### Production Ready

- ✅ Build passes (0 errors)
- ✅ Only 3 low vulnerabilities
- ✅ Graceful fallbacks (DB, Redis, APIs)
- ✅ Vercel compatible
- ✅ Supabase compatible

---

## 🧪 Quick Test Commands

```bash
# Build
npm run build

# Vulnerability scan
npm audit --omit=dev

# Start production mode
npm run start

# Database operations
npx prisma studio          # GUI
npx prisma migrate dev     # Create migration
npx prisma migrate deploy  # Apply migrations
npm run db:seed            # Seed data
```

---

## 🔗 Important URLs

### Local

- App: http://localhost:3000
- Health: http://localhost:3000/api/health
- Prisma Studio: http://localhost:5555 (after `npx prisma studio`)

### Production

- App: `https://your-app.vercel.app`
- Health: `https://your-app.vercel.app/api/health`

---

## 📊 Rate Limits

| Action      | Limit | Per        |
| ----------- | ----- | ---------- |
| Register    | 3     | hour (IP)  |
| Login       | 10    | min (IP)   |
| Create Post | 5     | min (user) |
| Comment     | 10    | min (user) |
| Vote        | 60    | min (user) |
| Report      | 5     | min (user) |

---

## 📁 Key Files

### Configuration

- `web/.env` - Local environment variables (gitignored)
- `web/.env.example` - Template with all vars
- `web/prisma/schema.prisma` - Database schema
- `web/middleware.ts` - Security headers

### Documentation

- `web/PRODUCTION_READY_SUMMARY.md` - Full implementation details
- `web/docs/DEPLOYMENT.md` - Vercel + Supabase guide
- `web/docs/SMOKE_TEST_CHECKLIST.md` - 60 test cases

### Core Logic

- `web/src/lib/env.ts` - Environment validation
- `web/src/lib/rateLimit.ts` - Rate limiting system
- `web/src/lib/rbac.ts` - Access control
- `web/src/lib/prisma.ts` - Database client
- `web/src/lib/redis.ts` - Redis caching

---

## 🐛 Troubleshooting

### Build fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database connection fails

- Check `DATABASE_URL` is set correctly
- Verify Supabase project is not paused
- Use **Session pooler** mode (port 6543)

### Rate limiting not working

- Check `REDIS_URL` is set (optional)
- If Redis down, falls back to in-memory (works but resets)

### Theme not persisting

- Clear browser localStorage
- Check browser allows localStorage

---

## 🆘 Emergency Commands

```bash
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Reset database
cd web
npx prisma migrate reset --force

# Fresh install
rm -rf node_modules package-lock.json
npm install

# Rebuild Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## ✨ What's Special About NeuroKind?

1. **Sensory-Friendly Design** - Soft colors, no harsh contrast
2. **Mental Health Focus** - Built for neurodiverse community
3. **Privacy First** - Anonymous posting, no tracking
4. **Production Ready** - Security hardened, scalable
5. **Zero Dependency Chaos** - Clean build, graceful fallbacks

---

**Need more details?** See [PRODUCTION_READY_SUMMARY.md](./PRODUCTION_READY_SUMMARY.md)

**Ready to deploy?** See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

**Ready to test?** See [docs/SMOKE_TEST_CHECKLIST.md](./docs/SMOKE_TEST_CHECKLIST.md)
