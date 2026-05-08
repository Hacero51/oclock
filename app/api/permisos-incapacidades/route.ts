import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        // If requesting metadata for the form (employees and types)
        if (type === 'meta') {
            const estado = searchParams.get('estado') || 'activos';
            
            // Fetch all valid persons once
            const allPersons = await prisma.eperson.findMany({
                select: { Oid: true, FirstName: true, LastName: true },
                orderBy: { FirstName: 'asc' }
            });

            const incTypes = await prisma.incapacitytype.findMany({
                select: { Oid: true, Name: true, Pay: true },
                orderBy: { Name: 'asc' }
            });

            if (estado === 'todos') {
                return NextResponse.json({ employees: allPersons, incTypes });
            }

            // Filter by status if needed
            let empWhere: any = {};
            if (estado === 'activos') empWhere.Status = 0;
            else if (estado === 'inactivos') empWhere.Status = { not: 0 };

            const matchedEmployees = await prisma.employee.findMany({
                where: empWhere,
                select: { Oid: true }
            });
            const matchedOidSet = new Set(matchedEmployees.map(e => e.Oid));
            const employees = allPersons.filter(p => matchedOidSet.has(p.Oid));

            return NextResponse.json({ employees, incTypes });
        }

        // MAIN TABLE: Obtener permisos/incapacidades reales de la base de datos
        const estado = searchParams.get('estado') || 'activos';
        let incWhere = {};

        if (estado !== 'todos') {
            let empWhere: any = {};
            if (estado === 'activos') empWhere.Status = 0;
            else if (estado === 'inactivos') empWhere.Status = { not: 0 };

            const matchedEmployees = await prisma.employee.findMany({
                where: empWhere,
                select: { Oid: true }
            });
            const matchedOids = matchedEmployees.map(e => e.Oid);
            incWhere = { Employee: { in: matchedOids } };
        }

        const incapacities = await prisma.incapacity.findMany({
            where: incWhere,
            orderBy: { IncapacityIn: 'desc' },
            take: 200
        });

        // Resolve names
        const empMap = new Map();
        const employees = await prisma.eperson.findMany({
            select: { Oid: true, FirstName: true, LastName: true }
        });
        employees.forEach(e => empMap.set(e.Oid, `${e.FirstName || ''} ${e.LastName || ''}`.trim()));

        const typeMap = new Map();
        const types = await prisma.incapacitytype.findMany({ select: { Oid: true, Name: true } });
        types.forEach(t => typeMap.set(t.Oid, t.Name));

        const formatLocale = (d: Date | null) => {
            if (!d) return "N/A";
            const options: Intl.DateTimeFormatOptions = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                timeZone: 'UTC'
            };
            return d.toLocaleDateString('es-ES', options).toUpperCase();
        };

        const data = incapacities.map(inc => ({
            id: inc.Oid,
            "Empleado": empMap.get(inc.Employee) || `Desconocido`,
            "Tipo": typeMap.get(inc.Type) || `Desconocido`,
            "Inicio": formatLocale(inc.IncapacityIn),
            "Fin": formatLocale(inc.IncapacityOut),
            "Pago": inc.Pay || false,
            // Hidden fields for the update form:
            _employeeId: inc.Employee,
            _typeId: inc.Type,
            _inicioRaw: inc.IncapacityIn ? inc.IncapacityIn.toISOString().slice(0, 16) : "",
            _finRaw: inc.IncapacityOut ? inc.IncapacityOut.toISOString().slice(0, 16) : "",
            _nota: inc.Note || ""
        }));

        return NextResponse.json(data);

    } catch (error) {
        console.error("Error obteniendo incapacidades:", error);
        return NextResponse.json({ error: "Error obteniendo datos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Obtener el valor de Pago del tipo de incapacidad para asegurar integridad
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
        
        // Obtener el valor de Pago del tipo de incapacidad
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
