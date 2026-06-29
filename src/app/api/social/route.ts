import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.socialPlan.findMany({
    where: { userId, isActive: true },
    include: { logs: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appName, dailyLimit } = await req.json();

  if (!appName || typeof dailyLimit !== "number")
    return NextResponse.json(
      { error: "appName and numeric dailyLimit are required" },
      { status: 400 }
    );

  const plan = await prisma.socialPlan.create({
    data: { appName, dailyLimit, userId },
    include: { logs: true },
  });

  return NextResponse.json(plan, { status: 201 });
}
