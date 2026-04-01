"use client";
import { useState } from "react";
import { Journal } from "@/types/index";
import { BurnAnimation } from "./BurnAnimation";
import { JournalEditor } from "./JournalEditor";
import { AiReflectPanel } from "./AiReflectPanel";

interface Props {
  entry: Journal;
  onUpdate: (id: string, data: Partial<Pick<Journal, "title" | "content" | "mood">>) => Promise<void>;
  onBurn: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const MOOD_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  great:   { label: "Great",   color: "#2D7A4F", bg: "#E8F5EE", border: "#C0DD97" },
  good:    { label: "Good",    color: "#3B6D11", bg: "#EAF3DE", border: "#C0DD97" },
  neutral: { label: "Neutral", color: "#633806", bg: "#FAEEDA", border: "#FAC775" },
  low:     { label: "Low",     color: "#712B13", bg: "#FAECE7", border: "#F5C4B3" },
  bad:     { label: "Bad",     color: "#791F1F", bg: "#FDECEA", border: "#F7C1C1" },
};

export function JournalCard({ entry, onUpdate, onBurn, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReflect, setShowReflect] = useState(false);

  const meta = MOOD_META[entry.mood] ?? MOOD_META.neutral;
  const isLong = entry.content.length > 280;
  const preview = isLong && !expanded
    ? entry.content.slice(0, 280) + "..."
    : entry.content;

  const formattedDate = new Date(entry.date).toLocaleDateString("en", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  if (entry.burned) {
    return (
      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12, padding: "14px 16px",
          opacity: 0.5,
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>🕊️</span>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {formattedDate}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
            This entry was burned and released.
          </div>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            marginLeft: "auto", fontSize: 11,
            color: "var(--color-text-secondary)",
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <JournalEditor
        initial={entry}
        onSave={async (data) => {
          await onUpdate(entry.id, data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14, padding: "16px 18px",
        borderLeft: `3px solid ${meta.color}`,
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 10, marginBottom: 10,
      }}>
        <div>
          {entry.title && (
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
              {entry.title}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            {formattedDate}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 20,
              background: meta.bg,
              color: meta.color,
              border: `0.5px solid ${meta.border}`,
              fontWeight: 500,
            }}
          >
            {meta.label}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{ fontSize: 11, padding: "3px 8px", color: "var(--color-text-secondary)" }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            style={{ fontSize: 11, padding: "3px 8px", color: "var(--color-text-secondary)" }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <p style={{
        fontSize: 13, lineHeight: 1.7,
        color: "var(--color-text-primary)",
        whiteSpace: "pre-wrap", marginBottom: 8,
      }}>
        {preview}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            fontSize: 12, color: "var(--color-text-info)",
            background: "transparent", border: "none",
            cursor: "pointer", padding: 0, marginBottom: 10,
          }}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}

      {/* AI reflect */}
      {showReflect && (
        <AiReflectPanel content={entry.content} mood={entry.mood} />
      )}

      {/* Footer actions */}
      <div style={{
        display: "flex", gap: 6,
        paddingTop: 10,
        borderTop: "0.5px solid var(--color-border-tertiary)",
        marginTop: 10,
      }}>
        <button
          onClick={() => setShowReflect(!showReflect)}
          style={{
            fontSize: 12, padding: "4px 12px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            borderColor: "var(--color-border-info)",
          }}
        >
          {showReflect ? "Hide reflection" : "AI reflect ✦"}
        </button>
        <BurnAnimation journalId={entry.id} onBurn={onBurn} />
      </div>
    </div>
  );
}