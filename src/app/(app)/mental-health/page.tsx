"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/* ── Constants ── */
const MOODS = [
  { emoji: "😄", label: "Great", score: 5 },
  { emoji: "🙂", label: "Good", score: 4 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "😔", label: "Low", score: 2 },
  { emoji: "😰", label: "Anxious", score: 1 },
];

const PHQ_QUESTIONS = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble sleeping or sleeping too much?",
  "Feeling tired or having little energy?",
  "Feeling bad about yourself?",
];

const PHQ_OPTIONS = ["Never", "Sometimes", "Often", "Always"];

const WELLNESS_TIPS = [
  "🧘 Practice 10 minutes of deep breathing daily",
  "🛁 Take a warm bath to ease tension",
  "🤝 Talk to a trusted friend or partner",
  "🚶 A short walk outside can boost mood",
  "📱 Limit social media to 30 mins/day",
  "💤 Aim for 8–9 hours of sleep",
  "🎵 Listen to calming music or nature sounds",
];

/* ── Types ── */
interface MoodEntry {
  date: string;
  mood_emoji: string;
  mood_label: string;
  mood_score: number;
  ai_feedback?: string;
}

type AlertType = "safe" | "warn" | "danger";

/* ── Component ── */
export default function MentalHealthPage() {
  const { data: session } = useSession();
  const week = (session?.user as any)?.pregnancyWeek ?? 1;

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

  /* ── Load history ── */
  useEffect(() => {
    loadHistory();
  }, []);

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
      setMoodFeedback({ type, text: data.aiFeedback ?? "✅ Mood saved!" });
      loadHistory();
    } catch {
      setMoodFeedback({
        type: "warn",
        text: "Could not save. Please try again.",
      });
    }
    setSaving(false);
  }

  function clearMood() {
    setSelectedMood(null);
    setJournal("");
    setMoodFeedback(null);
  }

  /* ── PHQ assessment (also saves score to API) ── */
  async function assessPHQ() {
    if (phqAnswers.some((a) => a === -1)) {
      setPhqResult({
        type: "warn",
        text: "⚠️ Please answer all 5 questions for an accurate assessment.",
      });
      return;
    }
    const total = phqAnswers.reduce((s, v) => s + v, 0);

    let result: { type: AlertType; text: string };
    if (total <= 4) {
      result = {
        type: "safe",
        text: "✅ Low risk. Your responses suggest minimal depression symptoms. Keep up your self-care routine!",
      };
    } else if (total <= 9) {
      result = {
        type: "warn",
        text: "⚠️ Mild symptoms detected. Consider talking to your doctor at your next visit. You're not alone.",
      };
    } else {
      result = {
        type: "danger",
        text: "🚨 Please speak to your healthcare provider soon. Your responses suggest you may benefit from professional support. This is common and treatable.",
      };
    }
    setPhqResult(result);

    // Optionally save the PHQ score alongside today's mood
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodEmoji: selectedMood?.emoji ?? "😐",
          moodLabel: selectedMood?.label ?? "Okay",
          moodScore: selectedMood?.score ?? 3,
          phqScore: total,
          week,
        }),
      });
    } catch {
      /* non-blocking */
    }
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
          Mental Wellness
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-light)" }}>
          Your emotional health matters
        </p>
      </div>

      {/* ── Mood Logger ── */}
      <div className="bloom-card" style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 20,
            color: "var(--text-dark)",
          }}
        >
          How are you feeling today?
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
          placeholder="Write freely… What's on your mind today? How did you sleep? Any concerns?"
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
            {saving ? "💾 Saving…" : "Save Today's Entry 💾"}
          </button>
          <button className="btn-outline" onClick={clearMood}>
            Clear
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
        <div className="bloom-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            📅 Mood History
          </h3>
          {historyLoading ? (
            <p style={{ fontSize: 13, color: "var(--text-light)" }}>Loading…</p>
          ) : moodHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-light)" }}>
              No entries yet. Start logging your mood!
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
                    <div
                      key={i}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: "var(--cream)",
                        fontSize: 12,
                        color: "var(--text-mid)",
                        border: "1px solid rgba(200,169,110,0.15)",
                      }}
                    >
                      {entry.mood_emoji} {entry.date}
                    </div>
                  ))}
              </div>
              {/* Latest AI feedback */}
              {moodHistory[moodHistory.length - 1]?.ai_feedback && (
                <div
                  className="alert-box alert-safe"
                  style={{ display: "block", fontSize: 13 }}
                >
                  💙 <strong>Latest AI insight:</strong>{" "}
                  {moodHistory[moodHistory.length - 1].ai_feedback}
                </div>
              )}
            </>
          )}
        </div>

        {/* Wellness Tips */}
        <div className="bloom-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            🧘 Wellness Tips
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {WELLNESS_TIPS.map((tip, i) => (
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
        className="bloom-card"
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
          💙 Postpartum Depression Screening
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-mid)",
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          Regular screening helps catch issues early. Based on the Edinburgh
          Postnatal Depression Scale (EPDS).
        </p>

        {PHQ_QUESTIONS.map((q, i) => (
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
              {PHQ_OPTIONS.map((opt, j) => (
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
          Get My Assessment
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
    </div>
  );
}
