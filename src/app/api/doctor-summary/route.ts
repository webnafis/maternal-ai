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
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔔 UPDATE: Fetch user profile first to ensure they exist before executing other database requests
  const user = await getUserById(session.user.id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 🔔 UPDATE: Run all secondary asynchronous database queries in parallel for optimal speed
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

  const recentMood = moodEntries[0];
  const recentSymptoms = symptomLogs.flatMap((s) => s.symptoms).slice(0, 10);
  const doneVaccines = VACCINES.filter((v) => vaccMap.get(v.id) === "done").map(
    (v) => v.name
  );
  const dueVaccines = VACCINES.filter((v) => vaccMap.get(v.id) === "due").map(
    (v) => v.name
  );

  // Generate AI recommendations
  let aiRecommendations = "";
  try {
    const context = `
Patient: ${user.name}
Pregnancy week: ${week}/40 (${trimester} trimester)
Recent mood: ${
      recentMood
        ? `${recentMood.mood_emoji} ${recentMood.mood_label}`
        : "Not logged"
    }
Recent symptoms: ${
      recentSymptoms.length > 0 ? recentSymptoms.join(", ") : "None reported"
    }
Vaccinations done: ${doneVaccines.join(", ") || "None"}
Due vaccinations: ${dueVaccines.join(", ") || "None"}
`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Updated to a valid Sonnet identifier
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Based on this maternal health data, provide 3-4 specific, actionable recommendations for the doctor visit. Be concise and clinically relevant:\n${context}`,
        },
      ],
    });

    aiRecommendations = (response.content[0] as any).text;
  } catch (error) {
    console.error("Doctor summary AI generation failed:", error);
    aiRecommendations = `Maintain ${
      trimester === "1st" ? "folic acid" : "iron"
    } supplementation, ensure regular prenatal check-ups, monitor fetal movements daily${
      dueVaccines.length > 0 ? `, schedule: ${dueVaccines.join(", ")}` : ""
    }.`;
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
    recentMood: recentMood
      ? `${recentMood.mood_emoji} ${recentMood.mood_label} (${recentMood.date})`
      : "Not logged",
    symptomsReported:
      recentSymptoms.length > 0
        ? recentSymptoms.slice(0, 6).join(", ")
        : "None reported recently",
    aiRecommendations,
    nextAppointment:
      week < 28
        ? "Monthly prenatal check-up recommended"
        : week < 36
        ? "Every 2-week check-up recommended"
        : "Weekly check-up recommended",
    generatedAt: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return NextResponse.json({ summary });
}
