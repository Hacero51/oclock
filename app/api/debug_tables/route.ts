import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch 5 checkinout records
        const logs = await prisma.checkinout.findMany({
            take: 5,
            select: {
                Oid: true,
                CheckTime: true,
                Employee: true,
                Machine: true,
                CheckType: true
            }
        });

        const empIds = logs.map(l => l.Employee).filter(Boolean) as string[];
        const machIds = logs.map(l => l.Machine).filter(Boolean) as string[];

        // Try to find persons
        const persons = await prisma.eperson.findMany({
            where: { Oid: { in: empIds } },
            select: { Oid: true, FullName: true, FirstName: true, LastName: true }
        });

        // Try to find machines
        const machines = await prisma.machine.findMany({
            where: { Oid: { in: machIds } },
            select: { Oid: true, Name: true, MachineNumber: true }
        });

        return NextResponse.json({
            logs,
            persons,
            machines,
            match_counts: {
                logs: logs.length,
                persons: persons.length,
                machines: machines.length
            }
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
