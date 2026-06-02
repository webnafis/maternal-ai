"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { AuthPrivacyNote } from "@/components/AuthPrivacyNote";
import { useLanguage } from "@/contexts/LanguageContext";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t("auth.invalidCredentials"));
      return;
    }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      name: username.trim(),
      password,
      language,
      redirect: false,
    });

    if (result?.error) {
      setError(t("auth.invalidCredentials"));
      setLoading(false);
    } else {
      router.replace("/dashboard");
    }
  };

  if (status === "loading") {
    return <div style={{ textAlign: "center", padding: 40 }}>🌸</div>;
  }

  return (
    <>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          color: "var(--text-dark)",
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        {t("auth.loginTitle")}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div>
          <label style={labelStyle}>{t("auth.username")}</label>
          <input
            className="JotnoAI-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("auth.usernamePlaceholder")}
            autoComplete="username"
          />
        </div>
        <div>
          <label style={labelStyle}>{t("auth.password")}</label>
          <input
            className="JotnoAI-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="alert-box alert-danger" style={{ margin: 0 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ width: "100%", padding: 14, borderRadius: 14 }}
          disabled={loading}
        >
          {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
        {t("auth.noAccount")}{" "}
        <Link href="/signup" style={{ color: "var(--rose)", fontWeight: 600 }}>
          {t("auth.signupLink")}
        </Link>
      </p>

      <AuthPrivacyNote />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
