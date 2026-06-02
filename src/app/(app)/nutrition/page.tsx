"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTrimester, NUTRITION_DATA } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Nutrient {
  name: string;
  pct: number;
  color: string;
}

interface NutritionPlan {
  safe: string[];
  avoid: string[];
  supps: string[];
  nutrients: Nutrient[];
}

export default function NutritionPage() {
  const { data: session, status } = useSession(); // 👈 add status
  const [week, setWeek] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === "authenticated") {
      // 👈 wait for confirmed session
      const currentWeek = (session?.user as any)?.pregnancyWeek || 1;
      setWeek(currentWeek);
      setLoading(false);
    }
  }, [status]);

  const trimester = getTrimester(week);
  const plan: NutritionPlan = NUTRITION_DATA[trimester];

  // Replace the existing if (loading) block
  if (loading || status === "loading") {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-40 rounded-full" />
        </div>

        {/* Top grid — nutrients + supplements */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Nutrient bars skeleton */}
          <div className="JotnoAI-card">
            <Skeleton className="h-5 w-72 mb-2" />
            <Skeleton className="h-4 w-full mb-5" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Supplements skeleton */}
          <div className="JotnoAI-card">
            <Skeleton className="h-5 w-56 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid — safe + avoid foods */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {/* Safe foods skeleton */}
          <div className="JotnoAI-card">
            <Skeleton className="h-5 w-56 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Avoid foods skeleton */}
          <div className="JotnoAI-card">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Hydration banner skeleton */}
        <Skeleton className="h-16 w-full rounded-xl mt-6" />
      </div>
    );
  }

  return (
    <div
      style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}
      className="animate-fade-in"
    >
      {/* Page Header */}
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
            Prenatal Nutrition Guide
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
            Tailored dietary recommendations for your health in **Week {week}**
          </p>
        </div>
        <span className="JotnoAI-badge badge-gold">
          {trimester} Trimester Diet Plan
        </span>
      </div>

      {/* Main Grid Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Left Side: Nutrient Bar Graph Indicators */}
        <div
          className="JotnoAI-card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            🎯 Target Daily Macro & Micronutrients
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 20 }}
          >
            Essential element requirements magnified during this specific
            developmental segment.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {plan.nutrients.map((nutrient) => (
              <div key={nutrient.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: "var(--text-dark)" }}>
                    {nutrient.name}
                  </span>
                  <span style={{ color: "var(--text-mid)" }}>
                    {nutrient.pct}% Recommended
                  </span>
                </div>
                {/* Progress bar wrap container */}
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    background: "var(--cream)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="nutrient-fill"
                    style={{
                      width: `${nutrient.pct}%`,
                      height: "100%",
                      backgroundColor: nutrient.color,
                      borderRadius: "10px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Micro Supplements Recommendations Card */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 4,
              color: "var(--text-dark)",
            }}
          >
            💊 Vital Supplements & Dosages
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 16 }}
          >
            Consult your healthcare provider before shifting current vitamin
            schedules.
          </p>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {plan.supps.map((supp, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  background: "var(--rose-pale)",
                  border: "1px solid var(--rose-light)",
                  borderRadius: "12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-dark)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>✨</span>
                {supp}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Food Lists Grid Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Safe Foods Checklist */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 6,
              color: "var(--sage)",
            }}
          >
            🟢 Highly Recommended Foods
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}
          >
            Nutrient-dense options supporting rapid embryonic and cellular
            tissue expansion.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.safe.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--sage-pale)",
                  border: "1.5px solid var(--sage-light)",
                  fontSize: 14,
                  color: "var(--text-dark)",
                  fontWeight: 500,
                }}
              >
                <span>✅</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Foods to Avoid Checklist */}
        <div className="JotnoAI-card">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              marginBottom: 6,
              color: "var(--error)",
            }}
          >
            🛑 Foods strictly to Avoid
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}
          >
            Potential bacterial vectors or chemical catalysts presenting
            prenatal complications risk.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.avoid.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#FFF5F5",
                  border: "1.5px solid #FFB3B3",
                  fontSize: 14,
                  color: "var(--text-dark)",
                  fontWeight: 500,
                }}
              >
                <span>⚠️</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hydration Information Banner */}
      <div
        className="alert-box alert-safe"
        style={{
          marginTop: 24,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>💧</span>
        <div>
          <strong style={{ color: "#3B6B50" }}>
            Hydration Protocol Baseline Reminder:
          </strong>{" "}
          Aim to ingest at least 2.5 to 3 liters of purified water daily.
          Adequate hydration balances amniotic volumes and reduces common
          cardiovascular stress indicators like sudden swelling or acute
          maternal headaches.
        </div>
      </div>
    </div>
  );
}
