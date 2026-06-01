import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivity } from "@/lib/activity-log";

export async function GET(
    request: Request,
    context: { params: Promise<{ Oid: string }> }
) {
    const { Oid } = await context.params;

    if (!Oid) {
        return NextResponse.json({ error: "Oid requerido" }, { status: 400 });
    }

    try {
        // 1. Buscar el Horario Base (Timetable)
        const timetable = await prisma.timetable.findUnique({
            where: { Oid },
        });

        if (!timetable) {
            return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
        }

        // 2. Buscar detalles específicos (Fijo o Variable) usando contains para robustez con Char(38)
        const [fixed, variable, linkedShifts] = await Promise.all([
            prisma.timetablefixed.findFirst({ where: { Oid: { contains: Oid.trim() } } }),
            prisma.timetablevariable.findFirst({ where: { Oid: { contains: Oid.trim() } } }),
            prisma.shifttimetable.findMany({
                where: { Timetable: { contains: Oid.trim() } }
            })
        ]);

        // 3. Determinar tipo y construir respuesta
        let type = "unknown";
        let details = {};

        if (variable) {
            type = "variable";
            details = {
                tiempoTrabajo: secondsToTime(variable.WorkingTime),
                descuentoComida: secondsToTime(variable.DiscountTimeLunch),
                // Incluir referencias de hora si existen en tabla fija (para Formato 3)
                entrada: fixed ? secondsToTime(fixed.MarkingIn) : undefined,
                salida: fixed ? secondsToTime(fixed.MarkingOut) : undefined,
            };
        } else if (fixed) {
            type = "fijo";
            details = {
                entrada: secondsToTime(fixed.MarkingIn),
                salida: secondsToTime(fixed.MarkingOut),
                incluirComida: fixed.Lunch ?? false,
                salidaComida: secondsToTime(fixed.LunchOut),
                entradaComida: secondsToTime(fixed.LunchIn),
                retardo: secondsToTime(fixed.Delay),
            };
        }

        // 4. Obtener Shifts ligados (Ids)
        const turnos = linkedShifts.map(ls => ({
            Shift: ls.Shift,
            Day: ls.Day || '',
            NumberDay: ls.NumberDay || 0,
            MustMarkingOut: ls.MustMarkingOut ?? true,
            StartShiftMarkingIn: ls.StartShiftMarkingIn ?? false,
            MarkingOptional: ls.MarkingOptional ?? false
        }));


        return NextResponse.json({
            ...timetable,
            type,
            ...details,
            turnos: turnos
        });

    } catch (error) {
        console.error("Error fetching horario detail:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

// Update (PUT) - Para guardar cambios
export async function PUT(
    request: Request,
    context: { params: Promise<{ Oid: string }> }
) {
    const { Oid } = await context.params;
    try {
        const body = await request.json();
        const {
            name: nameFromFront,
            type, // 'fijo' | 'variable'
            turnos, // Array of { Shift, Day, NumberDay, MustMarkingOut, StartShiftMarkingIn, MarkingOptional }
            // Fijo
            entrada,
            salida,
            incluirComida,
            salidaComida,
            entradaComida,
            retardo,
            // Variable
            tiempoTrabajo,
            descuentoComida
        } = body;

        let finalName = nameFromFront;

        // 1. Actualizar Timetable (Nombre, TotalTime)
        let totalTimeSeconds = 0;

        // Validar si hay descuento de comida para variable
        const discountSeconds = type === 'variable' ? timeToSeconds(descuentoComida) : 0;

        // Determinar si debemos guardar datos en timetablefixed (Entrada/Salida) aunque sea variable
        // Esto es necesario para el Formato 3: "Inicio A Fin ... (Descuento ...)"
        const hasReferenceTimes = entrada && salida;

        if (type === 'fijo') {
            totalTimeSeconds = calculateTotalSeconds(entrada, salida, incluirComida, salidaComida, entradaComida);
            // Nombre Fijo (Logic preserved or simple)
            finalName = `${format12h(entrada)} A ${format12h(salida)}`;
            if (incluirComida) {
                finalName += ` CON ALMUERZO DE ${format12h(salidaComida)} A ${format12h(entradaComida)}`;
            }

        } else {
            // VARIABLE
            totalTimeSeconds = timeToSeconds(tiempoTrabajo);

            // GENERACIÓN DE NOMBRE PARA VARIABLE
            // Format 3: [Start] A [End] : [Total] (DESCUENTO DEL TIEMPO DE COMIDA : [Lunch])
            if (discountSeconds > 0 && hasReferenceTimes) {
                finalName = `${format12h(entrada)} A ${format12h(salida)} : ${tiempoTrabajo} (DESCUENTO DEL TIEMPO DE COMIDA : ${descuentoComida})`;
            } else {
                // Format 1 & 2
                const [horas, minutos] = tiempoTrabajo.split(':').map(Number);
                const horasTexto = `${horas} HORA${horas !== 1 ? 'S' : ''}`;
                const minText = minutos > 0 ? ` ${minutos} MIN` : '';

                // Analizar turnos para ver si hay un día único recurrente
                let diaUnico = '';
                if (Array.isArray(turnos) && turnos.length > 0) {
                    const diasUnicos = new Set(turnos.map((t: any) => t.Day).filter(Boolean));
                    if (diasUnicos.size === 1) {
                        diaUnico = Array.from(diasUnicos)[0] as string;
                    }
                }

                if (diaUnico) {
                    finalName = `${diaUnico.toUpperCase()} ${horasTexto}${minText} : ${tiempoTrabajo}`;
                } else {
                    finalName = `${horasTexto}${minText} : ${tiempoTrabajo}`;
                }
            }
        }


        await prisma.timetable.update({
            where: { Oid },
            data: {
                DisplayName: finalName,
                Name: finalName,
                TotalTime: totalTimeSeconds,
            }
        });

        // 2. Actualizar Tablas Específicas

        // Limpieza de tablas contrarias para evitar registros huérfanos
        if (type === 'fijo') {
            await prisma.timetablevariable.deleteMany({ where: { Oid } });
        } else if (type === 'variable' && !hasReferenceTimes) {
            await prisma.timetablefixed.deleteMany({ where: { Oid } });
        }

        // SIEMPRE actualizamos timetablefixed si vienen datos, para soportar las referencias de hora en Variable
        if (type === 'fijo' || hasReferenceTimes) {
            await prisma.timetablefixed.upsert({
                where: { Oid },
                create: {
                    Oid,
                    MarkingIn: timeToSeconds(entrada),
                    MarkingOut: timeToSeconds(salida),
                    Lunch: type === 'fijo' ? incluirComida : false, // Solo Fijo usa flag real de lunch logic
                    LunchOut: timeToSeconds(salidaComida),
                    LunchIn: timeToSeconds(entradaComida),
                    Delay: timeToSeconds(retardo)
                },
                update: {
                    MarkingIn: timeToSeconds(entrada),
                    MarkingOut: timeToSeconds(salida),
                    Lunch: type === 'fijo' ? incluirComida : false,
                    LunchOut: timeToSeconds(salidaComida),
                    LunchIn: timeToSeconds(entradaComida),
                    Delay: timeToSeconds(retardo)
                }
            });
        }

        if (type === 'variable') {
            await prisma.timetablevariable.upsert({
                where: { Oid },
                create: {
                    Oid,
                    WorkingTime: timeToSeconds(tiempoTrabajo),
                    DiscountTimeLunch: timeToSeconds(descuentoComida)
                },
                update: {
                    WorkingTime: timeToSeconds(tiempoTrabajo),
                    DiscountTimeLunch: timeToSeconds(descuentoComida)
                }
            });
        }

        // 3. Actualizar Relación con Turnos (ShiftTimetable)
        if (Array.isArray(turnos)) {
            await prisma.shifttimetable.deleteMany({
                where: { Timetable: Oid }
            });

            const { v4: uuidv4 } = require('uuid');

            const newLinks = turnos.map((t: any) => ({
                Oid: uuidv4(),
                Timetable: Oid,
                Shift: t.Shift, // ID del turno
                Day: t.Day,
                NumberDay: t.NumberDay,
                MustMarkingOut: t.MustMarkingOut ?? true,
                StartShiftMarkingIn: t.StartShiftMarkingIn ?? false,
                MarkingOptional: t.MarkingOptional ?? false
            }));

            if (newLinks.length > 0) {
                await prisma.shifttimetable.createMany({
                    data: newLinks
                });
            }
        }

        // REGISTRO DE ACTIVIDAD
        await recordActivity({
            action: "UPDATE",
            targetModel: "timetable",
            targetId: Oid,
            targetName: finalName,
            description: `Actualización de horario`,
            req: request
        });

        return NextResponse.json({ success: true, name: finalName });

    } catch (error) {
        console.error("Error updating horario:", error);
        return NextResponse.json({ error: "Error actualizando horario" }, { status: 500 });
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
        const timetable = await prisma.timetable.findUnique({
            where: { Oid },
        });

        if (!timetable) {
            return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
        }

        // Eliminar en transacción para asegurar integridad
        await prisma.$transaction([
            prisma.shifttimetable.deleteMany({ where: { Timetable: Oid } }),
            prisma.timetablefixed.deleteMany({ where: { Oid } }),
            prisma.timetablevariable.deleteMany({ where: { Oid } }),
            prisma.timetable.delete({ where: { Oid } })
        ]);

        await recordActivity({
            action: "DELETE",
            targetModel: "timetable",
            targetId: Oid,
            targetName: timetable.Name || timetable.DisplayName || "",
            description: `Eliminación de horario`,
            req: request
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting horario:", error);
        return NextResponse.json({ error: "Error eliminando horario" }, { status: 500 });
    }
}

// Helpers
function secondsToTime(val: number | null | undefined): string {
    if (val === null || val === undefined) return "00:00:00";

    const hours = Math.floor(val / 3600);
    const minutes = Math.floor((val % 3600) / 60);
    const seconds = Math.floor(val % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeStr: string | null | undefined): number {
    if (!timeStr) return 0;
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

function calculateTotalSeconds(entrada: string, salida: string, incluirComida: boolean, salidaComida: string, entradaComida: string): number {
    let total = timeToSeconds(salida) - timeToSeconds(entrada);
    if (incluirComida) {
        const lunchTime = timeToSeconds(entradaComida) - timeToSeconds(salidaComida);
        total -= lunchTime;
    }
    return total > 0 ? total : 0;
}

function format12h(timeStr: string | null | undefined): string {
    if (!timeStr) return "";
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr || "0", 10);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12; // la hora '0' de debe ser '12'

    return `${h}:${m} ${ampm}`;
}
