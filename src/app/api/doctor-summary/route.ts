import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserById,
  getMoodEntriesForUser,
  getSymptomLogsForUser,
  getVaccinationRecords,
} from "@/lib/db";
import { getTrimester, getProgress, getDaysLeft, VACCINES } from "@/lib/utils";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch user profile first to ensure they exist before executing other database requests
  const user = await getUserById(session.user.id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Run all secondary asynchronous database queries in parallel for optimal speed
  const [moodEntries, symptomLogs, vaccRecords] = await Promise.all([
    getMoodEntriesForUser(session.user.id, 7),
    getSymptomLogsForUser(session.user.id, 7),
    getVaccinationRecords(session.user.id),
  ]);

  const week = user.pregnancy_week;
  const trimester = getTrimester(week);
  const progress = getProgress(week);
  const daysLeft = getDaysLeft(week);

  const vaccMap = new Map(vaccRecords.map((r) => [r.vaccine_id, r.status]));

  const doneVaccines = VACCINES.filter((v) => vaccMap.get(v.id) === "done").map(
    (v) => v.name
  );
  const dueVaccines = VACCINES.filter((v) => vaccMap.get(v.id) === "due").map(
    (v) => v.name
  );

  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- Build structured data for UI ---

  // Full 7-day mood log for UI
  const moodLog = moodEntries.map((m) => ({
    date: m.date,
    emoji: m.mood_emoji,
    label: m.mood_label,
  }));

  // Full symptom log with date + severity for UI
  const symptomLog = symptomLogs.map((s) => ({
    date: s.date,
    symptoms: s.symptoms as string[],
    // severity: s.severity as "safe" | "warn" | "danger",
  }));

  // --- Build rich AI context strings ---

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

  // Generate AI recommendations via Groq
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
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 450,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `You are a clinical maternal health assistant generating a concise doctor visit summary.
Provide exactly 3-4 numbered, specific, and actionable clinical recommendations based on the patient data provided.
Analyze mood trends across all days, symptom patterns and severity, vaccination status, and gestational stage.
Use clinical language appropriate for a physician's pre-visit review.
Format as a plain numbered list (1. 2. 3. 4.) — do not use markdown headers, bullet dashes, or special characters.
Keep the total response under 350 words.`,
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
        : "4. Review hydration, rest patterns, and nutritional intake for third-trimester readiness.",
    ].join("\n");
  }

  const summary = {
    patient: user.name,
    week: `${week}/40 — ${trimester} Trimester`,
    progress: `${progress}% complete — ${daysLeft} days until estimated due date`,
    dueDate: user.due_date || "Not set",
    vaccinations:
      [
        ...doneVaccines.map((v) => `✅ ${v}`),
        ...dueVaccines.map((v) => `⏰ ${v} (Due)`),
      ].join(", ") || "No records",
    // Structured arrays for rich UI rendering
    moodLog,
    symptomLog,
    aiRecommendations,
    nextAppointment:
      week < 28
        ? "Monthly prenatal check-up recommended"
        : week < 36
        ? "Every 2-week check-up recommended"
        : "Weekly check-up recommended",
    generatedAt,
  };

  return NextResponse.json({ summary });
}
