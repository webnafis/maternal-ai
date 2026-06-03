"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { AppLanguage } from "@/lib/i18n/types";
import { LANGUAGES } from "@/lib/i18n/types";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { language, setLanguage, switching } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "var(--rose-pale)",
        borderRadius: 10,
        padding: 3,
        opacity: switching ? 0.7 : 1,
        pointerEvents: switching ? "none" : "auto",
      }}
      aria-label="Language"
    >
      {LANGUAGES.map(({ code, native }) => {
        const active = language === code;

        return (
          <button
            key={code}
            type="button"
            // 1. Disable the button if it's already active OR if the language is currently switching
            disabled={active || switching}
            onClick={() => setLanguage(code as AppLanguage)}
            style={{
              border: "none",
              borderRadius: 8,
              padding: compact ? "6px 10px" : "7px 12px",
              fontSize: compact ? 11 : 12,
              fontWeight: active ? 600 : 500,
              // 2. Change cursor to 'default' or 'not-allowed' when disabled
              cursor: active
                ? "default"
                : switching
                ? "not-allowed"
                : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              background: active ? "var(--rose)" : "transparent",
              color: active ? "white" : "var(--text-mid)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {compact ? (code === "bn" ? "বাং" : "EN") : native}
          </button>
        );
      })}
    </div>
  );
}
