
import crypto from "crypto";
import prisma from "@/lib/prisma";

export interface CalculationResult {
    conceptCode: string;
    hours: number;
    startDate: Date;
    endDate: Date;
}

export class LaborEngine {
    private nightStartHour = 19; // 7 PM
    private nightEndHour = 6;    // 6 AM
    private weeklyOrdinaryLimit = 44;
    private weeklyExtraLimit = 12;
    private implicitLunchSeconds = 1800; // 30 min

    async processDay(employeeOid: string, date: Date) {
        const startOfDayDB = new Date(date);
        startOfDayDB.setUTCHours(0, 0, 0, 0);

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
            const shiftInSecs = timetable.MarkingIn || 0;
            if (shiftInSecs > 0) {
                expectedIn = createTimeFromSeconds(calcReference, shiftInSecs);
            } else {
                expectedIn = actualIn;
            }
            
            targetA01Secs = baseTimetable?.TotalTime || ((timetable.MarkingOut || 0) - (shiftInSecs));
            
            const remainingA01 = Math.max(0, this.weeklyOrdinaryLimit - weekA01);
            const effectiveA01Secs = Math.min(targetA01Secs, remainingA01 * 3600);
            
            let lunchDurationSecs = 0;
            if (timetable.Lunch && timetable.LunchOut !== null && timetable.LunchIn !== null) {
                lunchDurationSecs = timetable.LunchIn - timetable.LunchOut;
            } else if (targetA01Secs >= 6 * 3600) { 
                lunchDurationSecs = this.implicitLunchSeconds;
            }

            expectedOut = new Date(expectedIn.getTime() + (effectiveA01Secs + lunchDurationSecs) * 1000);
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
        let dailyExtrasCount = 0;
        let weeklyA02Tracker = weekA02;
        let accumulatedDayA01Secs = 0;
        const maxDayA01Secs = targetA01Secs;

        for (const seg of segments) {
            const subSegments = this.splitByBoundaries(seg.start, seg.end, expectedIn, expectedOut);
            for (const sub of subSegments) {
                const totalHours = (sub.end.getTime() - sub.start.getTime()) / 3600000;
                const isNight = this.isNightTime(sub.start);
                const overlapStart = sub.start > expectedIn ? sub.start : expectedIn;
                const overlapEnd = sub.end < expectedOut ? sub.end : expectedOut;

                let ordinaryHours = 0;
                if (canHaveOrdinary && overlapStart < overlapEnd) {
                    const potentialA01Secs = (overlapEnd.getTime() - overlapStart.getTime()) / 1000;
                    const remainingDayA01 = Math.max(0, maxDayA01Secs - accumulatedDayA01Secs);
                    const allowedA01Secs = Math.min(potentialA01Secs, remainingDayA01);

                    if (allowedA01Secs > 0) {
                        ordinaryHours = allowedA01Secs / 3600;
                        accumulatedDayA01Secs += allowedA01Secs;
                        const concept = this.getOrdinaryConcept(isSundayOrHoliday, isNight);
                        results.push({ 
                            conceptCode: concept, 
                            hours: ordinaryHours, 
                            startDate: overlapStart, 
                            endDate: new Date(overlapStart.getTime() + allowedA01Secs * 1000) 
                        });
                    }
                }

                const extraHours = Math.max(0, totalHours - ordinaryHours);

                if (extraHours > 0) {
                    let extraStart = new Date(sub.start.getTime() + ordinaryHours * 3600000);
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

        let ordinary = 0;
        let extras = 0;

        for (const d of details) {
            const type = await prisma.attendancetype.findUnique({ where: { Oid: d.AttendanceType || '' } });
            if (!type || !type.CodeToExport) continue;
            const code = type.CodeToExport;
            if (ordinaryCodes.includes(code)) ordinary += d.Hours || 0;
            if (extraCodes.includes(code)) extras += d.Hours || 0;
        }

        return { ordinary, extras };
    }

    private isNightTime(date: Date): boolean {
        const hour = date.getUTCHours();
        return hour >= this.nightStartHour || hour < this.nightEndHour;
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
        return 'A36';
    }

    private async saveResults(empOid: string, day: Date, results: CalculationResult[]) {
        await prisma.attendancedetail.deleteMany({
            where: { Employee: empOid, Day: day }
        });

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