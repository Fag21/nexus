import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

const EDITABLE = [
  "name", "description", "type", "frequency", "scheduledTime",
  "color", "icon", "motivation", "ifSucceed", "isActive",
] as const;

// PATCH — update a habit's fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) data[key] = body[key];
  }

  const habit = await prisma.habit.update({
    where: { id, userId },
    data,
    include: { logs: { orderBy: { date: "desc" } } },
  });

  return NextResponse.json(habit);
}

// DELETE — remove a habit (and its logs via cascade)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.habit.delete({ where: { id, userId } });

  return NextResponse.json({ success: true });
}
