import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { HabitCoachPlan } from "@/types";

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
    const systemPrompt = `You are a world-class habit coach trained in Atomic Habits and Tiny Habits.
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
Keep every string tight and specific to the habit. obstacles: exactly 3. firstWeek: exactly 7.`;

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
            content: `Habit to ${type}: "${name}"${extra ? `\n${extra}` : ""}\n\nGenerate my coaching plan.`,
          },
        ],
        max_tokens: 900,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const plan = JSON.parse(
      raw.replace(/```json|```/g, "").trim()
    ) as HabitCoachPlan;
    return NextResponse.json(plan);
  } catch (err) {
    console.error("[habits-coach] OpenRouter call failed:", err);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
