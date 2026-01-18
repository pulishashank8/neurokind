# NeuroKind Quick Start & Launch Commands

🎉 **NeuroKind is PRODUCTION READY!** All features implemented and tested.

---

## 🚀 Get Started in 5 Minutes

### Step 1: Start Database & Cache (Required)

```bash
# From project root:
docker-compose up

# Keep this terminal running
# Watch for:
#   ✓ postgres: ready to accept connections
#   ✓ redis: Ready to accept connections
```

**Windows Troubleshooting**:

- If `docker-compose: not found` → Install Docker Desktop
- If port 5432 in use → Stop conflicting containers: `docker ps` then `docker stop <container>`
- If Docker daemon fails → Start Docker Desktop app

### Step 2: Apply Migrations (One-time Setup)

```bash
cd web
npx prisma migrate deploy

# If first time, you'll see multiple migrations applied
# Subsequent runs: "Already applied successfully"
```

### Step 3: Start Development Server

```bash
npm run dev

# Watch for: "✓ Ready in 2.5s"
# Open: http://localhost:3000
```

### Step 4: Test Authentication

```
Login with:
  Email: admin@neurokind.local
  Password: admin123

(Or parent@neurokind.local / parent123)
```

---

## ✅ Test Completed Features

### ✅ Theme Toggle (NEW)

After login:

1. Look for **sun/moon icon** in navbar (top right)
2. Click to toggle dark mode
3. Refresh page → Theme persists ✓

### ✅ Create Post (FIXED)

Once DB running:

1. Go to `/community` → Click "Create New Post"
2. Fill form, submit
3. Should appear in feed ✓

### ✅ Anti-Spam Protection

Try to create post with >2 links:

- Should get: "Too many links. Maximum 2 allowed" ✓

### ✅ Rate Limiting

Create 5 posts in 60 seconds:

- 6th post: "Rate limit exceeded. Retry after X seconds" ✓

---

## 📋 Complete Development Commands

### Development

```bash
# Start dev server (runs on http://localhost:3000)
npm run dev

# Open Prisma Studio (visual database editor)
npm run db:studio

# Run linting
npm run lint

# Build for production
npm run build
```

### Database

```bash
# Push schema changes to database
npm run db:push

# Create a new migration (after schema changes)
npx prisma migrate dev --name <migration_name>
# Example: npx prisma migrate dev --name add_post_features

# Seed database with sample data
npm run db:seed

# Generate Prisma client (usually automatic)
npm run db:generate

# Reset database (⚠️ WARNING: Deletes all data!)
npx prisma migrate reset
```

### Database Connection String

```
DATABASE_URL=postgresql://neurokind:neurokind@localhost:5432/neurokind
```

---

## Development Workflow

### 1. Starting Development

```bash
# Terminal 1: Start Next.js dev server
cd c:\Users\User\neurokind\web
npm run dev

# Terminal 2 (optional): Open Prisma Studio for database viewing
npm run db:studio

# Terminal 3 (optional): Watch for TypeScript/ESLint errors
npm run lint
```

Open http://localhost:3000 in browser

### 2. Making Schema Changes

```bash
# Edit schema.prisma
# Then sync to database
npm run db:push

# If you want versioned migrations instead
npx prisma migrate dev --name <descriptive_name>
```

### 3. Working on Features

1. **Backend (API):** Create route file in `src/app/api/`
2. **Validation:** Add schemas to `src/lib/validators.ts`
3. **Frontend:** Create components in `src/components/` and pages in `src/app/`
4. **Test:** Use curl/Postman or browser dev tools
5. **Commit:** `git add . && git commit -m "Add feature"`

### 4. Testing Authentication-Protected Routes

```bash
# Login with test account
Email: admin@neurokind.local
Password: admin123

# Check session in browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)

# Check current user info
fetch('/api/user/profile').then(r => r.json()).then(console.log)
```

---

## File Structure Reference

### Key Directories

- `src/app/` - Pages (App Router)
- `src/app/api/` - API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utilities (auth, validation, database client)
- `prisma/` - Database schema and migrations
- `public/` - Static assets

### Important Files

