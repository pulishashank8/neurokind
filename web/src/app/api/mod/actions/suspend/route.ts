import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/rbac";

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
    const { userId, isSuspended, reason, durationDays } = body;

    if (durationDays !== undefined && (typeof durationDays !== 'number' || durationDays < 0)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update user profile shadowban status
    await prisma.profile.update({
      where: { userId },
      data: { shadowbanned: !!isSuspended },
    });

    await prisma.modActionLog.create({
      data: {
        actionType: isSuspended ? "SHADOWBAN" : "UNSHADOWBAN",
        targetType: "USER",
        targetId: userId,
        moderatorId: session.user.id,
        reason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error suspending user:", e);
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
  }
}
