import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { laborEngine } from "@/server/biometric/engine";
import { recordActivity } from "@/lib/activity-log";

// Forzar recompilacion - v5 (LEGACY IDENTITY RESTORATION)
export async function GET(request: Request) {
    try {
        // Migrate existing records that were initialized to false instead of null
        await prisma.marking.updateMany({
            where: {
                StartShiftMarkingIn: false,
                OverTimeBeforeEntry: false,
                OverTimeAfterExit: false,
                OverTimeInHoliday: false
            },
            data: {
                StartShiftMarkingIn: null,
                OverTimeBeforeEntry: null,
                OverTimeAfterExit: null,
                OverTimeInHoliday: null
            }
        });

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const isExport = searchParams.get("export") === "true";
        const skip = (page - 1) * limit;

        const empleado = searchParams.get("empleado");
        const turno = searchParams.get("turno");
        const desde = searchParams.get("desde");
        const hasta = searchParams.get("hasta");
        const estado = searchParams.get("estado");

        const whereClause: any = {};

        // Filtro por turno
        if (turno && turno !== "all") {
            whereClause.Shift = turno;
        }

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
                // Asegurar que incluya el dia completo hasta la medianoche (T00 del dia siguiente)
                // si buscamos por bloques de T00
                hastaFecha.setUTCHours(23, 59, 59, 999);
                whereClause.Day.lte = hastaFecha;
            }
        }

        // PRE-FILTRO: Búsqueda de empleado
        if (empleado && empleado !== "all") {
            // Si es un UUID (Oid), lo usamos directamente
            if (/^[0-9a-fA-F-]{32,38}$/.test(empleado.trim())) {
                whereClause.Employee = empleado.trim();
            } else {
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
        }

        const total = await prisma.marking.count({ where: whereClause });

        const marcaciones = isExport
            ? await prisma.marking.findMany({
                where: whereClause,
                orderBy: { Day: 'desc' }
            })
            : await prisma.marking.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { Day: 'desc' }
            });

        // --- RESOLUCIÓN DE IDENTIDAD OPTIMIZADA ---
        // 1. Recopilar todos los OIDs únicos necesarios en una sola pasada
        const empOidsSet = new Set<string>();
        const shiftOidsSet = new Set<string>();

        marcaciones.forEach(m => {
            const eOid = m.Employee?.trim();
            if (eOid) empOidsSet.add(eOid);

            const sOid = m.Shift?.trim();
            if (sOid && sOid.length > 10) shiftOidsSet.add(sOid);
        });

        const relevantEmpOids = Array.from(empOidsSet);

        // 2. Fetch de datos base en paralelo
        const [employeesLegacy, personsLegacy] = await Promise.all([
            prisma.employee.findMany({
                where: { Oid: { in: relevantEmpOids } },
                select: { Oid: true, AcNumber: true, CurrentShift: true, CardNumber: true, Department: true }
            }),
            prisma.eperson.findMany({
                where: { Oid: { in: relevantEmpOids } },
                select: { Oid: true, FirstName: true, LastName: true, FullName: true, Document: true }
            })
        ]);

        // 3. Agregar los CurrentShift de los empleados a la lista de turnos a buscar y recopilar departamentos
        const departmentOidsSet = new Set<string>();
        employeesLegacy.forEach(e => {
            const csOid = e.CurrentShift?.trim();
            if (csOid && csOid.length > 10) shiftOidsSet.add(csOid);

            const deptOid = e.Department?.trim();
            if (deptOid && deptOid.length > 10) departmentOidsSet.add(deptOid);
        });

        // 4. Fetch de turnos, departamentos y construcción de mapas finales
        const [shiftsLegacy, shifttimetablesLegacy, departmentsLegacy] = await Promise.all([
            prisma.shift.findMany({
                where: { Oid: { in: Array.from(shiftOidsSet) } },
                select: {
                    Oid: true,
                    Name: true,
                    OverTimeBeforeEntry: true,
                    OverTimeAfterExit: true,
                    OverTimeInLunch: true,
                    OverTimeInHoliday: true
                }
            }),
            prisma.shifttimetable.findMany({
                where: { Shift: { in: Array.from(shiftOidsSet) } },
                select: { Shift: true, NumberDay: true, StartShiftMarkingIn: true }
            }),
            prisma.department.findMany({
                where: { Oid: { in: Array.from(departmentOidsSet) } },
                select: { Oid: true, FullName: true, Name: true }
            })
        ]);

        const empMap = new Map(employeesLegacy.map(e => [e.Oid.trim(), e]));
        const personMap = new Map(personsLegacy.map(p => [p.Oid.trim(), p]));
        const shiftMap = new Map(shiftsLegacy.map(s => [s.Oid.trim(), s]));
        const shifttimetableMap = new Map(
            shifttimetablesLegacy.map(st => [`${st.Shift?.trim()}_${st.NumberDay}`, st])
        );
        const deptMap = new Map(departmentsLegacy.map(d => [d.Oid.trim(), d]));

        // --- FUNCIONES HELPER FUERA DEL LOOP PARA VELOCIDAD ---
        const formatLocale = (d: Date | null) => {
            if (!d) return "";
            let hours = d.getUTCHours();
            const minutes = d.getUTCMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'P. M.' : 'A. M.';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const day = d.getUTCDate().toString().padStart(2, '0');
            const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        };

        const formatDateOnly = (d: Date | null) => {
            if (!d) return "N/A";
            return d.toLocaleDateString('es-ES', { timeZone: 'UTC' });
        };

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
            let activeShiftId: string | null = null;

            // Prioridad 1: Turno explícito en la marcación
            if (markShiftId && shiftMap.has(markShiftId)) {
                activeShiftId = markShiftId;
                turnoNombre = shiftMap.get(markShiftId)!.Name || 'Turno Sin Nombre';
            }
            // Prioridad 2: Turno asignado al empleado (CurrentShift)
            else if (empShiftId && shiftMap.has(empShiftId)) {
                activeShiftId = empShiftId;
                turnoNombre = shiftMap.get(empShiftId)!.Name || 'Turno Sin Nombre';
            }

            // Validar que el nombre sea un nombre real y no un ID o fallback
            const cleanName = nombreEmpleado ? nombreEmpleado.trim() : '';
            const cleanOid = empOid ? empOid.trim() : '';

            const esNombreValido =
                cleanName &&
                cleanName !== 'Desconocido' &&
                cleanName !== 'N/A' &&
                !cleanName.startsWith('ID:') &&
                cleanName.toLowerCase() !== cleanOid.toLowerCase() &&
                !/^[0-9a-fA-F-]{30,}$/.test(cleanName) &&
                !(cleanName === documento && cleanName.length > 20);

            if (!esNombreValido) return null;

            // C. Resolver valores de configuración para checkboxes
            const shiftObj = activeShiftId ? shiftMap.get(activeShiftId) : null;

            // Day of the week for shifttimetable lookup (Lunes=1, Domingo=7)
            const dayOfWeek = m.Day ? new Date(m.Day).getUTCDay() : 1;
            const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;
            
            const shifttimetableObj = activeShiftId 
                ? shifttimetableMap.get(`${activeShiftId}_${numberDay}`) 
                : null;

            // Fallback a la configuración si el valor es null en la base de datos
            let iniciaTurnoVal = m.StartShiftMarkingIn;
            if (iniciaTurnoVal === null) {
                iniciaTurnoVal = shifttimetableObj ? !!shifttimetableObj.StartShiftMarkingIn : false;
            }

            let extraDespuesVal = m.OverTimeAfterExit;
            if (extraDespuesVal === null) {
                extraDespuesVal = shiftObj ? !!shiftObj.OverTimeAfterExit : false;
            }

            let extraFestivoVal = m.OverTimeInHoliday;
            if (extraFestivoVal === null) {
                extraFestivoVal = shiftObj ? !!shiftObj.OverTimeInHoliday : false;
            }

            // D. Resolver DEPARTAMENTO
            let departamentoNombre = 'Sin Departamento';
            const deptOid = empData?.Department?.trim();
            if (deptOid && deptMap.has(deptOid)) {
                const deptObj = deptMap.get(deptOid)!;
                let name = deptObj.FullName || deptObj.Name || '';
                name = name.replace(/^(7 DE AGOSTO|CALLE 4|CALLE 4TA)\//i, "");
                departamentoNombre = name;
            }

            return {
                id: m.Oid,
                cedula: documento,
                empleado: cleanName,
                departamento: departamentoNombre,
                turno: turnoNombre,
                fecha: formatDateOnly(m.Day),
                entrada: formatLocale(m.MarkingIn),
                salida: formatLocale(m.MarkingOut),
                iniciaTurno: !!iniciaTurnoVal,
                tiempoExtraDespues: !!extraDespuesVal,
                tiempoExtraFestivo: !!extraFestivoVal,
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

        // Obtener nombre del empleado para el log
        let empName = "Empleado";
        if (updated.Employee) {
            const p = await prisma.eperson.findUnique({ where: { Oid: updated.Employee }, select: { FullName: true } });
            empName = p?.FullName || updated.Employee;
        }

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "UPDATE",
            targetModel: "marking",
            targetId: id,
            targetName: `Marcación de ${empName}`,
            description: `Actualización manual de marcación. Datos: ${JSON.stringify(updateData)}`,
            req: request
        });

        // RECALCULO INSTANTANEO SI HUBO ACTUALIZACION MANUAL
        if (updated.Employee && updated.Day) {
            try {
                await laborEngine.processDay(updated.Employee, updated.Day);
            } catch (err) {
                console.error("Error silently ignored on processDay for PATCH:", err);
            }
        }

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

        // Validación flexible: Al menos entrada o salida deben estar presentes
        if (!empleadoId || !fecha || (!entrada && !salida)) {
            return NextResponse.json({ error: "Empleado, fecha y al menos una marcación (entrada/salida) son requeridos" }, { status: 400 });
        }

        // Helper para crear fecha UTC desde partes locales
        const createUTCDate = (dateStr: string, timeStr: string | null) => {
            if (!timeStr) return null;
            const [year, month, day] = dateStr.split('-').map(Number);
            const [hour, minute] = timeStr.split(':').map(Number);
            return new Date(Date.UTC(year, month - 1, day, hour, minute));
        };

        const markingInData = createUTCDate(fecha, entrada);
        const markingOutData = createUTCDate(fecha, salida);

        const newMarking = await prisma.marking.create({
            data: {
                Oid: crypto.randomUUID(),
                Employee: empleadoId,
                Shift: turnoId || null,
                Day: new Date(fecha),
                MarkingIn: markingInData,
                MarkingOut: markingOutData,
                StartShiftMarkingIn: !!markingInData,
                Approve: false
            }
        });

        // Obtener nombre del empleado para el log
        const p = await prisma.eperson.findUnique({ where: { Oid: empleadoId }, select: { FullName: true } });
        const empName = p?.FullName || empleadoId;

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "CREATE",
            targetModel: "marking",
            targetId: newMarking.Oid,
            targetName: `Nueva marcación: ${empName}`,
            description: `Creación manual de marcación el día ${fecha}`,
            req: request
        });

        if (newMarking.Employee && newMarking.Day) {
            try {
                await laborEngine.processDay(newMarking.Employee, newMarking.Day);
            } catch (err) {
                console.error("Error silently ignored on processDay for POST:", err);
            }
        }

        return NextResponse.json(newMarking);
    } catch (error) {
        console.error("Error creating manual marcación:", error);
        return NextResponse.json(
            { error: "Error creando marcación manual" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID de marcación requerido" }, { status: 400 });
        }

        // 1. Buscar datos antes de borrar para el log
        const oldMarking = await prisma.marking.findUnique({
            where: { Oid: id }
        });

        let empName = "Desconocido";
        // 2. Si existe la marcación, buscamos el nombre de la persona manualmente
        if (oldMarking?.Employee) {
            const persona = await prisma.eperson.findUnique({
                where: { Oid: oldMarking.Employee },
                select: { FullName: true }
            });
            empName = persona?.FullName || "Desconocido";
        }

        const dayStr = oldMarking?.Day ? new Date(oldMarking.Day).toLocaleDateString() : "";

        // 3. Borrar la marcación
        await prisma.marking.delete({
            where: { Oid: id }
        });

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "DELETE",
            targetModel: "marking",
            targetId: id,
            targetName: `Marcación de ${empName} (${dayStr})`,
            description: `Eliminación de registro de asistencia`,
            req: request
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting marcación:", error);
        return NextResponse.json(
            { error: "Error eliminando marcación" },
            { status: 500 }
        );
    }
}

