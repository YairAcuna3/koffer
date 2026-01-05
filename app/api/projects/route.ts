import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isConsider = searchParams.get("isConsider") === "true";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const state = searchParams.get("state") || "";
  const type = searchParams.get("type") || "";
  const tag = searchParams.get("tag") || "";

  const where: Record<string, unknown> = {
    userId: session.user.id,
    isConsider,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (state) where.state = state;
  if (type) where.type = type;
  if (tag) {
    where.tags = { some: { name: { contains: tag, mode: "insensitive" } } };
  }

  const orderBy: Record<string, string> = {};
  if (sortBy === "order") orderBy.order = sortOrder;
  else if (sortBy === "name") orderBy.name = sortOrder;
  else if (sortBy === "startAt") orderBy.startAt = sortOrder;
  else if (sortBy === "endAt") orderBy.endAt = sortOrder;
  else if (sortBy === "state") orderBy.state = sortOrder;
  else if (sortBy === "type") orderBy.type = sortOrder;
  else orderBy.createdAt = sortOrder;

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    include: { tags: true, stateHistory: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await request.json();
  const { tags, startAt, endAt, ...projectData } = data;

  // Obtener el máximo order actual para este usuario y tipo de proyecto
  const maxOrderProject = await prisma.project.findFirst({
    where: {
      userId: session.user.id,
      isConsider: projectData.isConsider ?? false,
    },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (maxOrderProject?.order ?? -1) + 1;

  const project = await prisma.project.create({
    data: {
      ...projectData,
      userId: session.user.id,
      order: nextOrder,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      tags: tags?.length
        ? {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          }
        : undefined,
      stateHistory: {
        create: {
          state: projectData.state || "Sin iniciar",
          changedAt: new Date(),
        },
      },
    },
    include: { tags: true, stateHistory: true },
  });

  return NextResponse.json(project);
}
