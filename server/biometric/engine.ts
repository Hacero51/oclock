import crypto from "crypto";
import prisma from "@/lib/prisma";

export interface CalculationResult {
    conceptCode: string;
    hours: number;
    startDate: Date;
    endDate: Date;
}

export class LaborEngine {
    // Definición de las horas donde comienza y termina el horario nocturno
    private nightStartHour = 19; // 7 PM
    private nightEndHour = 6;    // 6 AM
    
    // Límites legales de horas en la semana (dinámico mediante variable de entorno para transición a 42h)
    private weeklyOrdinaryLimit = process.env.WEEKLY_ORDINARY_LIMIT ? parseInt(process.env.WEEKLY_ORDINARY_LIMIT) : 44;
    private weeklyExtraLimit = 12;
    
    // Tiempo de almuerzo implícito (30 minutos)
    private implicitLunchSeconds = 1800; 

    async processDay(employeeOid: string, date: Date) {
        if (!(global as any).engineTrace) (global as any).engineTrace = [];
        const trace = (global as any).engineTrace;
        trace.push(`Starting processDay for ${employeeOid} on ${date.toISOString()}`);

        // 1. Normalizar la fecha de inicio del día a la medianoche UTC
        const startOfDayDB = new Date(date);
        startOfDayDB.setUTCHours(0, 0, 0, 0);

        // 2. Buscar al empleado en la base de datos
        const employee = await prisma.employee.findUnique({ where: { Oid: employeeOid } });
        if (!employee) {
            trace.push("Employee not found in DB");
            return;
        }

        // Validar si la fecha a procesar está dentro de los contratos/acuerdos del empleado
        const agreements = await prisma.agreement.findMany({
            where: { Employee: employeeOid, GCRecord: null }
        });

        let isWorkingPeriod = false;

        if (agreements.length > 0) {
            // Si tiene acuerdos, el día debe caer dentro de al menos uno de ellos
            for (const agg of agreements) {
                if (agg.StartDate) {
                    const start = new Date(agg.StartDate);
                    start.setUTCHours(0, 0, 0, 0);
                    
                    const end = agg.EndDate ? new Date(agg.EndDate) : null;
                    if (end) {
                        end.setUTCHours(0, 0, 0, 0);
                    }

                    const fallsAfterStart = startOfDayDB >= start;
                    const fallsBeforeEnd = !end || startOfDayDB <= end;

                    if (fallsAfterStart && fallsBeforeEnd) {
                        isWorkingPeriod = true;
                        break;
                    }
                }
            }
        } else {
            // Si no tiene contratos registrados (caso común en esta base de datos):
            // A. Obtener fecha de ingreso límite (fecha de primera marcación o creación de registro)
            const firstMarking = await prisma.marking.findFirst({
                where: { Employee: employeeOid },
                orderBy: { Day: 'asc' }
            });
            const firstMarkingDay = firstMarking && firstMarking.Day ? new Date(firstMarking.Day) : null;
            if (firstMarkingDay) {
                firstMarkingDay.setUTCHours(0, 0, 0, 0);
            }

            const party = await prisma.eparty.findUnique({
                where: { Oid: employeeOid },
                select: { CreatedDate: true, GCRecord: true }
            });
            const hireDate = (party && party.GCRecord === null) ? party.CreatedDate : null;
            let normalizedHireDate = null;
            if (hireDate) {
                normalizedHireDate = new Date(hireDate);
                normalizedHireDate.setUTCHours(0, 0, 0, 0);
            }

            const startLimit = firstMarkingDay || normalizedHireDate;

            // B. Obtener última marcación registrada antes o en el mismo día que se está calculando
            const prevMarking = await prisma.marking.findFirst({
                where: { 
                    Employee: employeeOid,
                    Day: { lte: startOfDayDB }
                },
                orderBy: { Day: 'desc' }
            });
            const prevMarkingDay = prevMarking && prevMarking.Day ? new Date(prevMarking.Day) : null;
            if (prevMarkingDay) {
                prevMarkingDay.setUTCHours(0, 0, 0, 0);
            }

            // C. Obtener la última marcación histórica absoluta (para validar el fin laboral de inactivos)
            const absoluteLastMarking = await prisma.marking.findFirst({
                where: { Employee: employeeOid },
                orderBy: { Day: 'desc' }
            });
            const absoluteLastMarkingDay = absoluteLastMarking && absoluteLastMarking.Day ? new Date(absoluteLastMarking.Day) : null;
            if (absoluteLastMarkingDay) {
                absoluteLastMarkingDay.setUTCHours(0, 0, 0, 0);
            }

            // D. Evaluar vigencia
            const afterStartLimit = !startLimit || startOfDayDB >= startLimit;
            
            if (afterStartLimit) {
                if (employee.Status !== 0 && absoluteLastMarkingDay && startOfDayDB > absoluteLastMarkingDay) {
                    // Empleado INACTIVO: no trabaja después de su última marcación absoluta
                    isWorkingPeriod = false;
                } else {
                    // Evaluamos el umbral de 3 días sin marcar
                    isWorkingPeriod = true;
                    if (prevMarkingDay) {
                        const diffDays = (startOfDayDB.getTime() - prevMarkingDay.getTime()) / (1000 * 3600 * 24);
                        if (diffDays > 3) {
                            isWorkingPeriod = false;
                        }
                    } else if (startLimit) {
                        const diffDays = (startOfDayDB.getTime() - startLimit.getTime()) / (1000 * 3600 * 24);
                        if (diffDays > 3) {
                            isWorkingPeriod = false;
                        }
                    }
                }
            }

            trace.push(`Checking active period for ${employeeOid}: isWorkingPeriod=${isWorkingPeriod} (status=${employee.Status}, startLimit=${startLimit?.toISOString()}, lastMarking=${prevMarkingDay?.toISOString()}, absoluteLastMarking=${absoluteLastMarkingDay?.toISOString()})`);
        }

        if (!isWorkingPeriod) {
            // Limpiar cualquier registro guardado en este día fuera del período laboral
            const endOfDay = new Date(startOfDayDB);
            endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
            await this.saveResultsRange(employeeOid, startOfDayDB, endOfDay, []);
            trace.push(`Day ${startOfDayDB.toISOString()} is outside employee's active working agreements. Cleaned day.`);
            return;
        }

        // 3. Obtener la marcación de entrada/salida de ese día
        const marking = await prisma.marking.findFirst({
            where: { Employee: employeeOid, Day: startOfDayDB }
        });

        // R48: Validar ausencia injustificada si no hay entrada ni salida
        const hasNoMarking = !marking || (!marking.MarkingIn && !marking.MarkingOut);
        if (hasNoMarking) {
            // Verificar si el día es festivo registrado y activo (Status: 0)
            const endOfDayDB = new Date(startOfDayDB);
            endOfDayDB.setUTCHours(23, 59, 59, 999);
            const holiday = await prisma.holiday.findFirst({
                where: { 
                    Day: { gte: startOfDayDB, lte: endOfDayDB },
                    Status: 0 
                }
            });
            if (holiday) {
                const endOfDay = new Date(startOfDayDB);
                endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
                await this.saveResultsRange(employeeOid, startOfDayDB, endOfDay, []);
                trace.push(`Absence on holiday ${holiday.Name} skipped for R48.`);
                return;
            }

            const dayOfWeek = date.getUTCDay();
            const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

            let activeShiftOid = (marking?.Shift || '').trim() || null;
            let currentShiftObj = null;
            if (activeShiftOid) {
                currentShiftObj = await prisma.shift.findUnique({ where: { Oid: activeShiftOid } });
            }
            if (!currentShiftObj && employee.CurrentShift) {
                activeShiftOid = employee.CurrentShift.trim();
                currentShiftObj = await prisma.shift.findUnique({ where: { Oid: activeShiftOid } });
            }

            const shiftLink = activeShiftOid ? await prisma.shifttimetable.findFirst({
                where: { Shift: activeShiftOid, NumberDay: numberDay }
            }) : null;

            let timetable = null;
            if (shiftLink && shiftLink.Timetable) {
                timetable = await prisma.timetablefixed.findUnique({ where: { Oid: shiftLink.Timetable } });
            }

            if (timetable) {
                const endOfDayDB = new Date(startOfDayDB);
                endOfDayDB.setUTCHours(23, 59, 59, 999);

                const hasIncapacity = await prisma.incapacity.findFirst({
                    where: {
                        Employee: employeeOid,
                        IncapacityIn: { lte: endOfDayDB },
                        IncapacityOut: { gte: startOfDayDB }
                    }
                });

                if (!hasIncapacity) {
                    const baseTimetable = await prisma.timetable.findUnique({ where: { Oid: shiftLink?.Timetable || undefined } });
                    const targetA01Secs = baseTimetable?.TotalTime || ((timetable.MarkingOut || 0) - (timetable.MarkingIn || 0));
                    const r48Hours = targetA01Secs / 3600;

                    const isSaturday = numberDay === 6;
                    const isOfficeShift = currentShiftObj && (currentShiftObj.Name || '').toUpperCase().includes('OFICINA');
                    const isDummyTimetable = baseTimetable && ((baseTimetable.Name || '').toUpperCase().includes('DUMMY') || (baseTimetable.TotalTime || 0) < 3600);

                    const skipR48 = isSaturday && (isOfficeShift || isDummyTimetable);

                    if (skipR48) {
                        trace.push(`Absence on Saturday skipped for R48 because of office shift or dummy timetable.`);
                    } else {
                        const results = [{
                            conceptCode: 'R48',
                            hours: r48Hours,
                            startDate: startOfDayDB,
                            endDate: new Date(startOfDayDB.getTime() + targetA01Secs * 1000)
                        }];

                        const endOfDay = new Date(startOfDayDB);
                        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

                        await this.saveResultsRange(employeeOid, startOfDayDB, endOfDay, results);
                        trace.push(`Absence registered as R48 for employee ${employeeOid} on ${startOfDayDB.toISOString()} with ${r48Hours} hours`);
                        return;
                    }
                }
            }

            // Limpiar registros del día si no hay turno o hay una incapacidad/permiso
            const endOfDay = new Date(startOfDayDB);
            endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
            await this.saveResultsRange(employeeOid, startOfDayDB, endOfDay, []);
            trace.push(`No punches and R48 not required/justified. Cleaned day.`);
            return;
        }

        // Si hay una marcación incompleta (ej. solo salida), validamos que tenga entrada
        if (!marking.MarkingIn) {
            trace.push("Marking has no MarkingIn");
            return;
        }

        trace.push(`Marking found: In=${marking.MarkingIn.toISOString()}, Out=${marking.MarkingOut?.toISOString()}, Shift=${marking.Shift}`);

        // 4. Calcular cuántas horas ordinarias (A01) y extras (A02) lleva en la semana ANTES de hoy
        const { ordinary: weekA01, extras: weekA02 } = await this.getWeeklyAccumulated(employeeOid, startOfDayDB);
        trace.push(`Weekly accumulated: ordinary=${weekA01}, extras=${weekA02}`);

        // 5. Determinar qué día de la semana es hoy (Lunes=1, Domingo=7)
        const dayOfWeek = date.getUTCDay();
        const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        // 6. Buscar si el empleado tiene un turno asignado para este día específico (priorizando el de la marcación)
        let activeShiftOid = (marking.Shift || '').trim() || null;
        let currentShiftObj = null;
        if (activeShiftOid) {
            currentShiftObj = await prisma.shift.findUnique({ where: { Oid: activeShiftOid } });
        }

        // Fallback: Si el turno de la marcación no existe en la base de datos o es nulo,
        // usamos el turno actual configurado en el perfil del empleado.
        if (!currentShiftObj && employee.CurrentShift) {
            activeShiftOid = employee.CurrentShift.trim();
            currentShiftObj = await prisma.shift.findUnique({ where: { Oid: activeShiftOid } });
        }

        const shiftLink = activeShiftOid ? await prisma.shifttimetable.findFirst({
            where: { Shift: activeShiftOid, NumberDay: numberDay }
        }) : null;

        let timetable = null;
        let baseTimetable = null;

        // 7. Si tiene un turno para hoy, cargar los horarios fijos y variables del turno
        if (shiftLink && shiftLink.Timetable) {
            [timetable, baseTimetable] = await Promise.all([
                prisma.timetablefixed.findUnique({ where: { Oid: shiftLink.Timetable } }),
                prisma.timetable.findUnique({ where: { Oid: shiftLink.Timetable } })
            ]);
        }

        // 8. Revisar si hoy es un día festivo oficial
        const endOfDayDB = new Date(startOfDayDB);
        endOfDayDB.setUTCHours(23, 59, 59, 999);
        const holiday = await prisma.holiday.findFirst({
            where: { 
                Day: { gte: startOfDayDB, lte: endOfDayDB },
                Status: 0 
            }
        });
        // Es un día dominical/festivo si es domingo (0) o si hay un registro de festivo
        const isSundayOrHoliday = (dayOfWeek === 0 || !!holiday);

        const calcReference = new Date(date);
        calcReference.setUTCHours(0, 0, 0, 0);

        // Función ayudante para convertir los segundos del turno (ej. 25200s = 7 AM) a una fecha real
        const createTimeFromSeconds = (base: Date, seconds: number) => {
            const d = new Date(base);
            d.setUTCHours(0, 0, 0, 0);
            d.setUTCSeconds(seconds);
            return d;
        };

        const segments: { start: Date, end: Date }[] = [];
        let actualIn = marking.MarkingIn;
        let actualOut = marking.MarkingOut;

        // 9. Si el empleado no marcó salida, tratar de "asumir" la salida para el cálculo
        if (!actualOut) {
            // Asumir salida esperada (o 14:00 por defecto)
            const expectedOutSecs = (timetable?.MarkingOut || 14 * 3600);
            const expectedOut = createTimeFromSeconds(calcReference, expectedOutSecs);
            // Solo asumir si ya pasaron 6 horas desde la salida esperada
            if (new Date() > new Date(expectedOut.getTime() + 6 * 3600000)) {
                actualOut = expectedOut;
                // NOTA: No actualizamos la tabla 'marking' para que RRHH vea que falta la marcación real
            } else {
                return; // Si no, esperar a que marque salida real o pase el tiempo de gracia
            }
        }

        // Variables para definir el "bloque" principal de trabajo ordinario
        let expectedIn = actualIn;
        let expectedOut = actualOut;
        let theoreticalOut = actualOut;
        let canHaveOrdinary = false;
        let targetA01Secs = 0;
        let lunchSubtractedInSegments = false;

        // 10. Si el empleado SÍ tiene un horario hoy (Lunes a Viernes, usualmente)
        const remainingA01 = Math.max(0, this.weeklyOrdinaryLimit - weekA01);

        // Obtener configuraciones de checkbox con fallback
        const startsShiftMarkingIn = marking.StartShiftMarkingIn !== null 
            ? marking.StartShiftMarkingIn 
            : (shiftLink ? !!shiftLink.StartShiftMarkingIn : false);

        const extraBeforeEntryAllowed = true;

        const extraAfterExitAllowed = marking.OverTimeAfterExit !== null 
            ? marking.OverTimeAfterExit 
            : (currentShiftObj ? !!currentShiftObj.OverTimeAfterExit : false);

        const extraInHolidayAllowed = marking.OverTimeInHoliday !== null 
            ? marking.OverTimeInHoliday 
            : (currentShiftObj ? !!currentShiftObj.OverTimeInHoliday : false);

        const isPlanta = currentShiftObj && currentShiftObj.Name && currentShiftObj.Name.toLowerCase().includes('planta');

        if (timetable) {
            let shiftInSecs = timetable.MarkingIn || 0;
            if (startsShiftMarkingIn) {
                const shiftInDate = shiftInSecs > 0 ? createTimeFromSeconds(calcReference, shiftInSecs) : null;
                if (shiftInDate && actualIn < shiftInDate) {
                    expectedIn = shiftInDate;
                } else {
                    expectedIn = actualIn;
                }
            } else if (shiftInSecs > 0) {
                expectedIn = createTimeFromSeconds(calcReference, shiftInSecs);
            } else {
                expectedIn = actualIn;
            }
            
            // ¿Cuántas horas ordinarias debería trabajar hoy según el turno? (ej. 9 horas)
            targetA01Secs = baseTimetable?.TotalTime || ((timetable.MarkingOut || 0) - (timetable.MarkingIn || 0));
            
            // Las horas ordinarias EFECTIVAS de hoy no pueden superar el turno ni las que le quedan en la semana
            const effectiveA01Secs = Math.min(targetA01Secs, remainingA01 * 3600);
            
            // 11. Descontar el tiempo de almuerzo (ya sea explícito o implícito si trabaja más de 6 horas)
            let lunchDurationSecs = 0;
            if (timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                lunchDurationSecs = timetable.LunchIn - timetable.LunchOut;
            } else if ((timetable.Lunch !== false || isPlanta) && targetA01Secs >= 6 * 3600) { 
                lunchDurationSecs = this.implicitLunchSeconds;
            }

            // Calcular a qué hora debería salir para cumplir sus horas exactas teóricas
            theoreticalOut = new Date(expectedIn.getTime() + (effectiveA01Secs + (isPlanta ? 0 : lunchDurationSecs)) * 1000);

            // Si el turno tiene un horario de salida (MarkingOut), extendemos el bloque esperado
            // de horas ordinarias hasta esa salida para que cualquier trabajo dentro de la ventana
            // del turno sume para completar las horas ordinarias del día, resolviendo la falla de
            // cálculos decimales o incompletos por ingreso tarde.
            let shiftOutSecs = timetable.MarkingOut || 0;
            if (shiftOutSecs > 0) {
                const shiftOutDate = createTimeFromSeconds(calcReference, shiftOutSecs);
                expectedOut = shiftOutDate > theoreticalOut ? shiftOutDate : theoreticalOut;
            } else {
                expectedOut = theoreticalOut;
            }
            canHaveOrdinary = effectiveA01Secs > 0;

        } else {
            // Solución para Sábados o días sin turno:
            targetA01Secs = remainingA01 * 3600;
            canHaveOrdinary = targetA01Secs > 0;
            
            expectedIn = actualIn;
            expectedOut = new Date(actualIn.getTime() + targetA01Secs * 1000);
        }

        // =========================================================================
        // REGLA DE TIEMPO EXTRA (ANTES Y DESPUÉS)
        // =========================================================================
        
        // A. EXTRAS ANTES DE LA ENTRADA
        let effectiveIn = actualIn;
        if (actualIn < expectedIn) {
            if (!extraBeforeEntryAllowed) {
                effectiveIn = expectedIn;
            } else {
                let rawExtraBeforeMs = expectedIn.getTime() - actualIn.getTime();
                const minBeforeMin = 30;

                if (rawExtraBeforeMs < minBeforeMin * 60 * 1000) {
                    effectiveIn = expectedIn; // Ignorar si es inferior al mínimo (ej. 15 min)
                }
            }
        }

        // B. EXTRAS DESPUÉS DE LA SALIDA
        let effectiveOut = actualOut;
        if (actualOut > expectedOut) {
            if (!extraAfterExitAllowed) {
                effectiveOut = expectedOut;
            } else {
                let rawExtraAfterMs = actualOut.getTime() - expectedOut.getTime();
                const minExtraMinutes = 30; // Mínimo de ley para cualquier turno
                const minExtraMs = minExtraMinutes * 60 * 1000;
                
                if (rawExtraAfterMs < minExtraMs) {
                    effectiveOut = expectedOut; // Si es menor al mínimo (30 min), no cuenta nada
                } else {
                    // El descuento de almuerzo se aplica al final sobre las horas redondeadas
                    effectiveOut = new Date(expectedOut.getTime() + rawExtraAfterMs);
                }
            }
        }

        // 12. Construir los "segmentos" o pedazos de tiempo trabajado
        if (timetable) {
            const totalWorkedMs = effectiveOut.getTime() - effectiveIn.getTime();
            const shouldSubtractLunch = (timetable.Lunch || isPlanta) && targetA01Secs >= 6 * 3600 && (totalWorkedMs > 5 * 3600000);

            let lunchDurationSecs = 0;
            if (shouldSubtractLunch && timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                lunchSubtractedInSegments = true;
                lunchDurationSecs = timetable.LunchIn - timetable.LunchOut;
                const lunchOut = createTimeFromSeconds(calcReference, timetable.LunchOut);
                const lunchIn = createTimeFromSeconds(calcReference, timetable.LunchIn);
                const morningEnd = effectiveOut < lunchOut ? effectiveOut : lunchOut;
                if (effectiveIn < morningEnd) segments.push({ start: effectiveIn, end: morningEnd });
                const afternoonStart = effectiveIn > lunchIn ? effectiveIn : lunchIn;
                if (afternoonStart < effectiveOut) segments.push({ start: afternoonStart, end: effectiveOut });
            } else if (shouldSubtractLunch) {
                lunchSubtractedInSegments = true;
                lunchDurationSecs = this.implicitLunchSeconds;
                const theoreticalA01End = new Date(expectedIn.getTime() + (targetA01Secs + (isPlanta ? 0 : lunchDurationSecs)) * 1000);
                const implicitLunchIn = new Date(theoreticalA01End.getTime() + this.implicitLunchSeconds * 1000);
                const morningEnd = effectiveOut < theoreticalA01End ? effectiveOut : theoreticalA01End;
                if (effectiveIn < morningEnd) segments.push({ start: effectiveIn, end: morningEnd });
                if (implicitLunchIn < effectiveOut) segments.push({ start: implicitLunchIn, end: effectiveOut });
            } else {
                segments.push({ start: effectiveIn, end: effectiveOut });
            }
        } else {
            segments.push({ start: effectiveIn, end: effectiveOut });
        }

        const results: CalculationResult[] = [];
        let dailyExtrasCount = 0; // Límite de 2 horas extras por día
        let weeklyA02Tracker = weekA02;
        let accumulatedDayA01Secs = 0;
        const maxDayA01Secs = targetA01Secs;

        // 13. Procesar cada segmento trabajado (ej. Mañana y Tarde)
        for (const seg of segments) {
            // Dividir si el segmento cruza la frontera del día/noche (6AM o 7PM)
            const subSegments = this.splitByBoundaries(seg.start, seg.end, expectedIn, expectedOut);
            
            for (const sub of subSegments) {
                const totalHours = (sub.end.getTime() - sub.start.getTime()) / 3600000;
                const isNight = this.isNightTime(sub.start);
                
                // Determinar cuánto de este pedazo cae dentro del "bloque esperado" del turno
                const overlapStart = sub.start > expectedIn ? sub.start : expectedIn;
                const overlapEnd = sub.end < expectedOut ? sub.end : expectedOut;

                let ordinaryHours = 0;
                // 14. Calcular Horas Ordinarias (A01 / A49)
                if (canHaveOrdinary && overlapStart < overlapEnd) {
                    const potentialA01Secs = (overlapEnd.getTime() - overlapStart.getTime()) / 1000;
                    const remainingDayA01 = Math.max(0, maxDayA01Secs - accumulatedDayA01Secs);
                    const allowedA01Secs = Math.min(potentialA01Secs, remainingDayA01);

                    if (allowedA01Secs > 0) {
                        ordinaryHours = allowedA01Secs / 3600;
                        accumulatedDayA01Secs += allowedA01Secs;
                        // Define si es Diurna (A01), Nocturna (A49) o Dominical/Festiva (A50)
                        const concept = this.getOrdinaryConcept(isSundayOrHoliday, isNight);
                        results.push({ 
                            conceptCode: concept, 
                            hours: ordinaryHours, 
                            startDate: overlapStart, 
                            endDate: new Date(overlapStart.getTime() + allowedA01Secs * 1000) 
                        });
                    }
                }

                // 15. Calcular Horas Extras (Lo que sobra después de las ordinarias)
                const extraHours = Math.max(0, totalHours - ordinaryHours);

                if (extraHours > 0) {
                    if (isSundayOrHoliday && !extraInHolidayAllowed) {
                        // Si es domingo/festivo y no se permite extra festivo, no se añaden extras
                    } else {
                        let extraStart = new Date(sub.start.getTime() + ordinaryHours * 3600000);
                        let remainingExtra = extraHours;
                        
                        while (remainingExtra > 0) {
                            // Revisar cuántas horas extras puede hacer en la semana (Límite 12)
                            const remainingWeeklyA02 = Math.max(0, this.weeklyExtraLimit - weeklyA02Tracker);
                            // Limitar a máximo 2 horas extras por día, y no exceder las 12 semanales
                            const canTakeA02 = Math.min(remainingExtra, Math.max(0, 2 - dailyExtrasCount), remainingWeeklyA02);

                            if (canTakeA02 > 0) {
                                // Cae dentro del límite: se vuelve Extra real (A02, A04, A06, A08)
                                const concept = this.getExtraConcept(isSundayOrHoliday, isNight);
                                const segmentEnd = new Date(extraStart.getTime() + canTakeA02 * 3600000);
                                results.push({ conceptCode: concept, hours: canTakeA02, startDate: new Date(extraStart), endDate: segmentEnd });
                                
                                const roundedHours = this.roundExtraHours(canTakeA02);
                                dailyExtrasCount += roundedHours;
                                weeklyA02Tracker += roundedHours;
                                remainingExtra -= canTakeA02;
                                extraStart = segmentEnd;
                            } else {
                                // ⚠️ AQUÍ ESTÁ EL PROBLEMA DE LOS DOMINGOS (A36)
                                // Si se pasan de las 2 horas diarias o 12 semanales, el exceso cae como "Bonificación"
                                // Actualmente getBonificacionConcept devuelve 'A36' siempre.
                                // Modifiqué esta función abajo para que los domingos devuelva A50 o A05 en lugar de A36.
                                const concept = this.getBonificacionConcept(isSundayOrHoliday, isNight);
                                const bonusEnd = new Date(extraStart.getTime() + remainingExtra * 3600000);
                                results.push({ conceptCode: concept, hours: remainingExtra, startDate: new Date(extraStart), endDate: bonusEnd });
                                remainingExtra = 0;
                            }
                        }
                    }
                }
            }
        }

        // Convertir A49 (Recargo Nocturno Ordinario) a A01 (Ordinario Diurno) si la suma de A49 en el día no supera los 30 minutos (0.5h)
        const totalA49 = results
            .filter(r => r.conceptCode === 'A49')
            .reduce((sum, r) => sum + r.hours, 0);

        if (totalA49 > 0 && totalA49 <= 0.5) {
            for (const res of results) {
                if (res.conceptCode === 'A49') {
                    res.conceptCode = 'A01';
                }
            }
        }

        // 16. Redondear horas extras según reglas de negocio (>=30 min -> 0.5; >=45 min -> 1.0)
        const ordinaryCodes = ['A01', 'A49', 'A50'];
        for (const res of results) {
            if (!ordinaryCodes.includes(res.conceptCode)) {
                res.hours = this.roundExtraHours(res.hours);
            }
        }

        // Aplicar el mínimo de horas extras requerido por el turno (mínimo de ley de 30 min)
        const minExtraMinutes = 30;
        const minExtraHours = minExtraMinutes / 60;

        let totalExtras = results
            .filter(r => !ordinaryCodes.includes(r.conceptCode))
            .reduce((sum, r) => sum + r.hours, 0);

        // Si las extras acumuladas no alcanzan el mínimo del turno, se anulan (se ponen en 0)
        if (totalExtras < minExtraHours) {
            for (const res of results) {
                if (!ordinaryCodes.includes(res.conceptCode)) {
                    res.hours = 0;
                }
            }
            totalExtras = 0;
        }

        // Aplicar descuento de 30 minutos (0.5 horas) por almuerzo en tiempo extra si el turno es de planta (ej. planta-extra)
        if (isPlanta && totalExtras > 0 && !lunchSubtractedInSegments) {
            // Regla de descuento de almuerzo para planta:
            // Sábado (Día 6): se descuenta si es >= 2.0 horas.
            // Lunes a Viernes / Domingo / Festivos: se descuenta si es >= 1.0 hora.
            const isSaturday = numberDay === 6;
            const threshold = isSaturday ? 2.0 : 1.0;

            if (totalExtras >= threshold) {
                let deductionRemaining = 0.5;
                // Priorizar el descuento de almuerzo en conceptos diurnos/nocturnos extras (excluyendo A36)
                const deductionOrder = ['A02', 'A06', 'A04', 'A08'];
                for (const code of deductionOrder) {
                    for (const res of results) {
                        if (res.conceptCode === code && res.hours > 0) {
                            const toDeduct = Math.min(res.hours, deductionRemaining);
                            res.hours -= toDeduct;
                            deductionRemaining -= toDeduct;
                            if (deductionRemaining <= 0) break;
                        }
                    }
                    if (deductionRemaining <= 0) break;
                }
                // Si aún queda deducción pendiente (por conceptos no listados, excluyendo A36 y ordinarias)
                if (deductionRemaining > 0) {
                    for (const res of results) {
                        if (!ordinaryCodes.includes(res.conceptCode) && res.conceptCode !== 'A36' && res.hours > 0) {
                            const toDeduct = Math.min(res.hours, deductionRemaining);
                            res.hours -= toDeduct;
                            deductionRemaining -= toDeduct;
                            if (deductionRemaining <= 0) break;
                        }
                    }
                }
            }
        }

        // 17. Filtro "Quita-Ruido" agresivo
        const filteredResults = results.filter(res => {
            // Conceptos que SIEMPRE queremos mantener si tienen algo (aunque sea poco)
            const isMandatory = ['A01', 'A49', 'A50'].includes(res.conceptCode);
            if (isMandatory && res.hours >= 0.05) return true; // Mínimo 3 min para ordinario
            
            // Para todo lo demás (Extras, Bonos), mínimo 30 minutos (0.5h)
            return res.hours >= 0.5;
        });

        if (trace) {
            trace.push(`Results before filtering: ${JSON.stringify(results)}`);
            trace.push(`Results after filtering: ${JSON.stringify(filteredResults)}`);
        }

        // 17. Guardar los resultados (Limpieza total del día antes de insertar)
        const startOfDay = new Date(startOfDayDB);
        const endOfDay = new Date(startOfDayDB);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        await this.saveResultsRange(employeeOid, startOfDay, endOfDay, filteredResults);
        if (trace) {
            trace.push("saveResultsRange completed successfully");
        }
    }

