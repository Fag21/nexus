"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

function StaggeredFade({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const chars = text.split("");
  return (
    <span ref={ref} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: char === " " ? "inline" : "inline-block" }}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              y: 0,
              transition: { delay: i * 0.07, duration: 0.45 },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export function CinematicHero() {

  return (
    <section className="ch-section">
      <video autoPlay muted loop playsInline className="ch-video">
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
          type="video/mp4"
        />
      </video>
      <div className="ch-overlay" />

      <nav className="ch-nav">
        <Link href="/" className="ch-nexus-brand">
          Nexus
        </Link>
      </nav>

      <div className="ch-content">
        <h1 className="ch-heading font-garamond">
          <span style={{ display: "block" }}>
            <StaggeredFade text="Build better habits." />
          </span>
          <span style={{ display: "block" }}>
            <StaggeredFade text="Grow into your best self." />
          </span>
        </h1>

        <motion.p
          className="ch-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          Nexus brings your habits, screen time, journaling, reading and a
          personal AI coach into one beautiful place so every day moves you
          forward.
        </motion.p>

        <motion.div
          className="ch-cta-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <Link href="/auth/signup" className="liquid-glass ch-btn-primary">
            Get started its free
            <ArrowRight size={16} />
          </Link>
          <Link href="/auth/signin" className="liquid-glass ch-btn-secondary">
            I already have an account
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
