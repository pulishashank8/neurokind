# NeuroKind Quick Start & Command Reference

## Current Status
✅ **Foundation Complete**
- Docker: Postgres (port 5432) + Redis running
- Next.js dev server: http://localhost:3000
- Database: Connected via Prisma
- Auth: NextAuth with RBAC working
- Test Account: admin@neurokind.local / admin123

---

## Quick Commands

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
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (DO NOT edit directly, run `db:push` after) |
| `src/lib/auth.ts` | Authentication utilities & role checking |
| `src/lib/rbac.ts` | Role-based access control functions |
| `src/lib/validators.ts` | Zod validation schemas |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth configuration |
| `src/app/api/user/profile/route.ts` | User profile API |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |

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
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
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
        { status: 400 }
      );
    }
    
    const post = await prisma.post.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        categoryId: parsed.data.categoryId,
        authorId: parsed.data.isAnonymous ? null : user.id,
        isAnonymous: parsed.data.isAnonymous,
        tags: { connect: parsed.data.tags?.map(tagId => ({ id: tagId })) },
      },
      include: { author: { include: { profile: true } } },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if ((error as any).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
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

# Test session endpoint
curl http://localhost:3000/api/auth/session
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

## Getting Help

1. Check the **PROJECT_STATUS_AND_ROADMAP.md** for full context
2. Check **IMPLEMENTATION_TASKS.md** for detailed task breakdown
3. Look at existing code patterns in `src/app/api/auth/register/route.ts`
4. Search docs for specific technologies (Next.js, Prisma, NextAuth)
5. Check error messages carefully - they usually point to the solution

---

**Last Updated:** January 16, 2026
**Next Step:** Start Phase 1.1 - Create `src/app/api/posts/route.ts`
