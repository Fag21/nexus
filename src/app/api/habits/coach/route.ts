import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import type { HabitCoachPlan } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Generates a personalised, behavioral-science-based plan for one habit.
// Grounded in Atomic Habits / Tiny Habits: identity change, the habit loop
// (cue → routine → reward), implementation intentions, habit stacking,
// the two-minute rule, and if-then obstacle planning.

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; type?: string; description?: string; motivation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "Missing habit name" }, { status: 400 });

  const type = (body.type ?? "BUILD").toUpperCase() === "BREAK" ? "break" : "build";
  const extra = [
    body.description ? `Description: ${body.description}` : "",
    body.motivation ? `Their stated reason: ${body.motivation}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      system: `You are a world-class habit coach trained in Atomic Habits and Tiny Habits.
The user wants to ${type} a habit. Produce a concise, practical, encouraging plan.
Respond ONLY with valid JSON (no markdown, no extra text) matching exactly:
{
  "identity": "string — a short 'I am someone who...' identity statement",
  "why": "string — one motivating sentence reframing the deeper benefit",
  "cue": "string — a concrete trigger to attach the habit to",
  "twoMinute": "string — the 2-minute starter version that is impossible to fail",
  "habitStack": "string — 'After I [existing routine], I will [habit]' template filled in",
  "reward": "string — a small immediate reward to reinforce it",
  "obstacles": [
    { "if": "string — a likely obstacle", "then": "string — the pre-planned response" }
  ],
  "firstWeek": ["string — day 1 step", "...7 short, escalating daily steps total"]
}
Keep every string tight and specific to the habit. obstacles: exactly 3. firstWeek: exactly 7.`,
      messages: [
        {
          role: "user",
          content: `Habit to ${type}: "${name}"${extra ? `\n${extra}` : ""}\n\nGenerate my coaching plan.`,
        },
      ],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const plan = JSON.parse(
      raw.replace(/```json|```/g, "").trim()
    ) as HabitCoachPlan;
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
