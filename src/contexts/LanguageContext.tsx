"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { AppLanguage } from "@/lib/i18n/types";
import { normalizeLanguage } from "@/lib/i18n/types";
import { getMessages, translate, type Messages } from "@/lib/i18n/messages";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  switching: boolean;
  messages: Messages;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LANG_STORAGE_KEY = "jotno_lang";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): AppLanguage | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return stored ? normalizeLanguage(stored) : null;
}

export function LanguageProvider({
  children,
  initialLanguage,
  guestMode = false,
}: {
  children: React.ReactNode;
  initialLanguage?: string;
  /** When true, language is stored in localStorage only (login/signup). */
  guestMode?: boolean;
}) {
  const { data: session, update } = useSession();
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const stored = readStoredLanguage();
    if (stored) return stored;
    return normalizeLanguage(initialLanguage);
  });
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const sessionLang = (session?.user as { language?: string })?.language;
    if (sessionLang) {
      setLanguageState(normalizeLanguage(sessionLang));
    }
  }, [session?.user]);

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const setLanguage = useCallback(
    async (lang: AppLanguage) => {
      if (lang === language) return;
      setLanguageState(lang);
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      if (guestMode || !session?.user) return;

      setSwitching(true);
      try {
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang }),
        });
        if (res.ok) {
          await update({ language: lang });
        }
      } finally {
        setSwitching(false);
      }
    },
    [language, update, guestMode, session?.user]
  );

  const messages = useMemo(() => getMessages(language), [language]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(messages, key, vars),
    [messages]
  );

  const value = useMemo(
    () => ({ language, setLanguage, switching, messages, t }),
    [language, setLanguage, switching, messages, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
