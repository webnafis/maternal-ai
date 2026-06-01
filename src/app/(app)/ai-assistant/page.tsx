"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import AudioRecorder from "@/components/AudioRecorder";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const QUICK_PROMPTS = [
  {
    label: "🥗 Trimester nutrition",
    msg: "What foods should I eat in my trimester?",
  },
  { label: "🩺 About cramping", msg: "Is mild cramping normal in pregnancy?" },
  {
    label: "💧 Water intake",
    msg: "How much water should I drink daily during pregnancy?",
  },
  {
    label: "🏃 Safe exercises",
    msg: "What exercises are safe during pregnancy?",
  },
  {
    label: "👶 Fetal movement",
    msg: "When should I be concerned about fetal movement?",
  },
  {
    label: "💙 Mental health",
    msg: "What are signs of postpartum depression?",
  },
];

export default function AIAssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const week = (session?.user as any)?.pregnancyWeek ?? 1;
  const name = session?.user?.name ?? "there";

  /* ── load history on mount ── */
  useEffect(() => {
    loadHistory();
  }, []);

  /* ── auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/ai-chat");
      if (res.ok) {
        const data = await res.json();
        if (data.history?.length > 0) {
          setMessages(data.history);
        } else {
          setMessages([
            {
              role: "assistant",
              content: `Assalamu Alaikum, ${name}! 🌸 I'm your JotnoAI AI health assistant. I'm here to support your pregnancy journey at Week ${week}. Ask me anything about nutrition, symptoms, exercises, or what to expect. How can I help you today?`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch {
      /* silent fail */
    }
    setInitialLoading(false);
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const userMsg: Message = {
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, week }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            "I'm having trouble connecting right now. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting. For urgent concerns, please contact your doctor directly. 💙",
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setSending(false);
  }

  async function clearChat() {
    await fetch("/api/ai-chat", { method: "DELETE" });
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared! 🌸 Hello ${name}, I'm here to help with your Week ${week} pregnancy. What would you like to know?`,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function formatTime(iso?: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: "24px",
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              color: "var(--text-dark)",
              marginBottom: 4,
            }}
          >
            AI Health Assistant
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-light)" }}>
            Powered by Claude — Safe, empathetic guidance
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="JotnoAI-badge badge-sage">🤖 AI Powered</span>
          <button
            className="btn-outline"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={clearChat}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* ── Quick chips ── */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
      >
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            className="chip"
            disabled={sending}
            onClick={() => sendMessage(q.msg)}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* ── Chat area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          maxHeight: "100vh",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "var(--cream)",
            borderRadius: "16px 16px 0 0",
            border: "1px solid rgba(200,169,110,0.1)",
          }}
        >
          {initialLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-light)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌸</div>
              <p style={{ fontSize: 14 }}>Loading your conversation…</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxWidth: "80%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius:
                        msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      background:
                        msg.role === "user"
                          ? "var(--rose)"
                          : "var(--warm-white)",
                      color: msg.role === "user" ? "white" : "var(--text-dark)",
                      fontSize: 14,
                      lineHeight: 1.65,
                      boxShadow:
                        msg.role === "assistant" ? "var(--shadow)" : "none",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <span style={{ marginRight: 5 }}>🌸</span>
                    )}
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-light)" }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sending && (
                <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "18px 18px 18px 4px",
                      background: "var(--warm-white)",
                      boxShadow: "var(--shadow)",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 5, alignItems: "center" }}
                    >
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "12px",
            background: "var(--warm-white)",
            borderRadius: "0 0 16px 16px",
            border: "1px solid rgba(200,169,110,0.1)",
            borderTop: "none",
          }}
        >
          {/* NEW: Free Audio Input System */}
          <AudioRecorder
            disabled={sending}
            onTranscriptionComplete={(transcribedText) => {
              // Option A: Put text into field so user can check before sending
              setInput(transcribedText);

              // Option B: To instantly hit submit instead, uncomment line below:
              // sendMessage(transcribedText);
            }}
          />
          <input
            className="JotnoAI-input"
            style={{ flex: 1, borderRadius: 12, fontSize: 14 }}
            placeholder="Ask anything about pregnancy, symptoms, nutrition…"
            value={input}
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            className="btn-primary"
            style={{
              padding: "12px 20px",
              fontSize: 18,
              borderRadius: 12,
              minWidth: 52,
            }}
            disabled={sending || !input.trim()}
            onClick={() => sendMessage()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
