import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { projectIds } = await request.json();

  if (!Array.isArray(projectIds)) {
    return NextResponse.json(
      { error: "projectIds debe ser un array" },
      { status: 400 }
    );
  }

  // Verificar que todos los proyectos pertenecen al usuario
  const projects = await prisma.project.findMany({
    where: {
      id: { in: projectIds },
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (projects.length !== projectIds.length) {
    return NextResponse.json(
      { error: "Proyectos no válidos" },
      { status: 400 }
    );
  }

  // Actualizar el orden de cada proyecto
  await Promise.all(
    projectIds.map((id: string, index: number) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
