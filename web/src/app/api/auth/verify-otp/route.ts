import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VerifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = VerifyOTPSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message || 'Invalid input' },
                { status: 400 }
            );
        }

        const { email, otp } = parsed.data;

        // Find the verification record
        const verification = await prisma.emailVerification.findFirst({
            where: {
                email,
                otp,
                verified: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!verification) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP code' },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        if (new Date() > verification.expiresAt) {
            return NextResponse.json(
                { error: 'OTP code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Mark verification as completed
        await prisma.emailVerification.update({
            where: { id: verification.id },
            data: {
                verified: true,
                verifiedAt: new Date(),
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'An error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