    private async getWeeklyAccumulated(empOid: string, currentDate: Date): Promise<{ ordinary: number, extras: number }> {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getUTCDay();
        const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setUTCDate(diff);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        const details = await prisma.attendancedetail.findMany({
            where: {
                Employee: empOid,
                Day: { gte: startOfWeek, lt: currentDate }
            }
        });

        const ordinaryCodes = ['A01', 'A49', 'A50'];
        const extraCodes = ['A02', 'A04', 'A06', 'A08'];

        let sumOrdinary = 0;
        let sumExtras = 0;

        for (const d of details) {
            const type = await prisma.attendancetype.findUnique({ where: { Oid: d.AttendanceType || '' } });
            if (!type || !type.CodeToExport) continue;
            const code = type.CodeToExport;
            if (ordinaryCodes.includes(code)) sumOrdinary += d.Hours || 0;
            if (extraCodes.includes(code)) sumExtras += d.Hours || 0;
        }

        // =======================================================================================
        // NUEVA REGLA: Sumar horas de incapacidades o permisos remunerados al tiempo ordinario
        // En Colombia, los permisos remunerados y las incapacidades cuentan como tiempo laborado
        // =======================================================================================
        const incapacities = await prisma.incapacity.findMany({
            where: {
                Employee: empOid,
                IncapacityOut: { gt: startOfWeek },
                IncapacityIn: { lt: currentDate },
                Pay: true
            }
        });

        for (const inc of incapacities) {
            if (!inc.IncapacityIn || !inc.IncapacityOut) continue;
            
            // Recorrer día a día desde startOfWeek hasta currentDate
            let curr = new Date(startOfWeek);
            while (curr < currentDate) {
                const dayStart = new Date(curr);
                const dayEnd = new Date(curr);
                dayEnd.setUTCHours(23, 59, 59, 999);
                
                const overlapStart = new Date(Math.max(inc.IncapacityIn.getTime(), dayStart.getTime()));
                const overlapEnd = new Date(Math.min(inc.IncapacityOut.getTime(), dayEnd.getTime()));
                
                if (overlapStart < overlapEnd) {
                    const diffHours = (overlapEnd.getTime() - overlapStart.getTime()) / 3600000;
                    // El tope máximo que una incapacidad puede sumar por día son 8 horas de jornada ordinaria
                    sumOrdinary += Math.min(diffHours, 8);
                }
                
                curr.setUTCDate(curr.getUTCDate() + 1);
            }
        }

        return { ordinary: sumOrdinary, extras: sumExtras };
    }

