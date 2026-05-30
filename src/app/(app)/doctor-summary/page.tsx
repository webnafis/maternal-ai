"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SummaryData {
  patient: string;
  week: string;
  progress: string;
  dueDate: string;
  vaccinations: string;
  recentMood: string;
  symptomsReported: string;
  aiRecommendations: string;
  nextAppointment: string;
  generatedAt: string;
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
      style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}
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
            Compiling database state & drafting clinical recommendations...
          </p>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger">
          ⚠️ {error}. Please try again later.
        </div>
      )}

      {/* Main Print Area Profile Card */}
      {!loading && !error && summary && (
        <div
          className="bloom-card"
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
              className="bloom-badge badge-rose"
              style={{ fontSize: 14, padding: "6px 14px" }}
            >
              🌸 Bloom Report
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                label: "Patient Identity Profile Name",
                value: summary.patient,
              },
              { label: "Gestational Timeline Status", value: summary.week },
              { label: "Completion Progress Metrics", value: summary.progress },
              {
                label: "Target Estimated Due Date (EDD)",
                value: summary.dueDate,
              },
              {
                label: "Immunization Record Profile Ledger",
                value: summary.vaccinations,
              },
              {
                label: "Aggregated Psychological Mood Metric (Past 7 Days)",
                value: summary.recentMood,
              },
              {
                label: "Active Somatic Symptom Tracking Log",
                value: summary.symptomsReported,
              },
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

          {/* AI Clinical Clinical Recommendations Field */}
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
              style={{ color: "var(--rose)", marginBottom: 6, fontWeight: 700 }}
            >
              ✨ Bloom AI Personalized Consultation Insights
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-dark)",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {summary.aiRecommendations}
            </p>
          </div>

          {/* Next Steps schedule helper advice */}
          <div style={{ marginTop: 12 }} className="alert-box alert-safe">
            <strong>📅 Routine Clinic Protocol Guideline:</strong>{" "}
            {summary.nextAppointment}.
          </div>

          {/* International and Local Policy Disclaimer Notice */}
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

      {/* Embedded CSS style print overrides */}
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
          .bloom-card {
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
