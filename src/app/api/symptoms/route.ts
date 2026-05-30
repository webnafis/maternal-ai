import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveSymptomLog, getSymptomLogsForUser } from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔔 UPDATE: Added 'await' since database queries are asynchronous now
  const logs = await getSymptomLogsForUser(session.user.id, 14);
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { symptoms, week, save } = await req.json();

  if (!symptoms || symptoms.length === 0) {
    return NextResponse.json({
      severity: "safe",
      analysis: "✅ No symptoms selected. Great — keep monitoring daily!",
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

  let severity = hasDanger ? "danger" : hasWarn ? "warn" : "safe";
  let aiAnalysis = "";

  // Get AI analysis
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

End with one actionable recommendation. Keep it under 80 words total.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Updated to a valid Sonnet identifier
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    aiAnalysis = (message.content[0] as any).text;
  } catch (error) {
    console.error("Symptom AI analysis generation failed:", error);
    aiAnalysis = hasDanger
      ? "🚨 These symptoms require immediate medical attention. Please contact your doctor or emergency services right away."
      : hasWarn
      ? "⚠️ These symptoms warrant professional evaluation. Please contact your healthcare provider today."
      : "✅ These symptoms are typically normal in pregnancy. Rest, stay hydrated, and mention them at your next check-up.";
  }

  if (save) {
    const date = getTodayDate();
    // 🔔 UPDATE: Added 'await' to ensure the record safely saves to Neon before replying
    await saveSymptomLog(session.user.id, date, symptoms, severity, aiAnalysis);
  }

  return NextResponse.json({ severity, analysis: aiAnalysis });
}
