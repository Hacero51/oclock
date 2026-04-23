import prisma from '@/lib/prisma';
import crypto from 'crypto';

export interface CalculationResult {
    conceptCode: string;
    hours: number;
    startDate: Date;
    endDate: Date;
}

export class LaborEngine {
    private nightStartHour = 19; // 7 PM
    private nightEndHour = 6;    // 6 AM
    private weekThreshold = 44;  // 44 Hours per week (Post July 2025)

    /**
     * Procesa la asistencia de un empleado para un día específico
     * y puebla la tabla attendancedetail.
     */
    async processDay(employeeOid: string, date: Date) {
        // 1. Limpiar registros previos del día para este empleado
        // IMPORTANTE: El sistema legado parece guardar la medianoche literal sin zona horaria,
        // lo cual Prisma interpreta y guarda como T00:00:00.000Z.
        const startOfDayDB = new Date(date);
        startOfDayDB.setUTCHours(0, 0, 0, 0);

        await prisma.attendancedetail.deleteMany({
            where: {
                Employee: employeeOid,
                Day: startOfDayDB
            }
        });

        // 2. Obtener Turno y Horario
        const employee = await prisma.employee.findUnique({ where: { Oid: employeeOid } });
        if (!employee || !employee.CurrentShift) return;

        const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday...
        // Mapeo: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        // shifttimetable usa NumberDay. Generalmente 1=Mon... 7=Sun?
        const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        const shiftLink = await prisma.shifttimetable.findFirst({
            where: {
                Shift: employee.CurrentShift,
                NumberDay: numberDay
            }
        });

        if (!shiftLink || !shiftLink.Timetable) return;

        const timetable = await prisma.timetablefixed.findUnique({
            where: { Oid: shiftLink.Timetable }
        });

        if (!timetable) return;

        // 3. Obtener Marcaciones del día
        const marking = await prisma.marking.findFirst({
            where: {
                Employee: employeeOid,
                Day: startOfDayDB
            }
        });

        if (!marking || !marking.MarkingIn) return;

        // 4. Determinar si es Festivo
        const holiday = await prisma.holiday.findFirst({
            where: { Day: startOfDayDB, Status: 1 }
        });
        const isSundayOrHoliday = (dayOfWeek === 0 || !!holiday);

        // 5. Segmentación (Lógica de Almuerzo)
        // La referencia para el cálculo de horas será T00:00:00.000Z pues las marcas 
        // están grabadas de forma que 05:48 am = 05:48:00Z.
        const calcReference = new Date(date);
        calcReference.setUTCHours(0, 0, 0, 0);

        const createTimeFromSeconds = (base: Date, seconds: number) => {
            const d = new Date(base);
            d.setUTCHours(0, 0, 0, 0); // Forzar inicio en 00:00 UTC para el cálculo relativo
            d.setUTCSeconds(seconds);
            return d;
        };

        const expectedIn = createTimeFromSeconds(calcReference, timetable.MarkingIn || 0);
        const expectedOut = createTimeFromSeconds(calcReference, timetable.MarkingOut || 0);

        // console.log(`[ENGINE-DEBUG] Emp: ${employeeOid.substring(0, 8)}, MarkingIn: ${marking.MarkingIn.toISOString()}, MarkingOut: ${marking.MarkingOut ? marking.MarkingOut.toISOString() : 'NULL'}`);
        // console.log(`[ENGINE-DEBUG] ExpectedIn: ${expectedIn.toISOString()}, ExpectedOut: ${expectedOut.toISOString()}`);

        const segments: { start: Date, end: Date, isExtra: boolean }[] = [];
        let actualIn = marking.MarkingIn;
        let actualOut = marking.MarkingOut;

        // Gracia de Llegada Temprano: Si llega hasta 60 mins antes del turno, no cuenta como extra, 
        // simplemente se "ajusta" su entrada a la hora esperada para el cálculo.
        if (expectedIn.getTime() - actualIn.getTime() > 0 && expectedIn.getTime() - actualIn.getTime() <= 3600000) {
            actualIn = expectedIn;
        }

        // --- AUTO CIERRE DE MARCACIONES ---
        // Si no pudo marcar salida porque cerraron las instalaciones
        if (!actualOut) {
            // Tiempo de gracia de 6 horas posteriores a la salida esperada para no arruinar horas extras reales
            const autoCloseThreshold = new Date(expectedOut.getTime() + 6 * 3600000); 
            
            if (new Date() > autoCloseThreshold) {
                actualOut = expectedOut; // Cerramos INTERNAMENTE con la salida de su turno base para el cálculo de horas
                // DESACTIVADO POR SOLICITUD DE USUARIO: El autocierre no debe persistir en la base de datos
                /* 
                await prisma.marking.update({
                    where: { Oid: marking.Oid },
                    data: { MarkingOut: expectedOut }
                });
                */
            } else {
                // Aún es muy temprano, podría estar haciendo horas extras, esperamos.
                return;
            }
        }

        // Implicit Lunch Splitting
        if (timetable.Lunch && (timetable.LunchOut !== null) && (timetable.LunchIn !== null)) {
            const lunchOut = createTimeFromSeconds(calcReference, timetable.LunchOut);
            const lunchIn = createTimeFromSeconds(calcReference, timetable.LunchIn);

            // Segmento mañana: desde el golpe real hasta el inicio del almuerzo (o hasta que salió)
            const MorningEnd = actualOut < lunchOut ? actualOut : lunchOut;
            if (actualIn < MorningEnd) {
                segments.push({ start: actualIn, end: MorningEnd, isExtra: false });
            }

            // Segmento tarde: desde el fin del almuerzo (o desde que entró si es después)
            const AfternoonStart = actualIn > lunchIn ? actualIn : lunchIn;
            if (AfternoonStart < actualOut) {
                segments.push({ start: AfternoonStart, end: actualOut, isExtra: false });
            }
        } else {
            // Regla para turnos de corrido (ej. 6 a 2):
            // Si no hay almuerzo configurado y se quedan a hacer extras, 
            // los primeros 30 min despues de finalizar (ej 14:00 a 14:30) son el espacio de almuerzo y NO cuentan.
            const implicitLunchOut = expectedOut;
            const implicitLunchIn = new Date(expectedOut.getTime() + 30 * 60000); // +30 mins

            const MorningEnd = actualOut < implicitLunchOut ? actualOut : implicitLunchOut;
            if (actualIn < MorningEnd) {
                segments.push({ start: actualIn, end: MorningEnd, isExtra: false });
            }

            const AfternoonStart = actualIn > implicitLunchIn ? actualIn : implicitLunchIn;
            if (AfternoonStart < actualOut) {
                segments.push({ start: AfternoonStart, end: actualOut, isExtra: false });
            }
        }

        // 6. Clasificación de cada segmento
        const results: CalculationResult[] = [];
        let totalDailyExtras = 0;

        for (const seg of segments) {
            // Dividir el segmento si cruza la frontera de las 19:00 o 06:00
            const subSegments = this.splitByNightBoundaries(seg.start, seg.end);

            for (const sub of subSegments) {
                const hours = (sub.end.getTime() - sub.start.getTime()) / (1000 * 60 * 60);
                const isNight = this.isNightTime(sub.start);

                // Determinar si este subsegmento es Extra u Ordinario
                // Es "Ordinario" si está total o parcialmente dentro de (expectedIn - lunch - expectedOut)
                // Pero como ya segmentamos por almuerzo, solo comparamos contra expectedIn/Out
                const overlapStart = sub.start > expectedIn ? sub.start : expectedIn;
                const overlapEnd = sub.end < expectedOut ? sub.end : expectedOut;

                let ordinaryHours = 0;
                let extraHours = 0;

                if (overlapStart < overlapEnd) {
                    ordinaryHours = (overlapEnd.getTime() - overlapStart.getTime()) / (3600000);
                }
                console.log(`[ENGINE-DEBUG] Sub: ${sub.start.toISOString()} - ${sub.end.toISOString()}, Ordinary: ${ordinaryHours.toFixed(2)}h`);
                extraHours = hours - ordinaryHours;

                // Guardar Ordinarias
                if (ordinaryHours > 0) {
                    const concept = this.getOrdinaryConcept(isSundayOrHoliday, isNight);
                    results.push({ conceptCode: concept, hours: ordinaryHours, startDate: overlapStart, endDate: overlapEnd });
                }

                // Guardar Extras con política de topes (2h -> Bonificación)
                if (extraHours > 0) {
                    // Determinar el rango físico de las extras en este subsegmento
                    // (Lo que no es overlap con el turno)
                    let currentExtraStart = new Date(sub.start);
                    let remainingExtra = extraHours;

                    while (remainingExtra > 0) {
                        const canTake = Math.min(remainingExtra, Math.max(0, 2 - totalDailyExtras));
                        const durationMs = canTake * 3600000;
                        const segmentEnd = new Date(currentExtraStart.getTime() + durationMs);

                        if (canTake > 0) {
                            const concept = this.getExtraConcept(isSundayOrHoliday, isNight);
                            results.push({ conceptCode: concept, hours: canTake, startDate: new Date(currentExtraStart), endDate: segmentEnd });
                            totalDailyExtras += canTake;
                            remainingExtra -= canTake;
                            currentExtraStart = segmentEnd;
                        } else {
                            // Bonificación - El resto del segmento
                            const concept = this.getBonificacionConcept(isSundayOrHoliday, isNight);
                            const bonusEnd = new Date(currentExtraStart.getTime() + (remainingExtra * 3600000));
                            results.push({ conceptCode: concept, hours: remainingExtra, startDate: new Date(currentExtraStart), endDate: bonusEnd });
                            remainingExtra = 0;
                        }
                    }
                }
            }
        }

        // 7. Agrupar y Persistir
        await this.saveResults(employeeOid, startOfDayDB, results);
    }

