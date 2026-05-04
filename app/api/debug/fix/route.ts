import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const result = await prisma.employee.updateMany({
            where: {
                AcNumber: { in: [1224, 1225] }
            },
            data: {
                Status: 0
            }
        });
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
