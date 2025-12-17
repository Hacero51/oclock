import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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

    // 2. Extraer IDs
    const oids = horarios.map(h => h.Oid);

    // 3. Buscar detalles
    const [detallesFijos, detallesVariables, linkedShifts] = await Promise.all([
      prisma.timetablefixed.findMany({ where: { Oid: { in: oids } } }),
      prisma.timetablevariable.findMany({ where: { Oid: { in: oids } } }),
      prisma.shifttimetable.findMany({ where: { Timetable: { in: oids } } }) // Buscar turnos para nombres dinámicos
    ]);

    // 4. Mapear datos
    const fijosMap = new Map(detallesFijos.map(d => [d.Oid, d]));
    const variablesMap = new Map(detallesVariables.map(d => [d.Oid, d]));

    // Mapear turnos por Horario
    const misTurnosMap = new Map();
    linkedShifts.forEach(ls => {
      if (!misTurnosMap.has(ls.Timetable)) {
        misTurnosMap.set(ls.Timetable, []);
      }
      misTurnosMap.get(ls.Timetable).push(ls);
    });

    // 5. Unificar y Formatear
    const respuesta = horarios.map(h => {
      const fijo = fijosMap.get(h.Oid);
      const variable = variablesMap.get(h.Oid);

      let tipo = "DESCONOCIDO";
      let displayName = h.DisplayName || "Sin Nombre";

      if (fijo && !variable) { // Un horario es fijo si NO es variable (prioridad) o si esta en fixed table y no variable table
        // Sin embargo, ahora podemos tener entradas en ambos si es variable c/ referencias.
        // La logica de asignacion de tipo original en GET[Oid] usaba "if (fixed) else if (variable)". 
        // Pero para listings, confiemos en que si tiene variable es variable.
        tipo = "HORARIO FIJO";
      }

      // Prioritize Variable but ensure it's a valid variable schedule (has WorkingTime)
      if (variable && (variable.WorkingTime ?? 0) > 0) {
        tipo = "HORARIO VARIABLE";

        const workingTimeFormatted = secondsToTime(variable.WorkingTime);
        const discountSeconds = variable.DiscountTimeLunch || 0;

        // 1. Determine Base Name Pattern
        let baseName = "";

        // Check for Format 3 (With Discount & Reference Times)
        if (discountSeconds > 0 && fijo && fijo.MarkingIn != null && fijo.MarkingOut != null) {
          const startStr = secondsToTime(fijo.MarkingIn).substring(0, 5); // HH:MM
          const endStr = secondsToTime(fijo.MarkingOut).substring(0, 5);
          const discountStr = secondsToTime(discountSeconds);

          baseName = `${format12h(startStr)} A ${format12h(endStr)} : ${workingTimeFormatted} (DESCUENTO DEL TIEMPO DE COMIDA : ${discountStr})`;
        } else {
          // Formats 1 & 2
          const [horas, minutos] = workingTimeFormatted.split(':').map(Number);
          const horasTexto = `${horas} HORA${horas !== 1 ? 'S' : ''}`;
          const minText = minutos > 0 ? ` ${minutos} MIN` : '';
          baseName = `${horasTexto}${minText} : ${workingTimeFormatted}`;
        }

        // 2. Check for Day Prefix (Applicable to ALL formats if unique day exists)
        const misTurnos = misTurnosMap.get(h.Oid) || [];
        const diasUnicos = new Set(misTurnos.map((t: any) => t.Day).filter(Boolean));

        if (diasUnicos.size === 1) {
          const dia = Array.from(diasUnicos)[0] as string;
          displayName = `${dia.toUpperCase()} ${baseName}`;
        } else {
          displayName = baseName;
        }
      }

      // Override tipo si no se detectó (logic fallback)
      if (!variable && fijo) tipo = "HORARIO FIJO";


      return {
        Oid: h.Oid,
        Name: displayName,
        DisplayName: h.DisplayName,
        Type: tipo,
        TotalTime: h.TotalTime ? secondsToTime(h.TotalTime) : "00:00:00",
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

// Helpers
function secondsToTime(val: number | null | undefined) {
  if (val === null || val === undefined) return "00:00:00";
  const hours = Math.floor(val / 3600);
  const minutes = Math.floor((val % 3600) / 60);
  const seconds = Math.floor(val % 60);
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function format12h(timeStr: string) {
  if (!timeStr) return "";
  let [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const mStr = (m || 0).toString().padStart(2, '0');
  return `${h}:${mStr} ${ampm}`;
}


// POST: Create New Horario with Full Details
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      name: nameFromFront,
      type, // 'fijo' | 'variable'
      turnos, // Array of { Shift, Day, NumberDay, MustMarkingOut, StartShiftMarkingIn, MarkingOptional }
      // Fijo
      entrada,
      salida,
      incluirComida,
      salidaComida,
      entradaComida,
      retardo,
      // Variable
      tiempoTrabajo,
      descuentoComida
    } = data;

    // Logic to Calculate Name and TotalTime (Shared with PUT)
    let finalName = nameFromFront || (type === 'fijo' ? 'Nuevo Horario Fijo' : 'Nuevo Horario Variable');
    let totalTimeSeconds = 0;
    const discountSeconds = type === 'variable' ? timeToSeconds(descuentoComida) : 0;
    const hasReferenceTimes = entrada && salida;

    if (type === 'fijo') {
      totalTimeSeconds = calculateTotalSeconds(entrada, salida, incluirComida, salidaComida, entradaComida);
      finalName = `${format12h(entrada)} A ${format12h(salida)}`;
      if (incluirComida) {
        finalName += ` CON ALMUERZO DE ${format12h(salidaComida)} A ${format12h(entradaComida)}`;
      }
    } else {
      // VARIABLE
      totalTimeSeconds = timeToSeconds(tiempoTrabajo);
      // Name Generation Logic
      if (discountSeconds > 0 && hasReferenceTimes) {
        finalName = `${format12h(entrada)} A ${format12h(salida)} : ${tiempoTrabajo} (DESCUENTO DEL TIEMPO DE COMIDA : ${descuentoComida})`;
      } else {
        const [horas, minutos] = (tiempoTrabajo || "00:00:00").split(':').map(Number);
        const horasTexto = `${horas} HORA${horas !== 1 ? 'S' : ''}`;
        const minText = minutos > 0 ? ` ${minutos} MIN` : '';

        let diaUnico = '';
        if (Array.isArray(turnos) && turnos.length > 0) {
          const diasUnicos = new Set(turnos.map((t: any) => t.Day).filter(Boolean));
          if (diasUnicos.size === 1) {
            diaUnico = Array.from(diasUnicos)[0] as string;
          }
        }

        if (diaUnico) {
          finalName = `${diaUnico.toUpperCase()} ${horasTexto}${minText} : ${tiempoTrabajo}`;
        } else {
          finalName = `${horasTexto}${minText} : ${tiempoTrabajo}`;
        }
      }
    }

    const newOid = uuidv4(); // Generate OID here or let DB handle if auto-inc? Schema says Oid String @id.
    // Ensure we use upper case UUID as per convention in this DB if needed, usually UUIDs are fine.

    // 1. Create Timetable
    const horario = await prisma.timetable.create({
      data: {
        Oid: newOid,
        DisplayName: finalName,
        Name: finalName,
        TotalTime: totalTimeSeconds,
        ObjectType: 0, // Default or specific type ID
      },
    });

    // 2. Create Details (Fixed/Variable)
    if (type === 'fijo' || hasReferenceTimes) {
      await prisma.timetablefixed.create({
        data: {
          Oid: newOid,
          MarkingIn: timeToSeconds(entrada),
          MarkingOut: timeToSeconds(salida),
          Lunch: type === 'fijo' ? incluirComida : false,
          LunchOut: timeToSeconds(salidaComida),
          LunchIn: timeToSeconds(entradaComida),
          Delay: timeToSeconds(retardo)
        }
      });
    }

    if (type === 'variable') {
      await prisma.timetablevariable.create({
        data: {
          Oid: newOid,
          WorkingTime: timeToSeconds(tiempoTrabajo),
          DiscountTimeLunch: timeToSeconds(descuentoComida)
        }
      });
    }

    // 3. Create Linked Shifts (ShiftTimetable)
    if (Array.isArray(turnos) && turnos.length > 0) {
      const newLinks = turnos.map((t: any) => ({
        Oid: uuidv4(),
        Timetable: newOid,
        Shift: t.Shift,
        Day: t.Day,
        NumberDay: t.NumberDay || 0,
        MustMarkingOut: t.MustMarkingOut ?? true,
        StartShiftMarkingIn: t.StartShiftMarkingIn ?? false,
        MarkingOptional: t.MarkingOptional ?? false
      }));

      await prisma.shifttimetable.createMany({
        data: newLinks
      });
    }

    return NextResponse.json({ message: "Horario creado correctamente", horario: horario }, { status: 201 });

  } catch (error) {
    console.error("Error en POST /api/horarios:", error);
    return NextResponse.json({ error: "Error creando horario" }, { status: 500 });
  }
}

// Helper Functions
function timeToSeconds(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const [h, m, s] = timeStr.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

function calculateTotalSeconds(entrada: string, salida: string, incluirComida: boolean, salidaComida: string, entradaComida: string): number {
  let total = timeToSeconds(salida) - timeToSeconds(entrada);
  if (incluirComida) {
    const lunchTime = timeToSeconds(entradaComida) - timeToSeconds(salidaComida);
    total -= lunchTime;
  }
  return total > 0 ? total : 0;
}