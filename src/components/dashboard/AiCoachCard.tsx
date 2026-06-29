"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OPENER: Message = {
  role: "assistant",
  content: "Hello! What would you like to work on today?",
};

export function AiCoachCard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([OPENER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          includeContext: true,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not connect. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skeu-card" style={{
      padding: "18px 20px", marginTop: 16,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>AI Coach</div>
        <button
          onClick={() => router.push("/ai")}
          style={{ fontSize: 11.5, color: "var(--color-text-info)" }}
        >
          Full chat
        </button>
      </div>

      {/* Mini chat */}
      <div style={{
        display: "flex", flexDirection: "column",
        gap: 8, marginBottom: 12,
        minHeight: 120, maxHeight: 240, overflowY: "auto",
      }}>
        {messages.slice(-4).map((m, i) => (
          <div
            key={i}
            style={{
              padding: "8px 11px",
              borderRadius: m.role === "user"
                ? "10px 10px 4px 10px"
                : "10px 10px 10px 4px",
              fontSize: 12.5, lineHeight: 1.55,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: 620,
              background: m.role === "user"
                ? "var(--color-background-success)"
                : "var(--color-background-secondary)",
              color: m.role === "user"
                ? "var(--color-text-success)"
                : "var(--color-text-primary)",
              border: m.role === "user"
                ? "0.5px solid var(--color-border-success)"
                : "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            padding: "8px 11px", borderRadius: "10px 10px 10px 4px",
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            alignSelf: "flex-start",
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "var(--color-text-secondary)",
                    animation: "bounce 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
              <style>{`
                @keyframes bounce {
                  0%,80%,100%{ transform:translateY(0) }
                  40%{ transform:translateY(-5px) }
                }
              `}</style>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask your coach..."
          disabled={loading}
          style={{ flex: 1, fontSize: 12.5 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            padding: "0 14px", fontSize: 13,
            background: input.trim()
              ? "var(--color-background-success)"
              : undefined,
            color: input.trim()
              ? "var(--color-text-success)"
              : undefined,
            borderColor: input.trim()
              ? "var(--color-border-success)"
              : undefined,
            opacity: !input.trim() ? 0.5 : 1,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}