"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface MoodEntry {
  date: string;
  emoji: string;
  label: string;
}

interface SymptomEntry {
  date: string;
  symptoms: string[];
  severity: "safe" | "warn" | "danger";
}

interface SummaryData {
  patient: string;
  week: string;
  progress: string;
  dueDate: string;
  vaccinations: string;
  moodLog: MoodEntry[];
  symptomLog: SymptomEntry[];
  aiRecommendations: string;
  nextAppointment: string;
  generatedAt: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

export default function DoctorSummaryPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/doctor-summary");
      if (!res.ok) throw new Error("Failed to load clinical report summary.");
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{ padding: "24px", margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* Header and Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
              marginBottom: 4,
            }}
          >
            Doctor Visit Summary
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
            Exportable report containing recent health records and personalized
            clinical advice.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-outline"
            onClick={fetchSummary}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button
            className="btn-primary"
            onClick={handlePrint}
            disabled={loading || !!error || !summary}
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="typing-dot" style={{ marginRight: 4 }}></div>
          <div className="typing-dot" style={{ marginRight: 4 }}></div>
          <div className="typing-dot"></div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", marginTop: 12 }}>
            Compiling database state &amp; drafting clinical recommendations...
          </p>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger">
          ⚠️ {error}. Please try again later.
        </div>
      )}

      {!loading && !error && summary && (
        <div
          className="JotnoAI-card"
          id="printable-doctor-report"
          style={{ position: "relative" }}
        >
          {/* Watermark branding badge */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              textAlign: "right",
            }}
          >
            <span
              className="JotnoAI-badge badge-rose"
              style={{ fontSize: 14, padding: "6px 14px" }}
            >
              🌸 JotnoAI Report
            </span>
            <div
              style={{ fontSize: 11, color: "var(--text-light)", marginTop: 4 }}
            >
              Generated: {summary.generatedAt}
            </div>
          </div>

          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              marginBottom: 20,
              color: "var(--text-dark)",
            }}
          >
            Prenatal Health Record
          </h3>

          {/* ── Static profile fields ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              { label: "Patient Name", value: summary.patient },
              { label: "Gestational Timeline", value: summary.week },
              { label: "Pregnancy Progress", value: summary.progress },
              { label: "Estimated Due Date (EDD)", value: summary.dueDate },
              { label: "Immunization Record", value: summary.vaccinations },
            ].map((field, idx) => (
              <div className="summary-field" key={idx}>
                <div className="summary-label">{field.label}</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-dark)",
                    marginTop: 2,
                  }}
                >
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── 7-Day Mood Log ── */}
          <div className="summary-field" style={{ marginTop: 12 }}>
            <div className="summary-label">Mood Log — Last 7 Days</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-dark)",
                marginTop: 2,
              }}
            >
              {summary.moodLog.length === 0
                ? "No mood entries recorded in the past 7 days."
                : summary.moodLog
                    .map((e) => `${e.emoji} ${e.label} (${formatDate(e.date)})`)
                    .join("  ·  ")}
            </div>
          </div>

          {/* ── Symptom Log ── */}
          <div className="summary-field" style={{ marginTop: 12 }}>
            <div className="summary-label">Symptom Log — Last 7 Days</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-dark)",
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {summary.symptomLog.length === 0
                ? "No symptoms reported in the past 7 days."
                : summary.symptomLog.map((entry, idx) => (
                    <span key={idx}>
                      <span
                        style={{ color: "var(--text-mid)", fontWeight: 400 }}
                      >
                        {formatDate(entry.date)}:
                      </span>{" "}
                      {entry.symptoms.join(", ")}
                    </span>
                  ))}
            </div>
          </div>

          {/* ── AI Clinical Recommendations ── */}
          <div
            style={{
              marginTop: 20,
              padding: "18px",
              background: "var(--rose-pale)",
              borderRadius: "14px",
              border: "1px solid rgba(232,117,106,0.15)",
            }}
          >
            <div
              className="summary-label"
              style={{ color: "var(--rose)", marginBottom: 8, fontWeight: 700 }}
            >
              ✨ AI Personalized Consultation Insights
            </div>
            <div
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-dark)",
                lineHeight: 1.7,
              }}
            >
              {summary.aiRecommendations
                .split("\n")
                .filter((line) => line.trim())
                .map((line, idx) => (
                  <p key={idx} style={{ margin: "0 0 6px 0" }}>
                    {line}
                  </p>
                ))}
            </div>
          </div>

          {/* ── Next Appointment ── */}
          <div style={{ marginTop: 12 }} className="alert-box alert-safe">
            <strong>📅 Routine Clinic Protocol:</strong>{" "}
            {summary.nextAppointment}.
          </div>

          {/* ── Disclaimer ── */}
          <div
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "var(--text-light)",
              lineHeight: 1.5,
              borderTop: "1px dashed rgba(200,169,110,0.25)",
              paddingTop: 16,
            }}
          >
            ⚠️ This summary is generated for diagnostic preparatory convenience.
            Medical adjustments or care tracking evaluations should strictly
            always proceed alongside a certified clinician. References map
            criteria guidelines of the World Health Organization (WHO) and
            Bangladesh DGHS Maternal Protocols.
          </div>
        </div>
      )}

      {/* Print overrides */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .desktop-only-sidebar,
          .mobile-nav,
          TopBar,
          button,
          .btn-primary,
          .btn-outline {
            display: none !important;
          }
          .JotnoAI-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .summary-field {
            background: #fdfdfd !important;
            border: 1px solid #eee !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
