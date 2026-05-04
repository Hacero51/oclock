import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";

export async function GET() {
    try {
        const inicio = new Date("2026-04-27T00:00:00Z");
        const fin = new Date("2026-04-27T23:59:59Z");

        // Buscar en checkinout (marcaciones crudas)
        const checkins = await prisma.checkinout.findMany({
            where: { CheckTime: { gte: inicio, lte: fin } },
            orderBy: { CheckTime: 'asc' }
        });

        const resultados = [];
        for (const c of checkins) {
            let nombre = "Desconocido";
            const emp = await prisma.employee.findUnique({ where: { Oid: c.Employee } });
            if (emp) {
                const p = await prisma.eperson.findUnique({ where: { Oid: emp.Oid } });
                nombre = p?.FullName || "Sin Nombre";
            }
            resultados.push({ oid: c.Employee, hora: c.CheckTime, nombre });
        }

        fs.writeFileSync("c:/proyectos/oclock/scratch/checkins_27.json", JSON.stringify(resultados, null, 2));

        return NextResponse.json({ count: resultados.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
