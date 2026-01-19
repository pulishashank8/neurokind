import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { 
  CreateDatasetSchema, 
  DatasetSearchParamsSchema 
} from "@/lib/validations/catalog";
import { z } from "zod";

/**
 * GET /api/admin/catalog
 * List and search datasets with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Enforce ADMIN role
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const params = DatasetSearchParamsSchema.parse({
      q: searchParams.get("q") || undefined,
      domain: searchParams.get("domain") || undefined,
      sensitivity: searchParams.get("sensitivity") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });

    // Build where clause
    const where: any = {};

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
        { tags: { has: params.q } },
      ];
    }

    if (params.domain) {
      where.domain = params.domain;
    }

    if (params.sensitivity) {
      where.sensitivity = params.sensitivity;
    }

    // Get total count
    const total = await prisma.dataset.count({ where });

    // Get datasets
    const datasets = await prisma.dataset.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        domain: true,
        ownerTeam: true,
        sensitivity: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            fields: true,
            glossaryTerms: true,
          },
        },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      datasets,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/catalog
 * Create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    // Enforce ADMIN role
    await requireRole("ADMIN");

    const body = await request.json();
    const data = CreateDatasetSchema.parse(body);

    // Check if dataset name already exists
    const existing = await prisma.dataset.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Dataset with this name already exists" },
        { status: 409 }
      );
    }

    // Create dataset
    const { ownerTeam, ...datasetData } = data;
    const dataset = await prisma.dataset.create({
      data: {
        ...datasetData,
        owner: {
          connectOrCreate: {
            where: { teamName: ownerTeam },
            create: {
              teamName: ownerTeam,
              contactEmail: `${ownerTeam.toLowerCase().replaceAll(" ", "-")}@neurokind.internal`,
            },
          },
        },
      },
      include: {
        owner: true,
        _count: {
          select: {
            fields: true,
            glossaryTerms: true,
          },
        },
      },
    });

    return NextResponse.json(dataset, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating dataset:", error);
    return NextResponse.json(
      { error: "Failed to create dataset" },
      { status: 500 }
    );
  }
}
