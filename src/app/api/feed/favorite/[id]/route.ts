import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null | undefined;
  return s?.user?.id ?? null;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = getUserId(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.favorite.delete({
    where: { id, userId },
  });

  return NextResponse.json({ success: true });
}