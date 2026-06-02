"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

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
    label: "Completed",
  },
  due: {
    icon: "⏰",
    badgeClass: "badge-rose",
    circleBg: "#FFF8E6",
    circleColor: "var(--gold)",
    timelineBg: "var(--rose-pale)",
    timelineBorder: "var(--rose)",
    label: "Due Now",
  },
  upcoming: {
    icon: "⏳",
    badgeClass: "badge-gold",
    circleBg: "var(--cream)",
    circleColor: "var(--text-light)",
    timelineBg: "#F5F5F5",
    timelineBorder: "#C8C8C8",
    label: "Upcoming",
  },
} as const;

export default function VaccinationPage() {
  const { data: session, status } = useSession();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Stores the vaccine ID pending an "undo done" confirmation, or null
  const [confirmUndoneId, setConfirmUndoneId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      // 👈 only fetch when session is confirmed ready
      fetchVaccines();
    }
  }, [status]);

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
      console.error("Error fetching vaccination list:", err);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
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
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div>
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
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
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>

          {/* Right: timeline */}
          <div className="JotnoAI-card" style={{ padding: "24px" }}>
            <Skeleton className="h-5 w-56 mb-4" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
          🛡️ Immunization Schedule
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          Track critical pregnancy vaccines recommended for your gestational
          week timeline.
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
              Doses Secured
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
              Pending Due
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
              Upcoming
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
          {
            // loading ? (
            //   <div
            //     style={{
            //       padding: "40px 0",
            //       textAlign: "center",
            //       color: "var(--text-light)",
            //       fontSize: 14,
            //     }}
            //   >
            //     Loading vaccination records...
            //   </div>
            // ) :
            vaccines.map((v) => {
              const s = STATUS[v.status];
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
                      Not Yet Due
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
                      Mark Done
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
                      Mark Undone
                    </button>
                  )}
                </div>
              );
            })
          }
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
            {
              // loading ? (
              //   <div style={{ fontSize: 13, color: "var(--text-light)" }}>
              //     Loading timeline...
              //   </div>
              // ) :

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
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
                      {/* <div
                      // style={{
                      //   padding: "12px",
                      //   background: "var(--rose-pale)",
                      //   borderRadius: 12,
                      //   borderLeft: "4px solid var(--rose)",
                      //   lineHeight: 1.4,
                      //   // marginBottom: 4,
                      // }}
                      > */}
                      <strong>{`${s.icon} ${v.name}: `}</strong>

                      {v.description}
                      {/* <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: s.timelineBorder,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.label}
                        </span> */}
                      {/* </div> */}
                      {/* <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-mid)",
                        }}
                      >
                        📅 {v.weekRange}
                      </p> */}
                    </div>
                  );
                })}
              </div>
            }
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
              Remove Completion?
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
              Mark{" "}
              <strong style={{ color: "var(--text-dark)" }}>
                {confirmingVaccine.name}
              </strong>{" "}
              as not done? The status will revert based on your current
              pregnancy week.
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
                Cancel
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
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
