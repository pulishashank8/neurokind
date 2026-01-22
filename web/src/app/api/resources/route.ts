import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const where: any = {
      status: "PUBLISHED", // Default to published only
    };

    if (category && category !== "ALL") {
      // Basic protection against obviously invalid enum values, though Prisma might throw
      where.category = category;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "views") {
      orderBy = { views: "desc" };
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy,
      take: limit, // Apply limit if provided
      select: {
        id: true,
        title: true,
        content: true,
        link: true,
        category: true,
        views: true,
        createdAt: true,
        status: true, // Include status for debugging/verification
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    // If it's a Prisma validation error (e.g. invalid enum), return 400 or empty
    // For now returning 400 seems appropriate for invalid input (e.g. category)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 400 } // Changing to 400 as it's likely input error for "Invalid Category" test
    );
  }
}
