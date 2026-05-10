"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Кой район е най-добър за семейство с малки деца?",
  "Кои райони имат добра велосипедна мрежа?",
  "Кои райони имат риск от наводнения?",
  "Сравни Лозенец и Младост за млад специалист",
];

export default function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    setError(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Грешка. Опитай отново.");
        // Remove the user message if request failed
        setMessages(messages);
        return;
      }

      setMessages([...newMessages, { role: "assistant", content: data.text }]);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch {
      setError("Няма връзка. Провери интернета си.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="AI асистент"
        style={{
          position:     "fixed",
          bottom:       24,
          right:        24,
          width:        52,
          height:       52,
          borderRadius: "50%",
          background:   open
            ? "var(--bg-overlay)"
            : "linear-gradient(135deg, #34d399 0%, #059669 100%)",
          border:      `1px solid ${open ? "var(--border-default)" : "transparent"}`,
          cursor:      "pointer",
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          fontSize:    22,
          boxShadow:   open
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 0 32px rgba(52,211,153,0.35), 0 4px 16px rgba(0,0,0,0.4)",
          zIndex:      900,
          transition:  "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {open ? "✕" : "✦"}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          style={{
            position:    "fixed",
            bottom:      88,
            right:       24,
            width:       360,
            height:      500,
            background:  "var(--bg-surface)",
            border:      "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            display:     "flex",
            flexDirection: "column",
            zIndex:      900,
            boxShadow:   "0 24px 64px rgba(0,0,0,0.6)",
            animation:   "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) both",
            overflow:    "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding:      "14px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              flexShrink:   0,
            }}
          >
            <div
              style={{
                width:        32,
                height:       32,
                borderRadius: "50%",
                background:   "rgba(52,211,153,0.1)",
                border:       "1px solid rgba(52,211,153,0.25)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     15,
              }}
            >
              ✦
            </div>
            <div>
              <div
                style={{
                  fontSize:    13,
                  fontWeight:  700,
                  color:       "var(--text-primary)",
                  fontFamily:  "var(--font-display)",
                }}
              >
                Sofia<span style={{ color: "#34d399" }}>AI</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Асистент за Sofia<span style={{ color: "#34d399" }}>Vital</span>
              </div>
            </div>
            {remaining !== null && (
              <div
                style={{
                  marginLeft:   "auto",
                  fontSize:     10,
                  color:        remaining <= 2 ? "#fb923c" : "var(--text-muted)",
                  background:   "var(--bg-raised)",
                  border:       "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding:      "2px 8px",
                }}
              >
                {remaining} оставащи
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            style={{
              flex:       1,
              overflowY:  "auto",
              padding:    "14px 14px 0",
              display:    "flex",
              flexDirection: "column",
              gap:        10,
            }}
          >
            {isEmpty && (
              <div style={{ textAlign: "center", paddingTop: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🗺️</div>
                <div
                  style={{
                    fontSize:   13,
                    fontWeight: 600,
                    color:      "var(--text-primary)",
                    marginBottom: 6,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Питай за районите
                </div>
                <div
                  style={{
                    fontSize:     11,
                    color:        "var(--text-muted)",
                    marginBottom: 16,
                    lineHeight:   1.5,
                  }}
                >
                  Сравнявам и анализирам 24-те района на Sofia по реални данни.
                </div>

                {/* Suggested questions */}
                <div
                  style={{
                    display:       "flex",
                    flexDirection: "column",
                    gap:           6,
                    textAlign:     "left",
                  }}
                >
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      style={{
                        background:   "var(--bg-raised)",
                        border:       "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding:      "8px 12px",
                        fontSize:     11,
                        color:        "var(--text-secondary)",
                        cursor:       "pointer",
                        textAlign:    "left",
                        lineHeight:   1.4,
                        transition:   "all 0.12s",
                        fontFamily:   "var(--font-body)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background     = "var(--bg-overlay)";
                        e.currentTarget.style.borderColor    = "var(--border-default)";
                        e.currentTarget.style.color          = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background  = "var(--bg-raised)";
                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                        e.currentTarget.style.color       = "var(--text-secondary)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display:       "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth:     "85%",
                    padding:      "9px 12px",
                    borderRadius: m.role === "user"
                      ? "12px 12px 3px 12px"
                      : "12px 12px 12px 3px",
                    background: m.role === "user"
                      ? "rgba(52,211,153,0.12)"
                      : "var(--bg-raised)",
                    border: `1px solid ${
                      m.role === "user"
                        ? "rgba(52,211,153,0.2)"
                        : "var(--border-subtle)"
                    }`,
                    fontSize:   12,
                    color:      "var(--text-primary)",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding:      "10px 14px",
                    borderRadius: "12px 12px 12px 3px",
                    background:   "var(--bg-raised)",
                    border:       "1px solid var(--border-subtle)",
                    display:      "flex",
                    gap:          4,
                    alignItems:   "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width:        5,
                        height:       5,
                        borderRadius: "50%",
                        background:   "#34d399",
                        opacity:      0.6,
                        animation:    `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  padding:      "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background:   "rgba(248,113,113,0.08)",
                  border:       "1px solid rgba(248,113,113,0.2)",
                  fontSize:     11,
                  color:        "#f87171",
                  textAlign:    "center",
                }}
              >
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding:      "12px 14px",
              borderTop:    "1px solid var(--border-subtle)",
              display:      "flex",
              gap:          8,
              flexShrink:   0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Питай за район..."
              disabled={loading}
              style={{
                flex:         1,
                background:   "var(--bg-raised)",
                border:       "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding:      "8px 12px",
                fontSize:     12,
                color:        "var(--text-primary)",
                outline:      "none",
                fontFamily:   "var(--font-body)",
                transition:   "border-color 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(52,211,153,0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width:        34,
                height:       34,
                borderRadius: "var(--radius-md)",
                background:   input.trim() && !loading
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "var(--bg-raised)",
                border:       "1px solid var(--border-subtle)",
                cursor:       input.trim() && !loading ? "pointer" : "default",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     14,
                color:        input.trim() && !loading
                  ? "#022c22"
                  : "var(--text-faint)",
                transition:   "all 0.15s",
                flexShrink:   0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
