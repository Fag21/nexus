"use client";
import { useState } from "react";

interface Props {
  appName: string;
  usedToday: number;
  dailyLimit: number;
  onClose: () => void;
  onLog: (minutes: number) => Promise<void>;
}

export function LogUsageModal({ appName, usedToday, dailyLimit, onClose, onLog }: Props) {
  const [minutes, setMinutes] = useState(15);
  const [saving, setSaving] = useState(false);

  const newTotal = usedToday + minutes;
  const isOver = newTotal > dailyLimit;

  const handleLog = async () => {
    setSaving(true);
    await onLog(minutes);
    setSaving(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "white", borderRadius: 16, padding: 28,
        width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          Log usage — {appName}
        </h2>
        <p style={{ fontSize: 13, color: "#6B7A64", marginBottom: 24 }}>
          Already used {usedToday} of {dailyLimit} min today
        </p>

        <p style={{ fontSize: 12, color: "#6B7A64", marginBottom: 8, fontWeight: 500 }}>
          How many minutes just now?{" "}
          <strong style={{ color: isOver ? "#B83232" : "#1A1F16" }}>{minutes} min</strong>
        </p>
        <input
          type="range" min={1} max={120} step={1} value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 12 }}
        />

        {isOver && (
          <div style={{
            background: "#FDECEA", border: "1px solid #F5C4B3",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 13, color: "#712B13",
          }}>
            This will put you {newTotal - dailyLimit} min over your daily limit.
          </div>
        )}

        <div style={{
          background: "#F6F8F4", borderRadius: 8, padding: "10px 14px",
          marginBottom: 20, fontSize: 13, color: "#3D4A38",
        }}>
          New total: <strong>{newTotal} / {dailyLimit} min</strong>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 10, borderRadius: 8,
            border: "1px solid #DDE5D8", background: "white",
            fontSize: 13, cursor: "pointer", color: "#6B7A64",
          }}>
            Cancel
          </button>
          <button onClick={handleLog} disabled={saving} style={{
            flex: 1, padding: 10, borderRadius: 8, border: "none",
            background: isOver ? "#B83232" : "#2D7A4F",
            color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Saving..." : "Log it"}
          </button>
        </div>
      </div>
    </div>
  );
}