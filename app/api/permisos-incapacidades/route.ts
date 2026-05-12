import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const search = searchParams.get('search') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const skip = (page - 1) * limit;

        // Metadata para el formulario
        if (type === 'meta') {
            const estado = searchParams.get('estado') || 'activos';
            const allPersons = await prisma.eperson.findMany({
                select: { Oid: true, FirstName: true, LastName: true },
                orderBy: { FirstName: 'asc' }
            });
            const incTypes = await prisma.incapacitytype.findMany({
                select: { Oid: true, Name: true, Pay: true },
                orderBy: { Name: 'asc' }
            });

            if (estado === 'todos') return NextResponse.json({ employees: allPersons, incTypes });

            let empWhere: any = {};
            if (estado === 'activos') empWhere.Status = 0;
            else if (estado === 'inactivos') empWhere.Status = { not: 0 };

            const matchedEmployees = await prisma.employee.findMany({ where: empWhere, select: { Oid: true } });
            const matchedOidSet = new Set(matchedEmployees.map(e => e.Oid));
            const employees = allPersons.filter(p => matchedOidSet.has(p.Oid));

            return NextResponse.json({ employees, incTypes });
        }

        // TABLA PRINCIPAL: Filtros y Paginación
        const estado = searchParams.get('estado') || 'activos';
        let incWhere: any = {};

        // Filtro por Estado (Empleados Activos/Inactivos)
        if (estado !== 'todos') {
            let empWhere: any = {};
            if (estado === 'activos') empWhere.Status = 0;
            else if (estado === 'inactivos') empWhere.Status = { not: 0 };

            const matchedEmployees = await prisma.employee.findMany({
                where: empWhere,
                select: { Oid: true }
            });
            incWhere.Employee = { in: matchedEmployees.map(e => e.Oid) };
        }

        // Filtro por Nombre (Buscador)
        if (search) {
            const matchedPersons = await prisma.eperson.findMany({
                where: {
                    OR: [
                        { FirstName: { contains: search } },
                        { LastName: { contains: search } },
                        { FullName: { contains: search } }
                    ]
                },
                select: { Oid: true }
            });
            const personOids = matchedPersons.map(p => p.Oid);
            if (incWhere.Employee) {
                incWhere.Employee.in = incWhere.Employee.in.filter((oid: string) => personOids.includes(oid));
            } else {
                incWhere.Employee = { in: personOids };
            }
        }

        // Filtro por Fechas
        if (startDate || endDate) {
            incWhere.IncapacityIn = {};
            if (startDate) incWhere.IncapacityIn.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                incWhere.IncapacityIn.lte = end;
            }
        }

        const [incapacities, totalCount] = await Promise.all([
            prisma.incapacity.findMany({
                where: incWhere,
                orderBy: { IncapacityIn: 'desc' },
                skip,
                take: limit
            }),
            prisma.incapacity.count({ where: incWhere })
        ]);

        // Resolución de nombres
        const empOids = Array.from(new Set(incapacities.map(i => i.Employee).filter(Boolean))) as string[];
        const typeOids = Array.from(new Set(incapacities.map(i => i.Type).filter(Boolean))) as string[];

        const [persons, types] = await Promise.all([
            prisma.eperson.findMany({
                where: { Oid: { in: empOids } },
                select: { Oid: true, FirstName: true, LastName: true, FullName: true }
            }),
            prisma.incapacitytype.findMany({
                where: { Oid: { in: typeOids } },
                select: { Oid: true, Name: true }
            })
        ]);

        const empMap = new Map(persons.map(p => [p.Oid, p.FullName || `${p.FirstName || ''} ${p.LastName || ''}`.trim()]));
        const typeMap = new Map(types.map(t => [t.Oid, t.Name]));

        const formatLocale = (d: Date | null) => {
            if (!d) return "N/A";
            return d.toLocaleDateString('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' 
            }).toUpperCase();
        };

        const data = incapacities.map(inc => ({
            id: inc.Oid,
            "Empleado": empMap.get(inc.Employee!) || `Desconocido`,
            "Tipo": typeMap.get(inc.Type!) || `Desconocido`,
            "Inicio": formatLocale(inc.IncapacityIn),
            "Fin": formatLocale(inc.IncapacityOut),
            "Pago": inc.Pay || false,
            _employeeId: inc.Employee,
            _typeId: inc.Type,
            _inicioRaw: inc.IncapacityIn ? inc.IncapacityIn.toISOString().slice(0, 16) : "",
            _finRaw: inc.IncapacityOut ? inc.IncapacityOut.toISOString().slice(0, 16) : "",
            _nota: inc.Note || ""
        }));

        return NextResponse.json({
            data,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error("Error obteniendo incapacidades:", error);
        return NextResponse.json({ error: "Error obteniendo datos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const typeInfo = await prisma.incapacitytype.findUnique({
            where: { Oid: body.tipo },
            select: { Pay: true }
        });

        await prisma.incapacity.create({
            data: {
                Oid: crypto.randomUUID(),
                Employee: body.empleado,
                Type: body.tipo,
                IncapacityIn: new Date(body.inicio),
                IncapacityOut: new Date(body.fin),
                Pay: typeInfo?.Pay || false,
                Note: body.nota || null,
                ModificationDate: new Date(),
                OptimisticLockField: 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creando incapacidad:", error);
        return NextResponse.json({ error: "Error al crear" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        const typeInfo = await prisma.incapacitytype.findUnique({
            where: { Oid: data.tipo },
            select: { Pay: true }
        });

        await prisma.incapacity.update({
            where: { Oid: id },
            data: {
                Employee: data.empleado,
                Type: data.tipo,
                IncapacityIn: new Date(data.inicio),
                IncapacityOut: new Date(data.fin),
                Pay: typeInfo?.Pay || false,
                Note: data.nota || null,
                ModificationDate: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error actualizando incapacidad:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}
