import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        console.log("API: Consultando departamentos...");
        const departamentos = await prisma.department.findMany({
            select: {
                Oid: true,
                Name: true,
                FullName: true,
                Parent: true,
            },
            orderBy: {
                Name: "asc",
            },
        });

        console.log(`API: Encontrados ${departamentos.length} departamentos.`);
        if (departamentos.length > 0) {
            console.log("API: Ejemplo de dato:", departamentos[0]);
        }

        // Obtener conteo
        const conteos = await prisma.employee.groupBy({
            by: ['Department'],
            _count: {
                Oid: true,
            },
            where: { Status: 0 }
        });

        const conteoMap = new Map();
        conteos.forEach(c => {
            if (c.Department) conteoMap.set(c.Department, c._count.Oid);
        });

        const data = departamentos.map(d => ({
            id: d.Oid,
            name: d.Name || d.FullName || "Departamento Sin Nombre", // Fallback robusto
            parentId: d.Parent,
            count: conteoMap.get(d.Oid) || 0
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
