"use client";
import { useState } from "react";

type Phase = "idle" | "confirm" | "burning" | "relief";

interface Props {
  journalId: string;
  onBurn: (id: string) => Promise<void>;
}

const FLAMES = [
  { x: "20%", delay: "0s", size: "2.2rem", duration: "0.7s" },
  { x: "35%", delay: "0.15s", size: "3rem", duration: "0.9s" },
  { x: "50%", delay: "0.05s", size: "3.5rem", duration: "0.8s" },
  { x: "65%", delay: "0.2s", size: "2.8rem", duration: "1s" },
  { x: "78%", delay: "0.1s", size: "2rem", duration: "0.75s" },
];

export function BurnAnimation({ journalId, onBurn }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");

  const startBurn = () => setPhase("confirm");

  const confirmBurn = async () => {
    setPhase("burning");
    await onBurn(journalId);
    setTimeout(() => setPhase("relief"), 3200);
    setTimeout(() => setPhase("idle"), 7000);
  };

  return (
    <>
      <button
        onClick={startBurn}
        style={{
          fontSize: 12,
          padding: "4px 12px",
          background: "var(--color-background-danger)",
          color: "var(--color-text-danger)",
          borderColor: "var(--color-border-danger)",
        }}
      >
        Burn it
      </button>

      {/* Confirm dialog */}
      {phase === "confirm" && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 50,
          }}
          onClick={(e) => e.target === e.currentTarget && setPhase("idle")}
        >
          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 16, padding: 28,
              width: 340, maxWidth: "90vw",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🔥</div>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              Burn this entry?
            </h3>
            <p style={{
              fontSize: 13, color: "var(--color-text-secondary)",
              lineHeight: 1.5, marginBottom: 22,
            }}>
              This will permanently release this entry. Use this when you need
              to let go of tension, anger, or something weighing on you.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPhase("idle")}
                style={{ flex: 1 }}
              >
                Keep it
              </button>
              <button
                onClick={confirmBurn}
                style={{
                  flex: 1,
                  background: "var(--color-background-danger)",
                  color: "var(--color-text-danger)",
                  borderColor: "var(--color-border-danger)",
                }}
              >
                Yes, burn it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Burning animation */}
      {phase === "burning" && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "#0a0500",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 50,
          }}
        >
          <style>{`
            @keyframes flicker {
              0%,100%{ transform: scaleY(1) scaleX(1) translateY(0); opacity:1; }
              25%{ transform: scaleY(1.15) scaleX(0.9) translateY(-6px); opacity:0.9; }
              50%{ transform: scaleY(0.9) scaleX(1.1) translateY(2px); opacity:1; }
              75%{ transform: scaleY(1.1) scaleX(0.95) translateY(-4px); opacity:0.85; }
            }
            @keyframes paperBurn {
              0%{ opacity:1; transform: scale(1) rotate(0deg); }
              60%{ opacity:0.6; transform: scale(0.85) rotate(-3deg); }
              100%{ opacity:0; transform: scale(0.3) rotate(8deg); }
            }
            @keyframes fadeInUp {
              from{ opacity:0; transform:translateY(16px); }
              to{ opacity:1; transform:translateY(0); }
            }
            @keyframes ember {
              0%{ opacity:1; transform:translateY(0) translateX(0) scale(1); }
              100%{ opacity:0; transform:translateY(-60px) translateX(var(--dx,10px)) scale(0); }
            }
          `}</style>

          {/* Paper sheet */}
          <div
            style={{
              width: 200, height: 240,
              background: "#fef9e7",
              borderRadius: 4,
              display: "flex", alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "paperBurn 3s ease-in forwards",
              boxShadow: "0 0 40px rgba(255,100,0,0.4)",
            }}
          >
            <div style={{
              width: 140, height: 6,
              background: "#ddd", borderRadius: 3,
              position: "absolute", top: 40,
            }} />
            <div style={{
              width: 120, height: 6,
              background: "#ddd", borderRadius: 3,
              position: "absolute", top: 58,
            }} />
            <div style={{
              width: 130, height: 6,
              background: "#ddd", borderRadius: 3,
              position: "absolute", top: 76,
            }} />
            <div style={{
              width: 100, height: 6,
              background: "#ddd", borderRadius: 3,
              position: "absolute", top: 94,
            }} />
          </div>

          {/* Flames */}
          <div style={{
            position: "absolute",
            bottom: "calc(50% - 40px)",
            width: 240,
            height: 120,
            pointerEvents: "none",
          }}>
            {FLAMES.map((f, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: f.x,
                  bottom: 0,
                  fontSize: f.size,
                  animation: `flicker ${f.duration} ease-in-out infinite`,
                  animationDelay: f.delay,
                  transformOrigin: "bottom center",
                  filter: "hue-rotate(0deg)",
                }}
              >
                🔥
              </div>
            ))}
          </div>

          {/* Embers */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: "50%",
                left: `${30 + i * 6}%`,
                width: 4, height: 4,
                borderRadius: "50%",
                background: "#ff6600",
                animation: `ember ${1 + i * 0.2}s ease-out forwards`,
                animationDelay: `${0.5 + i * 0.15}s`,
                ["--dx" as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px`,
              }}
            />
          ))}

          <p
            style={{
              color: "rgba(255,200,100,0.8)",
              fontSize: 14,
              marginTop: 32,
              animation: "fadeInUp 0.8s ease both",
              animationDelay: "0.4s",
              fontStyle: "italic",
              position: "relative", zIndex: 2,
            }}
          >
            Releasing what weighs you down...
          </p>
        </div>
      )}

      {/* Relief screen */}
      {phase === "relief" && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "#F0FAF4",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 50,
            padding: 32,
          }}
        >
          <style>{`
            @keyframes floatUp {
              from{ opacity:0; transform:translateY(30px) scale(0.9); }
              to{ opacity:1; transform:translateY(0) scale(1); }
            }
            @keyframes pulse {
              0%,100%{ transform:scale(1); }
              50%{ transform:scale(1.06); }
            }
          `}</style>

          <div
            style={{
              fontSize: 64, marginBottom: 24,
              animation: "floatUp 0.7s ease both, pulse 3s ease-in-out 0.7s infinite",
            }}
          >
            🕊️
          </div>

          <h2
            style={{
              fontSize: 28, fontWeight: 400,
              color: "#1A1F16",
              textAlign: "center",
              marginBottom: 14,
              animation: "floatUp 0.7s ease both",
              animationDelay: "0.2s",
              fontStyle: "italic",
            }}
          >
            You let it go.
          </h2>

          <p
            style={{
              fontSize: 15, color: "#3D4A38",
              textAlign: "center", lineHeight: 1.7,
              maxWidth: 320,
              animation: "floatUp 0.7s ease both",
              animationDelay: "0.4s",
            }}
          >
            That weight is gone now. Take a breath.
            You are lighter than you were a moment ago.
          </p>

          <div
            style={{
              marginTop: 32,
              display: "flex", gap: 6,
              animation: "floatUp 0.7s ease both",
              animationDelay: "0.7s",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: "#5BAD7F",
                  opacity: 0.3 + i * 0.14,
                  animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setPhase("idle")}
            style={{
              marginTop: 36,
              padding: "10px 28px",
              fontSize: 14,
              animation: "floatUp 0.7s ease both",
              animationDelay: "0.9s",
            }}
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}