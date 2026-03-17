"use client";

interface Props {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const PROMPTS = [
  {
    category: "Planning",
    items: [
      "Plan my week based on my habits",
      "Help me set a 30-day goal",
      "What should I focus on this week?",
    ],
  },
  {
    category: "Habits",
    items: [
      "Review my habit progress",
      "I keep missing my habit — what do I do?",
      "How do I build a morning routine?",
    ],
  },
  {
    category: "Mindset",
    items: [
      "I need motivation right now",
      "How do I stop procrastinating?",
      "Help me deal with a setback",
    ],
  },
  {
    category: "Wellbeing",
    items: [
      "I am feeling overwhelmed",
      "How can I improve my focus?",
      "Tips for better sleep habits",
    ],
  },
];

export function QuickPrompts({ onSelect, disabled }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {PROMPTS.map((group) => (
        <div key={group.category}>
          <div
            style={{
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              marginBottom: 7,
            }}
          >
            {group.category}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {group.items.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSelect(prompt)}
                disabled={disabled}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 12.5,
                  borderRadius: 8,
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border-tertiary)",
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background =
                      "var(--color-background-info)";
                    e.currentTarget.style.color =
                      "var(--color-text-info)";
                    e.currentTarget.style.borderColor =
                      "var(--color-border-info)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "var(--color-background-secondary)";
                  e.currentTarget.style.color =
                    "var(--color-text-primary)";
                  e.currentTarget.style.borderColor =
                    "var(--color-border-tertiary)";
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}