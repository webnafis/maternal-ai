"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getTrimester, getProgress } from "@/lib/utils";
import {
  getLocalizedBabyData,
  getLocalizedMilestones,
  getTrimesterDisplay,
} from "@/lib/i18n/content";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TrackerPage() {
  const { data: session, status, update } = useSession();
  const { language, t } = useLanguage();
  const initialized = useRef(false);
  const [week, setWeek] = useState<number | null>(null); // 👈 null instead of 1
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user && !initialized.current) {
      setWeek((session.user as any).pregnancyWeek || 1);
      initialized.current = true;
    }
  }, [session]);

  // 👇 Beautiful pulse loader
  if (status === "loading" || week === null) {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              height: 32,
              width: 220,
              borderRadius: 8,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 14,
              width: 160,
              borderRadius: 6,
              background: "rgba(200,169,110,0.12)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Week circle card skeleton */}
          <div className="JotnoAI-card" style={{ textAlign: "center" }}>
            <div
              style={{
                height: 20,
                width: 128,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                margin: "0 auto 20px",
              }}
            />

            {/* Circle */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background:
                  "conic-gradient(rgba(200,169,110,0.2) 100%, rgba(200,169,110,0.08) 0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: "50%",
                  background: "var(--warm-white)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    height: 34,
                    width: 40,
                    borderRadius: 6,
                    background: "rgba(200,169,110,0.2)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    height: 11,
                    width: 30,
                    borderRadius: 4,
                    background: "rgba(200,169,110,0.1)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  height: 36,
                  width: 80,
                  borderRadius: 8,
                  background: "rgba(200,169,110,0.15)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 36,
                  width: 80,
                  borderRadius: 8,
                  background: "rgba(200,169,110,0.2)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>

            <div
              style={{
                height: 22,
                width: 130,
                borderRadius: 20,
                background: "rgba(200,169,110,0.15)",
                animation: "pulse 1.5s ease-in-out infinite",
                margin: "0 auto 16px",
              }}
            />

            <div
              style={{
                background: "var(--cream)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  height: 12,
                  width: 64,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.15)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  margin: "0 auto 10px",
                }}
              />
              <div
                style={{
                  height: 8,
                  width: "100%",
                  borderRadius: 10,
                  background: "rgba(200,169,110,0.12)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  height: 12,
                  width: 96,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.15)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  margin: "0 auto",
                }}
              />
            </div>
          </div>

          {/* Baby development skeleton */}
          <div className="JotnoAI-card">
            <div
              style={{
                height: 20,
                width: 192,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            {["100%", "100%", "100%", "75%"].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  width: w,
                  borderRadius: 6,
                  background: "rgba(200,169,110,0.1)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  marginBottom: 8,
                }}
              />
            ))}
            <div style={{ marginBottom: 16 }} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--cream)",
                    borderRadius: 10,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: 20,
                      width: 48,
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.2)",
                      animation: "pulse 1.5s ease-in-out infinite",
                      margin: "0 auto 8px",
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: 56,
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.1)",
                      animation: "pulse 1.5s ease-in-out infinite",
                      margin: "0 auto",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone timeline skeleton */}
        <div className="JotnoAI-card">
          <div
            style={{
              height: 20,
              width: 176,
              borderRadius: 6,
              background: "rgba(200,169,110,0.2)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 16,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: "var(--cream)",
                  border: "1px solid transparent",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "rgba(200,169,110,0.25)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 14,
                      width: 200,
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.2)",
                      animation: "pulse 1.5s ease-in-out infinite",
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: "80%",
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.1)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ... rest of your code unchanged
  const changeWeek = async (delta: number) => {
    const newWeek = Math.max(1, Math.min(40, week + delta));
    setWeek(newWeek);
    setSaving(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregnancyWeek: newWeek }),
    });
    // const data = await res.json();
    // console.log(data);

    await update();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const trimester = getTrimester(week);
  const progress = getProgress(week);
  const baby = getLocalizedBabyData(week, language);
  const milestones = getLocalizedMilestones(language);
  const trimesterLabel = getTrimesterDisplay(language, trimester);

  const pct = progress;
  const conicGradient = `conic-gradient(var(--rose) calc(${pct}% * 3.6deg), rgba(200,169,110,0.2) 0)`;

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            marginBottom: 4,
          }}
        >
          {t("tracker.title")}
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          {t("tracker.subtitle")}{" "}
          {saved && (
            <span style={{ color: "var(--sage)" }}>{t("tracker.saved")}</span>
          )}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Week circle card */}
        <div className="JotnoAI-card" style={{ textAlign: "center" }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 20,
              color: "var(--text-dark)",
            }}
          >
            {t("tracker.currentWeek")}
          </h3>

          {/* Conic gradient circle */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: conicGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: "50%",
                background: "var(--warm-white)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 34,
                  color: "var(--rose)",
                  lineHeight: 1,
                }}
              >
                {week}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                {t("common.weekOf40")}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <button
              className="btn-outline"
              onClick={() => changeWeek(-1)}
              disabled={week <= 1 || saving}
            >
              {t("tracker.prev")}
            </button>
            <button
              className="btn-primary"
              onClick={() => changeWeek(1)}
              disabled={week >= 40 || saving}
            >
              {t("tracker.next")}
            </button>
          </div>

          <span className="JotnoAI-badge badge-rose">
            {t("common.trimester", { n: trimesterLabel })}
          </span>

          <div
            style={{
              marginTop: 16,
              padding: "12px",
              background: "var(--cream)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--text-light)",
                marginBottom: 6,
              }}
            >
              {t("common.progress")}
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(200,169,110,0.2)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--rose), var(--gold))",
                  borderRadius: 10,
                  transition: "width 0.5s",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--rose)",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {t("common.percentComplete", { pct: progress })}
            </div>
          </div>
        </div>

        {/* Baby development */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 16,
              color: "var(--text-dark)",
            }}
          >
            {t("tracker.babyDevelopment")}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-mid)",
              lineHeight: 1.9,
              marginBottom: 16,
            }}
          >
            {baby}
          </p>

          {/* Week range info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginTop: 8,
            }}
          >
            {[
              { label: t("tracker.trimesterLabel"), value: trimesterLabel },
              { label: t("tracker.weekLabel"), value: `${week}/40` },
              {
                label: t("tracker.daysLeftLabel"),
                value: `${(40 - week) * 7}d`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "var(--cream)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                  border: "1px solid rgba(200,169,110,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--rose)",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-light)",
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone timeline */}
      <div className="JotnoAI-card">
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 16,
            color: "var(--text-dark)",
          }}
        >
          {t("tracker.milestoneTimeline")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {milestones.map((m) => {
            let dotClass = "milestone-upcoming";
            if (m.week < week) dotClass = "milestone-done";
            else if (Math.abs(m.week - week) <= 2)
              dotClass = "milestone-current";

            const isActive = Math.abs(m.week - week) <= 2;
            const isDone = m.week < week;

            return (
              <div
                key={m.week}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 12,
                  background: isActive
                    ? "var(--rose-pale)"
                    : isDone
                    ? "var(--sage-pale)"
                    : "var(--cream)",
                  border: `1px solid ${
                    isActive
                      ? "var(--rose-light)"
                      : isDone
                      ? "var(--sage-light)"
                      : "transparent"
                  }`,
                  transition: "all 0.2s",
                }}
              >
                <div
                  className={`milestone-dot ${dotClass}`}
                  style={{ marginTop: 5 }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: isActive
                        ? "var(--rose)"
                        : isDone
                        ? "var(--sage)"
                        : "var(--text-dark)",
                    }}
                  >
                    {t("tracker.weekMilestone", { week: m.week, label: m.label })}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-light)",
                      marginTop: 2,
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
                {isDone && (
                  <span style={{ marginLeft: "auto", fontSize: 16 }}>✅</span>
                )}
                {isActive && (
                  <span style={{ marginLeft: "auto", fontSize: 16 }}>📍</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
