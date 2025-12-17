
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
            include: {
                person: true,
            }
        });
        console.log("DEBUG: Employees found:", empleadosRaw.length);
        if (empleadosRaw.length > 0) {
            console.log("DEBUG: First employee person:", empleadosRaw[0].person);
        }

        // Extract IDs for batch fetching
        const departmentIds = [...new Set(empleadosRaw.map((e) => e.Department).filter((id): id is string => !!id))];
        const shiftIds = [...new Set(empleadosRaw.map((e) => e.CurrentShift).filter((id): id is string => !!id))];
        const positionIds = [...new Set(empleadosRaw.map((e) => e.Position).filter((id): id is string => !!id))];
        const agreementTypeIds = [...new Set(empleadosRaw.map((e) => e.CurrentAgreementType).filter((id): id is string => !!id))];
        const bossIds = [...new Set(empleadosRaw.map((e) => e.Boss).filter((id): id is string => !!id))];

        // Parallel fetch
        const [departamentos, turnos, cargos, contratos, jefes] = await Promise.all([
            prisma.department.findMany({ where: { Oid: { in: departmentIds } } }),
            prisma.shift.findMany({ where: { Oid: { in: shiftIds } } }),
            prisma.position.findMany({ where: { Oid: { in: positionIds } } }),
            prisma.agreementtype.findMany({ where: { Oid: { in: agreementTypeIds } } }),
            prisma.eperson.findMany({ where: { Oid: { in: bossIds } } }),
        ]);

        // Create Maps
        const deptMap = new Map(departamentos.map((d) => [d.Oid, d]));
        const shiftMap = new Map(turnos.map((s) => [s.Oid, s]));
        const positionMap = new Map(cargos.map((p) => [p.Oid, p]));
        const agreementMap = new Map(contratos.map((a) => [a.Oid, a]));
        const bossMap = new Map(jefes.map((b) => [b.Oid, b]));

        // Construct Response
        const empleados = empleadosRaw.map((emp) => {
            const persona = emp.person;
            const departamento = emp.Department ? deptMap.get(emp.Department) : null;
            const turno = emp.CurrentShift ? shiftMap.get(emp.CurrentShift) : null;
            const cargo = emp.Position ? positionMap.get(emp.Position) : null;
            const contrato = emp.CurrentAgreementType ? agreementMap.get(emp.CurrentAgreementType) : null;
            const jefe = emp.Boss ? bossMap.get(emp.Boss) : null;

            const name = (persona?.FullName || "Sin Nombre").trim();
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
                Jefe: jefe?.FullName ?? "",
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

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error actualizando turno:", error);
        return NextResponse.json({ error: "Error actualizando turno" }, { status: 500 });
    }
}
