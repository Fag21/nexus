import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

const Schema = z.object({
  type: z.enum(["BOOK", "VIDEO"]),
  externalId: z.string().min(1),
  title: z.string().min(1),
  thumbnail: z.string().optional(),
  metadata: z.string().optional(),
});

// GET — fetch all favorites for user
export async function GET() {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

// POST — add a favorite
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = Schema.parse(body);

  // Upsert so double-clicking never throws
  const favorite = await prisma.favorite.upsert({
    where: {
      userId_type_externalId: {
        userId,
        type: data.type,
        externalId: data.externalId,
      },
    },
    update: {},
    create: { ...data, userId },
  });

  return NextResponse.json(favorite, { status: 201 });
}