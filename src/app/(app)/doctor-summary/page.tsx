"use client";
import { useEffect, useState } from "react";
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
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* ── Header and Controls ── */}
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

      {/* ─────────────────────────────────────────
          BEAUTIFUL PULSE SKELETON LOADER
          Mirrors the exact structure of the report
      ───────────────────────────────────────── */}
      {loading && (
        <div className="JotnoAI-card" style={{ position: "relative" }}>
          {/* Top-right badge skeleton */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <div
              style={{
                height: 28,
                width: 140,
                borderRadius: 20,
                background: "rgba(232,117,106,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 10,
                width: 110,
                borderRadius: 4,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* Report title */}
          <div
            style={{
              height: 26,
              width: 230,
              borderRadius: 8,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 24,
            }}
          />

          {/* ── Profile fields (5 rows) ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            {[
              { labelW: 120, valueW: "55%" },
              { labelW: 170, valueW: "45%" },
              { labelW: 155, valueW: "40%" },
              { labelW: 188, valueW: "60%" },
              { labelW: 140, valueW: "50%" },
            ].map((field, idx) => (
              <div
                key={idx}
                className="summary-field"
                style={{
                  background: "rgba(200,169,110,0.04)",
                  border: "1px solid rgba(200,169,110,0.1)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    height: 10,
                    width: field.labelW,
                    borderRadius: 5,
                    background: "rgba(200,169,110,0.2)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    marginBottom: 8,
                  }}
                />
                {/* Value */}
                <div
                  style={{
                    height: 14,
                    width: field.valueW,
                    borderRadius: 6,
                    background: "rgba(200,169,110,0.14)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Mood log field ── */}
          <div
            className="summary-field"
            style={{
              marginTop: 12,
              background: "rgba(200,169,110,0.04)",
              border: "1px solid rgba(200,169,110,0.1)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                height: 10,
                width: 175,
                borderRadius: 5,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 10,
              }}
            />
            {/* Mood emoji chips */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[76, 92, 80, 88, 70, 84, 78].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 22,
                    width: w,
                    borderRadius: 12,
                    background: "rgba(200,169,110,0.13)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Symptom log field ── */}
          <div
            className="summary-field"
            style={{
              marginTop: 12,
              background: "rgba(200,169,110,0.04)",
              border: "1px solid rgba(200,169,110,0.1)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                height: 10,
                width: 185,
                borderRadius: 5,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 10,
              }}
            />
            {/* Symptom rows */}
            {[
              ["60%", "80%"],
              ["55%", "72%"],
            ].map(([labelW, textW], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: i === 0 ? 6 : 0,
                }}
              >
                <div
                  style={{
                    height: 13,
                    width: labelW,
                    borderRadius: 5,
                    background: "rgba(200,169,110,0.12)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── AI Recommendations skeleton ── */}
          <div
            style={{
              marginTop: 20,
              padding: "18px",
              background: "rgba(232,117,106,0.06)",
              borderRadius: "14px",
              border: "1px solid rgba(232,117,106,0.12)",
            }}
          >
            {/* Section label */}
            <div
              style={{
                height: 12,
                width: 230,
                borderRadius: 6,
                background: "rgba(232,117,106,0.3)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 14,
              }}
            />
            {/* Body text lines — varying widths for realism */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[100, 95, 88, 98, 82, 91, 76, 94, 68].map((pct, i) => (
                <div
                  key={i}
                  style={{
                    height: 12,
                    width: `${pct}%`,
                    borderRadius: 5,
                    background: "rgba(200,169,110,0.14)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
            {/* Inline label "AI is drafting clinical insights…" */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {[0, 0.25, 0.5].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "rgba(232,117,106,0.5)",
                      animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-light)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                Compiling personalized clinical insights…
              </span>
            </div>
          </div>

          {/* ── Next appointment alert box skeleton ── */}
          <div
            style={{
              marginTop: 12,
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(100,160,110,0.07)",
              border: "1px solid rgba(100,160,110,0.16)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                height: 13,
                width: 24,
                borderRadius: 4,
                background: "rgba(100,160,110,0.25)",
                animation: "pulse 1.5s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: 13,
                width: "70%",
                borderRadius: 5,
                background: "rgba(100,160,110,0.15)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* ── Disclaimer skeleton ── */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px dashed rgba(200,169,110,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[100, 90, 70].map((pct, i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: "rgba(200,169,110,0.09)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
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
              style={{
                fontSize: 11,
                color: "var(--text-light)",
                marginTop: 4,
              }}
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
                        style={{
                          color: "var(--text-mid)",
                          fontWeight: 400,
                        }}
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
              style={{
                color: "var(--rose)",
                marginBottom: 8,
                fontWeight: 700,
              }}
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
