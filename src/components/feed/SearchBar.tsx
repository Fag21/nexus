"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search icon */}
      <div
        style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ display: "block" }}
        >
          <circle
            cx="6" cy="6" r="4.5"
            stroke="var(--color-text-secondary)" strokeWidth="1.4"
          />
          <path
            d="M9.5 9.5L12 12"
            stroke="var(--color-text-secondary)"
            strokeWidth="1.4" strokeLinecap="round"
          />
        </svg>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        style={{
          width: "100%",
          paddingLeft: 36,
          paddingRight: value ? 36 : 12,
          fontSize: 14,
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute", right: 8, top: "50%",
            transform: "translateY(-50%)",
            background: "transparent", border: "none",
            cursor: "pointer", padding: 4,
            color: "var(--color-text-secondary)",
            fontSize: 14, lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}