import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, bio: true, photo: true },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bio, photo } = await request.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bio, photo },
    select: { id: true, name: true, bio: true, photo: true },
  });

  return NextResponse.json(user);
}
