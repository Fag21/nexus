"use client";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Flame,
  Smartphone,
  NotebookPen,
  Sparkles,
  Library,
  LayoutDashboard,
  ArrowRight,
  Check,
  ShieldCheck,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Scroll-triggered reveal with a subtle 3D tilt-up */
function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 30, rotateX: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Feature card that tilts in 3D toward the pointer */
function TiltCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 16,
  });

  if (reduce) return <article className="lp-card">{children}</article>;

  return (
    <motion.article
      className="lp-card"
      initial={{ opacity: 0, y: 30, rotateX: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -4 }}
    >
      <div style={{ transform: "translateZ(40px)" }}>{children}</div>
    </motion.article>
  );
}

/* Hero product mock that tilts with the pointer and floats gently */
function PreviewMock({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), {
    stiffness: 120,
    damping: 18,
  });

  if (reduce) {
    return <div className="lp-preview">{children}</div>;
  }

  return (
    <motion.div
      className="lp-preview"
      initial={{ opacity: 0, y: 60, rotateX: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Flame,
    title: "Habits & Streaks",
    desc: "Build routines that stick. Earn XP, level up, and watch your streaks grow with a daily scheduler that keeps you accountable.",
  },
  {
    icon: Smartphone,
    title: "Screen-Time Control",
    desc: "Set daily limits for the apps that drain you. Log usage, get alerted before you overshoot, and reclaim your focus.",
  },
  {
    icon: NotebookPen,
    title: "Journal + AI Reflection",
    desc: "Capture how you feel, track your mood over time, and get thoughtful AI reflections on your entries — or burn them away.",
  },
  {
    icon: Sparkles,
    title: "Personal AI Coach",
    desc: "Chat with a coach that knows your data. Get a tailored weekly plan, growth summaries, and nudges exactly when you need them.",
  },
  {
    icon: Library,
    title: "Curated Feed & Library",
    desc: "Discover books and videos worth your time, save your favorites, and build a library that compounds your growth.",
  },
  {
    icon: LayoutDashboard,
    title: "Growth Dashboard",
    desc: "One score for your whole life. A composite growth score, weekly heatmaps, and analytics that show momentum at a glance.",
  },
];

const STEPS = [
  {
    title: "Create your free account",
    desc: "Sign up with Google or a magic link in seconds — no passwords, no friction.",
  },
  {
    title: "Set your habits & limits",
    desc: "Add the habits you want to build and the apps you want to tame. Nexus does the tracking.",
  },
  {
    title: "Grow with your AI coach",
    desc: "Reflect, review your score, and let your coach guide the next step every single week.",
  },
];

function Logo() {
  return (
    <div className="lp-logo">
      <span className="lp-logo-mark" aria-hidden>
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
      </span>
      <span className="lp-logo-word">Nexus</span>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="lp">
      {/* Nav */}
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <Logo />
          <nav className="lp-nav-actions">
            <Link href="/auth/signin" className="lp-btn lp-btn-link lp-hide-sm">
              Sign in
            </Link>
            <Link href="/auth/signup" className="lp-btn lp-btn-primary">
              Get started
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-container lp-hero">
        <motion.span
          className="lp-eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Sparkles size={14} />
          <span>
            Your <b>all-in-one</b> personal growth OS
          </span>
        </motion.span>

        <motion.h1
          className="lp-h1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
        >
          Build better habits.
          <br />
          Grow into your <span className="lp-grad">best self.</span>
        </motion.h1>

        <motion.p
          className="lp-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: EASE }}
        >
          Nexus brings your habits, screen time, journaling, reading and a
          personal AI coach into one beautiful place — so every day moves you
          forward.
        </motion.p>

        <motion.div
          className="lp-cta-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          <Link href="/auth/signup" className="lp-btn lp-btn-primary lp-btn-lg">
            Get started — it&apos;s free
            <ArrowRight size={18} />
          </Link>
          <Link href="/auth/signin" className="lp-btn lp-btn-ghost lp-btn-lg">
            I already have an account
          </Link>
        </motion.div>

        <motion.span
          className="lp-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
        >
          <ShieldCheck size={15} />
          No credit card · No passwords · Sign in with Google or email
        </motion.span>

        {/* Product preview mock */}
        <PreviewMock>
          <div className="lp-preview-bar">
            <span className="lp-dot" />
            <span className="lp-dot" />
            <span className="lp-dot" />
          </div>
          <div className="lp-preview-body">
            <div className="lp-mini">
              <div className="lp-mini-label">This week&apos;s habits</div>
              <div className="lp-heat">
                {[
                  "on","on","mid","on","on","mid","on",
                  "mid","on","on","on","mid","on","on",
                  "on","mid","on","on","on","on","mid",
                ].map((c, i) => (
                  <i key={i} className={c} />
                ))}
              </div>
              <div className="lp-bars">
                {[40, 70, 55, 90, 65, 80, 100].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="lp-mini">
              <div className="lp-mini-label">Growth score</div>
              <div className="lp-ring" aria-hidden />
            </div>
            <div className="lp-mini">
              <div className="lp-mini-label">Day streak</div>
              <div className="lp-mini-big">21🔥</div>
              <div className="lp-mini-label" style={{ marginTop: 14 }}>
                Focus reclaimed
              </div>
              <div className="lp-mini-big">2.4h</div>
            </div>
          </div>
        </PreviewMock>
      </section>

      {/* Features */}
      <section className="lp-container lp-section" id="features">
        <Reveal className="lp-section-head">
          <div className="lp-kicker">Everything you need</div>
          <h2 className="lp-h2">One app for every part of your growth</h2>
          <p className="lp-h2-sub">
            Stop juggling five different apps. Nexus connects your habits, focus,
            reflection and learning so the whole picture works together.
          </p>
        </Reveal>

        <div className="lp-grid" style={{ perspective: 1200 }}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <TiltCard key={title} delay={i * 0.06}>
              <div className="lp-card-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-container lp-section" id="how">
        <Reveal className="lp-section-head">
          <div className="lp-kicker">How it works</div>
          <h2 className="lp-h2">Start in under a minute</h2>
        </Reveal>
        <div className="lp-steps" style={{ perspective: 1000 }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.title} className="lp-step" delay={i * 0.1}>
              <div className="lp-step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-container lp-section" style={{ paddingTop: 8 }}>
        <Reveal className="lp-cta">
          <h2>Your best self is one habit away.</h2>
          <p>
            Join Nexus today and turn small daily wins into lasting change — with
            an AI coach in your corner the whole way.
          </p>
          <div className="lp-cta-row">
            <Link href="/auth/signup" className="lp-btn lp-btn-primary lp-btn-lg">
              Create your free account
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/signin" className="lp-btn lp-btn-ghost lp-btn-lg">
              Sign in
            </Link>
          </div>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 18,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: 13,
              opacity: 0.92,
              position: "relative",
            }}
          >
            {["Free forever plan", "Private & secure", "Cancel anytime"].map(
              (t) => (
                <span
                  key={t}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Check size={15} />
                  {t}
                </span>
              )
            )}
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <Logo />
          <span>© {2026} Nexus · Built for people who want to grow.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/auth/signin">Sign in</Link>
            <Link href="/auth/signup">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
