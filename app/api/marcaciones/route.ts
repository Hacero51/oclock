import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const empleado = searchParams.get("empleado");
        const desde = searchParams.get("desde");
        const hasta = searchParams.get("hasta");

        const whereClause: any = {};

        // Filtro por fecha (Day en la tabla marking)
        if (desde && hasta) {
            whereClause.Day = {
                gte: new Date(desde),
                lte: new Date(hasta)
            };
        }

        // Filtro por empleado
        if (empleado && empleado !== "all") {
            const persons = await prisma.eperson.findMany({
                where: {
                    OR: [
                        { FirstName: { contains: empleado } },
                        { LastName: { contains: empleado } },
                        { Document: { contains: empleado } }
                    ]
                },
                select: { Oid: true }
            });
            const employeeIds = persons.map(p => p.Oid);
            if (employeeIds.length === 0) {
                return NextResponse.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            whereClause.Employee = { in: employeeIds };
        }

        const [total, marcaciones] = await Promise.all([
            prisma.marking.count({ where: whereClause }),
            prisma.marking.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    Day: 'desc'
                }
            })
        ]);

        // Obtener datos relacionados (Empleados y Turnos)
        const relevantEmpOids = [...new Set(marcaciones.map(m => m.Employee).filter(Boolean) as string[])];
        const relevantShiftOids = [...new Set(marcaciones.map(m => m.Shift).filter(Boolean) as string[])];

        const [persons, shifts] = await Promise.all([
            prisma.eperson.findMany({
                where: { Oid: { in: relevantEmpOids } },
                select: { Oid: true, FirstName: true, LastName: true, Document: true }
            }),
            prisma.shift.findMany({
                where: { Oid: { in: relevantShiftOids } },
                select: { Oid: true, Name: true }
            })
        ]);

        const personMap = new Map(persons.map(p => [p.Oid, p]));
        const shiftMap = new Map(shifts.map(s => [s.Oid, s]));

        const data = marcaciones.map(m => {
            const person = m.Employee ? personMap.get(m.Employee) : null;
            const shift = m.Shift ? shiftMap.get(m.Shift) : null;

            const formatLocale = (d: Date | null) => {
                if (!d) return "";
                return d.toLocaleString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).toUpperCase();
            };

            const formatDateOnly = (d: Date | null) => {
                if (!d) return "N/A";
                return d.toLocaleDateString('es-ES');
            };

            return {
                id: m.Oid,
                empleado: person ? `${person.FirstName || ''} ${person.LastName || ''}`.trim() || person.Document : 'Desconocido',
                turno: shift?.Name || 'Sin Turno',
                fecha: formatDateOnly(m.Day),
                entrada: formatLocale(m.MarkingIn),
                salida: formatLocale(m.MarkingOut),
                iniciaTurno: !!m.StartShiftMarkingIn,
                tiempoExtraDespues: !!m.OverTimeAfterExit,
                tiempoExtraFestivo: !!m.OverTimeInHoliday,
                autorizar: !!m.Approve,
                estado: (m.MarkingIn && m.MarkingOut) ? "OK" : "Incompleto"
            };
        });

        return NextResponse.json({
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching marcaciones from Marking table:", error);
        return NextResponse.json(
            { error: "Error obteniendo marcaciones" },
            { status: 500 }
        );
    }
}
