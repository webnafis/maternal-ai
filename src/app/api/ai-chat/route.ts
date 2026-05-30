import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChatHistory, saveChatMessage, clearChatHistory } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Bloom, a warm and knowledgeable AI maternal health companion. You help pregnant women with health information, emotional support, and guidance throughout their pregnancy journey.

Guidelines:
- Be warm, empathetic, and supportive — like a knowledgeable friend
- Provide evidence-based maternal health information
- Always remind users that you're not a substitute for professional medical care
- For urgent/dangerous symptoms (heavy bleeding, severe pain, no fetal movement, vision changes), ALWAYS recommend immediate medical attention
- Keep responses concise (2-4 paragraphs max) unless more detail is needed
- Use pregnancy-relevant emojis occasionally for warmth 🌸
- Focus on: pregnancy symptoms, nutrition, emotional support, baby development, prenatal care`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  const history = await getChatHistory(session.user.id, 50);
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, week } = await req.json();
  if (!message?.trim())
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  const history = await getChatHistory(session.user.id, 20);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Updated to a valid Sonnet identifier
      max_tokens: 500,
      system:
        SYSTEM_PROMPT +
        (week ? `\n\nThe user is currently at week ${week} of pregnancy.` : ""),
      messages,
    });

    const reply = (response.content[0] as any).text;

    // 🔔 UPDATE: Added 'await' to ensure operations finish sequentially
    await saveChatMessage(session.user.id, "user", message);
    await saveChatMessage(session.user.id, "assistant", reply);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({
      reply:
        "I'm having trouble connecting right now. Please try again in a moment. If you have urgent concerns, please contact your healthcare provider. 💙",
    });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  await clearChatHistory(session.user.id);
  return NextResponse.json({ success: true });
}
