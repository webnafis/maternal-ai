"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrimester,
  getProgress,
  getDaysLeft,
  getGreeting,
  CHECKLIST_ITEMS,
  WEEK_FOCUS,
} from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [checklist, setChecklist] = useState<boolean[]>(
    CHECKLIST_ITEMS.map(() => false)
  );
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(1);

  useEffect(() => {
    if (session?.user) {
      const w = (session.user as any).pregnancyWeek || 1;
      setWeek(w);
      fetchChecklist();
    }
  }, [session]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch("/api/checklist");
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.items);
      }
    } catch {}
    setLoading(false);
  };

  const toggleItem = async (index: number) => {
    const newItems = [...checklist];
    newItems[index] = !newItems[index];
    setChecklist(newItems);
    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems }),
    });
  };

  const trimester = getTrimester(week);
  const progress = getProgress(week);
  const daysLeft = getDaysLeft(week);
  const greeting = getGreeting();
  const name = session?.user?.name || "";
  const focus = WEEK_FOCUS[trimester];
  const completed = checklist.filter(Boolean).length;

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
              color: "var(--text-dark)",
              marginBottom: 4,
            }}
          >
            {greeting}, {name} 🌸
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
            Week {week} of your pregnancy
          </p>
        </div>
        <span className="JotnoAI-badge badge-rose">{trimester} Trimester</span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { icon: "🍼", value: daysLeft, label: "Days Until Due Date" },
          { icon: "❤️", value: "Normal", label: "Health Status" },
          { icon: "📊", value: `${progress}%`, label: "Journey Complete" },
          {
            icon: "✅",
            value: `${completed}/${CHECKLIST_ITEMS.length}`,
            label: "Today's Tasks",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--warm-white)",
              borderRadius: 18,
              padding: "20px",
              boxShadow: "var(--shadow)",
              border: "1px solid rgba(200,169,110,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                color: "var(--rose)",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text-light)", marginTop: 3 }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Focus + Checklist */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Week Focus */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 14,
              color: "var(--text-dark)",
            }}
          >
            🌟 This Week's Focus
          </h3>
          <p
            style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.8 }}
          >
            {focus}
          </p>
        </div>

        {/* Checklist */}
        <div className="JotnoAI-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                color: "var(--text-dark)",
              }}
            >
              ✅ Today's Checklist
            </h3>
            <span className="JotnoAI-badge badge-sage" style={{ fontSize: 11 }}>
              {completed}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-light)",
                padding: 20,
              }}
            >
              Loading...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CHECKLIST_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleItem(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: checklist[i]
                      ? "var(--sage-pale)"
                      : "var(--cream)",
                    border: `1.5px solid ${
                      checklist[i]
                        ? "var(--sage-light)"
                        : "rgba(200,169,110,0.15)"
                    }`,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    color: checklist[i] ? "var(--sage)" : "var(--text-mid)",
                    fontWeight: checklist[i] ? 600 : 400,
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 16 }}>
                    {checklist[i] ? "✅" : "⬜"}
                  </span>
                  <span
                    style={{
                      textDecoration: checklist[i] ? "line-through" : "none",
                      opacity: checklist[i] ? 0.7 : 1,
                    }}
                  >
                    {item}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="JotnoAI-card">
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            marginBottom: 14,
            color: "var(--text-dark)",
          }}
        >
          📌 Quick Actions
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/ai-assistant">
            <button className="btn-primary">💬 Ask AI Assistant</button>
          </Link>
          <Link href="/symptoms">
            <button className="btn-outline">🩺 Check Symptoms</button>
          </Link>
          <Link href="/mental-health">
            <button className="btn-sage">🧘 Log Mood</button>
          </Link>
          <Link href="/doctor-summary">
            <button className="btn-outline">📋 Doctor Summary</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
