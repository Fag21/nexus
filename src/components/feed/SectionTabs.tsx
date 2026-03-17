"use client";

type Tab = "books" | "videos" | "favorites";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  favCount: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "books",     label: "Books" },
  { key: "videos",    label: "Videos" },
  { key: "favorites", label: "Saved" },
];

export function SectionTabs({ active, onChange, favCount }: Props) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "7px 18px",
            fontSize: 13,
            borderRadius: 20,
            fontWeight: active === t.key ? 500 : 400,
            background: active === t.key
              ? "var(--color-background-info)"
              : "var(--color-background-secondary)",
            color: active === t.key
              ? "var(--color-text-info)"
              : "var(--color-text-secondary)",
            borderColor: active === t.key
              ? "var(--color-border-info)"
              : "var(--color-border-tertiary)",
          }}
        >
          {t.label}
          {t.key === "favorites" && favCount > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "var(--color-background-info)",
                color: "var(--color-text-info)",
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 10,
                border: "0.5px solid var(--color-border-info)",
              }}
            >
              {favCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}