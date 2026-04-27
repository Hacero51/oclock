import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const summaryCount = await prisma.attendancesummary.count({
        where: { Year: 2026 }
    });
    
    const detailCount = await prisma.attendancedetail.count({
        where: { Day: { gte: new Date('2026-04-01'), lt: new Date('2026-05-01') } }
    });

    return NextResponse.json({ summaryCount, detailCount });
}
