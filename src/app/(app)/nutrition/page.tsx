"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTrimester } from "@/lib/utils";
import { getLocalizedNutrition, getTrimesterDisplay } from "@/lib/i18n/content";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { data: session, status } = useSession();
  const { language, t } = useLanguage();
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
  const plan: NutritionPlan =
    getLocalizedNutrition(language, trimester) ||
    getLocalizedNutrition("en", trimester)!;
  const trimesterLabel = getTrimesterDisplay(language, trimester);

  // Beautiful pulse loader
  if (loading || status === "loading") {
    return (
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

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
            <div
              style={{
                height: 32,
                width: 256,
                borderRadius: 8,
                background: "rgba(200,169,110,0.22)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 14,
                width: 320,
                borderRadius: 6,
                background: "rgba(200,169,110,0.12)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
          <div
            style={{
              height: 24,
              width: 168,
              borderRadius: 20,
              background: "rgba(200,169,110,0.15)",
              animation: "pulse 1.5s ease-in-out infinite",
              alignSelf: "center",
            }}
          />
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
            <div
              style={{
                height: 20,
                width: 280,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 20,
              }}
            />
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
                    <div
                      style={{
                        height: 12,
                        width: 96,
                        borderRadius: 6,
                        background: "rgba(200,169,110,0.2)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 12,
                        width: 128,
                        borderRadius: 6,
                        background: "rgba(200,169,110,0.12)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: 10,
                      width: "100%",
                      borderRadius: 10,
                      background: "rgba(200,169,110,0.12)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Supplements skeleton */}
          <div className="JotnoAI-card">
            <div
              style={{
                height: 20,
                width: 224,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(200,169,110,0.1)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    border: "1px solid rgba(200,169,110,0.12)",
                  }}
                />
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
            <div
              style={{
                height: 20,
                width: 224,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(200,169,110,0.08)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    border: "1.5px solid rgba(200,169,110,0.12)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Avoid foods skeleton */}
          <div className="JotnoAI-card">
            <div
              style={{
                height: 20,
                width: 192,
                borderRadius: 6,
                background: "rgba(200,169,110,0.2)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 13,
                width: "100%",
                borderRadius: 6,
                background: "rgba(200,169,110,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,220,220,0.35)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    border: "1.5px solid rgba(255,179,179,0.25)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hydration banner skeleton */}
        <div
          style={{
            height: 64,
            borderRadius: 12,
            background: "rgba(200,169,110,0.1)",
            animation: "pulse 1.5s ease-in-out infinite",
            marginTop: 24,
            border: "1px solid rgba(200,169,110,0.12)",
          }}
        />
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
            {t("nutrition.title")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)" }}>
            {t("nutrition.subtitle", { week })}
          </p>
        </div>
        <span className="JotnoAI-badge badge-gold">
          {t("nutrition.trimesterPlan", { n: trimesterLabel })}
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
            {t("nutrition.nutrientsTitle")}
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 20 }}
          >
            {t("nutrition.nutrientsDesc")}
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
                    {t("nutrition.percentRecommended", { pct: nutrient.pct })}
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
            {t("nutrition.suppsTitle")}
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 16 }}
          >
            {t("nutrition.suppsDesc")}
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
            {t("nutrition.safeTitle")}
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}
          >
            {t("nutrition.safeDesc")}
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
            {t("nutrition.avoidTitle")}
          </h3>
          <p
            style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}
          >
            {t("nutrition.avoidDesc")}
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
            {t("nutrition.hydrationTitle")}
          </strong>{" "}
          {t("nutrition.hydrationBody")}
        </div>
      </div>
    </div>
  );
}