    private splitByNightBoundaries(start: Date, end: Date): { start: Date, end: Date }[] {
        const subs: { start: Date, end: Date }[] = [];
        let current = new Date(start);

        while (current < end) {
            const nextBoundary = this.getNextBoundary(current, end);
            subs.push({ start: new Date(current), end: new Date(nextBoundary) });
            current = nextBoundary;
        }
        return subs;
    }

    private getNextBoundary(current: Date, end: Date): Date {
        // Fronteras: 06:00 y 19:00 del mismo día o siguiente (en formato UTC representativo)
        const d = new Date(current);
        const b6 = new Date(d); b6.setUTCHours(6, 0, 0, 0);
        const b19 = new Date(d); b19.setUTCHours(19, 0, 0, 0);

        const boundaries = [b6, b19];
        // Añadir fronteras del día siguiente
        const dNext = new Date(d); dNext.setUTCDate(dNext.getUTCDate() + 1);
        const nb6 = new Date(dNext); nb6.setUTCHours(6, 0, 0, 0);
        const nb19 = new Date(dNext); nb19.setUTCHours(19, 0, 0, 0);
        boundaries.push(nb6, nb19);

        const validBoundaries = boundaries.filter(b => b > current && b < end).sort((a, b) => a.getTime() - b.getTime());

        return validBoundaries.length > 0 ? validBoundaries[0] : end;
    }

