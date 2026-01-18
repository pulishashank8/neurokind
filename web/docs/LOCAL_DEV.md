# NeuroKind Local Development (Docker Postgres + Redis)

## Prerequisites

- Windows: Docker Desktop (WSL2 engine) and Node.js 20+
- Linux/macOS: Docker and Node.js 20+

## Environment Setup

- Copy `.env.example` to `.env.local` and adjust secrets
- Default local values:
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neurokind`
  - `REDIS_URL=redis://localhost:6379`
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET=<random-hex>`

## Start Docker Services

```bash
cd C:\Users\User\neurokind
# Bring up Postgres and Redis
docker compose up -d
# Verify
docker ps
```

## Initialize Database

```bash
cd web
npm install
# Push schema locally
npm run db:push
# Generate Prisma client
npm run db:generate
# Seed sample data
npm run db:seed
```

## Run App

```bash
npm run dev
# Visit http://localhost:3000
# Health check http://localhost:3000/api/health
```

## Notes

- Redis is optional; app disables cache/rate limit if unavailable.
- For Windows EPERM errors in Prisma generate, stop Node processes and regenerate:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\node_modules\.prisma
npx prisma generate
```
