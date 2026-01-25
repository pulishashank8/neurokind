import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const win = await prisma.dailyWin.findUnique({
      where: { id },
    });

    if (!win) {
      return NextResponse.json({ error: "Win not found" }, { status: 404 });
    }

    if (win.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.dailyWin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily win:", error);
    return NextResponse.json(
      { error: "Failed to delete daily win" },
      { status: 500 }
    );
  }
}
