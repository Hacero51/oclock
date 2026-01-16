import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Forzar recompilacion - v5 (LEGACY IDENTITY RESTORATION)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const empleado = searchParams.get("empleado");
        const desde = searchParams.get("desde");
        const hasta = searchParams.get("hasta");
        const estado = searchParams.get("estado");

        const whereClause: any = {};

        // Filtro por estado
        if (estado === "OK") {
            whereClause.MarkingIn = { not: null };
            whereClause.MarkingOut = { not: null };
        } else if (estado === "Incompleto") {
            whereClause.OR = [
                { MarkingIn: null },
                { MarkingOut: null }
            ];
        }

        // Filtro por fecha (Day en la tabla marking)
        if (desde || hasta) {
            whereClause.Day = {};
            if (desde) {
                whereClause.Day.gte = new Date(desde);
            }
            if (hasta) {
                const hastaFecha = new Date(hasta);
                hastaFecha.setUTCHours(23, 59, 59, 999);
                whereClause.Day.lte = hastaFecha;
            }
        }

        // PRE-FILTRO: Búsqueda de empleado por nombre (Legacy)
        // Si el usuario busca "Juan", primero buscamos en eperson y obtenemos los Oids
        if (empleado && empleado !== "all") {
            const terms = empleado.trim().split(/\s+/).filter(Boolean);
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
            const employeeIds = persons.map(p => p.Oid);
            // Si no hay matches, retornamos vacío
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

        // --- RESOLUCIÓN DE IDENTIDAD (STRATEGY LEGACY) ---
        // 1. Obtener todos los IDs únicos de empleados en esta página (Trimmed)
        const relevantEmpOids = [...new Set(marcaciones.map(m => m.Employee?.trim()).filter(Boolean) as string[])];

        // 2. Buscar en 'employee'
        const [employeesLegacy, personsLegacy] = await Promise.all([
            prisma.employee.findMany({
                where: { Oid: { in: relevantEmpOids } },
                select: { Oid: true, AcNumber: true, CurrentShift: true, CardNumber: true }
            }),
            prisma.eperson.findMany({
                where: { Oid: { in: relevantEmpOids } },
                select: { Oid: true, FirstName: true, LastName: true, FullName: true, Document: true }
            })
        ]);

        // 3. Obtener info de Turnos
        //    Recopilar todos los Shift IDs encontrados en 'CurrentShift' de los empleados
        const relevantShiftIds = [...new Set(employeesLegacy.map(e => e.CurrentShift?.trim()).filter(Boolean) as string[])];
        //    También agregar los Shift IDs que vengan explícitos en la marcación
        marcaciones.forEach(m => {
            const shiftId = m.Shift?.trim();
            if (shiftId && shiftId.length > 10) relevantShiftIds.push(shiftId);
        });

        const shiftsLegacy = await prisma.shift.findMany({
            where: { Oid: { in: relevantShiftIds } },
            select: { Oid: true, Name: true }
        });

        // 4. Construir Mapas para acceso rápido (Trim Keys)
        // Map: Oid -> Employee Data
        const empMap = new Map(employeesLegacy.map(e => [e.Oid.trim(), e]));
        // Map: Oid -> Person Data
        const personMap = new Map(personsLegacy.map(p => [p.Oid.trim(), p]));
        // Map: ShiftOid -> ShiftName
        const shiftMap = new Map(shiftsLegacy.map(s => [s.Oid.trim(), s.Name || 'Turno Sin Nombre']));


        const data = marcaciones.map(m => {
            const empOid = m.Employee?.trim() || '';
            const empData = empMap.get(empOid);
            const personData = personMap.get(empOid);

            // A. Resolver NOMBRE
            let nombreEmpleado = 'Desconocido';
            let documento = 'N/A';

            if (personData) {
                const nombre = personData.FullName || `${personData.FirstName || ''} ${personData.LastName || ''}`.trim();
                nombreEmpleado = nombre || personData.Document || empOid;
                documento = personData.Document || 'N/A';
            } else if (empData) {
                // Fallback si no hay registro persona pero sí empleado
                nombreEmpleado = `Empl ${empData.AcNumber || empData.CardNumber || '?'}`;
            } else if (empOid.length > 20) {
                // Último recurso: Mostrar parte del UUID
                nombreEmpleado = `ID: ${empOid.substring(0, 8)}...`;
            }

            // B. Resolver TURNO
            let turnoNombre = 'Sin Turno';
            const markShiftId = m.Shift?.trim();
            const empShiftId = empData?.CurrentShift?.trim();

            // Prioridad 1: Turno explícito en la marcación
            if (markShiftId && shiftMap.has(markShiftId)) {
                turnoNombre = shiftMap.get(markShiftId)!;
            }
            // Prioridad 2: Turno asignado al empleado (CurrentShift)
            else if (empShiftId && shiftMap.has(empShiftId)) {
                turnoNombre = shiftMap.get(empShiftId)!;
            }

            // UTC-5 (Colombia) handled at storage time
            const formatLocale = (d: Date | null) => {
                if (!d) return "";
                // No restamos 5h porque ya se almacenó con la hora correcta en UTC
                const colombiaTime = d;
                let hours = colombiaTime.getUTCHours();
                const minutes = colombiaTime.getUTCMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'P. M.' : 'A. M.';
                hours = hours % 12;
                hours = hours ? hours : 12;

                const day = colombiaTime.getUTCDate().toString().padStart(2, '0');
                const month = (colombiaTime.getUTCMonth() + 1).toString().padStart(2, '0');
                const year = colombiaTime.getUTCFullYear();
                return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
            };

            const formatDateOnly = (d: Date | null) => {
                if (!d) return "N/A";
                return d.toLocaleDateString('es-ES', { timeZone: 'UTC' });
            };

            // Validar que el nombre sea un nombre real y no un ID o fallback
            const cleanName = nombreEmpleado ? nombreEmpleado.trim() : '';
            const cleanOid = empOid ? empOid.trim() : '';

            const esNombreValido =
                cleanName &&
                cleanName !== 'Desconocido' &&
                cleanName !== 'N/A' &&
                !cleanName.startsWith('ID:') &&
                cleanName.toLowerCase() !== cleanOid.toLowerCase() && // Comparacion insensible a mayusculas
                !/^[0-9a-fA-F-]{30,}$/.test(cleanName) && // Validar que no sea un UUID o hash largo
                !(cleanName === documento && cleanName.length > 20); // Validar si es igual al documento y el documento es sospechosamente largo

            if (!esNombreValido) return null;

            return {
                id: m.Oid,
                cedula: documento,
                empleado: cleanName,
                turno: turnoNombre,
                fecha: formatDateOnly(m.Day),
                entrada: formatLocale(m.MarkingIn),
                salida: formatLocale(m.MarkingOut),
                iniciaTurno: !!m.StartShiftMarkingIn,
                tiempoExtraDespues: !!m.OverTimeAfterExit,
                tiempoExtraFestivo: !!m.OverTimeInHoliday,
                autorizar: !!m.Approve,
                estado: (m.MarkingIn && m.MarkingOut) ? "OK" : "Incompleto"
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
        console.error("Error fetching marcaciones:", error);
        return NextResponse.json(
            { error: "Error obteniendo marcaciones" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, entrada, salida, iniciaTurno, tiempoExtraDespues, tiempoExtraFestivo, autorizar } = body;

        if (!id) {
            return NextResponse.json({ error: "ID de marcación requerido" }, { status: 400 });
        }

        const updateData: any = {};

        if (entrada) {
            const [datePart, timePart] = entrada.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);
            updateData.MarkingIn = new Date(Date.UTC(year, month - 1, day, hour, minute));
        }

        if (salida) {
            // Convertimos la cadena local 'YYYY-MM-DDTHH:mm' a una fecha que Prisma trate como UTC
            const [datePart, timePart] = salida.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);
            updateData.MarkingOut = new Date(Date.UTC(year, month - 1, day, hour, minute));
        }

        if (iniciaTurno !== undefined) updateData.StartShiftMarkingIn = !!iniciaTurno;
        if (tiempoExtraDespues !== undefined) updateData.OverTimeAfterExit = !!tiempoExtraDespues;
        if (tiempoExtraFestivo !== undefined) updateData.OverTimeInHoliday = !!tiempoExtraFestivo;
        if (autorizar !== undefined) updateData.Approve = !!autorizar;

        const updated = await prisma.marking.update({
            where: { Oid: id },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating marcación:", error);
        return NextResponse.json(
            { error: "Error actualizando marcación" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { empleadoId, turnoId, fecha, entrada, salida } = body;

        if (!empleadoId || !fecha || !entrada) {
            return NextResponse.json({ error: "Empleado, fecha y entrada son requeridos" }, { status: 400 });
        }

        // Helper para crear fecha UTC desde partes locales
        const createUTCDate = (dateStr: string, timeStr: string) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const [hour, minute] = timeStr.split(':').map(Number);
            return new Date(Date.UTC(year, month - 1, day, hour, minute));
        };

        const markingInData = createUTCDate(fecha, entrada);
        const markingOutData = salida ? createUTCDate(fecha, salida) : null;

        const newMarking = await prisma.marking.create({
            data: {
                Oid: crypto.randomUUID(),
                Employee: empleadoId,
                Shift: turnoId || null,
                Day: new Date(fecha),
                MarkingIn: markingInData,
                MarkingOut: markingOutData,
                StartShiftMarkingIn: true, // Por defecto se asume que inicia turno si es manual
                Approve: false
            }
        });

        return NextResponse.json(newMarking);
    } catch (error) {
        console.error("Error creating manual marcación:", error);
        return NextResponse.json(
            { error: "Error creando marcación manual" },
            { status: 500 }
        );
    }
}
