import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { year, period } = body; // Ej: 2026, 4

        if (!year || !period) {
            return NextResponse.json({ error: "Parámetros 'year' y 'period' son requeridos" }, { status: 400 });
        }

        console.log(`[SYNC] Iniciando sincronización para ${year}-${period}`);

        // 1. Limpiar el resumen actual del periodo
        await prisma.attendancesummary.deleteMany({
            where: { Year: year, Period: period }
        });

        // 2. Obtener la suma de horas del detalle agrupado por empleado y concepto
        // Como Prisma no soporta agrupamiento avanzado en este esquema sin relaciones, 
        // lo haremos por pasos o vía Raw SQL.
        
        // Usaremos Raw SQL para máxima velocidad y precisión
        const summaryData: any[] = await prisma.$queryRaw`
            SELECT 
                Employee, 
                AttendanceType, 
                SUM(Time) as TotalTime, 
                SUM(Hours) as TotalHours
            FROM attendancedetail
            WHERE Year(Day) = ${year} AND Month(Day) = ${period}
            GROUP BY Employee, AttendanceType
        `;

        // 3. Insertar los nuevos totales en attendancesummary
        let count = 0;
        for (const row of summaryData) {
            await prisma.attendancesummary.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: row.Employee,
                    AttendanceType: row.AttendanceType,
                    Year: year,
                    Period: period,
                    Time: Number(row.TotalTime),
                    Hours: Number(row.TotalHours),
                    Status: 1,
                    OptimisticLockField: 0
                }
            });
            count++;
        }

        return NextResponse.json({
            success: true,
            mensaje: `Sincronización completada. ${count} registros de resumen creados para el periodo ${period}/${year}.`
        });

    } catch (error: any) {
        console.error("[SYNC ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
