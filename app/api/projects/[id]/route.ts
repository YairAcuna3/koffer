import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { tags: true, stateHistory: { orderBy: { createdAt: "desc" } } },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();
  const { tags, ...projectData } = data;

  // Sanitizar campos DateTime - eliminar si no son válidos
  const sanitizeDateTime = (value: unknown): Date | null | undefined => {
    if (value === null) return null;
    if (
      !value ||
      value === "" ||
      (typeof value === "string" && !value.trim())
    ) {
      return null;
    }
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? null : date;
  };

  if ("startAt" in projectData) {
    projectData.startAt = sanitizeDateTime(projectData.startAt);
  }
  if ("endAt" in projectData) {
    projectData.endAt = sanitizeDateTime(projectData.endAt);
  }

  const existingProject = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existingProject) {
    return NextResponse.json(
      { error: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  // Si el estado cambió, agregar al historial
  const stateChanged =
    projectData.state && projectData.state !== existingProject.state;

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...projectData,
      tags: {
        set: [],
        connectOrCreate:
          tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })) || [],
      },
      ...(stateChanged && {
        stateHistory: {
          create: {
            state: projectData.state,
            changedAt: new Date(),
          },
        },
      }),
    },
    include: { tags: true, stateHistory: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(project);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
