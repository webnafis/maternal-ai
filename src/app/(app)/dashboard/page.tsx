"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getTrimester,
  getProgress,
  getDaysLeft,
} from "@/lib/utils";
import {
  getLocalizedChecklist,
  getLocalizedWeekFocus,
  getLocalizedGreeting,
  getTrimesterDisplay,
} from "@/lib/i18n/content";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, t } = useLanguage();
  const checklistItems = getLocalizedChecklist(language);
  const [checklist, setChecklist] = useState<boolean[]>(
    checklistItems.map(() => false)
  );
  // const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<number | null>(null); // 👈 null instead of 1

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // 👈 status instead of session
      const w = (session.user as any).pregnancyWeek || 1;
      fetchChecklist().then(() => {
        setWeek(w);
      });
    }
  }, [status]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch("/api/checklist");
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.items);
      }
    } catch {}
    // setLoading(false);
  };

  const toggleItem = async (index: number) => {
    const newItems = [...checklist];
    newItems[index] = !newItems[index];
    setChecklist(newItems);
    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems }),
    });
  };

  /* ─────────────────────────────────────────
     BEAUTIFUL PULSE SKELETON LOADER
  ───────────────────────────────────────── */
  if (status === "loading" || week === null) {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

        {/* Header skeleton */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Greeting line */}
            <div
              style={{
                height: 32,
                width: 280,
                borderRadius: 8,
                background: "rgba(200,169,110,0.22)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            {/* Sub-label */}
            <div
              style={{
                height: 14,
                width: 180,
                borderRadius: 6,
                background: "rgba(200,169,110,0.12)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
          {/* Trimester badge */}
          <div
            style={{
              height: 28,
              width: 140,
              borderRadius: 20,
              background: "rgba(232,117,106,0.18)",
              animation: "pulse 1.5s ease-in-out infinite",
              alignSelf: "center",
            }}
          />
        </div>

        {/* ── Stats grid skeleton ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {[
            {
              iconBg: "rgba(200,169,110,0.15)",
              valueBg: "rgba(232,117,106,0.2)",
            },
            {
              iconBg: "rgba(200,169,110,0.15)",
              valueBg: "rgba(200,169,110,0.2)",
            },
            {
              iconBg: "rgba(200,169,110,0.15)",
              valueBg: "rgba(232,117,106,0.15)",
            },
            {
              iconBg: "rgba(200,169,110,0.15)",
              valueBg: "rgba(200,169,110,0.2)",
            },
          ].map((colors, i) => (
            <div
              key={i}
              style={{
                background: "var(--warm-white)",
                borderRadius: 18,
                padding: "20px",
                boxShadow: "var(--shadow)",
                border: "1px solid rgba(200,169,110,0.1)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: colors.iconBg,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              {/* Big value */}
              <div
                style={{
                  height: 28,
                  width: 70,
                  borderRadius: 8,
                  background: colors.valueBg,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              {/* Label */}
              <div
                style={{
                  height: 11,
                  width: 100,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.1)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Focus card + Checklist skeleton ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Week Focus skeleton */}
          <div className="JotnoAI-card">
            {/* Title bar */}
            <div
              style={{
                height: 22,
                width: 200,
                borderRadius: 6,
                background: "rgba(200,169,110,0.22)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            {/* Body text lines */}
            {[100, 94, 88, 72].map((pct, i) => (
              <div
                key={i}
                style={{
                  height: 13,
                  width: `${pct}%`,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.11)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  marginBottom: i < 3 ? 9 : 0,
                }}
              />
            ))}
          </div>

          {/* Checklist skeleton */}
          <div className="JotnoAI-card">
            {/* Title + badge row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  height: 22,
                  width: 170,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.22)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 22,
                  width: 42,
                  borderRadius: 20,
                  background: "rgba(100,160,110,0.2)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            {/* Checklist rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {checklistItems.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 42,
                    borderRadius: 10,
                    background:
                      i % 3 === 0
                        ? "rgba(100,160,110,0.08)"
                        : "rgba(200,169,110,0.07)",
                    border: `1.5px solid ${
                      i % 3 === 0
                        ? "rgba(100,160,110,0.14)"
                        : "rgba(200,169,110,0.1)"
                    }`,
                    animation: "pulse 1.5s ease-in-out infinite",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 12,
                    gap: 10,
                  }}
                >
                  {/* Checkbox icon placeholder */}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: "rgba(200,169,110,0.2)",
                      flexShrink: 0,
                    }}
                  />
                  {/* Text line */}
                  <div
                    style={{
                      height: 11,
                      width: `${55 + ((i * 7) % 30)}%`,
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.16)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions skeleton ── */}
        <div className="JotnoAI-card">
          <div
            style={{
              height: 22,
              width: 148,
              borderRadius: 6,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 16,
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { w: 160, bg: "rgba(232,117,106,0.2)" },
              { w: 148, bg: "rgba(200,169,110,0.14)" },
              { w: 116, bg: "rgba(100,160,110,0.15)" },
              { w: 152, bg: "rgba(200,169,110,0.14)" },
            ].map((btn, i) => (
              <div
                key={i}
                style={{
                  height: 38,
                  width: btn.w,
                  borderRadius: 10,
                  background: btn.bg,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const trimester = getTrimester(week);
  const progress = getProgress(week);
  const daysLeft = getDaysLeft(week);
  const greeting = getLocalizedGreeting(language);
  const name = session?.user?.name || "";
  const focus = getLocalizedWeekFocus(language, trimester);
  const trimesterLabel = getTrimesterDisplay(language, trimester);
  const completed = checklist.filter(Boolean).length;

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              color: "var(--text-dark)",
              marginBottom: 4,
            }}
          >
            {greeting}, {name} 🌸
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
            {t("dashboard.subtitle")} · {t("common.weekOf", { week })}
          </p>
        </div>
        <span className="JotnoAI-badge badge-rose">
          {t("common.trimester", { n: trimesterLabel })}
        </span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { icon: "🍼", value: daysLeft, label: t("dashboard.daysUntilDue") },
          { icon: "❤️", value: t("dashboard.healthNormal"), label: t("dashboard.healthStatus") },
          { icon: "📊", value: `${progress}%`, label: t("dashboard.journeyComplete") },
          {
            icon: "✅",
            value: `${completed}/${checklistItems.length}`,
            label: t("dashboard.todaysTasks"),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--warm-white)",
              borderRadius: 18,
              padding: "20px",
              boxShadow: "var(--shadow)",
              border: "1px solid rgba(200,169,110,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                color: "var(--rose)",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-light)",
                marginTop: 3,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Focus + Checklist */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Week Focus */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            🌟 {t("dashboard.weekFocus")}
          </h3>
          <p
            style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.8 }}
          >
            {focus}
          </p>
        </div>

        {/* Checklist */}
        <div className="JotnoAI-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                color: "var(--text-dark)",
              }}
            >
              ✅ {t("dashboard.dailyChecklist")}
            </h3>
            <span className="JotnoAI-badge badge-sage" style={{ fontSize: 11 }}>
              {t("dashboard.completed", {
                done: completed,
                total: checklistItems.length,
              })}
            </span>
          </div>
          {
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {checklistItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleItem(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: checklist[i]
                      ? "var(--sage-pale)"
                      : "var(--cream)",
                    border: `1.5px solid ${
                      checklist[i]
                        ? "var(--sage-light)"
                        : "rgba(200,169,110,0.15)"
                    }`,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    color: checklist[i] ? "var(--sage)" : "var(--text-mid)",
                    fontWeight: checklist[i] ? 600 : 400,
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 16 }}>
                    {checklist[i] ? "✅" : "⬜"}
                  </span>
                  <span
                    style={{
                      textDecoration: checklist[i] ? "line-through" : "none",
                      opacity: checklist[i] ? 0.7 : 1,
                    }}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Quick Actions */}
      <div className="JotnoAI-card">
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 14,
            color: "var(--text-dark)",
          }}
        >
          📌 {t("dashboard.quickActions")}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/ai-assistant">
            <button className="btn-primary">💬 {t("dashboard.aiChat")}</button>
          </Link>
          <Link href="/symptoms">
            <button className="btn-outline">🩺 {t("dashboard.logSymptoms")}</button>
          </Link>
          <Link href="/mental-health">
            <button className="btn-sage">🧘 {t("dashboard.moodCheck")}</button>
          </Link>
          <Link href="/doctor-summary">
            <button className="btn-outline">📋 {t("nav.doctorSummary")}</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
