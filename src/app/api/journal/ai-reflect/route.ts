import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    system: `You are a warm, empathetic journal companion.
Read the journal entry and respond with:
1. One sentence reflecting what you heard — validate the feeling.
2. One gentle, forward-looking insight or question to help them grow.
Keep it personal, short, and human. No bullet points. No generic advice.
Never start with "I". Mood context: ${mood}.`,
    messages: [
      {
        role: "user",
        content: `Journal entry:\n\n${content}`,
      },
    ],
  });

  const reflection =
    response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ reflection });
}