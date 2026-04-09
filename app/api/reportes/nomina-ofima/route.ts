
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

        // Analizar y crear fechas explícitas en zona horaria local (Colombia)
        // en lugar de depender de new Date() genérico que asume UTC y retrasa unas horas
        const [sYear, sMonth, sDay] = startDateStr.split('-').map(Number);
        const startDate = new Date(sYear, sMonth - 1, sDay, 0, 0, 0);

        const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
        const endDate = new Date(eYear, eMonth - 1, eDay);
        // Ajustar fin para cubrir todo el día final localmente
        const endDateAdjusted = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);

        console.log(`Generando reporte Ofima de ${startDate.toISOString()} a ${endDateAdjusted.toISOString()}`);

        // 1. Fetch Details within range
        const details = await prisma.attendancedetail.findMany({
            where: {
                Day: {
                    gte: startDate,
                    lte: endDateAdjusted,
                },
                Hours: { gt: 0 } // Sólo registros con horas
            },
            select: {
                Day: true,
                Employee: true,
                AttendanceType: true,
                Hours: true
            }
        });

        if (details.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch Related Data (Optimization: only fetch used IDs)
        const distinctEmpIds = [...new Set(details.map(d => d.Employee).filter((id): id is string => !!id))];
        const distinctTypeIds = [...new Set(details.map(d => d.AttendanceType).filter((id): id is string => !!id))];

        // Attendance Types (Concepts)
        const attTypes = await prisma.attendancetype.findMany({
            where: { Oid: { in: distinctTypeIds } },
            select: { Oid: true, CodeToExport: true } // CodeToExport maps to CONCEP
        });
        const typeMap = new Map(attTypes.map(t => [t.Oid, t.CodeToExport]));

        // People (Documents)
        const people = await prisma.eperson.findMany({
            where: { Oid: { in: distinctEmpIds } },
            select: { Oid: true, Document: true }
        });
        const personMap = new Map(people.map(p => [p.Oid, p.Document]));



        // Employee -> Cost Center
        // Need to fetch Employee to get CostCenter OID, then CostCenter to get Code
        const employees = await prisma.employee.findMany({
            where: { Oid: { in: distinctEmpIds } },
            select: { Oid: true, CostCenter: true }
        });

        // Fetch distinct CostCenters used
        const distinctCcIds = [...new Set(employees.map(e => e.CostCenter).filter((id): id is string => !!id))];
        const costCenters = await prisma.costcenter.findMany({
            where: { Oid: { in: distinctCcIds } },
            select: { Oid: true, Code: true }
        });
        const ccMap = new Map(costCenters.map(cc => [cc.Oid, cc.Code]));

        // Map Employee OID -> Cost Center Code
        const empToCcCodeMap = new Map<string, string>();
        employees.forEach(e => {
            if (e.CostCenter && ccMap.has(e.CostCenter)) {
                empToCcCodeMap.set(e.Oid, ccMap.get(e.CostCenter) || "000");
            } else {
                empToCcCodeMap.set(e.Oid, "000");
            }
        });

        // 3. Transform Data to RegistroOfima format
        // Aggregation might be needed? Usually payroll reports line-by-line or aggregated by day/concept. 
        // The image shows repeated dates for same person/concept? No, image dates are 16/12/2024 (period start/end?).
        // Actually image shows "FECHA" 16/12/2024 for all rows. "FECING" 31/12/2025.
        // If FECHA is always Period Start, we should change logic. 
        // BUT usually usage is "Date of event". The image might be showing a summarized view or a specific period usage.
        // Let's assume FECHA = Day of attendance for now, unless instructed otherwise.
        // Wait, the image shows "16/12/2024" for ALL rows visible. It looks like a "Period Start Date" or "Pay Date".
        // Let's use `startDate` as "FECHA" for aggregation if the user wants a single line per concept per period?
        // User said "dependiendo del rango de fechas haga el informe".
        // If I group by Employee + Concept, sum Hours, then FECHA = startDate (or EndDate).
        // Let's Aggregate: Sum Attributes by Employee + Concept.
        // Result: One row per Employee per Concept with Total Hours in that range.

        const aggregation = new Map<string, number>(); // Key: "EmpOID|ConceptCode", Value: Hours

        details.forEach(d => {
            if (!d.Employee || !d.AttendanceType) return;
            const concept = typeMap.get(d.AttendanceType);
            // Ignorar conceptos vacíos o no mapeables
            if (!concept || typeof concept !== 'string' || concept.trim() === '') return;

            const finalConcept = concept.trim();

            const key = `${d.Employee}|${finalConcept}`;
            const current = aggregation.get(key) || 0;
            aggregation.set(key, current + (d.Hours || 0));
        });

        const reportData: any[] = [];
        // Constants from image/request
        const FECING_FMT = endDate.toLocaleDateString('es-CO'); // 31/12/2025 style?
        const FECLIQUIDA_CONST = "01/01/1900";
        const FECMOD_CONST = "01/01/1900";

        for (const [key, totalHours] of aggregation.entries()) {
            const [empOid, conceptCode] = key.split('|');

            const codigo = personMap.get(empOid) || "0";
            const codcc = empToCcCodeMap.get(empOid) || "000";

            // FECHA: Use startDate of the requested period? Or end date?
            // Image "16/12/2024" suggests start of period.
            const fechaReporte = startDate.toLocaleDateString('es-CO');
            const fecIngReporte = endDate.toLocaleDateString('es-CO');

            reportData.push({
                CODCC: codcc,
                CODIGO: codigo,
                CONCEP: conceptCode,
                FECHA: fechaReporte,
                GRUPO: "REINO",
                NOTA: "",
                NROHORAS: totalHours,
                VALOR: 0,
            });
        }

        return NextResponse.json(reportData);

    } catch (error) {
        console.error("Error generating Ofima report:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
