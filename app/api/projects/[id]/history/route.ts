import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { historyId, changedAt } = await request.json();

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  const history = await prisma.stateHistory.update({
    where: { id: historyId },
    data: { changedAt: changedAt ? new Date(changedAt) : null },
  });

  return NextResponse.json(history);
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
  const { historyId } = await request.json();

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  // Obtener el estado que se va a eliminar
  const historyToDelete = await prisma.stateHistory.findUnique({
    where: { id: historyId },
  });

  await prisma.stateHistory.delete({ where: { id: historyId } });

  // Si se eliminó un estado "Terminado", recalcular lastUpdateAt
  if (historyToDelete?.state === "Terminado") {
    // Buscar el último "Terminado" restante en el historial
    const lastTerminado = await prisma.stateHistory.findFirst({
      where: { projectId: id, state: "Terminado" },
      orderBy: { changedAt: "desc" },
    });

    // Actualizar lastUpdateAt: usar changedAt del último Terminado o endAt si no hay ninguno
    await prisma.project.update({
      where: { id },
      data: {
        lastUpdateAt: lastTerminado?.changedAt || project.endAt,
      },
    });
  }

  return NextResponse.json({ success: true });
}
