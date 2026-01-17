# NeuroKind Code Patterns & Examples

A quick reference for common development patterns used throughout the project.

---

## Pattern 1: Protected API Routes

### Authentication + Authorization

```typescript
// File: src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require ADMIN role (throws error if not authorized)
    const user = await requireRole("ADMIN");

    // Now you can use user.id or check other permissions
    const users = await prisma.user.findMany({
      include: { profile: true, userRoles: true },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Multi-role Authorization

```typescript
import { requireAnyRole } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  try {
    // Require either ADMIN or MODERATOR role
    const user = await requireAnyRole(["ADMIN", "MODERATOR"]);

    // Process request...
  } catch (error: any) {
    // Handle error
  }
}
```

---

## Pattern 2: Input Validation with Zod

### Define Schema

```typescript
// File: src/lib/validators.ts
import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be at most 255 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be at most 10000 characters"),
  categoryId: z.string().cuid("Invalid category ID"),
  tags: z.array(z.string().cuid()).optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
```

### Validate Request

```typescript
import { CreatePostSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Safe parse returns { success, data, error }
  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.errors, // Array of validation errors
      },
      { status: 400 },
    );
  }

  // typed.data is fully typed with correct types
  const { title, content, categoryId, tags, isAnonymous } = parsed.data;

  // Safe to use now
  console.log(title); // string, not unknown
}
```

---

## Pattern 3: Database Query Patterns

### Simple Query

```typescript
const post = await prisma.post.findUnique({
  where: { id: postId },
});
```

### Query with Relations

```typescript
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: {
      include: {
        profile: true, // Nested include
      },
    },
    category: true,
    tags: true,
    comments: {
      include: {
        author: { include: { profile: true } },
      },
    },
  },
});
```

### List with Filtering

```typescript
const posts = await prisma.post.findMany({
  where: {
    status: "ACTIVE",
    categoryId: categoryId,
    tags: {
      some: { id: { in: tagIds } }, // Filter by tags
    },
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
  },
  include: { author: { include: { profile: true } } },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

### Count with Filtering

```typescript
const total = await prisma.post.count({
  where: { status: "ACTIVE", categoryId: categoryId },
});
```

### Create with Relations

```typescript
const post = await prisma.post.create({
  data: {
    title,
    content,
    categoryId,
    authorId: isAnonymous ? null : userId, // null for anonymous
    isAnonymous,
    tags: {
      connect: tags.map((tagId) => ({ id: tagId })), // Connect existing tags
    },
  },
  include: { author: { include: { profile: true } } },
});
```

### Update with Relations

```typescript
const post = await prisma.post.update({
  where: { id: postId },
  data: {
    title,
    content,
    updatedAt: new Date(),
    tags: {
      // Replace tags: disconnect old, connect new
      disconnect: true, // Disconnect all
      connect: newTags.map((id) => ({ id })),
    },
  },
});
```

### Atomic Increment

```typescript
// Increment view count by 1
await prisma.post.update({
  where: { id: postId },
  data: {
    viewCount: { increment: 1 },
  },
});
```

---

## Pattern 4: API Response Standardization

### Success Response

```typescript
// Single item
return NextResponse.json(post, { status: 201 }); // 201 for creation

// List with pagination
return NextResponse.json({
  data: posts,
  pagination: {
    total: 100,
    page: 1,
    pageSize: 10,
    pages: 10,
  },
});

// Success message
return NextResponse.json({
  success: true,
  message: "Post deleted successfully",
});
```

### Error Response

```typescript
// Validation error
return NextResponse.json(
  {
    error: "Validation failed",
    details: parsed.error.errors,
  },
  { status: 400 },
);

// Not found
return NextResponse.json({ error: "Post not found" }, { status: 404 });

// Forbidden
return NextResponse.json(
  { error: "You don't have permission to delete this post" },
  { status: 403 },
);

// Unauthorized
return NextResponse.json({ error: "You must be logged in" }, { status: 401 });

// Rate limited
return NextResponse.json(
  { error: "Too many requests. Please try again later." },
  { status: 429 },
);

// Server error
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

---

## Pattern 5: Client-Side Data Fetching

### Fetch Single Item

```typescript
// File: src/app/community/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) throw new Error("Failed to fetch post");
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      {/* Render post */}
    </div>
  );
}
```

### Fetch List with Pagination

```typescript
const [posts, setPosts] = useState([]);
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `/api/posts?page=${page}&pageSize=10&category=${categoryId}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setPosts(data.data);
      setTotal(data.pagination.total);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  fetchPosts();
}, [page, categoryId]);

// Pagination buttons
const totalPages = Math.ceil(total / 10);
const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

return (
  <>
    {posts.map(post => <PostCard key={post.id} post={post} />)}
    <div>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={p === page ? "font-bold" : ""}
        >
          {p}
        </button>
      ))}
    </div>
  </>
);
```

