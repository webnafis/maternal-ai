"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVaccineStatusLabel } from "@/lib/i18n/content";

interface Vaccine {
  id: string;
  name: string;
  weekRange: string;
  eligibleFromWeek: number;
  status: "done" | "due" | "upcoming";
  description: string;
}

// ── Status theme config ──────────────────────────────────────────────────────
const STATUS = {
  done: {
    icon: "✅",
    badgeClass: "badge-sage",
    circleBg: "var(--sage-pale)",
    circleColor: "var(--sage)",
    timelineBg: "var(--sage-pale)",
    timelineBorder: "var(--sage)",
  },
  due: {
    icon: "⏰",
    badgeClass: "badge-rose",
    circleBg: "#FFF8E6",
    circleColor: "var(--gold)",
    timelineBg: "var(--rose-pale)",
    timelineBorder: "var(--rose)",
  },
  upcoming: {
    icon: "⏳",
    badgeClass: "badge-gold",
    circleBg: "var(--cream)",
    circleColor: "var(--text-light)",
    timelineBg: "#F5F5F5",
    timelineBorder: "#C8C8C8",
  },
} as const;

export default function VaccinationPage() {
  const { data: session, status } = useSession();
  const { language, t } = useLanguage();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Stores the vaccine ID pending an "undo done" confirmation, or null
  const [confirmUndoneId, setConfirmUndoneId] = useState<string | null>(null);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    try {
      const currentWeek = (session?.user as any)?.pregnancyWeek || 1;
      const res = await fetch(`/api/vaccination?week=${currentWeek}`);
      if (res.ok) {
        const data = await res.json();
        setVaccines(data.vaccines || []);
      }
    } catch (err) {
      console.error("Error fetching vaccination list:", err);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated") fetchVaccines();
  }, [status, language, fetchVaccines]);

  // Mark a due vaccine as done immediately
  const markDone = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/vaccination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaccineId: id, status: "done" }),
      });
      if (res.ok) {
        setVaccines((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: "done" } : v))
        );
      }
    } catch (err) {
      console.error("Error marking vaccine done:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              height: 32,
              width: 280,
              borderRadius: 8,
              background: "rgba(200,169,110,0.22)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: 10,
            }}
          />
          <div
            style={{
              height: 14,
              width: 380,
              borderRadius: 6,
              background: "rgba(200,169,110,0.12)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Overview cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="JotnoAI-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(200,169,110,0.15)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    height: 24,
                    width: 60,
                    borderRadius: 6,
                    background: "rgba(200,169,110,0.2)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 12,
                    width: 90,
                    borderRadius: 6,
                    background: "rgba(200,169,110,0.1)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Main split */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left: vaccine list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  background: "var(--warm-white)",
                  borderRadius: 16,
                  boxShadow: "var(--shadow)",
                  border: "1px solid rgba(200,169,110,0.08)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(200,169,110,0.15)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div
                      style={{
                        height: 14,
                        width: 140,
                        borderRadius: 6,
                        background: "rgba(200,169,110,0.2)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: 60,
                        borderRadius: 20,
                        background: "rgba(200,169,110,0.12)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: 12,
                      width: 180,
                      borderRadius: 6,
                      background: "rgba(200,169,110,0.1)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 32,
                    width: 96,
                    borderRadius: 10,
                    background: "rgba(200,169,110,0.15)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right: timeline */}
          <div className="JotnoAI-card" style={{ padding: "24px" }}>
            <div
              style={{
                height: 20,
                width: 220,
                borderRadius: 6,
                background: "rgba(200,169,110,0.22)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 6,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 6,
              }}
            />
            <div
              style={{
                height: 13,
                width: "70%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 18,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    background: "rgba(200,169,110,0.08)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    borderLeft: "4px solid rgba(200,169,110,0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmed: mark a done vaccine as undone (API recalculates due/upcoming on next GET)
  const confirmMarkUndone = async () => {
    if (!confirmUndoneId) return;
    const id = confirmUndoneId;
    setConfirmUndoneId(null);
    setUpdatingId(id);
    try {
      const res = await fetch("/api/vaccination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send "due" — the GET endpoint will recalculate to due/upcoming correctly
        body: JSON.stringify({ vaccineId: id, status: "due" }),
      });
      if (res.ok) {
        // Refresh to get server-recalculated status
        await fetchVaccines();
      }
    } catch (err) {
      console.error("Error marking vaccine undone:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = vaccines.length;
  const completedCount = vaccines.filter((v) => v.status === "done").length;
  const pendingDueCount = vaccines.filter((v) => v.status === "due").length;
  const upcomingCount = vaccines.filter((v) => v.status === "upcoming").length;

  const confirmingVaccine = vaccines.find((v) => v.id === confirmUndoneId);

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* ── Page Title ── */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            color: "var(--text-dark)",
            marginBottom: 4,
          }}
        >
          {t("vaccination.title")}
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          {t("vaccination.subtitle")}
        </p>
      </div>

      {/* ── Overview Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          className="JotnoAI-card"
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
              {t("vaccination.dosesSecured")}
            </div>
          </div>
        </div>

        <div
          className="JotnoAI-card"
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
              {t("vaccination.pendingDue")}
            </div>
          </div>
        </div>

        <div
          className="JotnoAI-card"
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
              background: "var(--cream)",
              padding: "12px",
              borderRadius: "14px",
            }}
          >
            ⏳
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
              {upcomingCount}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}
            >
              {t("vaccination.upcoming")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Split Layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Vaccine Tracking List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {vaccines.map((v) => {
            const s = STATUS[v.status];
            const statusLabel = getVaccineStatusLabel(language, v.status);
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
                {/* Status icon */}
                <div
                  style={{
                    background: s.circleBg,
                    color: s.circleColor,
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
                  {s.icon}
                </div>

                {/* Name + badge + week */}
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
                      className={`JotnoAI-badge ${s.badgeClass}`}
                      style={{ fontSize: 10, textTransform: "capitalize" }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: 13,
                      color: "var(--text-mid)",
                    }}
                  >
                    📅 {t("vaccination.targetWindow")}:{" "}
                    <strong style={{ color: "var(--text-dark)" }}>
                      {v.weekRange}
                    </strong>
                  </p>
                </div>

                {/* Action button — upcoming is locked */}
                {v.status === "upcoming" ? (
                  <span
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      borderRadius: "10px",
                      background: "#F0F0F0",
                      color: "var(--text-light)",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    {t("vaccination.notYetDue")}
                  </span>
                ) : v.status === "due" ? (
                  <button
                    className="btn-primary"
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      borderRadius: "10px",
                      cursor: updatingId ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => markDone(v.id)}
                    disabled={updatingId !== null}
                  >
                    {t("vaccination.markDone")}
                  </button>
                ) : (
                  <button
                    className="btn-sage"
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      borderRadius: "10px",
                      cursor: updatingId ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setConfirmUndoneId(v.id)}
                    disabled={updatingId !== null}
                  >
                    {t("vaccination.markUndone")}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Clinical Timeline — all vaccines with description + status color */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="JotnoAI-card" style={{ padding: "24px" }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                marginBottom: 16,
                color: "var(--text-dark)",
              }}
            >
              {t("vaccination.timelineTitle")}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-mid)",
                lineHeight: 1.6,
                margin: "0 0 16px 0",
              }}
            >
              {t("vaccination.timelineDesc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vaccines.map((v) => {
                const s = STATUS[v.status];
                return (
                  <div
                    key={v.id}
                    style={{
                      padding: "12px 14px",
                      background: s.timelineBg,
                      borderRadius: 12,
                      borderLeft: `4px solid ${s.timelineBorder}`,
                      lineHeight: 1.5,
                      fontSize: 13,
                    }}
                  >
                    <strong>{`${s.icon} ${v.name}: `}</strong>
                    {v.description}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal: Mark Undone ── */}
      {confirmUndoneId && confirmingVaccine && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setConfirmUndoneId(null)}
        >
          <div
            style={{
              background: "var(--warm-white)",
              borderRadius: 20,
              padding: "28px 28px 24px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}
            >
              ↩️
            </div>
            <h4
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 8,
                color: "var(--text-dark)",
              }}
            >
              {t("vaccination.removeTitle")}
            </h4>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-mid)",
                lineHeight: 1.6,
                textAlign: "center",
                marginBottom: 22,
              }}
            >
              {t("vaccination.removeBody", { name: confirmingVaccine.name })}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-outline"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
                onClick={() => setConfirmUndoneId(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
                onClick={confirmMarkUndone}
              >
                {t("vaccination.yesRemove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
