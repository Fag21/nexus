import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WeeklyPlan } from "@/types";

export async function GET() {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all user data for context
  const [habits, socialPlans, journals] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: {
            date: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.socialPlan.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: {
            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.journal.findMany({
      where: { userId, burned: false },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  const habitSummary = habits.map((h) => {
    const completedDays = h.logs.filter((l) => l.completed).length;
    const totalDays = h.logs.length;
    return `${h.name}: ${completedDays}/${totalDays} completions in 2 weeks, level ${h.level}`;
  });

  const socialSummary = socialPlans.map((p) => {
    const daysOver = p.logs.filter((l) => l.minutesUsed > p.dailyLimit).length;
    return `${p.appName}: ${daysOver} days over limit this week`;
  });

  const moodTrend = journals
    .map((j) => j.mood)
    .join(", ");

  const context = [
    `Habits: ${habitSummary.join("; ") || "none set"}`,
    `Social media issues: ${socialSummary.join("; ") || "none"}`,
    `Recent moods: ${moodTrend || "no data"}`,
  ].join("\n");

  const today = new Date();

  try {
    const systemPrompt = `You are a personal development planner. 
Generate a practical weekly plan based on the user's habit and mood data.
Respond ONLY with valid JSON matching this exact structure, no markdown, no extra text:
{
  "weekOf": "string (e.g. March 17, 2026)",
  "focus": "string (one sentence — the week's main theme)",
  "days": [
    { "day": "Monday", "tasks": ["task 1", "task 2", "task 3"] },
    ...all 7 days
  ],
  "advice": "string (2-3 sentences of personalised coaching advice)"
}
Each day should have 2-3 specific, actionable tasks tied to the user's actual habits.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `User data:\n${context}\n\nToday is ${today.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Generate my weekly plan.`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const plan = JSON.parse(raw.replace(/```json|```/g, "").trim()) as WeeklyPlan;
    return NextResponse.json(plan);
  } catch (err) {
    console.error("[ai-plan] OpenRouter call failed:", err);
    return NextResponse.json(
      { error: "Failed to parse plan" },
      { status: 500 }
    );
  }
}