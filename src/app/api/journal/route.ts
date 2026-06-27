
// src/app/api/journal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

export async function GET() {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const journals = await prisma.journal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(journals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const journal = await prisma.journal.create({
    data: { ...body, userId },
  });
  return NextResponse.json(journal, { status: 201 });
}

