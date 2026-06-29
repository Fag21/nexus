import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

// GET — list the user's active habits with recent logs
export async function GET() {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      logs: {
        where: { date: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(habits);
}

// POST — create a habit
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b?.name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: b.name.trim(),
      description: b.description || null,
      type: b.type === "BREAK" ? "BREAK" : "BUILD",
      frequency: b.frequency || "daily",
      scheduledTime: b.scheduledTime || null,
      color: b.color || "#2D7A4F",
      icon: b.icon || "🎯",
      motivation: b.motivation || null,
      ifSucceed: b.ifSucceed || null,
    },
    include: { logs: true },
  });

  return NextResponse.json(habit, { status: 201 });
}
