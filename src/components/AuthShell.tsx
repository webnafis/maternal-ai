"use client";

import {
  LanguageProvider,
  useLanguage,
} from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function AuthShellInner({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--rose-pale) 0%, var(--cream) 40%, var(--sage-pale) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "-80px",
          right: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,117,106,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-60px",
          left: "-60px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,175,142,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <LanguageSwitcher />
      </div>

      <div
        style={{
          background: "var(--warm-white)",
          borderRadius: "28px",
          padding: "40px",
          boxShadow: "var(--shadow-md)",
          border: "1px solid rgba(200,169,110,0.15)",
          width: "100%",
          maxWidth: "440px",
          animation: "fadeInUp 0.4s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🌸</div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              color: "var(--rose)",
              letterSpacing: "-0.5px",
            }}
          >
            JotnoAI
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-light)",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 4,
            }}
          >
            {t("nav.tagline")}
          </div>
        </div>

        <p
          style={{
            fontSize: 14,
            color: "var(--text-mid)",
            lineHeight: 1.6,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          {t("auth.companion")}
        </p>

        {children}
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider guestMode>
      <AuthShellInner>{children}</AuthShellInner>
    </LanguageProvider>
  );
}