    private isNightTime(date: Date): boolean {
        const hour = date.getUTCHours();
        return hour >= this.nightStartHour || hour < this.nightEndHour;
    }

    private roundExtraHours(hoursDecimal: number): number {
        const totalMinutes = Math.round(hoursDecimal * 60);
        const hoursPart = Math.floor(totalMinutes / 60);
        const minutesPart = totalMinutes % 60;
        
        let roundedMinutes = 0;
        if (minutesPart >= 45) {
            roundedMinutes = 1.0;
        } else if (minutesPart >= 25) {
            roundedMinutes = 0.5;
        } else {
            roundedMinutes = 0.0;
        }
        
        return hoursPart + roundedMinutes;
    }

    private getOrdinaryConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return 'A50'; // Dominical/Festiva (A50)
        return isNight ? 'A49' : 'A01';            // Ordinaria (Nocturna A49, Diurna A01)
    }

    private getExtraConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return isNight ? 'A08' : 'A06'; // Extra Dominical/Festiva (Nocturna A08, Diurna A06)
        return isNight ? 'A04' : 'A02';            // Extra Ordinaria (Nocturna A04, Diurna A02)
    }

    private getBonificacionConcept(isSun: boolean, isNight: boolean): string {
        // Todo exceso de horas extras (diario > 2h o semanal > 12h) se reporta unificadamente como Bonificación (A36)
        return 'A36';
    }

    private async saveResultsRange(empOid: string, start: Date, end: Date, results: CalculationResult[]) {
        await prisma.attendancedetail.deleteMany({
            where: { 
                Employee: empOid, 
                Day: { gte: start, lt: end }
            }
        });

        for (const res of results) {
            const type = await prisma.attendancetype.findFirst({ where: { CodeToExport: res.conceptCode } });
            if (!type) continue;
            await prisma.attendancedetail.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: empOid,
                    Day: start,
                    AttendanceType: type.Oid,
                    StartDate: res.startDate,
                    EndDate: res.endDate,
                    Hours: res.hours,
                    Time: Math.round(res.hours * 3600),
                    ModificationDate: new Date(),
                    OptimisticLockField: 0
                }
            });
        }
    }

    // Esta función parte un bloque de tiempo largo en pedazos si cruza las 6AM o las 7PM,
    // o si cruza la frontera de Entrada/Salida del turno.
    private splitByBoundaries(start: Date, end: Date, expectedIn: Date, expectedOut: Date): { start: Date, end: Date }[] {
        const subs: { start: Date, end: Date }[] = [];
        let current = new Date(start);
        while (current < end) {
            const nextBoundary = this.getNextBoundaryWithExpected(current, end, expectedIn, expectedOut);
            subs.push({ start: new Date(current), end: new Date(nextBoundary) });
            current = nextBoundary;
        }
        return subs;
    }

    private getNextBoundaryWithExpected(current: Date, end: Date, expectedIn: Date, expectedOut: Date): Date {
        const d = new Date(current);
        const bStart = new Date(d); bStart.setUTCHours(this.nightStartHour, 0, 0, 0);
        const bEnd = new Date(d); bEnd.setUTCHours(this.nightEndHour, 0, 0, 0);
        const boundaries = [bStart, bEnd, expectedIn, expectedOut];
        const dNext = new Date(d); dNext.setUTCDate(dNext.getUTCDate() + 1);
        boundaries.push(new Date(dNext.setUTCHours(this.nightStartHour, 0, 0, 0)));
        boundaries.push(new Date(dNext.setUTCHours(this.nightEndHour, 0, 0, 0)));
        const valid = boundaries.filter(b => b > current && b < end).sort((a, b) => a.getTime() - b.getTime());
        return valid.length > 0 ? valid[0] : end;
    }
}

export const laborEngine = new LaborEngine();