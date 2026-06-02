"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function AuthPrivacyNote() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        marginTop: 20,
        padding: "12px 16px",
        background:
          "linear-gradient(135deg, var(--rose-pale), var(--sage-pale))",
        borderRadius: 12,
        fontSize: 12,
        color: "var(--text-mid)",
        lineHeight: 1.6,
      }}
    >
      🔒 {t("auth.privacyNote")}
    </div>
  );
}
