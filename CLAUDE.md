# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Nexus** is a personal-growth web app (Next.js 16 App Router, React 19) bundling five
features — Habits, Journal, Social-media screen-time, a content Feed (books/videos), and an
AI Coach — plus a Dashboard that aggregates them into a "growth score". Postgres (Neon) via
Prisma, NextAuth v5 for auth, Anthropic SDK for the AI features.

## Commands

```bash
npm run dev          # next dev (local development)
npm run build        # next build (production build — also the only typecheck gate)
npm run start        # next start (serve a production build)
npm run lint         # eslint (flat config via eslint-config-next)

npx prisma migrate dev --name <name>   # create + apply a migration against DATABASE_URL
npx prisma generate                    # regenerate the Prisma client after schema edits
npx prisma studio                      # inspect the DB
```

There is **no test runner** and no `typecheck` script — `npm run build` is what surfaces type
errors. Prisma config lives in `prisma.config.ts` (new-style external config that loads
`.env` via `dotenv` and reads `DATABASE_URL`), **not** in a `datasource url` inside the schema.

### Database access from this environment
The sandbox blocks Neon's WebSocket connection. Any command that actually touches the DB
(`prisma migrate`, `prisma studio`, running a route that queries) must be run with the
sandbox disabled. The runtime itself talks to Neon over WebSockets using the `ws` package.

## Architecture

### Per-feature vertical slices
Every feature follows the same five-layer path — trace any feature by walking these in order:

1. `src/app/<feature>/page.tsx` — **server component**, the route. Calls `auth()`, redirects
   to sign-in if no session, then renders `<NavBar/>` + the feature's client page.
2. `src/components/<feature>/<Feature>Page.tsx` — `"use client"` top-level UI, plus sibling
   components in the same folder.
3. `src/hooks/use<Feature>.ts` — client data/state hook consumed by the page.
4. `src/app/api/<feature>/route.ts` (+ nested routes) — REST handlers.
5. `prisma` models — persistence.

### Auth (NextAuth v5)
- Configured in `src/lib/auth.ts`: Prisma adapter, **Google + Email** providers, **database
  sessions**. A `session` callback copies `user.id` onto `session.user` (NextAuth's default
  session type omits it).
- `src/app/api/auth/[...nextauth]/route.ts` just re-exports `handlers`.
- **Server-side guard pattern**, used in every protected route and API handler:
  ```ts
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```
  The cast is the standard way `user.id` is reached here — match it rather than re-typing.
  All queries are scoped by `userId`; there is no row-level security beyond this filter.

### Prisma client (`src/lib/prisma.ts`)
Singleton cached on `globalThis` (dev hot-reload safe). Uses the **Neon serverless adapter**
(`PrismaNeon` with a `connectionString` — do **not** pass a pre-built `Pool`, that breaks it
to localhost). `neonConfig.webSocketConstructor = ws` is required under Node. Generator uses
`engineType = "binary"`.

### AI features (Anthropic)
Live entirely in API routes under `src/app/api/ai/*`, `api/journal/ai-reflect`,
`api/journal/insights`, `api/habits/coach|recommend|motivation`, `api/social`. Pattern:
- `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`, model **`claude-haiku-4-5-20251001`**.
- The route fetches the user's real Prisma data, compresses it into a text "context block",
  and injects it into the prompt so responses are personalised.
- The chat coach (`api/ai/route.ts`) has a **hard topic guardrail** in its system prompt —
  off-topic questions get a fixed refusal string. Preserve that when editing.
- Plan/insight routes ask for **raw JSON** and `JSON.parse` the reply (stripping ``` fences);
  they return 500 on parse failure.

### Types
Single source of truth is `src/types/index.ts`, re-exported through `src/types.ts`. Path
aliases (`tsconfig.json`): `@/types` → `src/types.ts`, `@/types/*` → `src/types/*`, `@/*` →
`src/*`. Note these are hand-written view models that **mirror but do not equal** the Prisma
models (e.g. dates are `string` here, `DateTime` in Prisma; some `src/types/*.ts` and a few
`api/*/route.ts` files contain stray duplicated type blocks — `src/types/index.ts` wins).

### Known inconsistency to watch for
Data-fetching is **not** uniform across hooks. `useDashboard` (and most hooks) fetch from
`/api/*`, but **`useHabits` persists to `localStorage`** (`nexus.habits.v1`) and never calls
the habits API — meanwhile a full `api/habits` + `api/habits/log` backend with XP/level logic
exists in parallel. Check which source a feature actually uses before assuming server state.

### Gamification & scoring
- Habits earn **10 XP per completion**; level = `floor(xp / 100) + 1`. This rule is
  duplicated in `api/habits/log/route.ts` and `useHabits.ts` — change both.
- Dashboard `growthScore` is a weighted composite: habits 40% / social 25% / journal 20% /
  feed 15%, computed in `api/dashboard/route.ts`.
- Streaks are computed by walking backwards day-by-day from today over completed logs; this
  logic is reimplemented in several places (`lib/utils.ts`, `useHabits`, dashboard route).

## Conventions
- React Compiler is **on** (`reactCompiler: true` + `babel-plugin-react-compiler`); don't add
  manual memoization to work around re-renders the compiler already handles.
- Tailwind CSS v4 (PostCSS plugin, no `tailwind.config`), `globals.css` holds the theme.
- `next/image` remote hosts are allowlisted in `next.config.ts` (`books.google.com`,
  `i.ytimg.com`, `img.youtube.com`) — add new external image hosts there or images 500.
- `tsconfig.json` **excludes** `UseJournal.ts` and `AireflectPanel.tsx` (broken/legacy
  duplicates of the lowercase `useJournal.ts` / `AiReflectPanel.tsx`) — edit the included
  lowercase versions.
