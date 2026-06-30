import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, mood } = await req.json();

  if (!content?.trim())
    return NextResponse.json({ error: "No content" }, { status: 400 });

  try {
    const systemPrompt = `You are a warm, empathetic journal companion.
Read the journal entry and respond with:
1. One sentence reflecting what you heard — validate the feeling.
2. One gentle, forward-looking insight or question to help them grow.
Keep it personal, short, and human. No bullet points. No generic advice.
Never start with "I". Mood context: ${mood}.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Journal entry:\n\n${content}`,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }

    const data = await res.json();
    const reflection = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reflection });
  } catch (err) {
    console.error("[ai-reflect] OpenRouter call failed:", err);
    return NextResponse.json(
      { error: "Could not generate reflection right now." },
      { status: 500 }
    );
  }
}