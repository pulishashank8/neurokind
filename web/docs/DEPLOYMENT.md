# NeuroKind Deployment Guide (Vercel + Supabase + Optional Upstash Redis)

## Overview

This guide deploys the Next.js app to Vercel with persistent data on Supabase Postgres. Redis caching/rate limit is optional (Upstash recommended). No code changes required across environments.

## Prerequisites

- Vercel account
- Supabase project with Postgres
- (Optional) Upstash Redis serverless instance

## Environment Variables

Set in Vercel Project → Settings → Environment Variables:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>`
- `NEXTAUTH_URL=https://<your-vercel-domain>`
- `NEXTAUTH_SECRET=<strong-random-secret>`
- `DATABASE_URL=<Supabase PgBouncer URL>` (see below)
- Optional Upstash:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Optional OAuth providers: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`

See `.env.example` for a full template.

## Supabase PgBouncer URL

Use PgBouncer for serverless platforms:

```
postgresql://<user>:<password>@<host>:6543/<database>?pgbouncer=true&connection_limit=1
```

Copy this to `DATABASE_URL` in Vercel.

## Database Migrations & Seeding

Run migrations outside the Vercel build (locally or CI):

```bash
cd web
# Ensure DATABASE_URL points to Supabase PgBouncer
npm run prisma:migrate:deploy
npm run db:generate
# Optional seed (adjust seed.ts for production-safe data)
npm run db:seed
```

## Deploy on Vercel

- Import the repo and select the `web` folder as the project root.
- Build Command: `npm run build`
- Output: Next.js defaults
- Set environment variables
- Deploy

## Post-Deployment Checks

- Health endpoint: `/api/health` shows `app` and `db` ok (Redis may be disabled if not configured)
- Public pages:
  - `/community` loads the feed
  - Post detail and comments load
- Auth: Login/register works if providers configured

## Redis (Optional)

- With Upstash: set `REDIS_URL` if you use ioredis (Upstash supports ioredis URL) or use REST via other libraries.
- The app gracefully disables caching/rate limits if Redis is missing or unavailable.

## Custom Domain

- Add `neurokind.com` in Vercel domain settings and point DNS accordingly.
