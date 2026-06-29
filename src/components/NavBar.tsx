"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/habits", label: "Habits" },
  { href: "/journal", label: "Journal" },
  { href: "/social", label: "Social" },
  { href: "/feed", label: "Feed" },
  { href: "/ai", label: "AI Coach" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background:
          "color-mix(in srgb, var(--color-background-primary) 80%, transparent)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 6px 20px -16px rgba(16,24,20,0.5)",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "12px clamp(20px, 4vw, 48px)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "var(--color-text-primary)",
            textDecoration: "none",
            marginRight: 12,
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background:
                "linear-gradient(160deg, var(--accent), color-mix(in srgb, var(--accent) 65%, #000))",
              boxShadow: "var(--skeu-pressable)",
              display: "inline-block",
            }}
          />
          Nexus
        </Link>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "7px 15px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  color: active ? "#fff" : "var(--color-text-secondary)",
                  background: active
                    ? "linear-gradient(160deg, var(--accent), color-mix(in srgb, var(--accent) 72%, #000))"
                    : "transparent",
                  border: active
                    ? "0.5px solid color-mix(in srgb, var(--accent) 60%, #000)"
                    : "0.5px solid transparent",
                  boxShadow: active ? "var(--skeu-pressable)" : "none",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Log out"
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 14px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
          }}
        >
          <LogOut size={15} />
          Log out
        </button>
      </nav>
    </header>
  );
}
