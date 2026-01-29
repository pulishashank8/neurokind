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

  const apiKey = process.env.GROQ_API_KEY;

  // Validate API key is configured
  if (!apiKey || apiKey === "mock-key") {
    logger.error('GROQ_API_KEY is not configured');
    return NextResponse.json({
      reply: "The AI assistant is being configured. Please try again shortly or explore our community resources.",
      error: "configuration_pending"
    });
  }

  const systemPrompt = {
    role: "system",
    content: `You are NeuroAI, a compassionate AI assistant for NeuroKind - supporting autistic children and their families.

Your purpose:
- Provide supportive, understanding responses about autism and neurodiversity
- Help parents understand their child's needs and behaviors
- Offer evidence-based strategies for daily challenges
- Connect families with appropriate resources
- Never provide medical diagnoses or replace professional healthcare advice

Guidelines:
- Use clear, simple language
- Be patient and non-judgmental
- Acknowledge emotions and validate experiences
- Focus on strengths-based approaches
- Keep responses concise but helpful`
  };

  let reply = "";
  let apiError = false;

  // Call Groq API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.text();
      logger.error({ status: res.status, body: errorBody }, 'Groq API error');
      apiError = true;
    } else {
      const data = await res.json();
      reply = data?.choices?.[0]?.message?.content || "";
    }
  } catch (err: any) {
    logger.error({ error: err.message }, 'Failed to call Groq API');
    apiError = true;
  }

  // Provide contextual fallback responses if API fails
  if (apiError || !reply) {
    const lastUserMessage = messages.at(-1)?.content?.toLowerCase() || "";

    if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
      reply = "Hello! I'm NeuroAI, here to support you. While I'm experiencing some connection issues, I'm still here to listen. How can I help you today?";
    } else if (lastUserMessage.includes('help') || lastUserMessage.includes('support')) {
      reply = "I understand you're looking for support. Our community forum is a great place where parents share experiences and advice. You can also check our resources section for helpful guides. Is there something specific I can try to help with?";
    } else if (lastUserMessage.includes('autism') || lastUserMessage.includes('autistic')) {
      reply = "Autism is a neurodevelopmental difference that affects how people perceive and interact with the world. Every autistic person is unique with their own strengths and challenges. Our resource library has excellent information about understanding and supporting autistic children.";
    } else if (lastUserMessage.includes('meltdown') || lastUserMessage.includes('overwhelm')) {
      reply = "Meltdowns can be challenging for both the child and caregivers. They're often a response to sensory or emotional overload. Key strategies include: creating a calm, safe space; reducing sensory input; staying calm yourself; and giving them time to recover.";
    } else if (lastUserMessage.includes('school') || lastUserMessage.includes('education')) {
      reply = "Education support for autistic children often involves working with the school to create accommodations. Consider requesting an IEP (Individualized Education Program) meeting. Our resources section has guides on advocating for your child's educational needs.";
    } else if (lastUserMessage.includes('sleep') || lastUserMessage.includes('bedtime')) {
      reply = "Sleep challenges are common in autistic children. Establishing consistent routines, creating a calm sensory environment, and using visual schedules can help. Some families find weighted blankets or white noise helpful. Consult your healthcare provider for persistent issues.";
    } else {
      reply = "I'm experiencing some connection difficulties, but I'm still here to help. Our community forum and resource library are great places to find support. Please try your question again, or explore our other resources in the meantime.";
    }
  }

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
