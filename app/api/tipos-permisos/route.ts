import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const leaves = await prisma.att_leavecategory.findMany({
            orderBy: { id: 'asc' }
        });

        const list = leaves.map(l => ({
            id: l.id.toString(),
            codigo: l.report_symbol,
            codigoExportar: l.report_symbol,
            nombre: l.category_name,
            pago: true, // Asumido
            estado: 'Activo' // Asumido
        }));

        return NextResponse.json(list);

    } catch (error) {
        console.error("Error obteniendo tipos de permisos:", error);
        return NextResponse.json({ error: "Error obteniendo tipos de permisos" }, { status: 500 });
    }
}
