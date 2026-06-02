"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTrimester,
  getProgress,
  getBabyData,
  MILESTONES,
} from "@/lib/utils";

export default function TrackerPage() {
  const { data: session, status, update } = useSession();
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

  // 👇 Skeleton loader
  if (status === "loading" || week === null) {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-40" />
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
            <Skeleton className="h-5 w-32 mx-auto mb-5" />
            <Skeleton className="h-36 w-36 rounded-full mx-auto mb-5" />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-5 w-28 rounded-full mx-auto mb-4" />
            <div
              style={{
                background: "var(--cream)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Skeleton className="h-3 w-16 mx-auto mb-3" />
              <Skeleton className="h-2 w-full rounded-full mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          </div>

          {/* Baby development skeleton */}
          <div className="JotnoAI-card">
            <Skeleton className="h-5 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
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
                  <Skeleton className="h-5 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-14 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone timeline skeleton */}
        <div className="JotnoAI-card">
          <Skeleton className="h-5 w-44 mb-4" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 12,
                  background: "var(--cream)",
                }}
              >
                <Skeleton className="h-3 w-3 rounded-full mt-1 flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-64" />
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
  const baby = getBabyData(week);

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
          Pregnancy Tracker
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
          Week-by-week journey{" "}
          {saved && <span style={{ color: "var(--sage)" }}>✓ Saved</span>}
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
            Current Week
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
                of 40
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
              ← Prev
            </button>
            <button
              className="btn-primary"
              onClick={() => changeWeek(1)}
              disabled={week >= 40 || saving}
            >
              Next →
            </button>
          </div>

          <span className="JotnoAI-badge badge-rose">
            {trimester} Trimester
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
              Progress
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
              {progress}% complete
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
            Baby Development 👶
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
              { label: "Trimester", value: trimester },
              { label: "Week", value: `${week}/40` },
              { label: "Days Left", value: `${(40 - week) * 7}d` },
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
          Milestone Timeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MILESTONES.map((m) => {
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
                    Week {m.week}: {m.label}
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
