"use client";
import { useState } from "react";
import { Habit, HabitType } from "@/types/index";

const ICONS = ["🏃", "📖", "🧘", "✍️", "💪", "🥗", "💤", "🚭", "📵", "💧", "🎯", "🎨"];
const COLORS = [
  "#2D7A4F", "#0F6E56", "#185FA5", "#B86B1A",
  "#993556", "#534AB7", "#A32D2D", "#3B6D11",
];

interface Props {
  onAdd: (data: Partial<Habit>) => Promise<void>;
  onClose: () => void;
}

export function AddHabitModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HabitType>("BUILD");
  const [frequency, setFrequency] = useState("daily");
  const [scheduledTime, setScheduledTime] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState("#2D7A4F");
  const [motivation, setMotivation] = useState("");
  const [ifSucceed, setIfSucceed] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name, description, type, frequency,
        scheduledTime: scheduledTime || undefined,
        icon, color,
        motivation: motivation || undefined,
        ifSucceed: ifSucceed || undefined,
      });
      onClose();
    } catch {
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 16, padding: 24,
          width: 420, maxWidth: "92vw",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: s <= step
                  ? "var(--color-background-success)"
                  : "var(--color-background-secondary)",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* Step 1 — Basics */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 18 }}>
              What habit?
            </h2>

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              Habit name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning run, No phone in bed..."
              style={{ width: "100%", marginBottom: 14 }}
              autoFocus
            />

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              Description (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about this habit..."
              style={{ width: "100%", marginBottom: 14 }}
            />

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>
              I want to...
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {(["BUILD", "BREAK"] as HabitType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1, padding: "10px",
                    fontSize: 13, fontWeight: 500,
                    background: type === t
                      ? t === "BUILD"
                        ? "var(--color-background-success)"
                        : "var(--color-background-danger)"
                      : "var(--color-background-secondary)",
                    color: type === t
                      ? t === "BUILD"
                        ? "var(--color-text-success)"
                        : "var(--color-text-danger)"
                      : "var(--color-text-secondary)",
                    borderColor: type === t
                      ? t === "BUILD"
                        ? "var(--color-border-success)"
                        : "var(--color-border-danger)"
                      : "var(--color-border-tertiary)",
                  }}
                >
                  {t === "BUILD" ? "Build this habit" : "Break this habit"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              style={{
                width: "100%",
                background: name.trim() ? "var(--color-background-success)" : undefined,
                color: name.trim() ? "var(--color-text-success)" : undefined,
                borderColor: name.trim() ? "var(--color-border-success)" : undefined,
              }}
            >
              Next →
            </button>
          </>
        )}

        {/* Step 2 — Schedule + Appearance */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 18 }}>
              When and how it looks
            </h2>

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              Frequency
            </label>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["daily", "weekdays", "weekends", "custom"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  style={{
                    flex: 1, padding: "7px 4px", fontSize: 11,
                    background: frequency === f
                      ? "var(--color-background-info)"
                      : "var(--color-background-secondary)",
                    color: frequency === f
                      ? "var(--color-text-info)"
                      : "var(--color-text-secondary)",
                    borderColor: frequency === f
                      ? "var(--color-border-info)"
                      : "var(--color-border-tertiary)",
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              Reminder time (optional)
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={{ width: "100%", marginBottom: 16 }}
            />

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>
              Icon
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ICONS.map((ic) => (
                <div
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    width: 38, height: 38, borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, cursor: "pointer",
                    border: icon === ic
                      ? "2px solid var(--color-border-info)"
                      : "0.5px solid var(--color-border-tertiary)",
                    background: icon === ic
                      ? "var(--color-background-info)"
                      : "var(--color-background-secondary)",
                  }}
                >
                  {ic}
                </div>
              ))}
            </div>

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>
              Color
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, cursor: "pointer",
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 2,
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  borderColor: "var(--color-border-info)",
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Motivation */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
              Your why
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 18 }}>
              These are shown to you when you need motivation. Both are optional but powerful.
            </p>

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              Why do you want this? (your personal reason)
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="e.g. I want to feel energised and strong every morning..."
              style={{
                width: "100%", minHeight: 72,
                resize: "vertical", marginBottom: 14,
                fontFamily: "inherit", fontSize: 13,
                padding: "8px 12px",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 8, color: "var(--color-text-primary)",
                background: "var(--color-background-primary)",
                outline: "none",
              }}
            />

            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
              If I keep this up, I will...
            </label>
            <textarea
              value={ifSucceed}
              onChange={(e) => setIfSucceed(e.target.value)}
              placeholder="e.g. treat myself to a weekend trip after 30 days..."
              style={{
                width: "100%", minHeight: 72,
                resize: "vertical", marginBottom: 20,
                fontFamily: "inherit", fontSize: 13,
                padding: "8px 12px",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 8, color: "var(--color-text-primary)",
                background: "var(--color-background-primary)",
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  flex: 2,
                  background: "var(--color-background-success)",
                  color: "var(--color-text-success)",
                  borderColor: "var(--color-border-success)",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Create habit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}