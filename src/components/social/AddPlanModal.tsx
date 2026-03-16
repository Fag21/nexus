"use client";
import { useState } from "react";

const APPS = [
  { name: "Instagram", color: "#E1306C" },
  { name: "Twitter / X", color: "#1DA1F2" },
  { name: "YouTube", color: "#FF0000" },
  { name: "TikTok", color: "#010101" },
  { name: "LinkedIn", color: "#0077B5" },
  { name: "Facebook", color: "#1877F2" },
  { name: "Reddit", color: "#FF4500" },
  { name: "Snapchat", color: "#FFFC00" },
];

interface Props {
  onClose: () => void;
  onAdd: (appName: string, dailyLimit: number) => Promise<void>;
}

export function AddPlanModal({ onClose, onAdd }: Props) {
  const [appName, setAppName] = useState("");
  const [custom, setCustom] = useState("");
  const [limit, setLimit] = useState(60);
  const [saving, setSaving] = useState(false);

  const finalName = appName === "custom" ? custom : appName;

  const handleSubmit = async () => {
    if (!finalName.trim() || limit < 1) return;
    setSaving(true);
    await onAdd(finalName.trim(), limit);
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
        width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>
          Add social media plan
        </h2>

        <p style={{ fontSize: 12, color: "#6B7A64", marginBottom: 8, fontWeight: 500 }}>
          Choose app
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {APPS.map((app) => (
            <button
              key={app.name}
              onClick={() => setAppName(app.name)}
              style={{
                padding: "8px 12px", borderRadius: 8, border: "1px solid",
                borderColor: appName === app.name ? app.color : "#DDE5D8",
                background: appName === app.name ? app.color + "15" : "white",
                color: appName === app.name ? app.color : "#3D4A38",
                fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
              }}
            >
              {app.name}
            </button>
          ))}
          <button
            onClick={() => setAppName("custom")}
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1px dashed",
              borderColor: appName === "custom" ? "#2D7A4F" : "#DDE5D8",
              background: appName === "custom" ? "#E8F5EE" : "white",
              color: "#6B7A64", fontSize: 13, cursor: "pointer", textAlign: "left",
            }}
          >
            + Custom
          </button>
        </div>

        {appName === "custom" && (
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="App name"
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: "1px solid #DDE5D8", fontSize: 13, marginBottom: 16, outline: "none",
            }}
          />
        )}

        <p style={{ fontSize: 12, color: "#6B7A64", marginBottom: 8, fontWeight: 500 }}>
          Daily limit: <strong style={{ color: "#1A1F16" }}>{limit} minutes</strong>
        </p>
        <input
          type="range" min={5} max={300} step={5} value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9EAB96", marginBottom: 24 }}>
          <span>5 min</span><span>1 hour</span><span>2 hours</span><span>5 hours</span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: "1px solid #DDE5D8", background: "white",
              fontSize: 13, cursor: "pointer", color: "#6B7A64",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!finalName || saving}
            style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none",
              background: !finalName ? "#9EAB96" : "#2D7A4F",
              color: "white", fontSize: 13, fontWeight: 600,
              cursor: !finalName ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Add plan"}
          </button>
        </div>
      </div>
    </div>
  );
}