import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChatHistory, saveChatMessage, clearChatHistory } from "@/lib/db";
import { appendLanguageToPrompt, setI18nEntry } from "@/lib/ai-language";
import { serializeI18nMap } from "@/lib/i18n/types";
import { getSessionUserLanguage } from "@/lib/user-language";
import { localizeChatHistory } from "@/lib/resolve-ai-i18n";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are JotnoAI, a warm and knowledgeable AI maternal health companion. You help pregnant women with health information, emotional support, and guidance throughout their pregnancy journey.

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

  const langCtx = await getSessionUserLanguage();
  const history = await getChatHistory(session.user.id, 50);
  const localized = langCtx
    ? await localizeChatHistory(history, langCtx.language)
    : history;
  return NextResponse.json({ history: localized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const langCtx = await getSessionUserLanguage();
  const language = langCtx?.language ?? "en";

  const { message, week } = await req.json();
  if (!message?.trim())
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const history = await getChatHistory(session.user.id, 20);

  const finalSystemPrompt = appendLanguageToPrompt(
    SYSTEM_PROMPT +
      (week ? `\n\nThe user is currently at week ${week} of pregnancy.` : ""),
    language
  );

  const messages = [
    { role: "system", content: finalSystemPrompt },
    ...history.map((h) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || "";
    const i18n = serializeI18nMap(setI18nEntry({}, language, reply));

    await saveChatMessage(session.user.id, "user", message);
    await saveChatMessage(session.user.id, "assistant", reply, i18n, language);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Groq AI chat error:", error);
    const fallback =
      language === "bn"
        ? "এখন সংযোগে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন। জরুরি হলে স্বাস্থ্যসেবা প্রদানকারীর সাথে যোগাযোগ করুন। 💙"
        : "I'm having trouble connecting right now. Please try again in a moment. If you have urgent concerns, please contact your healthcare provider. 💙";
    return NextResponse.json({ reply: fallback });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await clearChatHistory(session.user.id);
  return NextResponse.json({ success: true });
}
