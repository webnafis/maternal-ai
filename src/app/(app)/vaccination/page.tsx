"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Vaccine {
  id: string;
  name: string;
  weekRange: string;
  eligibleFromWeek: number;
  status: "done" | "due" | "upcoming";
}

export default function VaccinationPage() {
  const { data: session } = useSession();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVaccines();
  }, [session]);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const currentWeek = (session?.user as any)?.pregnancyWeek || 1;
      const res = await fetch(`/api/vaccination?week=${currentWeek}`);
      if (res.ok) {
        const data = await res.json();
        setVaccines(data.vaccines || []);
      }
    } catch (err) {
      console.error("Error fetching vaccination lists:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    const newStatus = currentStatus === "done" ? "due" : "done";

    try {
      const res = await fetch("/api/vaccination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaccineId: id, status: newStatus }),
      });

      if (res.ok) {
        setVaccines((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, status: newStatus as any } : v
          )
        );
      }
    } catch (err) {
      console.error("Error updates to immunization row failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 📊 Dynamic Metric Counters for Overview Cards
  const totalCount = vaccines.length;
  const completedCount = vaccines.filter((v) => v.status === "done").length;
  const pendingDueCount = vaccines.filter((v) => v.status === "due").length;

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* Page Title Header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            color: "var(--text-dark)",
            marginBottom: 4,
          }}
        >
          🛡️ Immunization Schedule
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          Track critical pregnancy vaccines recommended for your gestational
          week timeline context.
        </p>
      </div>

      {/* 🌟 Overview Cards Row (Matches HTML Design Blocks) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          className="bloom-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              background: "var(--sage-pale)",
              padding: "12px",
              borderRadius: "14px",
            }}
          >
            ✅
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-dark)",
                lineHeight: 1.2,
              }}
            >
              {completedCount} / {totalCount}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}
            >
              Doses Secured
            </div>
          </div>
        </div>

        <div
          className="bloom-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              background: pendingDueCount > 0 ? "#FFF8E6" : "var(--rose-pale)",
              padding: "12px",
              borderRadius: "14px",
            }}
          >
            {pendingDueCount > 0 ? "⏰" : "✨"}
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-dark)",
                lineHeight: 1.2,
              }}
            >
              {pendingDueCount}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}
            >
              Pending Doses Due
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left Side: Modernized Dynamic Vaccine Card Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "var(--text-light)",
                fontSize: 14,
              }}
            >
              Loading vaccination record matrix...
            </div>
          ) : (
            vaccines.map((v) => {
              const isDone = v.status === "done";
              const isDue = v.status === "due";

              const circleBg = isDone
                ? "var(--sage-pale)"
                : isDue
                ? "#FFF8E6"
                : "var(--cream)";
              const circleColor = isDone
                ? "var(--sage)"
                : isDue
                ? "var(--gold)"
                : "var(--text-light)";
              const checkIcon = isDone ? "✅" : isDue ? "⏰" : "⏳";

              return (
                <div
                  className="vacc-item animate-fade-in"
                  key={v.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "16px 20px",
                    background: "var(--warm-white)",
                    borderRadius: "16px",
                    boxShadow: "var(--shadow)",
                    border: "1px solid rgba(200,169,110,0.08)",
                    opacity: updatingId === v.id ? 0.6 : 1,
                    transition: "transform 0.2s ease",
                  }}
                >
                  {/* Status Icon Indicator */}
                  <div
                    className="vacc-status-circle"
                    style={{
                      background: circleBg,
                      color: circleColor,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {checkIcon}
                  </div>

                  {/* Core Details */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text-dark)",
                        }}
                      >
                        {v.name}
                      </span>
                      <span
                        className={`bloom-badge ${
                          isDone
                            ? "badge-sage"
                            : isDue
                            ? "badge-gold"
                            : "badge-rose"
                        }`}
                        style={{ fontSize: 10, textTransform: "capitalize" }}
                      >
                        {v.status}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: 13,
                        color: "var(--text-mid)",
                      }}
                    >
                      📅 Target Window:{" "}
                      <strong style={{ color: "var(--text-dark)" }}>
                        {v.weekRange}
                      </strong>
                    </p>
                  </div>

                  {/* Operational Action Button */}
                  <button
                    className={isDone ? "btn-sage" : "btn-primary"}
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      borderRadius: "10px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => toggleStatus(v.id, v.status)}
                    disabled={updatingId !== null}
                  >
                    {isDone ? "Mark Undone" : "Mark Done"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Clinical Timeline Guide Card Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="bloom-card" style={{ padding: "24px" }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                marginBottom: 12,
                color: "var(--text-dark)",
              }}
            >
              💡 Clinical Timeline Guidelines
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-mid)",
                lineHeight: 1.6,
                margin: "0 0 16px 0",
              }}
            >
              Vaccinations during pregnancy safely transfer essential active
              antibodies directly across the placenta structure to support
              newborn shielding lines prior to birth.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "var(--rose-pale)",
                  borderRadius: 12,
                  borderLeft: "4px solid var(--rose)",
                  lineHeight: 1.4,
                }}
              >
                <strong>Tetanus Toxoid (TT):</strong> Essential prevention
                tracking blocking neonatal maternal tetanus. Generally
                structured across two core sequential distribution windows.
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "var(--sage-pale)",
                  borderRadius: 12,
                  borderLeft: "4px solid var(--sage)",
                  lineHeight: 1.4,
                }}
              >
                <strong>Influenza Shield:</strong> Safe across all gestational
                windows. Protects prospective mothers from severe respiratory
                illness contexts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
