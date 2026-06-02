import type { AppLanguage } from "../types";
import en, { type Messages } from "./en";
import bn from "./bn";

const catalogs: Record<AppLanguage, Messages> = { en, bn };

export function getMessages(lang: AppLanguage): Messages {
  return catalogs[lang] || en;
}

/** Dot-path lookup, e.g. t(messages, 'nav.dashboard') */
export function translate(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let cur: string | Messages = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p] as string | Messages;
    } else {
      return key;
    }
  }
  if (typeof cur !== "string") return key;
  if (!vars) return cur;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    cur
  );
}

export type { Messages };
