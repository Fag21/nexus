import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { JournalInsights } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

// Reads the user's recent (non-burned) entries server-side and returns a
// psychologist-style reflection across them: recurring themes, emotional
// patterns, strengths, a gentle cognitive reframe, growth suggestions, and a
// single focus for the week. Read-only — never stores or exposes raw entries.
export async function POST() {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.journal.findMany({
    where: { userId, burned: false },
    orderBy: { date: "desc" },
    take: 20,
    select: { date: true, mood: true, content: true },
  });

  if (entries.length < 3)
    return NextResponse.json(
      { error: "Write at least 3 entries to unlock insights." },
      { status: 400 }
    );

  const corpus = entries
    .map((e, i) => {
      const d = new Date(e.date).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      });
      const text = e.content.slice(0, 600);
      return `Entry ${i + 1} (${d}, mood: ${e.mood}):\n${text}`;
    })
    .join("\n\n---\n\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      system: `You are a warm, insightful clinical psychologist reviewing a client's recent journal entries.
You are reflective and validating, never diagnostic or alarmist. You draw gently on CBT and positive psychology.
Respond ONLY with valid JSON (no markdown, no extra text) matching exactly:
{
  "summary": "2-3 sentences reflecting what you notice overall, written warmly to the person ('you...')",
  "themes": ["3-5 recurring themes or topics, short phrases"],
  "emotionalPattern": "one honest, compassionate sentence about their emotional trend",
  "strengths": ["2-4 genuine strengths or healthy coping you can see in their words"],
  "gentleReframe": "if a recurring unhelpful thought pattern appears, offer one kind, balanced reframe; otherwise an encouraging observation",
  "suggestions": ["2-4 small, concrete, doable suggestions for wellbeing or growth"],
  "focus": "one short focus or intention to carry into the coming week"
}
Speak directly to the person. Be specific to their entries, not generic. If anything suggests crisis or self-harm, gently encourage reaching out to a trusted person or professional support in the summary.`,
      messages: [
        {
          role: "user",
          content: `Here are my recent journal entries (newest first):\n\n${corpus}\n\nPlease reflect on them.`,
        },
      ],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const insights = JSON.parse(
      raw.replace(/```json|```/g, "").trim()
    ) as JournalInsights;
    return NextResponse.json(insights);
  } catch {
    return NextResponse.json(
      { error: "Could not generate insights right now." },
      { status: 500 }
    );
  }
}
