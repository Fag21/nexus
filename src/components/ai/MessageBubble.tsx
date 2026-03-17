"use client";
import { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

const THINKING_DOTS = "...";

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isThinking = message.content === THINKING_DOTS;

  const time = new Date(message.timestamp).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 14,
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          style={{
            width: 28, height: 28,
            borderRadius: "50%",
            background: "var(--color-background-success)",
            border: "0.5px solid var(--color-border-success)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 12, fontWeight: 600,
            color: "var(--color-text-success)",
          }}
        >
          N
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        {/* Bubble */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            fontSize: 13.5,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            background: isUser
              ? "var(--color-background-success)"
              : "var(--color-background-primary)",
            color: isUser
              ? "var(--color-text-success)"
              : "var(--color-text-primary)",
            border: isUser
              ? "0.5px solid var(--color-border-success)"
              : "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {isThinking ? (
            <ThinkingDots />
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp */}
        <span
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      <style>{`
        @keyframes bounce {
          0%,80%,100%{ transform:translateY(0); }
          40%{ transform:translateY(-5px); }
        }
      `}</style>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "var(--color-text-secondary)",
            animation: `bounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}