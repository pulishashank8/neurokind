import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/rbac";

// POST /api/posts/[id]/pin - Pin/unpin post (moderator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
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
      select: { isPinned: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Toggle pin status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { isPinned: !post.isPinned },
      select: {
        id: true,
        isPinned: true,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        actorId: session.user.id,
        action: updatedPost.isPinned ? "PIN" : "UNPIN",
        postId: id,
      },
    });

    return NextResponse.json({
      message: `Post ${updatedPost.isPinned ? "pinned" : "unpinned"} successfully`,
      isPinned: updatedPost.isPinned,
    });
  } catch (error) {
    console.error("Error pinning/unpinning post:", error);
    return NextResponse.json(
      { error: "Failed to update post pin status" },
      { status: 500 }
    );
  }
}
