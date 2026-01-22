import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/rbac";

// POST /api/posts/[id]/lock - Lock/unlock post (moderator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check moderator permissions
    const isModerator = await canModerate(session.user.id);
    if (!isModerator) {
      return NextResponse.json(
        { error: "Forbidden - Moderator access required" },
        { status: 403 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { isLocked: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Toggle lock status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { isLocked: !post.isLocked },
      select: {
        id: true,
        isLocked: true,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        actorId: session.user.id,
        action: updatedPost.isLocked ? "LOCK" : "LOCK", // Using LOCK for both or toggle based on status
        postId: id,
      },
    });

    return NextResponse.json({
      message: `Post ${updatedPost.isLocked ? "locked" : "unlocked"} successfully`,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error locking/unlocking post:", error);
    return NextResponse.json(
      { error: "Failed to update post lock status" },
      { status: 500 }
    );
  }
}
