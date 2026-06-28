"use client";
import { useEffect, useRef, useState } from "react";
import { Journal, Mood } from "@/types";
import {
  TECHNIQUES,
  type JournalTechnique,
  samplePrompts,
} from "@/lib/journalPrompts";

const MOODS: { value: Mood; label: string; color: string; bg: string }[] = [
  { value: "great",   label: "Great",   color: "#2D7A4F", bg: "#E8F5EE" },
  { value: "good",    label: "Good",    color: "#5BAD7F", bg: "#F0FAF4" },
  { value: "neutral", label: "Neutral", color: "#B86B1A", bg: "#FEF3E2" },
  { value: "low",     label: "Low",     color: "#D85A30", bg: "#FAECE7" },
  { value: "bad",     label: "Bad",     color: "#A32D2D", bg: "#FDECEA" },
];

interface Props {
  initial?: Journal;
  /** Pre-seed the entry with a guided prompt (from the prompt-of-the-day banner). */
  initialPrompt?: string;
  onSave: (data: { title?: string; content: string; mood: Mood }) => Promise<void>;
  onCancel: () => void;
}

export function JournalEditor({ initial, initialPrompt, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [mood, setMood] = useState<Mood>(initial?.mood ?? "neutral");
  const [saving, setSaving] = useState(false);
  const [technique, setTechnique] = useState<JournalTechnique>("free");
  const [promptOptions, setPromptOptions] = useState<string[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isEditing = Boolean(initial);

  // Seed a guided prompt when opened from the prompt-of-the-day banner.
  useEffect(() => {
    if (initialPrompt && !initial) {
      setTechnique("prompt");
      setContent(`> ${initialPrompt}\n\n`);
      setTimeout(() => textRef.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertScaffold = (text: string) => {
    setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
    setTimeout(() => textRef.current?.focus(), 0);
  };

  const chooseTechnique = (t: JournalTechnique) => {
    setTechnique(t);
    if (t === "prompt") {
      setPromptOptions(samplePrompts(4));
      return;
    }
    const meta = TECHNIQUES.find((x) => x.key === t);
    if (meta?.template) insertScaffold(meta.template);
    if (meta?.title && !title.trim()) setTitle(meta.title);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: title || undefined, content, mood });
    } catch {
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14, padding: "20px 22px",
      }}
    >
      {/* Technique selector — hidden while editing an existing entry */}
      {!isEditing && (
        <>
          <div style={{
            fontSize: 11, color: "var(--color-text-secondary)",
            marginBottom: 8, fontWeight: 500, letterSpacing: "0.4px",
          }}>
            How do you want to write today?
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {TECHNIQUES.map((t) => (
              <button
                key={t.key}
                onClick={() => chooseTechnique(t.key)}
                title={t.blurb}
                style={{
                  padding: "5px 12px", fontSize: 12, borderRadius: 20,
                  background: technique === t.key
                    ? "var(--color-background-info)"
                    : "var(--color-background-secondary)",
                  color: technique === t.key
                    ? "var(--color-text-info)"
                    : "var(--color-text-secondary)",
                  borderColor: technique === t.key
                    ? "var(--color-border-info)"
                    : "var(--color-border-tertiary)",
                  fontWeight: technique === t.key ? 500 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 14, opacity: 0.85 }}>
            {TECHNIQUES.find((t) => t.key === technique)?.blurb}
          </div>

          {/* Prompt picker */}
          {technique === "prompt" && (
            <div style={{
              background: "var(--color-background-secondary)",
              borderRadius: 10, padding: "12px 14px", marginBottom: 16,
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Pick a prompt</span>
                <button
                  onClick={() => setPromptOptions(samplePrompts(4))}
                  style={{ fontSize: 11, padding: "3px 10px", color: "var(--color-text-secondary)" }}
                >
                  Shuffle ↻
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {promptOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => insertScaffold(`> ${p}\n\n`)}
                    style={{
                      textAlign: "left", fontSize: 13, lineHeight: 1.4,
                      padding: "8px 12px", borderRadius: 8,
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      color: "var(--color-text-primary)", cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)..."
        style={{
          width: "100%", marginBottom: 12,
          fontSize: 16, fontWeight: 500,
          border: "none", outline: "none",
          background: "transparent",
          color: "var(--color-text-primary)",
          fontFamily: "inherit",
        }}
      />

      <div
        style={{
          height: "0.5px",
          background: "var(--color-border-tertiary)",
          marginBottom: 12,
        }}
      />

      {/* Content */}
      <textarea
        ref={textRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today? Write freely — no one else will read this unless you choose to share it..."
        autoFocus
        style={{
          width: "100%", minHeight: 200,
          resize: "vertical", border: "none",
          outline: "none", background: "transparent",
          fontSize: 14, lineHeight: 1.75,
          color: "var(--color-text-primary)",
          fontFamily: "inherit",
        }}
      />

      {/* Word count */}
      <div style={{
        fontSize: 11, color: "var(--color-text-secondary)",
        textAlign: "right", marginBottom: 16,
      }}>
        {wordCount} words
      </div>

      {/* Mood selector */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontSize: 11, color: "var(--color-text-secondary)",
          marginBottom: 8, fontWeight: 500,
          letterSpacing: "0.4px",
        }}>
          How are you feeling?
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              style={{
                flex: 1, padding: "7px 4px", fontSize: 12,
                background: mood === m.value ? m.bg : "var(--color-background-secondary)",
                color: mood === m.value ? m.color : "var(--color-text-secondary)",
                borderColor: mood === m.value ? m.color : "var(--color-border-tertiary)",
                borderWidth: mood === m.value ? "1.5px" : "0.5px",
                fontWeight: mood === m.value ? 500 : 400,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          style={{
            flex: 2,
            background: content.trim()
              ? "var(--color-background-success)"
              : undefined,
            color: content.trim()
              ? "var(--color-text-success)"
              : undefined,
            borderColor: content.trim()
              ? "var(--color-border-success)"
              : undefined,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : initial ? "Save changes" : "Save entry"}
        </button>
      </div>
    </div>
  );
}
