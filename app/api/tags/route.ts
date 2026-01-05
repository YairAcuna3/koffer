import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}
