import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const XP_PER_COMPLETION = 10;
const XP_PER_LEVEL = 100;

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habitId, completed, note } = await req.json();

  const log = await prisma.habitLog.create({
    data: { habitId, completed, note },
  });

  let levelUp = false;
  let newLevel = 1;
  let newXp = 0;

  if (completed) {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (habit) {
      const prevLevel = habit.level;
      newXp = habit.xp + XP_PER_COMPLETION;
      newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
      levelUp = newLevel > prevLevel;

      await prisma.habit.update({
        where: { id: habitId },
        data: { xp: newXp, level: newLevel },
      });
    }
  }

  return NextResponse.json({ log, levelUp, newLevel, newXp }, { status: 201 });
}