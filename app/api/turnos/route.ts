import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivity } from "@/lib/activity-log";
import crypto from "crypto";

export async function GET() {
// ... (rest of the file remains same until POST)
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
      "Nombre": t.Name || "Sin Nombre",
      Cycles: t.NumberCycles || 1,
      "Estado": t.Status === 0 ? "Activo" : "Inactivo"
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre,
      rotacion,
      festivos,
      numeroCiclos,
      estado,
      tiempoExtra,
      horarios, // Array of { day: number, timetableId: string, mustMarkOut: bool, startShiftMarkingIn: bool, markingOptional: bool }
      empleados, // Array of strings (Employee OIDs)
      tiempoExtraMinimo,
      adicionarTiempoExtra
    } = body;

    let shiftCycle = 1; // Default Semana
    if (rotacion === 'Dia') shiftCycle = 0;
    if (rotacion === 'Semana') shiftCycle = 1;
    if (rotacion === 'Mes') shiftCycle = 3;

    let holidayType = 0; // Default no trabaja
    if (festivos === 'trabaja_dias_de_fiesta') holidayType = 1;
    if (festivos === 'trabaja_ocacionalmente_dias_de_fiesta') holidayType = 2;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const newShiftOid = crypto.randomUUID().toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Shift
      const newShift = await tx.shift.create({
        data: {
          Oid: newShiftOid,
          Name: nombre,
          NumberCycles: parseInt(numeroCiclos) || 1,
          Status: estado === 'activo' ? 0 : 1,
          ShiftCycle: shiftCycle,
          Holidays: holidayType,
          OverTimeBeforeEntry: tiempoExtra?.antesEntrada || false,
          OverTimeAfterExit: tiempoExtra?.despuesSalida || false,
          OverTimeInLunch: tiempoExtra?.enComida || false,
          OverTimeInHoliday: tiempoExtra?.enFestivo || false,
          AddOverTime: parseInt(adicionarTiempoExtra) || 0,
          MinimumOverTime: parseInt(tiempoExtraMinimo) || 0
        }
      });

      // 2. Create ShiftTimetable entries (The Grid)
      if (horarios && Array.isArray(horarios)) {
        for (const h of horarios) {
          // Verify that timetableId is present or any of the flags are true before creating
          if (h.timetableId || h.mustMarkOut || h.startShiftMarkingIn || h.markingOptional) {
            await tx.shifttimetable.create({
              data: {
                Oid: crypto.randomUUID().toUpperCase(),
                Shift: newShiftOid,
                Timetable: h.timetableId || null,
                NumberDay: h.day,
                Day: h.day.toString(), // Storing the day number as string for now if needed
                MustMarkingOut: h.mustMarkOut || false,
                StartShiftMarkingIn: h.startShiftMarkingIn || false,
                MarkingOptional: h.markingOptional || false
              }
            });
          }
        }
      }

      // 3. Update Employees (Assignment)
      if (empleados && Array.isArray(empleados) && empleados.length > 0) {
        await tx.employee.updateMany({
          where: {
            Oid: { in: empleados }
          },
          data: {
            CurrentShift: newShiftOid
          }
        });
      }

      return newShift;
    }, {
      timeout: 30000
    });

    // REGISTRO DE ACTIVIDAD
    await recordActivity({
        action: "CREATE",
        targetModel: "shift",
        targetId: newShiftOid,
        targetName: nombre,
        description: `Creación de nuevo turno`,
        req: req
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creando turno:", error);
    return NextResponse.json({ error: "Error creando turno" }, { status: 500 });
  }
}