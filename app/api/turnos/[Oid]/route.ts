import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivity } from "@/lib/activity-log";

// Rebuild trigger

export async function GET(
    request: Request,
    context: { params: Promise<{ Oid: string }> }
) {
    const { Oid } = await context.params;

    try {
        const shift = await prisma.shift.findUnique({
            where: { Oid: Oid },
        });

        if (!shift) {
            return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
        }

        // 1. Fetch Horarios (ShiftTimetable)
        const shiftTimetables = await prisma.shifttimetable.findMany({
            where: { Shift: Oid },
            orderBy: { NumberDay: 'asc' }
        });

        // 2. Fetch Timetable Names for display
        const timetableIds = shiftTimetables
            .map(st => st.Timetable)
            .filter((oid): oid is string => oid !== null);

        let timetableMap: Record<string, string> = {};
        if (timetableIds.length > 0) {
            const timetables = await prisma.timetable.findMany({
                where: { Oid: { in: timetableIds } },
                select: { Oid: true, DisplayName: true }
            });
            timetables.forEach(t => {
                timetableMap[t.Oid] = t.DisplayName || "";
            });
        }

        const horarios = shiftTimetables.map(st => ({
            day: st.NumberDay,
            timetableId: st.Timetable,
            timetableName: st.Timetable ? (timetableMap[st.Timetable] || "Desconocido") : "",
            mustMarkOut: st.MustMarkingOut,
            startShiftMarkingIn: st.StartShiftMarkingIn,
            markingOptional: st.MarkingOptional
        }));

        // 3. Fetch Employees with full details
        const empleadosRaw = await prisma.employee.findMany({
            where: {
                OR: [
                    { CurrentShift: Oid }, // Assigned to this shift
                    { CurrentShift: null }  // OR Unassigned (available)
                ]
            }
        });

        // Extract IDs for batch fetching
        const empIds = empleadosRaw.map(e => e.Oid);
        const departmentIds = [...new Set(empleadosRaw.map((e) => e.Department).filter((id): id is string => !!id))];
        const shiftIds = [...new Set(empleadosRaw.map((e) => e.CurrentShift).filter((id): id is string => !!id))];
        const positionIds = [...new Set(empleadosRaw.map((e) => e.Position).filter((id): id is string => !!id))];
        const agreementTypeIds = [...new Set(empleadosRaw.map((e) => e.CurrentAgreementType).filter((id): id is string => !!id))];
        const bossIds = [...new Set(empleadosRaw.map((e) => e.Boss).filter((id): id is string => !!id))];

        // Parallel fetch
        const [departamentos, turnos, cargos, contratos, jefes, personas] = await Promise.all([
            prisma.department.findMany({ where: { Oid: { in: departmentIds } } }),
            prisma.shift.findMany({ where: { Oid: { in: shiftIds } } }),
            prisma.position.findMany({ where: { Oid: { in: positionIds } } }),
            prisma.agreementtype.findMany({ where: { Oid: { in: agreementTypeIds } } }),
            prisma.employee.findMany({ // We need the IDs of the bosses to get their names from the persons map? No, boss needs ePerson directly.
                where: { Oid: { in: bossIds } },
                select: { Oid: true, Boss: true } // Just valid IDs
            }),
            prisma.eperson.findMany({
                where: {
                    Oid: { in: [...empIds, ...bossIds] }
                },
                select: { Oid: true, FullName: true, Document: true, FirstName: true, LastName: true }
            }),
        ]);

        // Create Maps
        const deptMap = new Map(departamentos.map((d) => [d.Oid, d]));
        const shiftMap = new Map(turnos.map((s) => [s.Oid, s]));
        const positionMap = new Map(cargos.map((p) => [p.Oid, p]));
        const agreementMap = new Map(contratos.map((a) => [a.Oid, a]));
        const personMap = new Map(personas.map((p) => [p.Oid, p]));

        // Map bosses names
        // Correct logic: The 'Boss' field in Employee is an Employee OID. 
        // That Employee has a Person OID (same value).
        // So we look up the Boss name using the Boss OID in the Person Map.
        const getBossName = (bossOid: string | null) => {
            if (!bossOid) return "";
            const p = personMap.get(bossOid);
            return p ? (p.FullName || `${p.FirstName || ''} ${p.LastName || ''}`.trim()) : "";
        };

        // Construct Response
        const empleados = empleadosRaw.map((emp) => {
            const persona = personMap.get(emp.Oid);
            const departamento = emp.Department ? deptMap.get(emp.Department) : null;
            const turno = emp.CurrentShift ? shiftMap.get(emp.CurrentShift) : null;
            const cargo = emp.Position ? positionMap.get(emp.Position) : null;
            const contrato = emp.CurrentAgreementType ? agreementMap.get(emp.CurrentAgreementType) : null;

            const name = (persona?.FullName || `${persona?.FirstName || ''} ${persona?.LastName || ''}`).trim() || "Sin Nombre";
            const displayName = name === "" ? "Sin Nombre" : name;

            const item = {
                Oid: emp.Oid,
                "Número Lector": emp.AcNumber ?? "",
                "Nombre a mostrar": displayName,
                Documento: persona?.Document ?? "",
                Departamento: departamento?.Name ?? "",
                "Turno Actual": turno?.Name ?? "",
                "Valor Hora": emp.ValorHora ?? "",
                Cargo: cargo?.Name ?? "",
                Contrato: contrato?.Name ?? "",
                Jefe: getBossName(emp.Boss),
                Status: emp.Status,
                Assigned: emp.CurrentShift === Oid // Keep assignment logic
            };

            const tieneDatosReales =
                (item["Nombre a mostrar"] !== "Sin Nombre" && item["Nombre a mostrar"] !== "") ||
                item.Departamento !== "" ||
                item["Turno Actual"] !== "" ||
                item.Assigned; // Always include if assigned!

            return tieneDatosReales ? item : null;
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        // Mapping for Frontend
        let rotacion = "Semana";
        if (shift.ShiftCycle === 0) rotacion = "Dia";
        if (shift.ShiftCycle === 1) rotacion = "Semana";
        if (shift.ShiftCycle === 3) rotacion = "Mes";

        let festivos = "no_trabaja_dias_de_fiesta";
        if (shift.Holidays === 1) festivos = "trabaja_dias_de_fiesta";
        if (shift.Holidays === 2) festivos = "trabaja_ocacionalmente_dias_de_fiesta";

        return NextResponse.json({
            Oid: shift.Oid,
            nombre: shift.Name,
            numeroCiclos: shift.NumberCycles,
            estado: shift.Status === 0 ? "activo" : "inactivo",
            rotacion,
            festivos,
            tiempoExtra: {
                antesEntrada: shift.OverTimeBeforeEntry,
                despuesSalida: shift.OverTimeAfterExit,
                enComida: shift.OverTimeInLunch,
                enFestivo: shift.OverTimeInHoliday
            },
            adicionarTiempoExtra: shift.AddOverTime || 0,
            tiempoExtraMinimo: shift.MinimumOverTime || 0,
            horarios,
            empleados
        });
    } catch (error) {
        console.error("Error obteniendo turno:", error);
        return NextResponse.json({ error: "Error obteniendo turno" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    context: { params: Promise<{ Oid: string }> }
) {
    const { Oid } = await context.params;

    try {
        const body = await request.json();
        const {
            nombre,
            rotacion,
            festivos,
            numeroCiclos,
            estado,
            tiempoExtra,
            horarios,
            empleados,
            tiempoExtraMinimo,
            adicionarTiempoExtra
        } = body;

        const { v4: uuidv4 } = require('uuid');

        let shiftCycle = 1; // Default Semana
        if (rotacion === 'Dia') shiftCycle = 0;
        if (rotacion === 'Semana') shiftCycle = 1;
        if (rotacion === 'Mes') shiftCycle = 3;

        let holidayType = 0; // Default no trabaja
        if (festivos === 'trabaja_dias_de_fiesta') holidayType = 1;
        if (festivos === 'trabaja_ocacionalmente_dias_de_fiesta') holidayType = 2;

        const result = await prisma.$transaction(async (tx) => {
            const updatedShift = await tx.shift.update({
                where: { Oid: Oid },
                data: {
                    Name: nombre,
                    NumberCycles: parseInt(numeroCiclos) || 1,
                    Status: estado === 'activo' ? 0 : 1,
                    ShiftCycle: shiftCycle,
                    Holidays: holidayType,
                    OverTimeBeforeEntry: tiempoExtra?.antesEntrada || false,
                    OverTimeAfterExit: tiempoExtra?.despuesSalida || false,
                    OverTimeInLunch: tiempoExtra?.enComida || false,
                    OverTimeInHoliday: tiempoExtra?.enFestivo || false,
                    AddOverTime: parseInt(adicionarTiempoExtra) || 0,
                    MinimumOverTime: parseInt(tiempoExtraMinimo) || 0
                },
            });

            // Update Horarios (Delete all and recreate)
            await tx.shifttimetable.deleteMany({
                where: { Shift: Oid }
            });

            if (horarios && Array.isArray(horarios)) {
                for (const h of horarios) {
                    if (h.timetableId) {
                        await tx.shifttimetable.create({
                            data: {
                                Oid: uuidv4().toUpperCase(),
                                Shift: Oid,
                                Timetable: h.timetableId,
                                NumberDay: h.day,
                                Day: h.day.toString(),
                                MustMarkingOut: h.mustMarkOut || false,
                                StartShiftMarkingIn: h.startShiftMarkingIn || false,
                                MarkingOptional: h.markingOptional || false
                            }
                        });
                    }
                }
            }

            // Update Employees
            if (empleados && Array.isArray(empleados)) {
                // 1. Remove from this shift those who are NOT in the new list
                await tx.employee.updateMany({
                    where: {
                        CurrentShift: Oid,
                        Oid: { notIn: empleados }
                    },
                    data: { CurrentShift: null }
                });

                // 2. Assign selected ones to this shift
                if (empleados.length > 0) {
                    await tx.employee.updateMany({
                        where: { Oid: { in: empleados } },
                        data: { CurrentShift: Oid }
                    });
                }
            }

            return updatedShift;
        });

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "UPDATE",
            targetModel: "shift",
            targetId: Oid,
            targetName: nombre,
            description: `Actualización de turno. Empleados asignados: ${empleados?.length || 0}`,
            req: request
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error actualizando turno:", error);
        return NextResponse.json({ error: "Error actualizando turno" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ Oid: string }> }
) {
    const { Oid } = await context.params;

    if (!Oid) {
        return NextResponse.json({ error: "Oid requerido" }, { status: 400 });
    }

    try {
        const shift = await prisma.shift.findUnique({
            where: { Oid },
        });

        if (!shift) {
            return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
        }

        // Eliminar en transacción para asegurar integridad referencial
        await prisma.$transaction(async (tx) => {
            // 1. Quitar el turno asignado a los empleados
            await tx.employee.updateMany({
                where: { CurrentShift: Oid },
                data: { CurrentShift: null }
            });

            // 2. Eliminar las relaciones de horarios en shifttimetable
            await tx.shifttimetable.deleteMany({
                where: { Shift: Oid }
            });

            // 3. Eliminar el turno
            await tx.shift.delete({
                where: { Oid }
            });
        });

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "DELETE",
            targetModel: "shift",
            targetId: Oid,
            targetName: shift.Name || "",
            description: `Eliminación de turno`,
            req: request
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting turno:", error);
        return NextResponse.json({ error: "Error eliminando turno" }, { status: 500 });
    }
}
