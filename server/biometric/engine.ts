import prisma from '../../lib/prisma';
import crypto from 'crypto';

export interface CalculationResult {
    conceptCode: string;
    hours: number;
    startDate: Date;
    endDate: Date;
}

export class LaborEngine {
    private nightStartHour = 19; 
    private nightEndHour = 6;    
    private implicitLunchSeconds = 1800; 
    private weeklyOrdinaryLimit = 44;
    private weeklyExtraLimit = 12; // Cupo semanal de extras A02

    private async loadGlobalConfig() {
        try {
            const configs = await prisma.configuration.findMany({
                where: { Group: { in: ['Attendance', 'Pre-payroll'] } }
            });
            const oids = configs.map(c => c.Oid);
            const timeSpans = await prisma.configurationtimespan.findMany({ 
                where: { Oid: { in: oids } } 
            });
            
            const timeSpanMap = new Map(timeSpans.map(t => [t.Oid, t.Value]));
            
            const getVal = (id: string) => {
                const config = configs.find(c => c.Identifier === id);
                return config ? timeSpanMap.get(config.Oid) : null;
            };

            const nightStart = getVal('BeginningOfNight');
            const nightEnd = getVal('EndingOfNight');
            const lunchAdj = getVal('AdjustTheTimeByConcept');

            if (nightStart !== null) this.nightStartHour = Math.floor(nightStart / 3600);
            if (nightEnd !== null) this.nightEndHour = Math.floor(nightEnd / 3600);
            if (lunchAdj !== null) this.implicitLunchSeconds = lunchAdj;

        } catch (error) {
            console.error("[ENGINE] Error cargando config global:", error);
        }
    }

    private async getWeeklyAccumulated(employeeOid: string, currentDate: Date) {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getUTCDay();
        const diff = startOfWeek.getUTCDate() - (day === 0 ? 6 : day - 1);
        startOfWeek.setUTCDate(diff);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        const types = await prisma.attendancetype.findMany();
        const typeMap = new Map(types.map(t => [t.Oid, t.CodeToExport]));

        const details = await prisma.attendancedetail.findMany({
            where: {
                Employee: employeeOid,
                Day: { gte: startOfWeek, lt: currentDate },
            }
        });

        let ordinary = 0;
        let extras = 0;

        for (const d of details) {
            const code = typeMap.get(d.AttendanceType || '');
            if (code === 'A01' || code === 'A05' || code === 'A49' || code === 'A50') {
                ordinary += d.Hours || 0;
            } else if (code === 'A02' || code === 'A04' || code === 'A06' || code === 'A08') {
                extras += d.Hours || 0;
            }
        }

        return { ordinary, extras };
    }

