import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [habits, socialPlans, journals] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: {
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.socialPlan.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: {
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.journal.findMany({
      where: { userId, burned: false },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const habitData = habits.map((h) => {
    const completed = h.logs.filter((l) => l.completed).length;
    const total = h.logs.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return `${h.name}: ${rate}% completion rate over 30 days, level ${h.level}, ${h.xp} XP`;
  });

  const socialData = socialPlans.map((p) => {
    const totalUsed = p.logs.reduce((s, l) => s + l.minutesUsed, 0);
    const avgPerDay = p.logs.length > 0
      ? Math.round(totalUsed / 30)
      : 0;
    return `${p.appName}: avg ${avgPerDay}min/day vs ${p.dailyLimit}min limit`;
  });

  const moodCounts = journals.reduce<Record<string, number>>((acc, j) => {
    acc[j.mood] = (acc[j.mood] ?? 0) + 1;
    return acc;
  }, {});
  const moodSummary = Object.entries(moodCounts)
    .map(([mood, count]) => `${mood}: ${count}x`)
    .join(", ");

  const context = [
    `Habit performance (30 days):\n${habitData.join("\n") || "No habits"}`,
    `Social media (30 days):\n${socialData.join("\n") || "No tracking"}`,
    `Journal mood distribution: ${moodSummary || "No entries"}`,
    `Total journal entries: ${journals.length}`,
  ].join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You are a personal growth analyst. 
Read the user's 30-day data and write a warm, honest growth summary.
Structure your response as JSON with no markdown:
{
  "headline": "string (one punchy sentence summarising their month)",
  "strength": "string (their biggest win — be specific)",
  "challenge": "string (their main area to improve — be honest but kind)",
  "momentum": "high" | "medium" | "low",
  "advice": "string (2 sentences of forward-looking coaching)"
}`,
    messages: [
      {
        role: "user",
        content: `My 30-day data:\n${context}`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const summary = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse summary" },
      { status: 500 }
    );
  }
}