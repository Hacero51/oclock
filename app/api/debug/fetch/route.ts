import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const ids = [1224, 1225];
        const employees = await prisma.employee.findMany({
            where: { AcNumber: { in: ids } }
        });
        
        const oids = employees.map(e => e.Oid);
        const persons = await prisma.eperson.findMany({
            where: { Oid: { in: oids } }
        });
        
        return NextResponse.json({ success: true, employees, persons });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
