import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveSymptomLog, getSymptomLogsForUser } from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await getSymptomLogsForUser(session.user.id, 14);
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { symptoms, week, save, cachedSeverity, cachedAnalysis } =
    await req.json();
  if (save && cachedSeverity && cachedAnalysis) {
    const date = getTodayDate();
    await saveSymptomLog(
      session.user.id,
      date,
      symptoms,
      cachedSeverity,
      cachedAnalysis
    );
    return NextResponse.json({
      severity: cachedSeverity,
      analysis: cachedAnalysis,
    });
  }
  if (!symptoms || symptoms.length === 0) {
    return NextResponse.json({
      severity: "safe",
      analysis: "✅ No symptoms selected. Great — keep monitoring daily!",
    });
  }

  // If saving and we already have the generated result, just persist it — no re-generation
  if (save && cachedSeverity && cachedAnalysis) {
    const date = getTodayDate();
    await saveSymptomLog(
      session.user.id,
      date,
      symptoms,
      cachedSeverity,
      cachedAnalysis
    );
    return NextResponse.json({
      severity: cachedSeverity,
      analysis: cachedAnalysis,
    });
  }

  const dangerous = [
    "Heavy Bleeding",
    "Severe Pain",
    "No Movement",
    "Vision Change",
  ];
  const warning = ["Headache", "Cramping", "Spotting", "Swelling", "Fever"];

  const hasDanger = symptoms.some((s: string) =>
    dangerous.some((d) => s.includes(d))
  );
  const hasWarn = symptoms.some((s: string) =>
    warning.some((w) => s.includes(w))
  );

  const severity = hasDanger ? "danger" : hasWarn ? "warn" : "safe";
  let aiAnalysis = "";

  try {
    const prompt = `You are a maternal health AI assistant. A pregnant woman at week ${
      week || "unknown"
    } reports these symptoms: ${symptoms.join(", ")}.

Provide a brief, empathetic 2-3 sentence assessment. Be medically accurate but compassionate.
${
  hasDanger
    ? "This is URGENT - emphasize she should seek immediate medical attention."
    : ""
}
${hasWarn ? "These need medical evaluation soon." : ""}
${severity === "safe" ? "These are generally normal pregnancy symptoms." : ""}

End with one actionable recommendation. Keep it under 100 words total.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    aiAnalysis = response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Symptom AI analysis generation failed:", error);
    aiAnalysis = hasDanger
      ? "🚨 These symptoms require immediate medical attention. Please contact your doctor or emergency services right away."
      : hasWarn
      ? "⚠️ These symptoms warrant professional evaluation. Please contact your healthcare provider today."
      : "✅ These symptoms are typically normal in pregnancy. Rest, stay hydrated, and mention them at your next check-up.";
  }

  // analyze-only call — just return, don't save
  return NextResponse.json({ severity, analysis: aiAnalysis });
}
