import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createPostSchema, getPostsSchema } from "@/lib/validations/community";
import DOMPurify from 'isomorphic-dompurify';
import { getCached, setCached, invalidateCache, CACHE_TTL, cacheKey } from "@/lib/redis";
import { rateLimitResponse, RATE_LIMITERS } from "@/lib/rateLimit";
import { withApiHandler, getRequestId } from "@/lib/apiHandler";
import { createLogger } from "@/lib/logger";
import { apiErrors } from "@/lib/apiError";

// Reddit-style Hot algorithm: time-decayed score based on votes
function calculateHotScore(voteScore: number, createdAt: Date): number {
  const sign = voteScore > 0 ? 1 : voteScore < 0 ? -1 : 0;
  const magnitude = Math.log10(Math.max(Math.abs(voteScore), 1) + 1);
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const decay = Math.pow(0.8, ageHours / 2); // 50% decay per 2 hours
  return sign * magnitude * decay;
}

function enforceSafeLinks(html: string): string {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    const hasRel = /\brel\s*=/.test(attrs);
    const normalizedAttrs = hasRel ? attrs : `${attrs} rel="noopener noreferrer"`;
    return `<a ${normalizedAttrs}>`;
  });
}

// GET /api/posts - List posts with cursor pagination
export const GET = withApiHandler(async (request: NextRequest) => {
  const requestId = getRequestId(request);
  const logger = createLogger({ requestId });

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const validation = getPostsSchema.safeParse(searchParams);

  if (!validation.success) {
    logger.warn({ validationErrors: validation.error.errors }, 'Invalid query parameters');
    return NextResponse.json(
      { error: "Invalid query parameters", details: validation.error.errors },
      { status: 400 }
    );
  }

  const { cursor, limit, sort, categoryId, tag, search, page } = validation.data;
  const useCursor = !!cursor;
  const take = limit + 1; // Fetch one extra to determine if there's a next page

  logger.debug({ cursor, limit, sort, categoryId, tag, search }, 'Fetching posts');

  // Check cache
  const cacheKeyStr = cacheKey([
    "posts",
    useCursor ? `cursor:${cursor}` : `page:${page}`,
    String(limit),
    sort || "new",
    categoryId || "all",
    tag || "all",
    search || "all"
  ]);
  const cached = await getCached(cacheKeyStr, { prefix: "posts", ttl: CACHE_TTL.POSTS_FEED });
  if (cached) {
    logger.debug('Cache hit');
    return NextResponse.json(cached);
  }

  // Build where clause
  const where: any = {
    status: "ACTIVE",
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (tag) {
    where.tags = {
      some: {
        id: tag,
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  // Parse cursor for pagination
  const cursorObject = useCursor && cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString()) : null;

  // Build orderBy clause
  let orderBy: any = {};
  switch (sort) {
    case "new":
      orderBy = { createdAt: "desc" };
      break;
    case "top":
      orderBy = [{ voteScore: "desc" }, { createdAt: "desc" }];
      break;
    case "hot":
      // Hot sorting by creation time, then apply algorithm in JS
      orderBy = { createdAt: "desc" };
      break;
  }

  // Build query
  const query: any = {
    where,
    orderBy,
    take,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      isAnonymous: true,
      isPinned: true,
      isLocked: true,
      status: true,
      voteScore: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      author: {
        select: {
          id: true,
          profile: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  };

  // Add cursor/pagination
  if (useCursor && cursorObject) {
    query.skip = 1; // Skip the cursor itself
    query.cursor = { id: cursorObject.id };
  } else if (!useCursor && page) {
    query.skip = (page - 1) * limit;
  }

  const posts = await prisma.post.findMany(query) as any[];

  // Apply hot algorithm if needed
  let sortedPosts = posts;
  if (sort === "hot") {
    sortedPosts = posts.sort((a, b) => {
      const scoreA = calculateHotScore(a.voteScore, a.createdAt);
      const scoreB = calculateHotScore(b.voteScore, b.createdAt);
      return scoreB - scoreA;
    });
  }

  // Determine if there are more results
  const hasMore = sortedPosts.length > limit;
  const displayPosts = sortedPosts.slice(0, limit);
  const nextCursor = hasMore && displayPosts.length > 0
    ? Buffer.from(JSON.stringify({ id: displayPosts[displayPosts.length - 1].id })).toString('base64')
    : null;

  // Format posts
  const formattedPosts = displayPosts.map((post) => {
    return {
      id: post.id,
      title: post.title,
      snippet: post.content.substring(0, 200) + (post.content.length > 200 ? "..." : ""),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
      } : null,
      tags: post.tags,
      author: post.isAnonymous || !post.author
        ? {
          id: "anonymous",
          username: "Anonymous",
          avatarUrl: null,
        }
        : {
          id: post.author.id,
          username: post.author.profile?.username || "Unknown",
          avatarUrl: post.author.profile?.avatarUrl || null,
        },
      voteScore: post.voteScore,
      commentCount: post._count.comments,
      isPinned: post.isPinned,
      isLocked: post.isLocked,
      status: post.status,
    };
  });

  const response = {
    posts: formattedPosts,
    pagination: useCursor
      ? {
        nextCursor,
        hasMore,
        limit,
      }
      : {
        page,
        limit,
        hasMore,
      },
  };

  // Cache the response
  await setCached(cacheKeyStr, response, { prefix: "posts", ttl: CACHE_TTL.POSTS_FEED });

  logger.info({ postCount: formattedPosts.length, hasMore }, 'Posts fetched successfully');
  return NextResponse.json(response);
}, { method: 'GET', routeName: '/api/posts' });

// POST /api/posts - Create a new post (WITH CRASH PROTECTION)
export const POST = withApiHandler(async (request: NextRequest) => {
  try {
    const requestId = getRequestId(request);
    const logger = createLogger({ requestId });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn('Unauthorized post creation attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 posts per minute per user
    const canCreatePost = await RATE_LIMITERS.createPost.checkLimit(session.user.id);
    if (!canCreatePost) {
      const retryAfter = await RATE_LIMITERS.createPost.getRetryAfter(session.user.id);
      logger.warn({ userId: session.user.id }, 'Rate limit exceeded for post creation');
      return rateLimitResponse(retryAfter);
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      logger.warn({ validationErrors: validation.error.errors }, 'Invalid post data');
      return NextResponse.json({ error: "Validation failed", details: validation.error.errors }, { status: 400 });
    }

    const { title, content, categoryId, tagIds, isAnonymous } = validation.data;

    // Sanitize content to prevent XSS - USE TRY CATCH FOR LIBRARY LOAD
    let sanitizedContent = content;
    try {
      const dirty = content.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
        const hasRel = /\brel\s*=/.test(attrs);
        return `<a ${hasRel ? attrs : `${attrs} rel="noopener noreferrer"`}>`;
      });
      sanitizedContent = DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
          'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
          'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
        ],
        ALLOWED_ATTR: [
          'href', 'name', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'class', 'style'
        ],
      });
    } catch (libError) {
      console.error("DOMPurify Error:", libError);
      // Fallback to raw content if sanitizer crashes (Emergency measure)
      sanitizedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content: sanitizedContent,
        authorId: session.user.id,
        categoryId,
        isAnonymous,
        status: "ACTIVE",
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            profile: {
              select: { username: true, avatarUrl: true },
            },
          },
        },
      },
    });

    await invalidateCache("posts:*", { prefix: "posts" });

    logger.info({ postId: post.id, userId: session.user.id }, 'Post created successfully');
    return NextResponse.json(post, { status: 201 });
  } catch (outerError: any) {
    console.error("CRITICAL POST ERROR:", outerError);
    return NextResponse.json({
      error: "Critical Server Error",
      message: outerError.message || "Unknown error during post creation"
    }, { status: 500 });
  }
}, { method: 'POST', routeName: '/api/posts' });
