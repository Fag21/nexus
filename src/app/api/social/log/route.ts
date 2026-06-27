
// src/app/api/social/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, minutesUsed } = await req.json();

  // Save the log entry
  const log = await prisma.socialLog.create({
    data: { planId, minutesUsed, userId },
  });

  // Check if todays total exceeds the limit
  const plan = await prisma.socialPlan.findUnique({ where: { id: planId } });
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const todayTotal = await prisma.socialLog.aggregate({
    where: { planId, date: { gte: todayStart } },
    _sum: { minutesUsed: true },
  });

  const totalMinutes = todayTotal._sum.minutesUsed ?? 0;
  const isOverLimit = plan && totalMinutes >= plan.dailyLimit;

  return NextResponse.json({ log, totalMinutes, isOverLimit });
}