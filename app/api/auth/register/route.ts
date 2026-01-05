import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: "Nombre y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