    async processDay(employeeOid: string, date: Date) {
        await this.loadGlobalConfig();
        
        const startOfDayDB = new Date(date);
        startOfDayDB.setUTCHours(0, 0, 0, 0);

        await prisma.attendancedetail.deleteMany({
            where: { Employee: employeeOid, Day: startOfDayDB }
        });

        const employee = await prisma.employee.findUnique({ where: { Oid: employeeOid } });
        if (!employee) return;

        const marking = await prisma.marking.findFirst({
            where: { Employee: employeeOid, Day: startOfDayDB }
        });
        if (!marking || !marking.MarkingIn) return;

        const { ordinary: weekA01, extras: weekA02 } = await this.getWeeklyAccumulated(employeeOid, startOfDayDB);

        const dayOfWeek = date.getUTCDay();
        const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        const shiftLink = employee.CurrentShift ? await prisma.shifttimetable.findFirst({
            where: { Shift: employee.CurrentShift, NumberDay: numberDay }
        }) : null;

        let timetable = null;
        let baseTimetable = null;

        if (shiftLink && shiftLink.Timetable) {
            [timetable, baseTimetable] = await Promise.all([
                prisma.timetablefixed.findUnique({ where: { Oid: shiftLink.Timetable } }),
                prisma.timetable.findUnique({ where: { Oid: shiftLink.Timetable } })
            ]);
        }

        const holiday = await prisma.holiday.findFirst({
            where: { Day: startOfDayDB, Status: 1 }
        });
        const isSundayOrHoliday = (dayOfWeek === 0 || !!holiday);

        const calcReference = new Date(date);
        calcReference.setUTCHours(0, 0, 0, 0);

        const createTimeFromSeconds = (base: Date, seconds: number) => {
            const d = new Date(base);
            d.setUTCHours(0, 0, 0, 0);
            d.setUTCSeconds(seconds);
            return d;
        };

        const segments: { start: Date, end: Date }[] = [];
        let actualIn = marking.MarkingIn;
        let actualOut = marking.MarkingOut;

        if (!actualOut) {
            const expectedOutSecs = (timetable?.MarkingOut || 14 * 3600);
            const expectedOut = createTimeFromSeconds(calcReference, expectedOutSecs);
            if (new Date() > new Date(expectedOut.getTime() + 6 * 3600000)) {
                actualOut = expectedOut;
            } else {
                return;
            }
        }

        let expectedIn = actualIn;
        let expectedOut = actualOut;
        let canHaveOrdinary = false;
        let targetA01Secs = 0;

        if (timetable) {
            expectedIn = createTimeFromSeconds(calcReference, timetable.MarkingIn || 0);
            targetA01Secs = baseTimetable?.TotalTime || ((timetable.MarkingOut || 0) - (timetable.MarkingIn || 0));
            
            const remainingA01 = Math.max(0, this.weeklyOrdinaryLimit - weekA01);
            const effectiveA01Secs = Math.min(targetA01Secs, remainingA01 * 3600);
            
            expectedOut = new Date(expectedIn.getTime() + effectiveA01Secs * 1000);
            canHaveOrdinary = effectiveA01Secs > 0;

            if (expectedIn.getTime() - actualIn.getTime() > 0 && expectedIn.getTime() - actualIn.getTime() <= 3600000) {
                actualIn = expectedIn;
            }

            const totalWorkedMs = actualOut.getTime() - actualIn.getTime();
            const isPerformingExtra = actualOut.getTime() > expectedOut.getTime() + 60000;
            const shouldSubtractLunch = (totalWorkedMs > 5 * 3600000) && isPerformingExtra;

            if (timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                const lunchOut = createTimeFromSeconds(calcReference, timetable.LunchOut);
                const lunchIn = createTimeFromSeconds(calcReference, timetable.LunchIn);
                const morningEnd = actualOut < lunchOut ? actualOut : lunchOut;
                if (actualIn < morningEnd) segments.push({ start: actualIn, end: morningEnd });
                const afternoonStart = actualIn > lunchIn ? actualIn : lunchIn;
                if (afternoonStart < actualOut) segments.push({ start: afternoonStart, end: actualOut });
            } else if (shouldSubtractLunch) {
                const implicitLunchOut = expectedOut;
                const implicitLunchIn = new Date(expectedOut.getTime() + this.implicitLunchSeconds * 1000);
                const morningEnd = actualOut < implicitLunchOut ? actualOut : implicitLunchOut;
                if (actualIn < morningEnd) segments.push({ start: actualIn, end: morningEnd });
                const afternoonStart = actualIn > implicitLunchIn ? actualIn : implicitLunchIn;
                if (afternoonStart < actualOut) segments.push({ start: afternoonStart, end: actualOut });
            } else {
                segments.push({ start: actualIn, end: actualOut });
            }
        } else {
            expectedIn = actualIn;
            expectedOut = actualIn;
            segments.push({ start: actualIn, end: actualOut });
        }

        const results: CalculationResult[] = [];
        let dailyExtrasCount = 0;
        let weeklyA02Tracker = weekA02;

        for (const seg of segments) {
            const subSegments = this.splitByNightBoundaries(seg.start, seg.end);
            for (const sub of subSegments) {
                const totalHours = (sub.end.getTime() - sub.start.getTime()) / 3600000;
                const isNight = this.isNightTime(sub.start);
                const overlapStart = sub.start > expectedIn ? sub.start : expectedIn;
                const overlapEnd = sub.end < expectedOut ? sub.end : expectedOut;

                let ordinaryHours = 0;
                if (canHaveOrdinary && overlapStart < overlapEnd) {
                    ordinaryHours = (overlapEnd.getTime() - overlapStart.getTime()) / 3600000;
                }

                const extraHours = Math.max(0, totalHours - ordinaryHours);

                if (ordinaryHours > 0) {
                    const concept = this.getOrdinaryConcept(isSundayOrHoliday, isNight);
                    results.push({ conceptCode: concept, hours: ordinaryHours, startDate: overlapStart, endDate: overlapEnd });
                }

                if (extraHours > 0) {
                    let extraStart = sub.start > expectedOut ? sub.start : (sub.end < expectedIn ? sub.start : expectedOut);
                    if (extraStart < sub.start) extraStart = sub.start;
                    
                    let remainingExtra = extraHours;
                    while (remainingExtra > 0) {
                        const remainingWeeklyA02 = Math.max(0, this.weeklyExtraLimit - weeklyA02Tracker);
                        const canTakeA02 = Math.min(remainingExtra, Math.max(0, 2 - dailyExtrasCount), remainingWeeklyA02);

                        if (canTakeA02 > 0) {
                            const concept = this.getExtraConcept(isSundayOrHoliday, isNight);
                            const segmentEnd = new Date(extraStart.getTime() + canTakeA02 * 3600000);
                            results.push({ conceptCode: concept, hours: canTakeA02, startDate: new Date(extraStart), endDate: segmentEnd });
                            
                            dailyExtrasCount += canTakeA02;
                            weeklyA02Tracker += canTakeA02;
                            remainingExtra -= canTakeA02;
                            extraStart = segmentEnd;
                        } else {
                            const concept = this.getBonificacionConcept(isSundayOrHoliday, isNight);
                            const bonusEnd = new Date(extraStart.getTime() + remainingExtra * 3600000);
                            results.push({ conceptCode: concept, hours: remainingExtra, startDate: new Date(extraStart), endDate: bonusEnd });
                            remainingExtra = 0;
                        }
                    }
                }
            }
        }

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
        const d = new Date(current);
        const bStart = new Date(d); bStart.setUTCHours(this.nightStartHour, 0, 0, 0);
        const bEnd = new Date(d); bEnd.setUTCHours(this.nightEndHour, 0, 0, 0);
        const boundaries = [bStart, bEnd];
        const dNext = new Date(d); dNext.setUTCDate(dNext.getUTCDate() + 1);
        boundaries.push(new Date(dNext.setUTCHours(this.nightStartHour, 0, 0, 0)));
        boundaries.push(new Date(dNext.setUTCHours(this.nightEndHour, 0, 0, 0)));
        const valid = boundaries.filter(b => b > current && b < end).sort((a, b) => a.getTime() - b.getTime());
        return valid.length > 0 ? valid[0] : end;
    }

    private isNightTime(date: Date): boolean {
        const hour = date.getUTCHours();
        if (this.nightStartHour > this.nightEndHour) {
            return hour >= this.nightStartHour || hour < this.nightEndHour;
        } else {
            return hour >= this.nightStartHour && hour < this.nightEndHour;
        }
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
                    Day: day,
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
}

export const laborEngine = new LaborEngine();
