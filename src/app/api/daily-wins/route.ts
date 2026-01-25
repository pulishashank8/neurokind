import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wins = await prisma.dailyWin.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ wins });
  } catch (error) {
    console.error("Error fetching daily wins:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily wins" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, content, mood, category } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Content must be less than 2000 characters" },
        { status: 400 }
      );
    }

    if (mood && (mood < 1 || mood > 5)) {
      return NextResponse.json(
        { error: "Mood must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (category && category.length > 50) {
      return NextResponse.json(
        { error: "Category must be less than 50 characters" },
        { status: 400 }
      );
    }

    const win = await prisma.dailyWin.create({
      data: {
        userId: session.user.id,
        date: date ? new Date(date) : new Date(),
        content: content.trim(),
        mood: mood || null,
        category: category?.trim() || null,
      },
    });

    return NextResponse.json({ win }, { status: 201 });
  } catch (error) {
    console.error("Error creating daily win:", error);
    return NextResponse.json(
      { error: "Failed to create daily win" },
      { status: 500 }
    );
  }
}
