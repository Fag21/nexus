import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Nexus Coach — a warm, focused personal development assistant.

YOUR ONLY ALLOWED TOPICS:
- Habits (building, breaking, tracking, streaks)
- Journaling and emotional processing
- Social media control and screen time
- Productivity and deep work
- Goal setting and weekly planning
- Mindset, motivation, and self-belief
- Sleep, exercise, nutrition as they relate to personal growth
- Reading and learning habits
- Mental wellbeing and stress management

IF THE USER ASKS ABOUT ANYTHING ELSE (news, politics, coding help, entertainment,
other people, legal advice, medical diagnosis, general knowledge, sports scores,
math problems, or any topic not in the list above) you MUST respond with exactly:
"I am your self-development coach. I can only help with habits, goals, journaling,
productivity, and personal growth. What would you like to work on?"

TONE RULES:
- Be direct, warm, and specific — never generic
- Keep responses under 180 words unless giving a structured plan
- Reference the user's actual data when it is provided in the context
- Ask one focused follow-up question at the end when appropriate
- Never use bullet points for casual replies — only for structured plans
- Never start a sentence with "I"`;

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, includeContext } = await req.json();

  let contextBlock = "";

  // Optionally attach real user data as context
  if (includeContext) {
    const [habits, socialPlans, journals] = await Promise.all([
      prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          logs: {
            where: {
              date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            orderBy: { date: "desc" },
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
        take: 5,
      }),
    ]);

    // Build streak for each habit
    const habitSummary = habits.map((h) => {
      const completedDays = h.logs.filter((l) => l.completed).length;
      return `${h.name} (${h.type}, ${completedDays}/7 days this week, level ${h.level})`;
    });

    const socialSummary = socialPlans.map((p) => {
      const totalUsed = p.logs.reduce((s, l) => s + l.minutesUsed, 0);
      return `${p.appName}: ${totalUsed}min used this week (limit ${p.dailyLimit}min/day)`;
    });

    const moodSummary = journals
      .slice(0, 3)
      .map((j) => `${j.mood} mood on ${new Date(j.date).toLocaleDateString()}`);

    contextBlock = [
      "\n\n--- USER CONTEXT (use this to personalise your response) ---",
      habitSummary.length
        ? `Habits this week:\n${habitSummary.join("\n")}`
        : "No habits tracked yet.",
      socialSummary.length
        ? `Social media this week:\n${socialSummary.join("\n")}`
        : "No social media tracked.",
      moodSummary.length
        ? `Recent journal moods: ${moodSummary.join(", ")}`
        : "No journal entries.",
      "--- END CONTEXT ---",
    ].join("\n");
  }

  // Inject context into the last user message
  const formattedMessages = messages.map(
    (m: { role: string; content: string }, idx: number) => ({
      role: m.role as "user" | "assistant",
      content:
        includeContext && idx === messages.length - 1
          ? m.content + contextBlock
          : m.content,
    })
  );

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: formattedMessages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ message: text });
}