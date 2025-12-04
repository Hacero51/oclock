// app/api/empleados/data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [sucursales, departamentos, centros, turnos] = await Promise.all([
      prisma.ebranch.findMany({
        select: { Oid: true, Description: true, Code: true },
      }),
      prisma.department.findMany({
        select: { Oid: true, Name: true },
      }),
      prisma.costcenter.findMany({
        select: { Oid: true, Name: true },
      }),
      prisma.shift.findMany({
        select: { Oid: true, Name: true },
      }),
    ]);

    return NextResponse.json({
      sucursales,
      departamentos,
      centrosCosto: centros,
      turnos,
    });

  } catch (err) {
    console.error("❌ Error cargando catálogos:", err);
    return NextResponse.json(
      { error: "Error cargando catálogos" },
      { status: 500 }
    );
  }
}

