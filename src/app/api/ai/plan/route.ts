import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { WeeklyPlan } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: `You are a personal development planner. 
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
Each day should have 2-3 specific, actionable tasks tied to the user's actual habits.`,
    messages: [
      {
        role: "user",
        content: `User data:\n${context}\n\nToday is ${today.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Generate my weekly plan.`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const plan = JSON.parse(raw.replace(/```json|```/g, "").trim()) as WeeklyPlan;
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse plan" },
      { status: 500 }
    );
  }
}