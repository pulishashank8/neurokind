import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/rbac";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canModerate(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { targetId, reason } = body;
    const postId = targetId;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await prisma.post.update({
      where: { id: postId },
      data: { status: "REMOVED" },
    });

    // Test expects ModerationAction
    await prisma.moderationAction.create({
      data: {
        actorId: session.user.id,
        action: "REMOVE",
        postId: postId,
        notes: reason,
      },
    });

    // Also log to ModActionLog for completeness
    await prisma.modActionLog.create({
      data: {
        actionType: "REMOVE",
        targetType: "POST",
        targetId: postId,
        moderatorId: session.user.id,
        targetTitle: post.title,
        reason,
      },
    });

    // Invalidate cache
    await invalidateCache("posts:*", { prefix: "posts" });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error removing post:", e);
    return NextResponse.json({ error: "Failed to remove post" }, { status: 500 });
  }
}
