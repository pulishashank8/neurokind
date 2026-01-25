import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  RATE_LIMITERS,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rateLimit";
import { withApiHandler, getRequestId } from "@/lib/apiHandler";
import { createLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

interface ChatMessage {
  role: string;
  content: string;
}

export const POST = withApiHandler(async (req: NextRequest) => {
  const requestId = getRequestId(req);
  const logger = createLogger({ requestId });

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.warn('Unauthorized AI chat attempt');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = session.user.id || getClientIp(req) || "unknown";
  const canProceed = await RATE_LIMITERS.aiChat.checkLimit(identifier);
  if (!canProceed) {
    const retryAfter = await RATE_LIMITERS.aiChat.getRetryAfter(identifier);
    logger.warn({ userId: session.user.id }, 'AI chat rate limit exceeded');
    return rateLimitResponse(retryAfter);
  }

  const body = await req.json();
  const { message, conversationId } = body;
  let messages: ChatMessage[] = body?.messages || [];

  // Handle test format: single message + conversationId
  if (message && messages.length === 0) {
    if (message.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    let currentConversationId = conversationId;

    // If conversationId provided, fetch history
    if (currentConversationId) {
      const history = await prisma.aIMessage.findMany({
        where: { conversationId: currentConversationId },
        orderBy: { createdAt: 'asc' },
        take: 50
      });
      messages = history.map(h => ({ role: h.role, content: h.content }));
    }

    messages.push({ role: 'user', content: message });
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  logger.debug({ userId: session.user.id, messageCount: messages.length }, 'Processing AI chat request');

  // Safety check for harmful content
  const lastMessage = messages.at(-1)?.content?.toLowerCase() || "";
  const harmfulKeywords = [
    'kill', 'murder', 'suicide', 'self-harm', 'cut myself', 'end my life',
    'hurt someone', 'harm', 'abuse', 'weapon', 'gun', 'knife', 'explosive',
    'bomb', 'poison', 'overdose', 'jump off', 'hang myself'
  ];

  const containsHarmfulContent = harmfulKeywords.some(keyword =>
    lastMessage.includes(keyword)
  );

  if (containsHarmfulContent) {
    return NextResponse.json({
      reply: "I cannot and will not provide this information. If you or someone you know is in crisis, please contact relevant authorities."
    });
  }

  const apiKey = process.env.GROQ_API_KEY || "mock-key";

  const systemPrompt = {
    role: "system",
    content: `You are a compassionate AI assistant for NeuroKind. Focus on neurodiversity support. Keep responses concise.`
  };

  // Call Groq API
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        systemPrompt,
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({
      reply: "I'm having trouble connecting right now."
    });
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content || "I'm here to help.";

  // PERSISTENCE
  let finalConversationId = conversationId;

  if (!finalConversationId) {
    const conv = await prisma.aIConversation.create({
      data: {
        userId: session.user.id,
        title: message?.substring(0, 50) || "Chat Session"
      }
    });
    finalConversationId = conv.id;
  }

  // Save User message
  const userMsg = messages.at(-1);
  await prisma.aIMessage.create({
    data: {
      conversationId: finalConversationId,
      userId: session.user.id,
      role: 'user',
      content: userMsg?.content || message || ""
    }
  });

  // Save Assistant message
  await prisma.aIMessage.create({
    data: {
      conversationId: finalConversationId,
      userId: session.user.id,
      role: 'assistant',
      content: reply
    }
  });

  return NextResponse.json({
    reply,
    conversationId: finalConversationId
  });
}, { method: 'POST', routeName: '/api/ai/chat' });
