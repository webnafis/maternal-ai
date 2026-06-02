import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getMoodEntriesForUser,
  getMoodEntryForDate,
  upsertMoodEntry,
} from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import { appendLanguageToPrompt, setI18nEntry } from "@/lib/ai-language";
import { serializeI18nMap } from "@/lib/i18n/types";
import type { AppLanguage } from "@/lib/i18n/types";
import { getSessionUserLanguage } from "@/lib/user-language";
import { localizeMoodEntries } from "@/lib/resolve-ai-i18n";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const langCtx = await getSessionUserLanguage();
  const date = req.nextUrl.searchParams.get("date");

  if (date) {
    const entry = await getMoodEntryForDate(session.user.id, date);
    if (!entry) return NextResponse.json({ entry: null });
    const [localized] = langCtx
      ? await localizeMoodEntries([entry], langCtx.language)
      : [entry];
    return NextResponse.json({ entry: localized });
  }

  const entries = await getMoodEntriesForUser(session.user.id, 30);
  const localized = langCtx
    ? await localizeMoodEntries(entries, langCtx.language)
    : entries;
  return NextResponse.json({ entries: localized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const langCtx = await getSessionUserLanguage();
  const language: AppLanguage = langCtx?.language ?? "en";

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

    if (parts.length > 0) {
      const basePrompt = `You are a compassionate maternal mental health support AI. A pregnant woman at week ${
        week || "unknown"
      } has logged: ${parts.join(", ")}.

Provide warm, supportive feedback in 2-3 sentences. Be empathetic and encouraging. If PHQ score is high (>9), gently suggest professional support. Keep it under 60 words.`;

      const prompt = appendLanguageToPrompt(basePrompt, language);

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
    const tipsEn: Record<number, string> = {
      5: "You're glowing! Keep this positive energy. 🌟",
      4: "Great to hear you're doing well! Keep up healthy habits.",
      3: "It's okay to have neutral days. Be kind to yourself.",
      2: "Your feelings are valid. Consider talking to someone you trust. 💙",
      1: "Anxiety is common in pregnancy. If persistent, please speak to your doctor.",
    };
    const tipsBn: Record<number, string> = {
      5: "আপনি দারুণ লাগছেন! এই ইতিবাচক শক্তি ধরে রাখুন। 🌟",
      4: "ভালো শুনে ভালো লাগল! সুস্থ অভ্যাস চালিয়ে যান।",
      3: "নিরপেক্ষ দিন থাকা ঠিক আছে। নিজের প্রতি দয়ালু হন।",
      2: "আপনার অনুভূতি গুরুত্বপূর্ণ। বিশ্বস্ত কারো সাথে কথা বলার কথা ভাবুন। 💙",
      1: "গর্ভাবস্থায় উদ্বেগ সাধারণ। দীর্ঘস্থায়ী হলে ডাক্তারের সাথে কথা বলুন।",
    };
    const tips = language === "bn" ? tipsBn : tipsEn;
    aiFeedback =
      moodScore !== undefined
        ? tips[moodScore] ??
          (language === "bn"
            ? "আপনি ভালো করছেন। প্রতিদিন মেজাজ ট্র্যাক করুন।"
            : "You are doing great. Keep tracking your mood daily.")
        : language === "bn"
        ? "আজ মেজাজ লগ করার জন্য ধন্যবাদ।"
        : "Thank you for logging your mood today.";
  }

  const i18n = aiFeedback
    ? serializeI18nMap(setI18nEntry({}, language, aiFeedback))
    : undefined;

  await upsertMoodEntry(session.user.id, date, {
    moodEmoji,
    moodLabel,
    moodScore,
    journal,
    aiFeedback,
    aiFeedbackI18n: i18n,
    sourceLang: language,
  });

  return NextResponse.json({ success: true, aiFeedback, date });
}
