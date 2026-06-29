"use client";
import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  delta?: { value: string; up: boolean };
  accent?: "green" | "amber" | "red" | "blue";
  onClick?: () => void;
  children?: ReactNode;
}

const ACCENT_STYLES = {
  green: {
    value: "var(--color-text-success)",
    bar: "#2f9e6e",
  },
  amber: {
    value: "var(--color-text-warning)",
    bar: "#e0833b",
  },
  red: {
    value: "var(--color-text-danger)",
    bar: "#d6453b",
  },
  blue: {
    value: "var(--color-text-info)",
    bar: "#2f74c0",
  },
};

export function StatCard({
  label, value, sub, delta, accent = "green", onClick, children,
}: Props) {
  const a = ACCENT_STYLES[accent];

  return (
    <div
      onClick={onClick}
      className="skeu-card"
      style={{
        position: "relative",
        padding: "16px 18px 14px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${a.bar}, color-mix(in srgb, ${a.bar} 50%, #fff))`,
        }}
      />
      <div style={{
        fontSize: 11, color: "var(--color-text-secondary)",
        fontWeight: 500, marginBottom: 8,
        letterSpacing: "0.2px",
      }}>
        {label}
      </div>

      <div style={{
        fontSize: 28, fontWeight: 600,
        lineHeight: 1, letterSpacing: "-0.5px",
        color: a.value, marginBottom: 4,
      }}>
        {value}
      </div>

      {sub && (
        <div style={{
          fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4,
        }}>
          {sub}
        </div>
      )}

      {delta && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, padding: "2px 7px",
          borderRadius: 4,
          background: delta.up
            ? "var(--color-background-success)"
            : "var(--color-background-danger)",
          color: delta.up
            ? "var(--color-text-success)"
            : "var(--color-text-danger)",
        }}>
          {delta.up ? "▲" : "▼"} {delta.value}
        </div>
      )}

      {children}
    </div>
  );
}