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
        // 1. Normalizar la fecha de inicio del día a la medianoche UTC
        const startOfDayDB = new Date(date);
        startOfDayDB.setUTCHours(0, 0, 0, 0);

        // 2. Buscar al empleado en la base de datos
        const employee = await prisma.employee.findUnique({ where: { Oid: employeeOid } });
        if (!employee) return;

        // 3. Obtener la marcación de entrada/salida de ese día
        const marking = await prisma.marking.findFirst({
            where: { Employee: employeeOid, Day: startOfDayDB }
        });
        // Si no hay marcación o le falta la entrada, no hay nada que calcular
        if (!marking || !marking.MarkingIn) return;

        // 4. Calcular cuántas horas ordinarias (A01) y extras (A02) lleva en la semana ANTES de hoy
        const { ordinary: weekA01, extras: weekA02 } = await this.getWeeklyAccumulated(employeeOid, startOfDayDB);

        // 5. Determinar qué día de la semana es hoy (Lunes=1, Domingo=7)
        const dayOfWeek = date.getUTCDay();
        const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        // 6. Buscar si el empleado tiene un turno asignado para este día específico
        let currentShiftObj = null;
        if (employee.CurrentShift) {
            currentShiftObj = await prisma.shift.findUnique({ where: { Oid: employee.CurrentShift } });
        }

        const shiftLink = employee.CurrentShift ? await prisma.shifttimetable.findFirst({
            where: { Shift: employee.CurrentShift, NumberDay: numberDay }
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
        const holiday = await prisma.holiday.findFirst({
            where: { Day: startOfDayDB, Status: 1 }
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
        let canHaveOrdinary = false;
        let targetA01Secs = 0;

        // 10. Si el empleado SÍ tiene un horario hoy (Lunes a Viernes, usualmente)
        const remainingA01 = Math.max(0, this.weeklyOrdinaryLimit - weekA01);

        if (timetable) {
            const shiftInSecs = timetable.MarkingIn || 0;
            if (shiftInSecs > 0) {
                expectedIn = createTimeFromSeconds(calcReference, shiftInSecs);
            } else {
                expectedIn = actualIn;
            }
            
            // ¿Cuántas horas ordinarias debería trabajar hoy según el turno? (ej. 9 horas)
            targetA01Secs = baseTimetable?.TotalTime || ((timetable.MarkingOut || 0) - (shiftInSecs));
            
            // Las horas ordinarias EFECTIVAS de hoy no pueden superar el turno ni las que le quedan en la semana
            const effectiveA01Secs = Math.min(targetA01Secs, remainingA01 * 3600);
            
            // 11. Descontar el tiempo de almuerzo (ya sea explícito o implícito si trabaja más de 6 horas)
            let lunchDurationSecs = 0;
            if (timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                lunchDurationSecs = timetable.LunchIn - timetable.LunchOut;
            } else if (targetA01Secs >= 6 * 3600) { 
                lunchDurationSecs = this.implicitLunchSeconds;
            }

            // Calcular a qué hora debería salir para cumplir sus horas exactas
            expectedOut = new Date(expectedIn.getTime() + (effectiveA01Secs + lunchDurationSecs) * 1000);
            canHaveOrdinary = effectiveA01Secs > 0;

            // Tolerancia de 1 hora en la entrada: Si llega tarde pero dentro de 1 hr, no le penalizamos el inicio del bloque
            if (expectedIn.getTime() - actualIn.getTime() > 0 && expectedIn.getTime() - actualIn.getTime() <= 3600000) {
                actualIn = expectedIn;
            }

        } else {
            // Solución para Sábados o días sin turno:
            targetA01Secs = remainingA01 * 3600;
            canHaveOrdinary = targetA01Secs > 0;
            
            expectedIn = actualIn;
            expectedOut = new Date(actualIn.getTime() + targetA01Secs * 1000);
        }

        // =========================================================================
        // REGLA DE TIEMPO EXTRA (ANTES Y DESPUÉS): Mínimo 30 min (0.5h)
        // =========================================================================
        
        // A. EXTRAS ANTES DE LA ENTRADA
        if (actualIn < expectedIn) {
            let rawExtraBeforeMs = expectedIn.getTime() - actualIn.getTime();
            const minBeforeMin = currentShiftObj?.MinimumOverTime || 30;

            if (rawExtraBeforeMs < minBeforeMin * 60 * 1000) {
                actualIn = expectedIn; // Ignorar si es inferior al mínimo (ej. 15 min)
            }
            // Se toma el tiempo exacto sin redondeo
        }

        // B. EXTRAS DESPUÉS DE LA SALIDA
        let rawExtraMs = actualOut.getTime() - expectedOut.getTime();
        if (rawExtraMs > 0) {
            const minExtraMinutes = currentShiftObj?.MinimumOverTime || 30;
            const minExtraMs = minExtraMinutes * 60 * 1000;
            
            if (rawExtraMs < minExtraMs) {
                rawExtraMs = 0; // Si es menor al mínimo (30 min), no cuenta nada
            }
            // Se toma el tiempo exacto sin redondeo
            actualOut = new Date(expectedOut.getTime() + rawExtraMs);
        }

        // 12. Construir los "segmentos" o pedazos de tiempo trabajado
        if (timetable) {
            const totalWorkedMs = actualOut.getTime() - actualIn.getTime();
            const isPerformingExtra = actualOut.getTime() > expectedOut.getTime() + 60000;
            const shouldSubtractLunch = (totalWorkedMs > 5 * 3600000) && isPerformingExtra;

            let lunchDurationSecs = 0;
            if (timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                lunchDurationSecs = timetable.LunchIn - timetable.LunchOut;
                const lunchOut = createTimeFromSeconds(calcReference, timetable.LunchOut);
                const lunchIn = createTimeFromSeconds(calcReference, timetable.LunchIn);
                const morningEnd = actualOut < lunchOut ? actualOut : lunchOut;
                if (actualIn < morningEnd) segments.push({ start: actualIn, end: morningEnd });
                const afternoonStart = actualIn > lunchIn ? actualIn : lunchIn;
                if (afternoonStart < actualOut) segments.push({ start: afternoonStart, end: actualOut });
            } else if (shouldSubtractLunch) {
                lunchDurationSecs = this.implicitLunchSeconds;
                const theoreticalA01End = new Date(expectedIn.getTime() + (targetA01Secs + lunchDurationSecs) * 1000);
                const implicitLunchIn = new Date(theoreticalA01End.getTime() + this.implicitLunchSeconds * 1000);
                const morningEnd = actualOut < theoreticalA01End ? actualOut : theoreticalA01End;
                if (actualIn < morningEnd) segments.push({ start: actualIn, end: morningEnd });
                if (implicitLunchIn < actualOut) segments.push({ start: implicitLunchIn, end: actualOut });
            } else {
                segments.push({ start: actualIn, end: actualOut });
            }
        } else {
            segments.push({ start: actualIn, end: actualOut });
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
                        // Define si es Diurna (A01), Nocturna (A49), Dominical Diurna (A05) o Dominical Nocturna (A50)
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
                            
                            dailyExtrasCount += canTakeA02;
                            weeklyA02Tracker += canTakeA02;
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

        // 16. Filtro "Quita-Ruido" agresivo
        const filteredResults = results.filter(res => {
            // Conceptos que SIEMPRE queremos mantener si tienen algo (aunque sea poco)
            const isMandatory = ['A01', 'A49', 'A50', 'A05'].includes(res.conceptCode);
            if (isMandatory && res.hours >= 0.05) return true; // Mínimo 3 min para ordinario
            
            // Para todo lo demás (Extras, Bonos), mínimo 30 minutos (0.5h)
            return res.hours >= 0.5;
        });

        // 17. Guardar los resultados (Limpieza total del día antes de insertar)
        const startOfDay = new Date(startOfDayDB);
        const endOfDay = new Date(startOfDayDB);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        await this.saveResultsRange(employeeOid, startOfDay, endOfDay, filteredResults);
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

        const ordinaryCodes = ['A01', 'A49', 'A05', 'A50'];
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

    private getOrdinaryConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return isNight ? 'A50' : 'A05'; // Dominical/Festiva (Nocturna A50, Diurna A05)
        return isNight ? 'A49' : 'A01';            // Ordinaria (Nocturna A49, Diurna A01)
    }

    private getExtraConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return isNight ? 'A08' : 'A06'; // Extra Dominical/Festiva (Nocturna A08, Diurna A06)
        return isNight ? 'A04' : 'A02';            // Extra Ordinaria (Nocturna A04, Diurna A02)
    }

    private getBonificacionConcept(isSun: boolean, isNight: boolean): string {
        // Solución al reporte del domingo: 
        // Si el exceso de extras ocurre un domingo, no debería ser Bonificación A36, 
        // debería pagarse como una hora festiva adicional (A50 o A05).
        if (isSun) return isNight ? 'A50' : 'A05';
        
        // De lunes a sábado sí aplica Bonificación (A35 Nocturna, A36 Diurna)
        return isNight ? 'A35' : 'A36';
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