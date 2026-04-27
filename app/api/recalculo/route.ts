import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { laborEngine } from "@/server/biometric/engine";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desde, hasta } = body;

        if (!desde || !hasta) {
            return NextResponse.json({ error: "Parámetros 'desde' y 'hasta' son requeridos (formato: YYYY-MM-DD)" }, { status: 400 });
        }

        const startDate = new Date(`${desde}T00:00:00Z`);
        const endDate = new Date(`${hasta}T00:00:00Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
        }

        // Limitar a máximo 7 días por llamada para evitar timeout
        const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
            return NextResponse.json({ error: "Máximo 7 días por solicitud. Llama múltiples veces para rangos mayores." }, { status: 400 });
        }

        // Obtener todos los empleados activos (con turno asignado)
        const employees = await prisma.employee.findMany({
            where: { CurrentShift: { not: null } },
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

        return NextResponse.json({
            success: true,
            resumen: {
                desde,
                hasta,
                empleados: employees.length,
                diasProcesados: log.filter(l => l.startsWith('✔')).length,
                totalCalculos: totalProcessed,
                errores: totalErrors,
            },
            log
        });

    } catch (error: any) {
        console.error("[RECALCULO]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
