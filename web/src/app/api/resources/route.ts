import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const where: any = {
      status: "ACTIVE",
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        link: true,
        category: true,
        views: true,
        createdAt: true,
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
