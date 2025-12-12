import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { isValidName } from "@/lib/utils";

export async function GET() {
  try {
    // 1. Obtener Horarios Base (Timetable)
    const horarios = await prisma.timetable.findMany({
      select: {
        Oid: true,
        DisplayName: true,
        TotalTime: true,
      },
    });

    // 2. Extraer IDs para buscar detalles
    const oids = horarios.map(h => h.Oid);

    // 3. Buscar detalles en TimetableFixed (Fijos) y TimetableVariable (Variables)
    const [detallesFijos, detallesVariables] = await Promise.all([
      prisma.timetablefixed.findMany({ where: { Oid: { in: oids } } }),
      prisma.timetablevariable.findMany({ where: { Oid: { in: oids } } }),
    ]);

    // 4. Crear Mapas para acceso rápido
    const fijosMap = new Map(detallesFijos.map(d => [d.Oid, d]));
    const variablesMap = new Map(detallesVariables.map(d => [d.Oid, d]));

    // 5. Unificar datos y formatear
    const respuesta = horarios.map(h => {
      const fijo = fijosMap.get(h.Oid);
      const variable = variablesMap.get(h.Oid);

      // Determinar tipo exacto
      let tipo = "DESCONOCIDO";

      if (fijo) {
        tipo = "HORARIO FIJO";
      } else if (variable) {
        tipo = "HORARIO VARIABLE";
      }

      return {
        Oid: h.Oid,
        Name: h.DisplayName || "Sin Nombre",
        Type: tipo,
        // Formatear el TotalTime (minutos) a hora (480 -> 08:00)
        TotalTime: h.TotalTime ? secondsToTime(h.TotalTime) : "00:00",
      };
    });

    return NextResponse.json(respuesta);

  } catch (err) {
    console.error("❌ Error cargando horarios:", err);
    return NextResponse.json(
      { error: "Error cargando horarios" },
      { status: 500 }
    );
  }
}

// Helper para convertir segundos (480) a Texto ("08:00") --> Para TotalTime
function secondsToTime(val: number | null | undefined): string {
  if (val === null || val === undefined) return "00:00";

  const hours = Math.floor(val / 60 / 60);
  const minutes = Math.round((val - hours * 60 * 60) / 60);
  const seconds = Math.round((val - hours * 60 * 60 - minutes * 60));

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}