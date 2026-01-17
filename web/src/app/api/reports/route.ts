import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validations/community";
import { rateLimit, RATE_LIMITS } from "@/lib/redis";

// POST /api/reports - Create a report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitKey = `ratelimit:report:${session.user.id}`;
    const { success, remaining, reset } = await rateLimit(rateLimitKey, RATE_LIMITS.REPORT);

    if (!success) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later.", remaining, reset },
        { status: 429, headers: { "Retry-After": String(reset) } }
      );
    }

    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { targetType, targetId, reason, details } = validation.data;

    // Verify target exists
    if (targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    } else if (targetType === "COMMENT") {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
    } else if (targetType === "USER") {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Check if user already reported this target
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        targetType,
        targetId,
        status: { in: ["OPEN", "UNDER_REVIEW"] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType,
        targetId,
        reason,
        description: details || null,
        status: "OPEN",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully. Our team will review it shortly.",
        report,
      },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
