import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCached, CACHE_TTL } from "@/lib/redis";

// GET /api/categories - Get all categories
export async function GET() {
  try {
    // Check cache
    const cached = await getCached("all", { prefix: "categories", ttl: CACHE_TTL.CATEGORIES });
    if (cached) {
      return NextResponse.json(cached);
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: category._count.posts,
    }));

    const response = { categories: formattedCategories };

    // Cache the response
    await setCached("all", response, { prefix: "categories", ttl: CACHE_TTL.CATEGORIES });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
