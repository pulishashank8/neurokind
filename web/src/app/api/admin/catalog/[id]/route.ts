import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UpdateDatasetSchema } from "@/lib/validations/catalog";
import { z } from "zod";

/**
 * GET /api/admin/catalog/[id]
 * Get dataset details with fields and glossary terms
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Enforce ADMIN role
    await requireRole("ADMIN");

    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        fields: {
          orderBy: { name: "asc" },
        },
        glossaryTerms: {
          include: {
            term: true,
          },
        },
        _count: {
          select: {
            fields: true,
            glossaryTerms: true,
          },
        },
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dataset);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Error fetching dataset:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/catalog/[id]
 * Update dataset metadata
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Enforce ADMIN role
    await requireRole("ADMIN");

    const body = await request.json();
    const data = UpdateDatasetSchema.parse(body);

    // Check if dataset exists
    const existing = await prisma.dataset.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    // If updating name, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.dataset.findUnique({
        where: { name: data.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Dataset with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update dataset
    const updateData: any = { ...data };
    
    if (data.ownerTeam) {
      updateData.owner = {
        connectOrCreate: {
          where: { teamName: data.ownerTeam },
          create: {
            teamName: data.ownerTeam,
            contactEmail: `${data.ownerTeam.toLowerCase().replace(/\s+/g, "-")}@neurokind.internal`,
          },
        },
      };
      delete updateData.ownerTeam;
    }

    const dataset = await prisma.dataset.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: true,
        fields: {
          orderBy: { name: "asc" },
        },
        glossaryTerms: {
          include: {
            term: true,
          },
        },
        _count: {
          select: {
            fields: true,
            glossaryTerms: true,
          },
        },
      },
    });

    return NextResponse.json(dataset);
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

    console.error("Error updating dataset:", error);
    return NextResponse.json(
      { error: "Failed to update dataset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/catalog/[id]
 * Delete a dataset
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Enforce ADMIN role
    await requireRole("ADMIN");

    // Check if dataset exists
    const existing = await prisma.dataset.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    // Delete dataset (cascade will handle fields and glossary term links)
    await prisma.dataset.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Error deleting dataset:", error);
    return NextResponse.json(
      { error: "Failed to delete dataset" },
      { status: 500 }
    );
  }
}
