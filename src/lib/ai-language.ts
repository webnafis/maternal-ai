import Groq from "groq-sdk";
import {
  AppLanguage,
  I18nMap,
  parseI18nMap,
  serializeI18nMap,
} from "@/lib/i18n/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export function getLanguageInstruction(lang: AppLanguage): string {
  if (lang === "bn") {
    return `IMPORTANT: Write your ENTIRE response in Bengali (বাংলা) ONLY. Do NOT use any English words except medical abbreviations. Use simple, warm, caring language suitable for pregnant women in Bangladesh. Keep medical terms understandable. Every sentence must be in Bengali.`;
  }
  return `IMPORTANT: Write your ENTIRE response in English ONLY. Do NOT use any Bengali words. Use warm, caring language suitable for pregnant women.`;
}

export function appendLanguageToPrompt(
  basePrompt: string,
  lang: AppLanguage
): string {
  return `${basePrompt}\n\n${getLanguageInstruction(lang)}`;
}

export async function translateText(
  text: string,
  targetLang: AppLanguage
): Promise<string> {
  if (!text?.trim()) return text;

  const targetName = targetLang === "bn" ? "Bengali (বাংলা)" : "English";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a professional medical translator for a maternal health app. Translate the user's text to ${targetName} only. Preserve meaning, tone, emojis, and line breaks. Output ONLY the translation with no preamble.`,
        },
        { role: "user", content: text },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

/** Resolve AI text for display; translate on demand and optionally persist. */
export async function resolveLocalizedAiText(
  primaryText: string | null | undefined,
  i18nRaw: string | null | undefined,
  targetLang: AppLanguage,
  sourceLang: AppLanguage | null,
  onPersist?: (serialized: string, primary?: string) => Promise<void>
): Promise<string | null> {
  if (!primaryText?.trim()) return null;

  const map = parseI18nMap(i18nRaw);
  if (map[targetLang]?.trim()) return map[targetLang]!.trim();

  const inferredSource =
    sourceLang || (map.en && !map.bn ? "en" : map.bn && !map.en ? "bn" : "en");
  if (inferredSource === targetLang) {
    return primaryText.trim();
  }

  const sourceText = map[inferredSource]?.trim() || primaryText.trim();
  const translated = await translateText(sourceText, targetLang);
  const updated: I18nMap = {
    ...map,
    [inferredSource]: sourceText,
    [targetLang]: translated,
  };
  if (onPersist) {
    await onPersist(
      serializeI18nMap(updated),
      inferredSource === targetLang ? translated : primaryText
    );
  }
  return translated;
}

export function setI18nEntry(
  map: I18nMap,
  lang: AppLanguage,
  text: string
): I18nMap {
  return { ...map, [lang]: text };
}
