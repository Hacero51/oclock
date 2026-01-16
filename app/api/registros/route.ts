import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const empleado = searchParams.get("empleado");
        const fecha = searchParams.get("fecha");
        const desde = searchParams.get("desde");
        const hasta = searchParams.get("hasta");
        const tipo = searchParams.get("tipo"); // 'Entrada', 'Salida', etc.
        const dispositivo = searchParams.get("dispositivo");

        // Construir where clause para checkinout
        const whereClause: any = {};

        // Helper simple para parsear fecha local "YYYY-MM-DD" y convertirla a UTC puro
        // para coincidir con cómo Prisma lee los datos (datetime sin zona -> UTC)
        const parseLocalDateToUTC = (dateStr: string) => {
            if (!dateStr) return new Date();
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        };

        // Filtro por fecha (Rango o fecha específica)
        if (desde && hasta) {
            const startDate = parseLocalDateToUTC(desde);
            startDate.setUTCHours(0, 0, 0, 0);

            const endDate = parseLocalDateToUTC(hasta);
            endDate.setUTCHours(23, 59, 59, 999);

            whereClause.CheckTime = {
                gte: startDate,
                lte: endDate
            };
        } else if (fecha) {
            const startDate = parseLocalDateToUTC(fecha);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = parseLocalDateToUTC(fecha);
            endDate.setUTCHours(23, 59, 59, 999);

            whereClause.CheckTime = {
                gte: startDate,
                lte: endDate
            };
        }

        // Filtro por tipo
        if (tipo && tipo !== "all") {
            // Mapeo tentativo: Entrada ('I' o '0' o 0), Salida ('O' o '1' o 1)
            // CheckType suele ser Int.
            // Asoplución común: 0: CheckIn, 1: CheckOut, O: BreakOut, i: BreakIn
            // Si el Front envía 'Entrada', buscamos 0 (o 'I' si fuera string, pero el modelo dice Int)
            // Ajustaremos asumiendo Int: 0=Entrada, 1=Salida.
            // Si el usuario reporta que sale mal, revisaremos los valores reales.
            if (tipo === 'Entrada') whereClause.CheckType = 0;
            else if (tipo === 'Salida') whereClause.CheckType = 1;
        }

        // Filtro por dispositivo (Machine Oid)
        if (dispositivo) {
            whereClause.Machine = dispositivo;
        }

        // Para filtrar por empleado (nombre), es más complejo porque el nombre está en otra tabla
        // y no hay relación directa en Prisma.
        // Estrategia: Si hay filtro de empleado, buscar primero los IDs en eperson y luego filtrar checkinout.
        let employeeIds: string[] = [];
        if (empleado && empleado !== "all") {
            const terms = empleado.trim().split(/\s+/).filter(Boolean);

            // Construir condición AND para cada término
            // Cada término debe estar en (FirstName OR LastName OR Document)
            const searchConditions = terms.map(term => ({
                OR: [
                    { FirstName: { contains: term } },
                    { LastName: { contains: term } },
                    { Document: { contains: term } }
                ]
            }));

            const persons = await prisma.eperson.findMany({
                where: {
                    AND: searchConditions
                },
                select: { Oid: true }
            });
            employeeIds = persons.map(p => p.Oid);

            // Si no encontramos empleados con ese nombre, devolvemos vacío directamente
            if (employeeIds.length === 0) {
                return NextResponse.json({
                    data: [],
                    pagination: { total: 0, page, limit, totalPages: 0 }
                });
            }

            whereClause.Employee = { in: employeeIds };
        }

        const [total, logs] = await Promise.all([
            prisma.checkinout.count({ where: whereClause }),
            prisma.checkinout.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    CheckTime: 'desc'
                }
            })
        ]);

        // Obtener datos relacionados manualmente
        const empOids = [...new Set(logs.map(l => l.Employee).filter(Boolean) as string[])];
        const machineOids = [...new Set(logs.map(l => l.Machine).filter(Boolean) as string[])];

        const [persons, machines] = await Promise.all([
            prisma.eperson.findMany({
                where: { Oid: { in: empOids } },
                select: { Oid: true, FirstName: true, LastName: true, FullName: true }
            }),
            prisma.machine.findMany({
                where: { Oid: { in: machineOids } },
                select: { Oid: true, Name: true }
            })
        ]);

        // Crear mapas para búsqueda rápida
        const personMap = new Map(persons.map(p => [p.Oid, p]));
        const machineMap = new Map(machines.map(m => [m.Oid, m]));

        const data = logs.map(log => {
            const date = log.CheckTime ? new Date(log.CheckTime) : new Date();
            const person = log.Employee ? personMap.get(log.Employee) : null;
            const machine = log.Machine ? machineMap.get(log.Machine) : null;

            // Mapeo robusto de VerifyType
            const verifyTypeStr = MAP_VERIFY_TYPE[log.VerifyCode ?? -1] || 'Desconocido';

            // Mapeo robusto de CheckType
            // I/O status: 0=CheckIn, 1=CheckOut, 2=BreakOut, 3=BreakIn, 4=OT-In, 5=OT-Out
            let tipoStr = 'Desconocido';
            if (log.CheckType === 0) tipoStr = 'Entrada';
            else if (log.CheckType === 1) tipoStr = 'Salida';
            else if (log.CheckType === 2) tipoStr = 'Inicio Descanso'; // BreakOut
            else if (log.CheckType === 3) tipoStr = 'Fin Descanso';   // BreakIn
            else if (log.CheckType === 4) tipoStr = 'Entrada HE';
            else if (log.CheckType === 5) tipoStr = 'Salida HE';
            else if (log.CheckType === 15) tipoStr = 'Entrada'; // Por defecto para ZK Face/General
            else if (log.CheckType === 16) tipoStr = 'Entrada'; // Otro código de entrada observado
            else tipoStr = String(log.CheckType);

            const nombreStr = person ? (person.FullName || `${person.FirstName || ''} ${person.LastName || ''}`).trim() : 'Desconocido';

            if (!nombreStr || nombreStr === 'Desconocido') return null;

            return {
                id: log.Oid,
                empleado: nombreStr,
                tiempo: log.CheckTime,
                tipo: tipoStr,
                año: date.getUTCFullYear(),
                mes: date.getUTCMonth() + 1,
                // Si VerifyCode está vacío, intentar inferir o dejar vacío
                metodoverificacion: verifyTypeStr,
                lector: machine?.Name || 'Desconocido'
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

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
        console.error("Error fetching registros:", error);
        return NextResponse.json(
            { error: "Error obteniendo registros" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, checkTime, checkType } = body;

        if (!id) {
            return NextResponse.json({ error: "ID de registro requerido" }, { status: 400 });
        }

        const updateData: any = {};
        if (checkTime) updateData.CheckTime = new Date(checkTime);
        if (checkType !== undefined) {
            // Mapear de String a Int si es necesario
            if (checkType === 'Entrada') updateData.CheckType = 0;
            else if (checkType === 'Salida') updateData.CheckType = 1;
            else if (checkType === 'Inicio Descanso') updateData.CheckType = 2;
            else if (checkType === 'Fin Descanso') updateData.CheckType = 3;
            else if (typeof checkType === 'number') updateData.CheckType = checkType;
        }

        const updated = await prisma.checkinout.update({
            where: { Oid: id },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating registro:", error);
        return NextResponse.json(
            { error: "Error actualizando registro" },
            { status: 500 }
        );
    }
}

// Mapeo de verify_type (ajustar según documentación ZK real si difiere)
const MAP_VERIFY_TYPE: Record<number, string> = {
    0: 'Password',
    1: 'Huella',
    2: 'Tarjeta',
    3: 'Tarjeta',
    4: 'Tarjeta',
    15: 'Rostro',
    20: 'Rostro',
};

