import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Obtener empleados activos
        const empleados = await prisma.employee.findMany({
            select: {
                Oid: true,
                AcNumber: true,
                ValorHora: true,
                Status: true,
                Department: true,
                Position: true,
                CurrentShift: true,
                CurrentAgreementType: true,
                Boss: true,
                person: {
                    select: {
                        Document: true,
                        FullName: true,
                    },
                },
            },
            where: {},
        });

        // 2. Extraer IDs únicos para evitar N+1
        const positionIds = [...new Set(empleados.map(e => e.Position).filter(Boolean))];
        const shiftIds = [...new Set(empleados.map(e => e.CurrentShift).filter(Boolean))];
        const agreementTypeIds = [...new Set(empleados.map(e => e.CurrentAgreementType).filter(Boolean))];
        const bossIds = [...new Set(empleados.map(e => e.Boss).filter(Boolean))];

        // 3. Consultas en paralelo
        const [positions, shifts, agreementTypes, bosses] = await Promise.all([
            prisma.position.findMany({
                where: { Oid: { in: positionIds as string[] } },
                select: { Oid: true, Name: true },
            }),
            prisma.shift.findMany({
                where: { Oid: { in: shiftIds as string[] } },
                select: { Oid: true, Name: true },
            }),
            prisma.agreementtype.findMany({
                where: { Oid: { in: agreementTypeIds as string[] } },
                select: { Oid: true, Name: true },
            }),
            prisma.employee.findMany({
                where: { Oid: { in: bossIds as string[] } },
                select: { Oid: true, person: { select: { FullName: true } } },
            }),
        ]);

        // 4. Crear Mapas de búsqueda rápida
        const posMap = new Map(positions.map(p => [p.Oid, p.Name]));
        const shiftMap = new Map(shifts.map(s => [s.Oid, s.Name]));
        const agreeMap = new Map(agreementTypes.map(a => [a.Oid, a.Name]));
        const bossMap = new Map(bosses.map(b => [b.Oid, b.person?.FullName || ""]));

        // 5. Ensamblar respuesta
        const data = empleados.map((e) => ({
            Oid: e.Oid,
            "Número Lector": e.AcNumber,
            Documento: e.person?.Document || "",
            "Nombre a mostrar": e.person?.FullName || "",
            DepartmentId: e.Department,
            Cargo: e.Position ? (posMap.get(e.Position) || "") : "",
            "Turno Actual": e.CurrentShift ? (shiftMap.get(e.CurrentShift) || "") : "",
            "Contrato Actual": e.CurrentAgreementType ? (agreeMap.get(e.CurrentAgreementType) || "") : "",
            Jefe: e.Boss ? (bossMap.get(e.Boss) || "") : "",
            "Valor Hora": e.ValorHora,
            Status: e.Status,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching employees full data:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