    private isNightTime(date: Date): boolean {
        // Para evaluar noche, usamos la hora UTC directamente ya que representa la Local en la DB.
        const hour = date.getUTCHours();
        return hour >= 19 || hour < 6;
    }

    private getOrdinaryConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return isNight ? 'A50' : 'A05';
        return isNight ? 'A49' : 'A01';
    }

    private getExtraConcept(isSun: boolean, isNight: boolean): string {
        if (isSun) return isNight ? 'A08' : 'A06';
        return isNight ? 'A04' : 'A02';
    }

    private getBonificacionConcept(isSun: boolean, isNight: boolean): string {
        return isNight ? 'A35' : 'A36';
    }

    private async saveResults(empOid: string, day: Date, results: CalculationResult[]) {
        for (const res of results) {
            const type = await prisma.attendancetype.findFirst({ where: { CodeToExport: res.conceptCode } });
            if (!type) continue;

            await prisma.attendancedetail.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: empOid,
                    Day: day, // Esto será el startOfDayDB (T05:00:00Z)
                    AttendanceType: type.Oid,
                    StartDate: res.startDate,
                    EndDate: res.endDate,
                    Hours: res.hours,
                    Time: res.hours * 3600,
                    ModificationDate: new Date(),
                    OptimisticLockField: 0
                }
            });
        }
    }
}

export const laborEngine = new LaborEngine();
