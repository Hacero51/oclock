import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { laborEngine } from "@/server/biometric/engine";

export async function GET() {
  try {
    const desde = "2026-05-25";
    const hasta = "2026-06-10";

    const startDate = new Date(`${desde}T00:00:00Z`);
    const endDate = new Date(`${hasta}T00:00:00Z`);

    // 1. Obtener todos los empleados activos o con turno
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { Status: 0 },
          { CurrentShift: { not: null } }
        ]
      },
      select: { Oid: true }
    });

    const log: string[] = [];
    let totalProcessed = 0;
    let totalErrors = 0;

    const current = new Date(startDate);
    while (current <= endDate) {
      const dayStr = current.toISOString().split('T')[0];

      // Solo procesar días con marcaciones reales
      const markingsCount = await prisma.marking.count({
        where: {
          Day: new Date(current),
          MarkingIn: { not: null }
        }
      });

      if (markingsCount > 0) {
        for (const emp of employees) {
          try {
            await laborEngine.processDay(emp.Oid, new Date(current));
            totalProcessed++;
          } catch (err: any) {
            totalErrors++;
            log.push(`ERROR ${dayStr} EMP:${emp.Oid.substring(0, 8)}: ${err.message}`);
          }
        }
        log.push(`✔ ${dayStr}: ${employees.length} empleados procesados`);
      } else {
        log.push(`⚪ ${dayStr}: Sin marcaciones`);
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    // 2. Consultar cálculos detallados para Planta Extras para validación
    const targetDocs = ["1024471366", "1070386174"]; // Edgar Latorre, Hanner Martinez
    const people = await prisma.eperson.findMany({
      where: { Document: { in: targetDocs } }
    });

    const verificationResults = [];
    const attendanceTypes = await prisma.attendancetype.findMany();

    for (const person of people) {
      const details = await prisma.attendancedetail.findMany({
        where: {
          Employee: person.Oid,
          Day: { gte: startDate, lte: endDate }
        },
        orderBy: { Day: 'asc' }
      });

      const dailyData: Record<string, {
        fecha: string;
        ordinarias: number;
        extras: number;
        detalles: Record<string, number>;
      }> = {};

      for (const d of details) {
        if (!d.Day) continue;
        const dayStr = d.Day.toISOString().split('T')[0];
        const type = attendanceTypes.find(t => t.Oid === d.AttendanceType);
        const code = type?.CodeToExport || "Unknown";
        const hours = d.Hours || 0;

        if (!dailyData[dayStr]) {
          dailyData[dayStr] = {
            fecha: dayStr,
            ordinarias: 0,
            extras: 0,
            detalles: {}
          };
        }

        dailyData[dayStr].detalles[code] = (dailyData[dayStr].detalles[code] || 0) + hours;

        if (['A01', 'A49', 'A50'].includes(code)) {
          dailyData[dayStr].ordinarias += hours;
        } else {
          dailyData[dayStr].extras += hours;
        }
      }

      verificationResults.push({
        employeeName: `${person.FirstName} ${person.LastName}`,
        document: person.Document,
        breakdown: Object.values(dailyData)
      });
    }

    return NextResponse.json({
      success: true,
      resumenRecalculo: {
        desde,
        hasta,
        totalCalculos: totalProcessed,
        errores: totalErrors
      },
      verificationResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
