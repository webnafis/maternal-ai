"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getLocalizedMoods, getLocalizedMoodLabel } from "@/lib/i18n/content";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Types ── */
interface MoodEntry {
  date: string;
  mood_emoji: string;
  mood_label: string;
  mood_score: number;
  journal?: string;
  ai_feedback?: string;
}

type AlertType = "safe" | "warn" | "danger";

/* ── Component ── */
export default function MentalHealthPage() {
  const { data: session, status } = useSession();
  const { language, t } = useLanguage();
  const MOODS = useMemo(() => getLocalizedMoods(language), [language]);
  const wellnessTips = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((i) =>
        t(`mentalHealth.wellnessTip${i}` as "mentalHealth.wellnessTip1")
      ),
    [t, language]
  );
  const phqQuestions = useMemo(
    () => [1, 2, 3, 4, 5].map((i) => t(`mentalHealth.phqQ${i}` as "mentalHealth.phqQ1")),
    [t, language]
  );
  const phqOptions = useMemo(
    () => [
      t("mentalHealth.phqNever"),
      t("mentalHealth.phqSometimes"),
      t("mentalHealth.phqOften"),
      t("mentalHealth.phqAlways"),
    ],
    [t, language]
  );
  const week = session?.user?.pregnancyWeek ?? 1;

  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(
    null
  );
  const [journal, setJournal] = useState("");
  const [phqAnswers, setPhqAnswers] = useState<number[]>(Array(5).fill(-1));

  const [saving, setSaving] = useState(false);
  const [moodFeedback, setMoodFeedback] = useState<{
    type: AlertType;
    text: string;
  } | null>(null);
  const [phqResult, setPhqResult] = useState<{
    type: AlertType;
    text: string;
  } | null>(null);

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  /* ── Load history ── */
  useEffect(() => {
    loadHistory();
  }, [language]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/mood");
      if (res.ok) {
        const data = await res.json();
        setMoodHistory(data.entries ?? []);
      }
    } catch {
      /* silent */
    }
    setHistoryLoading(false);
  }

  /* ── Save mood + journal ── */
  async function saveMood() {
    if (!selectedMood) {
      setMoodFeedback({
        type: "warn",
        text: "⚠️ Please select how you are feeling today.",
      });
      return;
    }
    setSaving(true);
    setMoodFeedback(null);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodEmoji: selectedMood.emoji,
          moodLabel: selectedMood.label,
          moodScore: selectedMood.score,
          journal,
          week,
        }),
      });
      const data = await res.json();
      const type: AlertType =
        selectedMood.score >= 4
          ? "safe"
          : selectedMood.score >= 3
          ? "warn"
          : "danger";
      setMoodFeedback({
        type,
        text: data.aiFeedback ?? t("mentalHealth.moodSaved"),
      });
      loadHistory();
    } catch {
      setMoodFeedback({
        type: "warn",
        text: t("mentalHealth.saveFailed"),
      });
    }
    setSaving(false);
  }

  function clearMood() {
    setSelectedMood(null);
    setJournal("");
    setMoodFeedback(null);
  }

  /* ── PHQ assessment ── */
  async function assessPHQ() {
    if (phqAnswers.some((a) => a === -1)) {
      setPhqResult({
        type: "warn",
        text: t("mentalHealth.phqAnswerAll"),
      });
      return;
    }
    const total = phqAnswers.reduce((s, v) => s + v, 0);

    let result: { type: AlertType; text: string };
    if (total <= 4) {
      result = { type: "safe", text: t("mentalHealth.phqLow") };
    } else if (total <= 9) {
      result = { type: "warn", text: t("mentalHealth.phqMild") };
    } else {
      result = { type: "danger", text: t("mentalHealth.phqHigh") };
    }
    setPhqResult(result);

    try {
      await fetch("/api/mood/phq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phqScore: total }),
      });
    } catch {
      /* non-blocking */
    }
  }

  /* ─────────────────────────────────────────
     FULL-PAGE PULSE SKELETON LOADER
  ───────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

        {/* ── Header skeleton ── */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              height: 32,
              width: 210,
              borderRadius: 8,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 14,
              width: 200,
              borderRadius: 6,
              background: "rgba(200,169,110,0.12)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* ── Mood Logger card skeleton ── */}
        <div className="JotnoAI-card" style={{ marginBottom: 20 }}>
          {/* Title */}
          <div
            style={{
              height: 22,
              width: 240,
              borderRadius: 6,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 22,
            }}
          />

          {/* 5 mood buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {MOODS.map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 18px",
                }}
              >
                {/* Emoji circle */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "rgba(200,169,110,0.14)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    height: 10,
                    width: 36,
                    borderRadius: 5,
                    background: "rgba(200,169,110,0.1)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Journal textarea */}
          <div
            style={{
              width: "100%",
              height: 110,
              borderRadius: 12,
              background: "rgba(200,169,110,0.07)",
              border: "1px solid rgba(200,169,110,0.12)",
              animation: "pulse 1.5s ease-in-out infinite",
              boxSizing: "border-box",
            }}
          />

          {/* Buttons row */}
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <div
              style={{
                height: 38,
                width: 190,
                borderRadius: 10,
                background: "rgba(232,117,106,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 38,
                width: 70,
                borderRadius: 10,
                background: "rgba(200,169,110,0.12)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* ── Mood History + Wellness Tips skeleton ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Mood History skeleton */}
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
            {/* Chip pills */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              {[88, 76, 92, 80, 72, 84, 78, 90].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 28,
                    width: w,
                    borderRadius: 20,
                    background: "rgba(200,169,110,0.1)",
                    border: "1px solid rgba(200,169,110,0.12)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
            {/* AI insight box */}
            <div
              style={{
                height: 52,
                borderRadius: 10,
                background: "rgba(100,160,110,0.08)",
                border: "1px solid rgba(100,160,110,0.14)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* Wellness Tips skeleton */}
          <div className="JotnoAI-card">
            <div
              style={{
                height: 22,
                width: 155,
                borderRadius: 6,
                background: "rgba(200,169,110,0.22)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[88, 76, 82, 72, 94, 68, 80].map((pct, i) => (
                <div
                  key={i}
                  style={{
                    height: 13,
                    width: `${pct}%`,
                    borderRadius: 6,
                    background: "rgba(200,169,110,0.11)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── PHQ-5 Screening skeleton ── */}
        <div
          className="JotnoAI-card"
          style={{
            background:
              "linear-gradient(135deg, rgba(232,117,106,0.06) 0%, rgba(100,160,110,0.06) 100%)",
          }}
        >
          {/* Title */}
          <div
            style={{
              height: 22,
              width: 290,
              borderRadius: 6,
              background: "rgba(200,169,110,0.2)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 10,
            }}
          />
          {/* Subtitle lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                height: 13,
                width: "92%",
                borderRadius: 5,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 13,
                width: "70%",
                borderRadius: 5,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* 5 PHQ question blocks */}
          {phqQuestions.map((_, qi) => (
            <div key={qi} style={{ marginBottom: 18 }}>
              {/* Question text */}
              <div
                style={{
                  height: 13,
                  width: `${62 + ((qi * 8) % 28)}%`,
                  borderRadius: 5,
                  background: "rgba(200,169,110,0.18)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  marginBottom: 10,
                }}
              />
              {/* 4 radio option pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {phqOptions.map((opt, oi) => (
                  <div
                    key={oi}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {/* Radio circle */}
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        background: "rgba(200,169,110,0.18)",
                        border: "2px solid rgba(200,169,110,0.2)",
                        animation: "pulse 1.5s ease-in-out infinite",
                        flexShrink: 0,
                      }}
                    />
                    {/* Option label */}
                    <div
                      style={{
                        height: 11,
                        width: opt.length * 6.5,
                        borderRadius: 4,
                        background: "rgba(200,169,110,0.12)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit button */}
          <div
            style={{
              height: 38,
              width: 180,
              borderRadius: 10,
              background: "rgba(232,117,106,0.2)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginTop: 6,
            }}
          />
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div
      className="animate-fade-in"
      style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            color: "var(--text-dark)",
            marginBottom: 4,
          }}
        >
          {t("mentalHealth.title")}
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-light)" }}>
          {t("mentalHealth.subtitle")}
        </p>
      </div>

      {/* ── Mood Logger ── */}
      <div className="JotnoAI-card" style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 20,
            color: "var(--text-dark)",
          }}
        >
          {t("mentalHealth.howFeeling")}
        </h3>

        {/* Mood grid */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 18px",
                borderRadius: 14,
                border: `2px solid ${
                  selectedMood?.label === mood.label
                    ? "var(--rose)"
                    : "transparent"
                }`,
                background:
                  selectedMood?.label === mood.label
                    ? "var(--rose-pale)"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ fontSize: 34 }}>{mood.emoji}</span>
              <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {/* Journal */}
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder={t("mentalHealth.journalPlaceholder")}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(200,169,110,0.2)",
            background: "var(--cream)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--text-dark)",
            resize: "vertical",
            minHeight: 110,
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--rose)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(200,169,110,0.2)")}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={saveMood} disabled={saving}>
            {saving ? `💾 ${t("common.saving")}` : t("mentalHealth.saveEntry")}
          </button>
          <button className="btn-outline" onClick={clearMood}>
            {t("common.clear")}
          </button>
        </div>

        {moodFeedback && (
          <div
            className={`alert-box alert-${moodFeedback.type}`}
            style={{ display: "block" }}
          >
            {moodFeedback.text}
          </div>
        )}
      </div>

      {/* ── Mood History + Wellness Tips ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* History */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            {t("mentalHealth.moodHistory")}
          </h3>

          {/* ── INLINE HISTORY SKELETON ── */}
          {historyLoading ? (
            <>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {[88, 76, 92, 80, 72, 84, 78, 90].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 28,
                      width: w,
                      borderRadius: 20,
                      background: "rgba(200,169,110,0.1)",
                      border: "1px solid rgba(200,169,110,0.12)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  height: 50,
                  borderRadius: 10,
                  background: "rgba(100,160,110,0.07)",
                  border: "1px solid rgba(100,160,110,0.12)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </>
          ) : moodHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-light)" }}>
              {t("mentalHealth.noMoodYet")}
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {[...moodHistory]
                  .reverse()
                  .slice(0, 10)
                  .map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedEntry(entry)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: "var(--cream)",
                        fontSize: 12,
                        color: "var(--text-mid)",
                        border: "1px solid rgba(200,169,110,0.15)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "var(--rose)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(200,169,110,0.15)")
                      }
                    >
                      {entry.mood_emoji} {entry.date}
                    </button>
                  ))}
              </div>
              {moodHistory[0]?.ai_feedback && (
                <div
                  className="alert-box alert-safe"
                  style={{ display: "block", fontSize: 13 }}
                >
                  💙 <strong>{t("mentalHealth.latestInsight")}</strong>{" "}
                  {moodHistory[0].ai_feedback}
                </div>
              )}
            </>
          )}
        </div>

        {/* Wellness Tips */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            {t("mentalHealth.wellnessTips")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {wellnessTips.map((tip, i) => (
              <p
                key={i}
                style={{
                  fontSize: 14,
                  color: "var(--text-mid)",
                  lineHeight: 1.6,
                }}
              >
                {tip}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── PHQ-5 Screening ── */}
      <div
        className="JotnoAI-card"
        style={{
          background:
            "linear-gradient(135deg, var(--rose-pale) 0%, var(--sage-pale) 100%)",
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 8,
            color: "var(--text-dark)",
          }}
        >
          {t("mentalHealth.phqTitle")}
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-mid)",
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          {t("mentalHealth.phqDesc")}
        </p>

        {phqQuestions.map((q, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-dark)",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              {i + 1}. {q}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {phqOptions.map((opt, j) => (
                <label
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "var(--text-mid)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`phq_q${i}`}
                    value={j}
                    checked={phqAnswers[i] === j}
                    onChange={() => {
                      const copy = [...phqAnswers];
                      copy[i] = j;
                      setPhqAnswers(copy);
                    }}
                    style={{
                      accentColor: "var(--rose)",
                      width: 15,
                      height: 15,
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          className="btn-primary"
          style={{ marginTop: 6 }}
          onClick={assessPHQ}
        >
          {t("mentalHealth.getAssessment")}
        </button>

        {phqResult && (
          <div
            className={`alert-box alert-${phqResult.type}`}
            style={{ display: "block" }}
          >
            {phqResult.text}
          </div>
        )}
      </div>

      {/* ── Mood Detail Modal ── */}
      {selectedEntry && (
        <div
          onClick={() => setSelectedEntry(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--white, #fff)",
              borderRadius: 20,
              padding: 28,
              maxWidth: 460,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--text-light)",
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Emoji + date */}
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 52, marginBottom: 6 }}>
                {selectedEntry.mood_emoji}
              </div>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  color: "var(--text-dark)",
                  marginBottom: 2,
                }}
              >
                {getLocalizedMoodLabel(
                  selectedEntry.mood_label,
                  selectedEntry.mood_score,
                  language
                )}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-light)" }}>
                {selectedEntry.date}
              </p>
            </div>

            {/* Journal */}
            {selectedEntry.journal ? (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-light)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  {t("mentalHealth.yourNote")}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-mid)",
                    lineHeight: 1.65,
                    background: "var(--cream)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  {selectedEntry.journal}
                </p>
              </div>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-light)",
                  fontStyle: "italic",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {t("mentalHealth.noJournal")}
              </p>
            )}

            {/* AI feedback */}
            {selectedEntry.ai_feedback && (
              <div
                className="alert-box alert-safe"
                style={{ display: "block", fontSize: 13, marginBottom: 0 }}
              >
                💙 <strong>{t("mentalHealth.aiInsightLabel")}</strong>{" "}
                {selectedEntry.ai_feedback}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
