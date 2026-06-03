import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveSymptomLog, getSymptomLogsForUser } from "@/lib/db";
import { getTodayDate } from "@/lib/utils";
import { appendLanguageToPrompt, setI18nEntry } from "@/lib/ai-language";
import { serializeI18nMap } from "@/lib/i18n/types";
import {
  DANGEROUS_SYMPTOM_IDS,
  WARNING_SYMPTOM_IDS,
  getSymptomLabel,
} from "@/lib/i18n/content";
import type { AppLanguage } from "@/lib/i18n/types";
import { getSessionUserLanguage } from "@/lib/user-language";
import { localizeSymptomLogs } from "@/lib/resolve-ai-i18n";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function resolveSeverity(symptomIds: string[]) {
  const hasDanger = symptomIds.some((s) => DANGEROUS_SYMPTOM_IDS.includes(s));
  const hasWarn = symptomIds.some((s) => WARNING_SYMPTOM_IDS.includes(s));
  const severity = hasDanger ? "danger" : hasWarn ? "warn" : "safe";
  return { hasDanger, hasWarn, severity };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const langCtx = await getSessionUserLanguage();
  const logs = await getSymptomLogsForUser(session.user.id, 14);
  const localized = langCtx
    ? await localizeSymptomLogs(logs, langCtx.language)
    : logs;
  return NextResponse.json({ logs: localized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const langCtx = await getSessionUserLanguage();
  const language: AppLanguage = langCtx?.language ?? "en";

  const { symptoms, symptomIds, week, save, cachedSeverity, cachedAnalysis } =
    await req.json();

  const ids: string[] =
    symptomIds?.length > 0
      ? symptomIds
      : (symptoms as string[])?.map((s: string) => s) || [];

  if (save && cachedSeverity && cachedAnalysis) {
    const date = getTodayDate();
    const i18n = serializeI18nMap(setI18nEntry({}, language, cachedAnalysis));
    await saveSymptomLog(
      session.user.id,
      date,
      ids,
      cachedSeverity,
      cachedAnalysis,
      i18n,
      language
    );
    return NextResponse.json({
      severity: cachedSeverity,
      analysis: cachedAnalysis,
    });
  }

  if (!ids || ids.length === 0) {
    const noMsg =
      language === "bn"
        ? "✅ কোনো লক্ষণ নির্বাচন করা হয়নি। চমৎকার — প্রতিদিন পর্যবেক্ষণ করুন!"
        : "✅ No symptoms selected. Great — keep monitoring daily!";
    return NextResponse.json({ severity: "safe", analysis: noMsg });
  }

  const { hasDanger, hasWarn, severity } = resolveSeverity(ids);
  const symptomLabels = ids.map((id) => getSymptomLabel(id, language));
  let aiAnalysis = "";

  try {
    const basePrompt = `You are a maternal health AI assistant. A pregnant woman at week ${
      week || "unknown"
    } reports these symptoms: ${symptomLabels.join(", ")}.

Provide a brief, empathetic 2-3 sentence assessment. Be medically accurate but compassionate.
${
  hasDanger
    ? "This is URGENT - emphasize she should seek immediate medical attention."
    : ""
}
${hasWarn ? "These need medical evaluation soon." : ""}
${severity === "safe" ? "These are generally normal pregnancy symptoms." : ""}

End with one actionable recommendation. Keep it under 100 words total.`;

    const prompt = appendLanguageToPrompt(basePrompt, language);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    aiAnalysis = response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Symptom AI analysis generation failed:", error);
    if (language === "bn") {
      aiAnalysis = hasDanger
        ? "🚨 এই লক্ষণগুলোর জন্য তাৎক্ষণিক চিকিৎসা প্রয়োজন। অনুগ্রহ করে ডাক্তার বা জরুরি সেবায় যোগাযোগ করুন।"
        : hasWarn
        ? "⚠️ এই লক্ষণগুলো পেশাদার মূল্যায়ন প্রয়োজন। আজই স্বাস্থ্যসেবা প্রদানকারীর সাথে যোগাযোগ করুন।"
        : "✅ এই লক্ষণগুলো সাধারণত গর্ভাবস্থায় স্বাভাবিক। বিশ্রাম নিন, হাইড্রেটেড থাকুন এবং পরবর্তী চেক-আপে উল্লেখ করুন।";
    } else {
      aiAnalysis = hasDanger
        ? "🚨 These symptoms require immediate medical attention. Please contact your doctor or emergency services right away."
        : hasWarn
        ? "⚠️ These symptoms warrant professional evaluation. Please contact your healthcare provider today."
        : "✅ These symptoms are typically normal in pregnancy. Rest, stay hydrated, and mention them at your next check-up.";
    }
  }

  if (save) {
    const date = getTodayDate();
    const i18n = serializeI18nMap(setI18nEntry({}, language, aiAnalysis));
    await saveSymptomLog(
      session.user.id,
      date,
      ids,
      severity,
      aiAnalysis,
      i18n,
      language
    );
  }

  return NextResponse.json({ severity, analysis: aiAnalysis });
}