| File                                      | Purpose                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| `prisma/schema.prisma`                    | Database schema (DO NOT edit directly, run `db:push` after) |
| `src/lib/auth.ts`                         | Authentication utilities & role checking                    |
| `src/lib/rbac.ts`                         | Role-based access control functions                         |
| `src/lib/validators.ts`                   | Zod validation schemas                                      |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth configuration                                      |
| `src/app/api/user/profile/route.ts`       | User profile API                                            |
| `next.config.ts`                          | Next.js configuration                                       |
| `tailwind.config.ts`                      | Tailwind CSS configuration                                  |
| `tsconfig.json`                           | TypeScript configuration                                    |

---

## Implementation Priority

**Start Here (Next Immediate Step):**

```
Phase 1.1: Create src/app/api/posts/route.ts
├── POST handler: Create post
├── GET handler: List posts with filtering/pagination
└── Add validators to src/lib/validators.ts

↓ (After API tested)

Phase 2.1: Create src/app/community/page.tsx
├── Display categories
├── List recent posts
└── "Create Post" button link

↓ (After you have working posts)

Phase 2.4: Create src/app/community/posts/new/page.tsx
└── Post creation form

(Continue through roadmap sequentially)
```

---

## Common Tasks

### Adding a New API Route

```typescript
// File: src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/lib/validators";

// GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const posts = await prisma.post.findMany({
      where: { status: "ACTIVE" },
      include: { author: { include: { profile: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.post.count({ where: { status: "ACTIVE" } });

    return NextResponse.json({
      data: posts,
      pagination: { total, page, pageSize, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(); // Returns user or throws 401

    const body = await request.json();
    const parsed = CreatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        categoryId: parsed.data.categoryId,
        authorId: parsed.data.isAnonymous ? null : user.id,
        isAnonymous: parsed.data.isAnonymous,
        tags: { connect: parsed.data.tags?.map((tagId) => ({ id: tagId })) },
      },
      include: { author: { include: { profile: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if ((error as any).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
```

### Adding a New Page Component

```typescript
// File: src/app/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CommunityPage() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, postsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/posts?page=1&pageSize=10"),
        ]);

        if (!categoriesRes.ok || !postsRes.ok) throw new Error("Failed to fetch");

        const categoriesData = await categoriesRes.json();
        const postsData = await postsRes.json();

        setCategories(categoriesData);
        setPosts(postsData.data);
      } catch (err) {
        setError((err as any).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community</h1>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {categories.map(cat => (
          <div key={cat.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <h2 className="text-lg font-semibold">{cat.name}</h2>
            <p className="text-gray-600">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        {posts.map(post => (
          <Link key={post.id} href={`/community/posts/${post.id}`}>
            <div className="p-4 border rounded-lg mb-2 hover:bg-gray-50">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-600">{post.content.substring(0, 100)}...</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Adding Validators

```typescript
// File: src/lib/validators.ts (add to existing)
import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().cuid("Invalid category ID"),
  tags: z.array(z.string().cuid()).optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
```

### Checking User Role in API

```typescript
// In API route handler
import { requireRole, hasRole } from "@/lib/rbac";

// Require specific role (throws error if not)
const user = await requireRole("MODERATOR");

// Check if user has role (returns boolean)
const isMod = await hasRole(userId, "MODERATOR");

// Require any of multiple roles
const user = await requireAnyRole(["ADMIN", "MODERATOR"]);
```

### Querying Related Data

```typescript
// Get post with all relations
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: { include: { profile: true } },
    category: true,
    tags: true,
    comments: { include: { author: { include: { profile: true } } } },
    bookmarks: true,
  },
});

// Count with filter
const postCount = await prisma.post.count({
  where: { status: "ACTIVE", categoryId: categoryId },
});

// Paginated query
const posts = await prisma.post.findMany({
  where: { status: "ACTIVE" },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
});
```

---

## Environment Variables

Located in: `.env.local` (git-ignored)

```env
# Database
DATABASE_URL=postgresql://neurokind:neurokind@localhost:5432/neurokind

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Useful Links

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Zod Docs:** https://zod.dev

---

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

