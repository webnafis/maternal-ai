"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SYMPTOMS } from "@/lib/utils";

export default function SymptomsPage() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cachedResult, setCachedResult] = useState<{
    severity: string;
    analysis: string;
  } | null>(null);
  const [result, setResult] = useState<{
    severity: string;
    analysis: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true); // 👈 add this

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const fetchRecentLogs = async () => {
    setLogsLoading(true); // 👈 add this
    const res = await fetch("/api/symptoms");
    if (res.ok) {
      const data = await res.json();
      setRecentLogs(data.logs?.slice(0, 5) || []);
    }
    setLogsLoading(false); // 👈 add this
  };

  const toggleSymptom = (i: number) => {
    const newSet = new Set(selected);
    if (newSet.has(i)) newSet.delete(i);
    else newSet.add(i);
    setSelected(newSet);
    setResult(null);
  };

  const analyzeSymptoms = async (save = false) => {
    setLoading(true);
    setSaved(false);

    const selectedSymptoms = Array.from(selected).map((i) => SYMPTOMS[i].label);
    const week = (session?.user as any)?.pregnancyWeek || 20;

    // If saving, reuse the already-generated result — no re-generation
    if (save && cachedResult) {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          week,
          save: true,
          cachedSeverity: cachedResult.severity,
          cachedAnalysis: cachedResult.analysis,
        }),
      });
      if (res.ok) {
        setSaved(true);
        fetchRecentLogs();
      }
      setLoading(false);
      return;
    }

    // Fresh analysis — generate AI result
    const res = await fetch("/api/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: selectedSymptoms, week, save: false }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setCachedResult(data); // cache for potential save
    }
    setLoading(false);
  };

  const clearAll = () => {
    setSelected(new Set());
    setResult(null);
    setCachedResult(null);
    setSaved(false);
  };

  const alertClass =
    result?.severity === "danger"
      ? "alert-danger"
      : result?.severity === "warn"
      ? "alert-warn"
      : "alert-safe";

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
          Symptom Checker
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          Select all symptoms you are experiencing
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Symptom selector */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 16,
              color: "var(--text-dark)",
            }}
          >
            What are you feeling? 🩺
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {SYMPTOMS.map((s, i) => (
              <button
                key={i}
                className={`symptom-btn  ${selected.has(i) ? "selected" : ""}`}
                onClick={() => toggleSymptom(i)}
              >
                <span
                  style={{ fontSize: 20, display: "block", marginBottom: 4 }}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() => analyzeSymptoms(false)}
              disabled={loading}
            >
              {loading ? "🔍 Analyzing..." : "Analyze Symptoms"}
            </button>
            {result && !saved && (
              <button
                className="btn-sage"
                onClick={() => analyzeSymptoms(true)}
                disabled={loading} // ✅ already there — good
              >
                {loading ? "💾 Saving…" : "💾 Save to Log"} {/* add this */}
              </button>
            )}
            <button className="btn-outline" onClick={clearAll}>
              Clear
            </button>
          </div>

          {saved && (
            <div className="alert-box alert-safe" style={{ marginTop: 12 }}>
              ✅ Symptom log saved for today.
            </div>
          )}

          {result && (
            <div
              className={`alert-box ${alertClass}`}
              style={{ marginTop: 12 }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {result.severity === "danger"
                  ? "🚨 Seek Immediate Help"
                  : result.severity === "warn"
                  ? "⚠️ Monitor Closely"
                  : "✅ Usually Normal"}
              </div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{result.analysis}</p>
            </div>
          )}
        </div>

        {/* Symptom guide */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="JotnoAI-card">
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                marginBottom: 14,
                color: "var(--text-dark)",
              }}
            >
              🚦 Symptom Guide
            </h3>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
            >
              {[
                {
                  color: "var(--sage-pale)",
                  border: "var(--sage-light)",
                  title: "✅ Usually Normal",
                  titleColor: "var(--sage)",
                  items: [
                    "Mild nausea",
                    "Light fatigue",
                    "Breast tenderness",
                    "Frequent urination",
                    "Mild backache",
                  ],
                },
                {
                  color: "#FFF8E6",
                  border: "#F0D080",
                  title: "⚠️ Monitor Closely",
                  titleColor: "#C8920A",
                  items: [
                    "Persistent vomiting",
                    "Leg swelling",
                    "Mild cramping",
                    "Spotting",
                    "Sleep issues",
                  ],
                },
                {
                  color: "#FFF5F5",
                  border: "#FFB3B3",
                  title: "🚨 Seek Help Now",
                  titleColor: "var(--error)",
                  items: [
                    "Heavy bleeding",
                    "Severe abdominal pain",
                    "No fetal movement",
                    "Vision changes",
                    "Severe headache",
                  ],
                },
              ].map((cat) => (
                <div
                  key={cat.title}
                  style={{
                    padding: 12,
                    background: cat.color,
                    border: `1px solid ${cat.border}`,
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: cat.titleColor,
                      marginBottom: 6,
                    }}
                  >
                    {cat.title}
                  </div>
                  {cat.items.map((item) => (
                    <div
                      key={item}
                      style={{ color: "var(--text-mid)", padding: "2px 0" }}
                    >
                      · {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Recent logs */}
          <div className="JotnoAI-card">
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16,
                marginBottom: 12,
                color: "var(--text-dark)",
              }}
            >
              📋 Recent Logs
            </h3>

            {logsLoading ? (
              // Skeleton loader
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "var(--cream)",
                      border: "1px solid rgba(200,169,110,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        height: 12,
                        width: "40%",
                        borderRadius: 6,
                        background: "rgba(200,169,110,0.15)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        width: "80%",
                        borderRadius: 6,
                        background: "rgba(200,169,110,0.1)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 18,
                        width: "25%",
                        borderRadius: 10,
                        background: "rgba(200,169,110,0.1)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                ))}
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
              </div>
            ) : recentLogs.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-light)" }}>
                No symptom logs yet.
              </p>
            ) : (
              recentLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "var(--cream)",
                    marginBottom: 6,
                    fontSize: 12,
                    color: "var(--text-mid)",
                    border: "1px solid rgba(200,169,110,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-dark)",
                      marginBottom: 2,
                    }}
                  >
                    {log.date}
                  </div>
                  <div>{log.symptoms?.join(", ") || "No symptoms"}</div>
                  <span
                    className={`JotnoAI-badge ${
                      log.severity === "danger"
                        ? "badge-rose"
                        : log.severity === "warn"
                        ? "badge-gold"
                        : "badge-sage"
                    }`}
                    style={{ marginTop: 4, fontSize: 10 }}
                  >
                    {log.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
