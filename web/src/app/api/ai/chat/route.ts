import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback local response
      const last = messages[messages.length - 1]?.content || "";
      const reply = `I understand: "${last}". While I can't provide medical advice, here are some calming, practical tips: maintain routines, use visual supports, and celebrate small wins. Consider reaching out to local providers for specialized support.`;
      return NextResponse.json({ reply });
    }

    // Minimal REST call to OpenAI (GPT-4o-mini or similar) without adding new deps
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
      }),
    });
    const json = await res.json();
    const reply = json?.choices?.[0]?.message?.content || "I'm here to help with general guidance.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to process" }, { status: 500 });
  }
}
