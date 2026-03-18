"use client";
import { useState, useRef, useCallback } from "react";
import { ChatMessage } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I am your Nexus Coach. I can help you with habits, journaling, social media control, productivity, goal setting, and personal growth. What would you like to work on today?",
  timestamp: new Date().toISOString(),
};

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      // Add a temporary thinking placeholder
      const thinkingId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: thinkingId,
          role: "assistant",
          content: "...",
          timestamp: new Date().toISOString(),
        },
      ]);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            includeContext,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        // Replace placeholder with real response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,
                  content: data.message,
                  timestamp: new Date().toISOString(),
                }
              : m
          )
        );
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,
                  content:
                    "Something went wrong. Please check your connection and try again.",
                }
              : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, includeContext]
  );

  const clearChat = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return {
    messages,
    input, setInput,
    loading,
    includeContext, setIncludeContext,
    sendMessage,
    clearChat,
    stopGeneration,
  };
}