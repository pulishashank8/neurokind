import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileUpdateSchema } from "@/lib/validators";

// GET /api/user/profile
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        userRoles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.userRoles.map((ur: any) => ur.role),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { username, displayName, bio, location, avatarUrl } = parsed.data;

    // Check if username is taken (if provided and different from current)
    if (username) {
      const existingProfile = await prisma.profile.findUnique({
        where: { username },
      });

      if (existingProfile && existingProfile.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
