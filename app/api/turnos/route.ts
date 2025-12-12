import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const turnos = await prisma.shift.findMany({
      select: {
        Oid: true,
        Name: true,
        NumberCycles: true,
        Status: true,
      },
      orderBy: {
        Name: 'asc',
      }
    });

    // Mapeamos para que el frontend reciba algo limpio
    const response = turnos.map(t => ({
      Oid: t.Oid,
      Name: t.Name || "Sin Nombre",
      Cycles: t.NumberCycles || 1,
      Status: t.Status === 0 ? "Activo" : "Inactivo" // Asumiendo 0=Activo en ZKTeco
    }));

    return NextResponse.json(response);

  } catch (err) {
    console.error("❌ Error cargando turnos:", err);
    return NextResponse.json(
      { error: "Error cargando turnos" },
      { status: 500 }
    );
  }
}