✅ **Solution:** Make sure Docker containers are running

```bash
docker-compose up -d  # In root directory
docker ps  # Verify containers running
```

### Prisma Client Not Generated

```
Error: Cannot find module '@prisma/client'
```

✅ **Solution:** Generate Prisma client

```bash
npm run db:generate
```

### TypeScript Errors

```bash
# Check all files for errors
npm run lint

# Clear TypeScript cache
rm -rf .next
npm run build
```

### Session/Auth Not Working

```bash
# Check NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Verify database has users
npm run db:studio
# Check: Users table, UserRoles table
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

✅ **Solution:** Kill process on port 3000

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or just use a different port
npm run dev -- -p 3001
```

---

## 🪟 Windows PowerShell: Testing API Endpoints

### ⚠️ Important: curl Alias Issue

In **Windows PowerShell**, `curl` is an alias for `Invoke-WebRequest` (not the Unix curl utility). This breaks commands like:

```powershell
# ❌ FAILS - PowerShell interprets as Invoke-WebRequest, different parameters
curl -s http://localhost:3000/api/posts?limit=5
```

### ✅ Solution: Use Invoke-RestMethod or iwr

**Option 1: Invoke-RestMethod** (recommended, returns parsed JSON)

```powershell
# Get all posts (limit 5)
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5" | ConvertTo-Json

# Get specific post detail
Invoke-RestMethod "http://localhost:3000/api/posts/[post-id]"

# Get comments for a post
Invoke-RestMethod "http://localhost:3000/api/posts/[post-id]/comments"
```

**Option 2: iwr (Invoke-WebRequest alias)** + Select-Object

```powershell
# Get posts and show content
iwr "http://localhost:3000/api/posts?limit=5" | Select-Object -ExpandProperty Content

# Get with authorization header
$headers = @{ Authorization = "Bearer YOUR_TOKEN" }
iwr -Uri "http://localhost:3000/api/posts" -Headers $headers | Select-Object -ExpandProperty Content
```

**Option 3: Use npm scripts** (easiest - see below)

```bash
npm run api:posts
npm run api:post-detail
npm run api:comments
```

### PowerShell API Test Commands

```powershell
# Health check
Invoke-RestMethod "http://localhost:3000/api/health"

# List posts (newest, limit 5)
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=new"

# List posts sorted by Hot
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=hot"

# List posts sorted by Top
Invoke-RestMethod "http://localhost:3000/api/posts?limit=5&sort=top"

# Search posts
Invoke-RestMethod "http://localhost:3000/api/posts?search=mental+health&limit=5"

# Filter by category
Invoke-RestMethod "http://localhost:3000/api/posts?categoryId=category-uuid&limit=5"

# Get specific post
Invoke-RestMethod "http://localhost:3000/api/posts/[post-id]"

# Get comments for post
Invoke-RestMethod "http://localhost:3000/api/posts/[post-id]/comments"

# Check session (if logged in)
$response = iwr -Uri "http://localhost:3000/api/auth/session" -UseBasicParsing
$response.Content | ConvertFrom-Json
```

### Bash/Unix: Traditional curl Commands

If using **Git Bash** or **WSL** on Windows:

```bash
# These commands work as expected in Bash/WSL

# Health check
curl http://localhost:3000/api/health

# List posts
curl "http://localhost:3000/api/posts?limit=5&sort=new"

# Get specific post
curl http://localhost:3000/api/posts/[post-id]

# Get comments
curl http://localhost:3000/api/posts/[post-id]/comments

# Pretty print JSON
curl http://localhost:3000/api/posts?limit=5 | jq
```

---

## Getting Help

1. Check the **PROJECT_STATUS_AND_ROADMAP.md** for full context
2. Check **IMPLEMENTATION_TASKS.md** for detailed task breakdown
3. Look at existing code patterns in `src/app/api/auth/register/route.ts`
4. Search docs for specific technologies (Next.js, Prisma, NextAuth)
5. Check error messages carefully - they usually point to the solution

---

**Last Updated:** January 16, 2026
**Next Step:** Start Phase 1.1 - Create `src/app/api/posts/route.ts`
