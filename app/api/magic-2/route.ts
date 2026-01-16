
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Standard import

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Fixing Dairo (Magic 2)...");
        const startDay = new Date(Date.UTC(2025, 11, 24, 0, 0, 0, 0));

        // Search in EPerson table
        const people = await prisma.eperson.findMany({
            where: {
                OR: [
                    { FirstName: { contains: 'DAIRO' } },
                    { LastName: { contains: 'DAIRO' } },
                    { FirstName: { contains: 'ESTEBAN' } }
                ]
            },
            take: 10
        });

        if (people.length === 0) {
            return NextResponse.json({ error: 'No one named DAIRO/ESTEBAN found in EPerson table.' });
        }

        const stats = [];

        for (const person of people) {
            // Find Employee
            const emp = await prisma.employee.findUnique({
                where: { Oid: person.Oid }
            });

            if (!emp) {
                stats.push({ name: person.FirstName + ' ' + person.LastName, status: 'No Employee Record linked' });
                continue;
            }

            // Check if marking exists
            const existing = await prisma.marking.findFirst({
                where: { Employee: emp.Oid, Day: startDay }
            });

            if (existing) {
                stats.push({ name: person.FirstName + ' ' + person.LastName, status: 'Marking Exists', marking: existing });
                continue;
            }

            // Create Marking if missing
            const check = await prisma.checkinout.findFirst({
                where: { Employee: emp.Oid, CheckTime: { gte: startDay } },
                orderBy: { CheckTime: 'asc' }
            });

            if (check) {
                const newM = await prisma.marking.create({
                    data: {
                        Oid: crypto.randomUUID(),
                        Employee: emp.Oid,
                        Day: startDay,
                        MarkingIn: check.CheckTime,
                        Shift: (emp as any)?.CurrentShift || null,
                        Cycle: (emp as any)?.CurrentCycle || null,
                        Status: 1,
                        StartShiftMarkingIn: false,
                        OverTimeBeforeEntry: false,
                        OverTimeAfterExit: false,
                        OverTimeInHoliday: false,
                        Approve: false
                    }
                });
                stats.push({ name: person.FirstName + ' ' + person.LastName, status: 'FIXED - Marking Created', newMarking: newM });
            } else {
                stats.push({ name: person.FirstName + ' ' + person.LastName, status: 'No Raw Checks Found today' });
            }
        }

        return NextResponse.json({ summary: stats, peopleFound: people.length });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
