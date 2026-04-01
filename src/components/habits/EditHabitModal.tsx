"use client";
import { useState } from "react";
import { Habit } from "@/types/index";

interface Props {
  habit: Habit;
  onUpdate: (id: string, data: Partial<Habit>) => Promise<void>;
  onClose: () => void;
}

export function EditHabitModal({ habit, onUpdate, onClose }: Props) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? "");
  const [scheduledTime, setScheduledTime] = useState(habit.scheduledTime ?? "");
  const [motivation, setMotivation] = useState(habit.motivation ?? "");
  const [ifSucceed, setIfSucceed] = useState(habit.ifSucceed ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(habit.id, {
        name, description,
        scheduledTime: scheduledTime || undefined,
        motivation: motivation || undefined,
        ifSucceed: ifSucceed || undefined,
      });
      onClose();
    } catch {
      alert("Failed to update. Try again.");
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
          width: 400, maxWidth: "92vw",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>
          Edit habit
        </h2>

        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 14 }}
        />

        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
          Description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", marginBottom: 14 }}
        />

        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
          Reminder time
        </label>
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          style={{ width: "100%", marginBottom: 14 }}
        />

        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
          Personal reason
        </label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          style={{
            width: "100%", minHeight: 64, resize: "vertical",
            marginBottom: 14, fontFamily: "inherit", fontSize: 13,
            padding: "8px 12px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 8, outline: "none",
            color: "var(--color-text-primary)",
            background: "var(--color-background-primary)",
          }}
        />

        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
          If I succeed, I will...
        </label>
        <textarea
          value={ifSucceed}
          onChange={(e) => setIfSucceed(e.target.value)}
          style={{
            width: "100%", minHeight: 64, resize: "vertical",
            marginBottom: 20, fontFamily: "inherit", fontSize: 13,
            padding: "8px 12px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 8, outline: "none",
            color: "var(--color-text-primary)",
            background: "var(--color-background-primary)",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              flex: 2,
              background: "var(--color-background-success)",
              color: "var(--color-text-success)",
              borderColor: "var(--color-border-success)",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}