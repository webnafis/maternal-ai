import { resolveLocalizedAiText } from "@/lib/ai-language";
import type { AppLanguage } from "@/lib/i18n/types";
import { normalizeLanguage } from "@/lib/i18n/types";
import {
  updateSymptomLogI18n,
  updateMoodEntryI18n,
  updateChatMessageI18n,
  type SymptomLog,
  type MoodEntry,
  type ChatMessage,
} from "@/lib/db";

export async function localizeSymptomLogs(
  logs: SymptomLog[],
  targetLang: AppLanguage
) {
  return Promise.all(
    logs.map(async (log) => {
      if (!log.ai_analysis) return log;
      const localized = await resolveLocalizedAiText(
        log.ai_analysis,
        log.ai_analysis_i18n ?? null,
        targetLang,
        normalizeLanguage(log.source_lang),
        async (serialized) => {
          await updateSymptomLogI18n(log.id, serialized);
        }
      );
      return { ...log, ai_analysis: localized };
    })
  );
}

export async function localizeMoodEntries(
  entries: MoodEntry[],
  targetLang: AppLanguage
) {
  return Promise.all(
    entries.map(async (entry) => {
      if (!entry.ai_feedback) return entry;
      const localized = await resolveLocalizedAiText(
        entry.ai_feedback,
        entry.ai_feedback_i18n ?? null,
        targetLang,
        normalizeLanguage(entry.source_lang),
        async (serialized) => {
          await updateMoodEntryI18n(entry.id, serialized);
        }
      );
      return { ...entry, ai_feedback: localized };
    })
  );
}

export async function localizeChatHistory(
  messages: ChatMessage[],
  targetLang: AppLanguage
) {
  return Promise.all(
    messages.map(async (msg) => {
      if (msg.role !== "assistant") return msg;
      const localized = await resolveLocalizedAiText(
        msg.content,
        msg.content_i18n ?? null,
        targetLang,
        normalizeLanguage(msg.source_lang),
        async (serialized) => {
          await updateChatMessageI18n(msg.id, serialized);
        }
      );
      return { ...msg, content: localized ?? msg.content };
    })
  );
}
