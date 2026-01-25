import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, conversationId } = body;

    if (type === "connection-requests") {
      await prisma.connectionRequest.updateMany({
        where: {
          receiverId: userId,
          status: "PENDING",
          seenAt: null,
        },
        data: {
          seenAt: new Date(),
        },
      });
    } else if (type === "messages" && conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      await prisma.directMessage.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as seen:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
