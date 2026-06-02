import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getMoodEntriesForUser,
  getMoodEntryForDate,
  upsertMoodEntry,
} from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (date) {
    const entry = await getMoodEntryForDate(session.user.id, date);
    return NextResponse.json({ entry: entry || null });
  }

  const entries = await getMoodEntriesForUser(session.user.id, 30);
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: {
    moodEmoji: string;
    moodLabel: string;
    moodScore: number;
    journal: string;
    week: number;
  } = await req.json();
  const { moodEmoji, moodLabel, moodScore, week } = body;
  let journal = body.journal;
  const date = getTodayDate();

  let aiFeedback = "";

  try {
    const parts: string[] = [];
    if (moodLabel) parts.push(`mood: ${moodLabel} (${moodEmoji})`);
    if (journal) {
      parts.push(`journal: "${journal}"`);
    } else {
      journal = "nothing added";
    }
    // if (phqScore !== undefined) parts.push(`PHQ-5 score: ${phqScore}/20`);

    if (parts.length > 0) {
      const prompt = `You are a compassionate maternal mental health support AI. A pregnant woman at week ${
        week || "unknown"
      } has logged: ${parts.join(", ")}.

Provide warm, supportive feedback in 2-3 sentences. Be empathetic and encouraging. If PHQ score is high (>9), gently suggest professional support. Keep it under 60 words.`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 150,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });

      aiFeedback = response.choices[0]?.message?.content?.trim() || "";
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
        ? tips[moodScore] ??
          "You are doing great. Keep tracking your mood daily."
        : "Thank you for logging your mood today.";
  }

  await upsertMoodEntry(session.user.id, date, {
    moodEmoji,
    moodLabel,
    moodScore,
    journal,
    // phqScore: phqScore !== undefined ? phqScore : undefined,
    aiFeedback,
  });

  return NextResponse.json({ success: true, aiFeedback, date });
}
