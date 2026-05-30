import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getMoodEntriesForUser,
  getMoodEntryForDate,
  upsertMoodEntry,
} from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (date) {
    // 🔔 UPDATE: Added 'await' because database call is asynchronous now
    const entry = await getMoodEntryForDate(session.user.id, date);
    return NextResponse.json({ entry: entry || null });
  }

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  const entries = await getMoodEntriesForUser(session.user.id, 30);
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { moodEmoji, moodLabel, moodScore, journal, phqScore, week } = body;
  const date = getTodayDate();

  let aiFeedback = "";

  try {
    const parts = [];
    if (moodLabel) parts.push(`mood: ${moodLabel} (${moodEmoji})`);
    if (journal) parts.push(`journal: "${journal}"`);
    if (phqScore !== undefined) parts.push(`PHQ-5 score: ${phqScore}/20`);

    if (parts.length > 0) {
      const prompt = `You are a compassionate maternal mental health support AI. A pregnant woman at week ${
        week || "unknown"
      } has logged:
${parts.join(", ")}.

Provide warm, supportive feedback in 2-3 sentences. Be empathetic and encouraging. If PHQ score is high (>9), gently suggest professional support. Keep it under 60 words.`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022", // Updated to a valid Sonnet identifier
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });

      aiFeedback = (message.content[0] as any).text;
    }
  } catch (error) {
    console.error("Mood AI feedback generation failed:", error);
    const tips: Record<number, string> = {
      5: "You're glowing! Keep this positive energy. 🌟",
      4: "Great to hear you're doing well! Keep up healthy habits.",
      3: "It's okay to have neutral days. Be kind to yourself.",
      2: "Your feelings are valid. Consider talking to someone you trust. 💙",
      1: "Anxiety is common in pregnancy. If persistent, please speak to your doctor.",
    };
    aiFeedback =
      moodScore !== undefined
        ? tips[moodScore] ||
          "You are doing great. Keep tracking your mood daily."
        : "Thank you for logging your mood today.";
  }

  // 🔔 UPDATE: Added 'await' to ensure the record safely saves to Neon before replying
  await upsertMoodEntry(session.user.id, date, {
    moodEmoji,
    moodLabel,
    moodScore,
    journal,
    phqScore: phqScore !== undefined ? phqScore : undefined,
    aiFeedback,
  });

  return NextResponse.json({ success: true, aiFeedback, date });
}
