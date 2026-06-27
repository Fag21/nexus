// src/app/api/journal/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const journal = await prisma.journal.update({
    where: { id, userId },
    data: body,
  });
  return NextResponse.json(journal);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.journal.delete({
    where: { id, userId },
  });
  return NextResponse.json({ success: true });
}