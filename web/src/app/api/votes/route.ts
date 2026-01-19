import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createVoteSchema } from "@/lib/validations/community";
import { invalidateCache } from "@/lib/redis";
import {
  RATE_LIMITERS,
  rateLimitResponse,
} from "@/lib/rateLimit";
import { withApiHandler, getRequestId } from "@/lib/apiHandler";
import { createLogger } from "@/lib/logger";
import { apiErrors } from "@/lib/apiError";

// POST /api/votes - Create/update/remove vote
export const POST = withApiHandler(async (request: NextRequest) => {
  const requestId = getRequestId(request);
  const logger = createLogger({ requestId });
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.warn('Unauthorized vote attempt');
    throw apiErrors.unauthorized();
  }

  // Rate limit: 60 votes per minute per user
  const canVote = await RATE_LIMITERS.vote.checkLimit(session.user.id);
  if (!canVote) {
    const retryAfter = await RATE_LIMITERS.vote.getRetryAfter(
      session.user.id
    );
    logger.warn({ userId: session.user.id }, 'Vote rate limit exceeded');
    return rateLimitResponse(retryAfter);
  }

  const body = await request.json();
  const validation = createVoteSchema.safeParse(body);

  if (!validation.success) {
    logger.warn({ validationErrors: validation.error.errors }, 'Invalid vote data');
    return NextResponse.json(
      { error: "Invalid input", details: validation.error.errors },
      { status: 400 }
    );
  }

  const { targetType, targetId, value } = validation.data;
  
  logger.debug({ userId: session.user.id, targetType, targetId, value }, 'Processing vote');

    // Verify target exists
    if (targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    } else if (targetType === "COMMENT") {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_targetId_targetType: {
          userId: session.user.id,
          targetId,
          targetType,
        },
      },
    });

    let updatedVoteScore = 0;

    if (value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: {
            userId_targetId_targetType: {
              userId: session.user.id,
              targetId,
              targetType,
            },
          },
        });

        // Update target vote score
        const scoreChange = -existingVote.value;
        if (targetType === "POST") {
          const post = await prisma.post.update({
            where: { id: targetId },
            data: { voteScore: { increment: scoreChange } },
            select: { voteScore: true },
          });
          updatedVoteScore = post.voteScore;
        } else {
          const comment = await prisma.comment.update({
            where: { id: targetId },
            data: { voteScore: { increment: scoreChange } },
            select: { voteScore: true },
          });
          updatedVoteScore = comment.voteScore;
        }
      }
    } else {
      // Create or update vote
      const oldValue = existingVote?.value || 0;
      const scoreChange = value - oldValue;

      await prisma.vote.upsert({
        where: {
          userId_targetId_targetType: {
            userId: session.user.id,
            targetId,
            targetType,
          },
        },
        create: {
          userId: session.user.id,
          targetType,
          targetId,
          value,
        },
        update: {
          value,
        },
      });

      // Update target vote score
      if (targetType === "POST") {
        const post = await prisma.post.update({
          where: { id: targetId },
          data: { voteScore: { increment: scoreChange } },
          select: { voteScore: true },
        });
        updatedVoteScore = post.voteScore;
      } else {
        const comment = await prisma.comment.update({
          where: { id: targetId },
          data: { voteScore: { increment: scoreChange } },
          select: { voteScore: true },
        });
        updatedVoteScore = comment.voteScore;
      }
    }

    // Invalidate caches
    if (targetType === "POST") {
      await invalidateCache("posts:*", { prefix: "posts" });
    }

    logger.info({ 
      userId: session.user.id, 
      targetType, 
      targetId, 
      value, 
      voteScore: updatedVoteScore 
    }, 'Vote processed successfully');
    
    return NextResponse.json({
      success: true,
      voteScore: updatedVoteScore,
      userVote: value,
    });
}, { method: 'POST', routeName: '/api/votes' });
