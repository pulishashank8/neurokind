import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { withApiHandler } from "@/lib/apiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const emailToken = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });

    if (!emailToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (new Date() > emailToken.expiresAt) {
        return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Verify user
    await prisma.user.update({
        where: { id: emailToken.userId },
        data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
        where: { id: emailToken.id },
    });

    return NextResponse.json({ success: true });
}, { method: 'GET', routeName: '/api/auth/verify-email' });
