import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        if (!startDateStr || !endDateStr) {
            return NextResponse.json(
                { error: "Se requieren startDate y endDate" },
                { status: 400 }
            );
        }

        // Las fechas en DB están guardadas como T05:00:00.000Z (medianoche local Colombia)
        // startDate = primer día del período (inclusive)
        // endDate   = último día del período (inclusive)
        const [sYear, sMonth, sDay] = startDateStr.split('-').map(Number);
        const startDate = new Date(Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0));

        const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
        // lte = límite exacto para la medianoche del último día
        const endDateInclusive = new Date(Date.UTC(eYear, eMonth - 1, eDay, 5, 0, 0, 0));

        console.log(`[OFIMA] Reporte de ${startDate.toISOString()} a ${endDateInclusive.toISOString()}`);

        // Conceptos excluidos del reporte (R48 = datos legados, no generados por el motor nuevo)
        const EXCLUDED_CODES = ['R48'];

        // 1. OIDs de conceptos excluidos
        const excludedTypes = await prisma.attendancetype.findMany({
            where: { CodeToExport: { in: EXCLUDED_CODES } },
            select: { Oid: true }
        });
        const excludedTypeOids = excludedTypes.map(t => t.Oid);

        // 2. Detalles del período, sin R48, solo registros con horas
        const details = await prisma.attendancedetail.findMany({
            where: {
                Day: {
                    gte: startDate,
                    lte: endDateInclusive,
                },
                Hours: { gt: 0 },
                ...(excludedTypeOids.length > 0 && {
                    AttendanceType: { notIn: excludedTypeOids }
                })
            },
            select: {
                Day: true,
                Employee: true,
                AttendanceType: true,
                Hours: true
            },
            orderBy: [
                { Day: 'asc' },
                { Employee: 'asc' }
            ]
        });

        if (details.length === 0) {
            return NextResponse.json([]);
        }

        // 3. Cargar relaciones (solo IDs usados para eficiencia)
        const distinctEmpIds = [...new Set(details.map(d => d.Employee).filter((id): id is string => !!id))];
        const distinctTypeIds = [...new Set(details.map(d => d.AttendanceType).filter((id): id is string => !!id))];

        const attTypes = await prisma.attendancetype.findMany({
            where: { Oid: { in: distinctTypeIds } },
            select: { Oid: true, CodeToExport: true }
        });
        const typeMap = new Map(attTypes.map(t => [t.Oid, t.CodeToExport]));

        const people = await prisma.eperson.findMany({
            where: { Oid: { in: distinctEmpIds } },
            select: { Oid: true, Document: true }
        });
        const personMap = new Map(people.map(p => [p.Oid, p.Document]));

        const employees = await prisma.employee.findMany({
            where: { Oid: { in: distinctEmpIds } },
            select: { Oid: true, CostCenter: true }
        });
        const distinctCcIds = [...new Set(employees.map(e => e.CostCenter).filter((id): id is string => !!id))];
        const costCenters = await prisma.costcenter.findMany({
            where: { Oid: { in: distinctCcIds } },
            select: { Oid: true, Code: true }
        });
        const ccMap = new Map(costCenters.map(cc => [cc.Oid, cc.Code]));
        const empToCcCodeMap = new Map<string, string>();
        employees.forEach(e => {
            empToCcCodeMap.set(e.Oid, (e.CostCenter && ccMap.get(e.CostCenter)) || "000");
        });

        // 4. Agrupar: UNA FILA por Empleado + Día + Concepto
        //    (suma horas si hay sub-segmentos del mismo concepto en el mismo día)
        const aggregation = new Map<string, {
            empOid: string;
            day: Date;
            conceptCode: string;
            hours: number;
        }>();

        details.forEach(d => {
            if (!d.Employee || !d.AttendanceType || !d.Day) return;
            const concept = typeMap.get(d.AttendanceType);
            if (!concept || concept.trim() === '') return;

            const dayKey = d.Day.toISOString();
            const key = `${d.Employee}|${dayKey}|${concept.trim()}`;

            const existing = aggregation.get(key);
            if (existing) {
                existing.hours += (d.Hours || 0);
            } else {
                aggregation.set(key, {
                    empOid: d.Employee,
                    day: d.Day,
                    conceptCode: concept.trim(),
                    hours: d.Hours || 0
                });
            }
        });

        // 5. Construir fila de reporte
        const reportData: any[] = [];

        for (const row of aggregation.values()) {
            const codigo = personMap.get(row.empOid) || "0";
            const codcc = empToCcCodeMap.get(row.empOid) || "000";

            // La fecha en DB = YYYY-MM-DDTT05:00:00Z = medianoche local Colombia.
            // getUTCDate/Month/FullYear nos da el día del calendario correcto.
            const d = row.day;
            const fechaStr = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;

            reportData.push({
                CODCC: codcc,
                CODIGO: codigo,
                CONCEP: row.conceptCode,
                FECHA: fechaStr,
                GRUPO: "REINO",
                NOTA: "",
                NROHORAS: Math.round(row.hours * 100) / 100,
                VALOR: 0,
            });
        }

        // Ordenar por fecha ASC, luego documento, luego concepto
        reportData.sort((a, b) => {
            // Fechas en formato dd/MM/yyyy — comparar por partes
            const [da, ma, ya] = a.FECHA.split('/').map(Number);
            const [db, mb, yb] = b.FECHA.split('/').map(Number);
            const dateA = ya * 10000 + ma * 100 + da;
            const dateB = yb * 10000 + mb * 100 + db;
            if (dateA !== dateB) return dateA - dateB;
            if (String(a.CODIGO) !== String(b.CODIGO)) return String(a.CODIGO).localeCompare(String(b.CODIGO));
            return a.CONCEP.localeCompare(b.CONCEP);
        });

        return NextResponse.json(reportData);

    } catch (error) {
        console.error("Error generating Ofima report:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