### Create/Update with Form Submission

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        categoryId,
        tags,
        isAnonymous,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to create post");
    }

    const post = await response.json();
    router.push(`/community/posts/${post.id}`);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {error && <div className="text-red-600">{error}</div>}
    {/* Form fields */}
    <button type="submit" disabled={isLoading}>
      {isLoading ? "Creating..." : "Create Post"}
    </button>
  </form>
);
```

---

## Pattern 6: Component Props & TypeScript

### Typed Component Props

```typescript
// File: src/components/community/PostCard.tsx
import { FC } from "react";
import type { Post, User, Profile } from "@prisma/client";

interface PostCardProps {
  post: Post & {
    author: (User & { profile: Profile | null }) | null;
    category: { name: string };
    _count: { comments: number; votes: number };
  };
  onClick?: () => void;
  isHighlighted?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  post,
  onClick,
  isHighlighted = false,
}) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer ${
        isHighlighted ? "bg-blue-50 border-blue-300" : ""
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold">{post.title}</h3>
      <p className="text-gray-600">{post.content.substring(0, 100)}...</p>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{post._count.comments} comments</span>
        <span>{post._count.votes} votes</span>
      </div>
    </div>
  );
};

export default PostCard;
```

### Using Component in Parent

```typescript
import PostCard from "@/components/community/PostCard";

export default function CategoryPage() {
  return (
    <>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => router.push(`/community/posts/${post.id}`)}
          isHighlighted={post.id === highlightedPostId}
        />
      ))}
    </>
  );
}
```

---

## Pattern 7: Conditional Rendering

### Anonymous Posts

```typescript
{post.isAnonymous ? (
  <span className="text-gray-500">Anonymous User</span>
) : post.author ? (
  <Link href={`/profile/${post.author.id}`}>
    <span className="font-semibold text-blue-600">
      {post.author.profile?.displayName}
    </span>
  </Link>
) : (
  <span className="text-gray-500">Unknown User</span>
)}
```

### Role-Based UI

```typescript
const { data: session } = useSession();
const isAdmin = session?.user?.roles?.includes("ADMIN");
const isMod = session?.user?.roles?.includes("MODERATOR");

return (
  <>
    {/* Edit button - only for author */}
    {session?.user?.id === post.authorId && (
      <button onClick={handleEdit}>Edit</button>
    )}

    {/* Mod actions - only for mods/admins */}
    {(isAdmin || isMod) && (
      <select onChange={handleModAction}>
        <option>Moderation</option>
        <option>Remove</option>
        <option>Lock</option>
        <option>Pin</option>
      </select>
    )}
  </>
);
```

### Loading States

```typescript
if (loading) {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
      {error}
    </div>
  );
}

if (data.length === 0) {
  return <div className="text-center text-gray-500">No posts found</div>;
}
```

---

## Pattern 8: Pagination Helper

### Create Pagination Helper

```typescript
// File: src/lib/pagination.ts

interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function getPaginationMeta(params: PaginationParams): PaginationMeta {
  const { page, pageSize, total } = params;
  const pages = Math.ceil(total / pageSize);

  return {
    total,
    page,
    pageSize,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

// Get offset for database query
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
```

### Use Helper in API

```typescript
import { getPaginationMeta, getPaginationOffset } from "@/lib/pagination";

const page = parseInt(searchParams.get("page") || "1");
const pageSize = parseInt(searchParams.get("pageSize") || "10");

const total = await prisma.post.count({ where: { status: "ACTIVE" } });

const posts = await prisma.post.findMany({
  where: { status: "ACTIVE" },
  skip: getPaginationOffset(page, pageSize),
  take: pageSize,
  orderBy: { createdAt: "desc" },
});

const pagination = getPaginationMeta({ page, pageSize, total });

return NextResponse.json({ data: posts, pagination });
```

---

## Pattern 9: Error Handling Wrapper

### Create Error Handler

```typescript
// File: src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export async function safeApiCall<T>(
  fn: () => Promise<T>,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
```

### Use Wrapper

```typescript
const result = await safeApiCall(() =>
  prisma.post.findUnique({ where: { id: postId } }),
);

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 500 });
}

const post = result.data;
```

---

## Pattern 10: Search Implementation

### Simple ILIKE Search

```typescript
const query = searchParams.get("q") || "";

const posts = await prisma.post.findMany({
  where: {
    status: "ACTIVE",
    OR: [
      { title: { search: query } }, // PostgreSQL full-text (if using @@ operator)
      { title: { contains: query, mode: "insensitive" } }, // ILIKE
      { content: { contains: query, mode: "insensitive" } },
    ],
  },
  take: 20,
});
```

### Search with Multiple Filters

```typescript
const query = searchParams.get("q");
const category = searchParams.get("category");
const tag = searchParams.get("tag");
const sortBy = searchParams.get("sort") || "newest";

const where: Prisma.PostWhereInput = {
  status: "ACTIVE",
};

if (query) {
  where.OR = [
    { title: { contains: query, mode: "insensitive" } },
    { content: { contains: query, mode: "insensitive" } },
  ];
}

if (category) {
  where.categoryId = category;
}

if (tag) {
  where.tags = { some: { id: tag } };
}

const orderBy: Record<string, any> = {};
if (sortBy === "newest") orderBy.createdAt = "desc";
if (sortBy === "popular") orderBy.votes = "desc"; // Would need vote count field
if (sortBy === "trending") {
  // Logic for trending (e.g., recent votes)
}

const posts = await prisma.post.findMany({ where, orderBy, take: 20 });
```

---

## Pattern 11: Middleware for Protection

### Route Protection Middleware

```typescript
// File: src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import type { Role } from "@prisma/client";

const PROTECTED_ROUTES: Record<string, Role | Role[]> = {
  "/admin": "ADMIN",
  "/admin/users": "ADMIN",
  "/admin/moderation": ["ADMIN", "MODERATOR"],
  "/community/posts/new": undefined, // Just require auth, any role
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route needs protection
  const requiredRole = PROTECTED_ROUTES[pathname];
  if (requiredRole === undefined && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Get session
  const session = await getServerSession();

  // Not authenticated
  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${pathname}`, request.url),
    );
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.some((role) => session.user?.roles?.includes(role));

    if (!hasRole) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/community/posts/new", "/settings"],
};
```

---

## Common Gotchas

### ❌ Don't forget to `.json()` response

```typescript
// Wrong
const response = await fetch("/api/posts/1");
const data = response; // This is Response object

// Right
const response = await fetch("/api/posts/1");
const data = await response.json(); // Now it's the data
```

### ❌ Don't forget to include relations

```typescript
// Wrong: author will be null
const post = await prisma.post.findUnique({
  where: { id: postId },
});

// Right: author included
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: { author: true },
});
```

### ❌ Don't mix async/await with promises

```typescript
// Awkward but works
const posts = await Promise.all([fetch("/api/posts/1"), fetch("/api/posts/2")]);

// Better: use async/await
const [res1, res2] = await Promise.all([
  fetch("/api/posts/1"),
  fetch("/api/posts/2"),
]);
const posts = await Promise.all([res1.json(), res2.json()]);
```

### ❌ Don't forget error handling in useEffect

```typescript
// Bad: error not handled
useEffect(() => {
  fetch("/api/posts")
    .then((r) => r.json())
    .then(setPosts);
}, []);

// Good: error handled
useEffect(() => {
  fetch("/api/posts")
    .then((r) => r.json())
    .then(setPosts)
    .catch((err) => setError(err.message));
}, []);
```

---

**Last Updated:** January 16, 2026
