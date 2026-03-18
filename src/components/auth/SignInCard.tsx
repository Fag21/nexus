"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mode = "options" | "email" | "email-sent";

export function SignInCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("options");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-in failed. Try again.");
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setError("Could not send email. Check your address and try again.");
      } else {
        setMode("email-sent");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 380,
        maxWidth: "92vw",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "#2D7A4F",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2L9 16M5 7L9 2L13 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="14" r="2.5" fill="white" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.5px",
          }}
        >
          Nexus
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 18,
          padding: "32px 28px",
        }}
      >
        {/* ── Email sent confirmation ── */}
        {mode === "email-sent" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 10,
                color: "var(--color-text-primary)",
              }}
            >
              Check your inbox
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              We sent a sign-in link to{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {email}
              </strong>
              . Click the link to sign in — no password needed.
            </p>
            <button
              onClick={() => {
                setMode("options");
                setEmail("");
              }}
              style={{ width: "100%", fontSize: 13 }}
            >
              Use a different method
            </button>
          </div>
        )}

        {/* ── Options ── */}
        {mode === "options" && (
          <>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 6,
                textAlign: "center",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.3px",
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Sign in to continue your growth journey
            </p>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--color-background-danger)",
                  border: "0.5px solid var(--color-border-danger)",
                  fontSize: 13,
                  color: "var(--color-text-danger)",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 16px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 10,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56C11.24 14.1 10.211 14.42 9 14.42c-2.392 0-4.417-1.616-5.14-3.787H.757v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.86 10.633A5.41 5.41 0 0 1 3.578 9c0-.559.096-1.103.282-1.633V5.035H.757A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.757 4.035l3.103-2.402z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .757 5.035L3.86 7.367C4.583 5.196 6.608 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              {loading ? "Connecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "0.5px",
                  background: "var(--color-border-tertiary)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                }}
              >
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: "0.5px",
                  background: "var(--color-border-tertiary)",
                }}
              />
            </div>

            {/* Email button */}
            <button
              onClick={() => {
                setMode("email");
                setError(null);
              }}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 16px",
                fontSize: 14,
                background: "var(--color-background-secondary)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Continue with email
            </button>

            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginTop: 20,
                lineHeight: 1.5,
              }}
            >
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/auth/signup")}
                style={{
                  color: "var(--color-text-info)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Sign up free
              </span>
            </p>
          </>
        )}

        {/* ── Email input ── */}
        {mode === "email" && (
          <>
            <button
              onClick={() => {
                setMode("options");
                setError(null);
              }}
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Back
            </button>

            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 6,
                color: "var(--color-text-primary)",
              }}
            >
              Sign in with email
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              We&apos;ll send a magic link to your inbox — no password needed.
            </p>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--color-background-danger)",
                  border: "0.5px solid var(--color-border-danger)",
                  fontSize: 13,
                  color: "var(--color-text-danger)",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <label
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
              placeholder="you@example.com"
              autoFocus
              style={{ width: "100%", marginBottom: 16 }}
            />

            <button
              onClick={handleEmail}
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 14,
                background: email.trim()
                  ? "var(--color-background-success)"
                  : undefined,
                color: email.trim() ? "var(--color-text-success)" : undefined,
                borderColor: email.trim()
                  ? "var(--color-border-success)"
                  : undefined,
                opacity: loading || !email.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          textAlign: "center",
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        By signing in you agree to our{" "}
        <span style={{ color: "var(--color-text-info)", cursor: "pointer" }}>
          Terms
        </span>{" "}
        and{" "}
        <span style={{ color: "var(--color-text-info)", cursor: "pointer" }}>
          Privacy Policy
        </span>
      </p>
    </div>
  );
}
