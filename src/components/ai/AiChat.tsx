"use client";
import { useEffect, useRef } from "react";
import { useAiChat } from "@/hooks/useAiChat";
import { MessageBubble } from "./MessageBubble";
import { QuickPrompts } from "./QuickPrompts";

export function AiChat() {
  const {
    messages, input, setInput,
    loading, includeContext, setIncludeContext,
    sendMessage, clearChat, stopGeneration,
  } = useAiChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showQuickPrompts =
    messages.length <= 1 && !loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Chat header controls */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0", marginBottom: 4,
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--color-text-secondary)",
            cursor: "pointer", userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              style={{ width: 14, height: 14 }}
            />
            Use my data
          </label>
          <span style={{
            fontSize: 11, color: "var(--color-text-secondary)",
            padding: "1px 7px", borderRadius: 4,
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}>
            {messages.length - 1} messages
          </span>
        </div>
        <button
          onClick={clearChat}
          style={{
            fontSize: 12, color: "var(--color-text-secondary)",
          }}
        >
          Clear chat
        </button>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1, overflowY: "auto",
          padding: "12px 0",
          display: "flex", flexDirection: "column",
          minHeight: 0,
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Quick prompts shown on fresh chat */}
        {showQuickPrompts && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 11, color: "var(--color-text-secondary)",
              marginBottom: 10, fontWeight: 500,
              letterSpacing: "0.4px",
            }}>
              Try asking...
            </div>
            <QuickPrompts
              onSelect={(p) => sendMessage(p)}
              disabled={loading}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        borderTop: "0.5px solid var(--color-border-tertiary)",
        paddingTop: 12, display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your coach anything about growth..."
          disabled={loading}
          style={{ flex: 1, fontSize: 14 }}
        />

        {loading ? (
          <button
            onClick={stopGeneration}
            style={{
              padding: "8px 16px", fontSize: 13,
              background: "var(--color-background-danger)",
              color: "var(--color-text-danger)",
              borderColor: "var(--color-border-danger)",
            }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            style={{
              padding: "8px 18px", fontSize: 13,
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
            Send
          </button>
        )}
      </div>
    </div>
  );
}