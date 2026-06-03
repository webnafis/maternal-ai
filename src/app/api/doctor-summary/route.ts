import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserById,
  getMoodEntriesForUser,
  getSymptomLogsForUser,
  getVaccinationRecords,
} from "@/lib/db";
import { getTrimester, getProgress, getDaysLeft } from "@/lib/utils";
import { getLocalizedVaccines } from "@/lib/i18n/content";
import { appendLanguageToPrompt } from "@/lib/ai-language";
import { normalizeLanguage } from "@/lib/i18n/types";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(session.user.id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const language = normalizeLanguage(user.language);

  const [moodEntries, symptomLogs, vaccRecords] = await Promise.all([
    getMoodEntriesForUser(session.user.id, 7),
    getSymptomLogsForUser(session.user.id, 7),
    getVaccinationRecords(session.user.id),
  ]);

  const week = user.pregnancy_week;
  const vaccines = getLocalizedVaccines(language);
  const trimester = getTrimester(week);
  const progress = getProgress(week);
  const daysLeft = getDaysLeft(week);

  const vaccMap = new Map(vaccRecords.map((r) => [r.vaccine_id, r.status]));

  const getVaccineStatus = (vaccineId: string, eligibleFromWeek: number) => {
    if (vaccMap.has(vaccineId)) return vaccMap.get(vaccineId) as string;
    if (week >= eligibleFromWeek) return "due";
    return "upcoming";
  };

  const doneVaccines = vaccines
    .filter((v) => getVaccineStatus(v.id, v.eligibleFromWeek) === "done")
    .map((v) => v.name);

  const dueVaccines = vaccines
    .filter((v) => getVaccineStatus(v.id, v.eligibleFromWeek) === "due")
    .map((v) => v.name);

  const upcomingVaccines = vaccines
    .filter((v) => getVaccineStatus(v.id, v.eligibleFromWeek) === "upcoming")
    .map((v) => v.name);

  const generatedAt = new Date().toLocaleDateString(
    language === "bn" ? "bn-BD" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const moodLog = moodEntries.map((m) => ({
    date: m.date,
    emoji: m.mood_emoji,
    label: m.mood_label,
    score: m.mood_score,
  }));

  const symptomLog = symptomLogs.map((s) => ({
    date: s.date,
    symptoms: s.symptoms as string[],
  }));

  const moodContextLines =
    moodEntries.length > 0
      ? moodEntries
          .map((m) => `  • ${m.date}: ${m.mood_emoji} ${m.mood_label}`)
          .join("\n")
      : "  No mood entries logged in the past 7 days.";

  const symptomContextLines =
    symptomLogs.length > 0
      ? symptomLogs
          .map(
            (s) =>
              `  • ${s.date} [${s.severity}]: ${(s.symptoms as string[]).join(
                ", "
              )}`
          )
          .join("\n")
      : "  No symptoms reported in the past 7 days.";

  let aiRecommendations = "";
  try {
    const context = `
Patient Name: ${user.name}
Pregnancy Week: ${week}/40 (${trimester} Trimester)
Estimated Due Date (EDD): ${user.due_date || "Not set"}
Report Generated On: ${generatedAt}

Mood Log — Last 7 Days:
${moodContextLines}

Symptom Log — Last 7 Days:
${symptomContextLines}

Vaccinations Completed: ${doneVaccines.join(", ") || "None"}
Vaccinations Due: ${dueVaccines.join(", ") || "None"}
Vaccinations Upcoming: ${upcomingVaccines.join(", ") || "None"}
`;

    const systemBase = `You are a clinical maternal health assistant generating a concise doctor visit summary.
Provide exactly 3-4 numbered, specific, and actionable clinical recommendations based on the patient data provided.
Analyze mood trends across all days, symptom patterns and severity, vaccination status, and gestational stage.
Use clinical language appropriate for a physician's pre-visit review.
Format as a plain numbered list (1. 2. 3. 4.) — do not use markdown headers, bullet dashes, or special characters.
Keep the total response under 350 words.
CRITICAL: You MUST complete every recommendation fully. Do NOT truncate or cut off mid-sentence. Every numbered item must be a complete, well-formed sentence or paragraph.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: appendLanguageToPrompt(systemBase, language),
        },
        {
          role: "user",
          content: `Based on the following maternal health data, provide 3-4 specific and actionable recommendations for the upcoming doctor visit:\n${context}`,
        },
      ],
    });

    aiRecommendations = response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq AI doctor summary generation failed:", error);
    if (language === "bn") {
      aiRecommendations = [
        `1. ${
          trimester === "1st"
            ? "ফলিক অ্যাসিড (৪০০–৮০০ মাইক্রোগ্রাম)"
            : "লৌহ (২৭ মিগ্রা)"
        } সম্পূরক গর্ভাবস্থার নির্দেশিকা অনুযায়ী চালিয়ে যান।`,
        "2. WHO ও DGHS বাংলাদেশ মাতৃস্বাস্থ্য প্রোটোকল অনুযায়ী নিয়মিত প্রসবপূর্ব পরীক্ষা নিশ্চিত করুন।",
        "3. প্রতিদিন ভ্রূণের নড়াচড়া পর্যবেক্ষণ করুন এবং কমে গেলে তাৎক্ষণিক জানান।",
        dueVaccines.length > 0
          ? `4. বিলম্বিত টিকা অবিলম্বে নিন: ${dueVaccines.join(", ")}.`
          : upcomingVaccines.length > 0
          ? `4. আসন্ন টিকার জন্য প্রস্তুতি নিন: ${upcomingVaccines.join(", ")}.`
          : "4. তৃতীয় ত্রৈমাসিকের জন্য হাইড্রেশন, বিশ্রাম ও পুষ্টি পর্যালোচনা করুন।",
      ].join("\n");
    } else {
      aiRecommendations = [
        `1. Maintain ${
          trimester === "1st" ? "folic acid (400–800 mcg)" : "iron (27 mg)"
        } supplementation per gestational stage guidelines.`,
        "2. Ensure regular prenatal check-ups in line with WHO and DGHS Bangladesh maternal protocols.",
        "3. Monitor fetal movements daily and report any reduction or cessation immediately.",
        dueVaccines.length > 0
          ? `4. Schedule overdue vaccinations without delay: ${dueVaccines.join(
              ", "
            )}.`
          : upcomingVaccines.length > 0
          ? `4. Prepare for upcoming vaccinations: ${upcomingVaccines.join(
              ", "
            )}.`
          : "4. Review hydration, rest patterns, and nutritional intake for third-trimester readiness.",
      ].join("\n");
    }
  }

  const trimesterLabel =
    language === "bn"
      ? trimester === "1st"
        ? "১ম"
        : trimester === "2nd"
        ? "২য়"
        : "৩য়"
      : trimester;
  const completedLbl = language === "bn" ? "সম্পন্ন" : "Completed";
  const dueLbl = language === "bn" ? "বাকি" : "Due";
  const upcomingLbl = language === "bn" ? "আসন্ন" : "Upcoming";
  const notSet = language === "bn" ? "নির্ধারিত নয়" : "Not set";
  const noRecords = language === "bn" ? "কোনো রেকর্ড নেই" : "No records";

  const summary = {
    patient: user.name,
    week:
      language === "bn"
        ? `${week}/40 — ${trimesterLabel} ত্রৈমাসিক`
        : `${week}/40 — ${trimester} Trimester`,
    progress:
      language === "bn"
        ? `${progress}% সম্পন্ন — আনুমানিক প্রসব তারিখ পর্যন্ত ${daysLeft} দিন`
        : `${progress}% complete — ${daysLeft} days until estimated due date`,
    dueDate: user.due_date || notSet,
    vaccinations:
      [
        ...doneVaccines.map((v) => `✅ ${v} (${completedLbl})`),
        ...dueVaccines.map((v) => `⏰ ${v} (${dueLbl})`),
        ...upcomingVaccines.map((v) => `🔜 ${v} (${upcomingLbl})`),
      ].join(", ") || noRecords,
    moodLog,
    symptomLog,
    aiRecommendations,
    nextAppointment:
      language === "bn"
        ? week < 28
          ? "মাসিক প্রসবপূর্ব পরীক্ষা সুপারিশকৃত"
          : week < 36
          ? "প্রতি ২ সপ্তাহে পরীক্ষা সুপারিশকৃত"
          : "সাপ্তাহিক পরীক্ষা সুপারিশকৃত"
        : week < 28
        ? "Monthly prenatal check-up recommended"
        : week < 36
        ? "Every 2-week check-up recommended"
        : "Weekly check-up recommended",
    generatedAt,
  };

  return NextResponse.json({ summary });
}
