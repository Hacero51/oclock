
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Standard project import

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Fixing Duplicate Markings (In == Out) - V2...");

        // Range: From yesterday to be safe
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);

        // Find suspect markings
        const markings = await prisma.marking.findMany({
            where: {
                Day: { gte: startDate },
                MarkingOut: { not: null },
                Status: 1
            }
        });

        const stats = [];
        let fixedCount = 0;

        for (const m of markings) {
            if (!m.MarkingIn || !m.MarkingOut) continue;

            const diffMs = Math.abs(m.MarkingIn.getTime() - m.MarkingOut.getTime());

            // Threshold: 60 seconds
            if (diffMs < 60000) {
                // Just use Oid to avoid schema issues
                const name = m.Employee;

                await prisma.marking.update({
                    where: { Oid: m.Oid },
                    data: { MarkingOut: null }
                });

                stats.push({
                    oid: m.Oid,
                    time: m.MarkingIn.toISOString(),
                    diffMs,
                    status: 'FIXED (Re-opened)'
                });
                fixedCount++;
            }
        }

        return NextResponse.json({
            message: `Scanned ${markings.length} markings. Fixed ${fixedCount}.`,
            details: stats
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
